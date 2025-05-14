import { getDeck } from "./firebase";
import type { Card } from "./firebase";
import { generateAIQuiz } from "./chatbot";

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
  // Shuffle to add randomness, but keep nextReview as a priority
  const prioritized = shuffle(cards.slice(0, 20)); // Take more than needed to avoid dups
  const sessionCards = avoidNearDuplicates(prioritized, 10);

  // If not enough, fill with more cards
  if (sessionCards.length < 10) {
    const extra = shuffle(cards.filter((c) => !sessionCards.includes(c)));
    for (const card of extra) {
      if (sessionCards.length >= 10) break;
      sessionCards.push(card);
    }
  }

  // Generate questions
  const questions = await Promise.all(
    sessionCards.map(async (card) => {
      const type = getRandomQuestionType();
      let options: string[] = [];
      let aiQuestion: string | undefined;
      let aiExplanation: string | undefined;
      let correctAnswer: string | undefined;

      if (type === "multiple-choice" || type === "listening") {
        options = getMCQOptions(cards, card);
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

  return questions;
}
