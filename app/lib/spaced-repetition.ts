import { getDeck } from "./firebase";
import type { Card } from "./firebase";
import { generateAIQuiz } from "./chatbot";

export const N_QUESTIONS_PER_SESSION = 5;

export type QuestionType =
  | "multiple-choice"
  | "fill-blank"
  | "listening"
  | "ai-quiz";

export interface Question {
  card: Card;
  type: QuestionType;
  options: string[];
  aiQuestion?: string;
  aiExplanation?: string;
  correctAnswer?: string;
}

function getRandomQuestionType(): QuestionType {
  const types: QuestionType[] = [
    "multiple-choice",
    "fill-blank",
    "listening",
    "ai-quiz",
  ];
  return types[Math.floor(Math.random() * types.length)];
}

function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((a) => [Math.random(), a] as [number, T])
    .sort((a, b) => a[0] - b[0])
    .map((a) => a[1]);
}

function getMCQOptions(cards: Card[], correct: Card, n = 4): string[] {
  const others = shuffle(cards.filter((c) => c.id !== correct.id)).slice(
    0,
    n - 1
  );
  const options = shuffle([correct, ...others]).map((c) => c.term);
  return options;
}

function avoidNearDuplicates(cards: Card[], count: number): Card[] {
  // Avoid cards with the same term/definition in a session
  const seenTerms = new Set<string>();
  const seenDefs = new Set<string>();
  const result: Card[] = [];
  for (const card of cards) {
    if (seenTerms.has(card.term) || seenDefs.has(card.definition)) continue;
    seenTerms.add(card.term);
    seenDefs.add(card.definition);
    result.push(card);
    if (result.length === count) break;
  }
  return result;
}

export async function generateSessionQuestions(
  deckId: string
): Promise<Question[]> {
  const deck = await getDeck(deckId);
  if (!deck || !deck.cards) return [];
  const cards = deck.cards.slice();

  // Use nextReview as a priority (lower/older first), but not a filter
  cards.sort(
    (a, b) => (a.nextReview?.seconds || 0) - (b.nextReview?.seconds || 0)
  );

  // Get all available cards
  const availableCards = cards.slice(0, N_QUESTIONS_PER_SESSION);

  // If we have fewer cards than questions, we'll need to reuse some
  const selectedCards: Card[] = [];
  for (let i = 0; i < N_QUESTIONS_PER_SESSION; i++) {
    selectedCards.push(availableCards[i % availableCards.length]);
  }

  // Define the base question types
  const baseTypes: QuestionType[] = [
    "multiple-choice",
    "fill-blank",
    "listening",
    "ai-quiz",
  ];

  // Calculate how many times each type should appear
  const typesCount = Math.ceil(N_QUESTIONS_PER_SESSION / baseTypes.length);
  const remainingTypes = N_QUESTIONS_PER_SESSION % baseTypes.length;

  // Create array of question types with uniform distribution
  const questionTypes: QuestionType[] = [];
  baseTypes.forEach((type) => {
    // Add the base count for each type
    for (let i = 0; i < typesCount - 1; i++) {
      questionTypes.push(type);
    }
  });

  // Add remaining types to reach N_QUESTIONS_PER_SESSION
  for (let i = 0; i < remainingTypes; i++) {
    questionTypes.push(baseTypes[i]);
  }

  // Shuffle the question types to randomize their order
  const shuffledTypes = shuffle(questionTypes);

  // Generate questions
  const questions = await Promise.all(
    selectedCards.map(async (card, index) => {
      const type = shuffledTypes[index];
      let options: string[] = [];
      let aiQuestion: string | undefined;
      let aiExplanation: string | undefined;
      let correctAnswer: string | undefined;

      if (type === "multiple-choice" || type === "listening") {
        options = getMCQOptions(cards, card);
        correctAnswer = card.term;
      } else if (type === "fill-blank") {
        options = [card.term]; // For fill-blank, we only need the correct term
        correctAnswer = card.term;
      } else if (type === "ai-quiz") {
        try {
          const aiQuiz = await generateAIQuiz(card.term);
          options = aiQuiz.options;
          aiQuestion = aiQuiz.question;
          aiExplanation = aiQuiz.explanation;
          correctAnswer = aiQuiz.correctAnswer;
        } catch (error) {
          // Fallback to multiple choice if AI quiz generation fails
          console.error("Error generating AI quiz:", error);
          options = getMCQOptions(cards, card);
          correctAnswer = card.term;
        }
      }

      return { card, type, options, aiQuestion, aiExplanation, correctAnswer };
    })
  );

  // Shuffle the questions to randomize their order
  return shuffle(questions);
}
