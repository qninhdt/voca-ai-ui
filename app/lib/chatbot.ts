import OpenAI from "openai";

const MY_VERY_VERY_SECRET_API_KEY =
  "c2stcHJvai00Q1daNjlpQXFYdnRkOFpHOTJORzd1dVZqT1N0RXVRZjc4ZTJJV3RpWU5XSkl3U2NYSkRFUFRxUTFNSmlTaXBWQ003MUJlb1gzNVQzQmxia0ZKdGdycUhDUzNqbXhNQnhGTG5ieG52TW1kQS1jS1ltci1IMjIxdkZaSnc1amdrUzRvLWNFYVdxcFRFMmUtSGJaN2Fhb2hJMmN6WUE=";

export const client = new OpenAI({
  dangerouslyAllowBrowser: true,
  apiKey: atob(MY_VERY_VERY_SECRET_API_KEY),
});

export const VOCA_AI_SYSTEM_PROMPT = `You are VocaAI, an intelligent vocabulary learning assistant. Your primary goal is to help users expand their vocabulary and improve their language skills. Here's how you should interact:

1. Provide clear, concise definitions of words
2. Give practical examples of word usage in context
3. Suggest related words, synonyms, and antonyms
4. Create memory aids and mnemonics to help remember words
5. Offer practice exercises and quizzes
6. Explain word origins and etymology when relevant
7. Adapt your teaching style to the user's level
8. Be encouraging and supportive in your responses

Always maintain a friendly, educational tone and focus on making vocabulary learning engaging and effective.`;

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  word: string;
  questions: QuizQuestion[];
  difficulty: "easy" | "medium" | "hard";
}

export async function generateAIQuiz(word: string): Promise<Quiz> {
  const prompt = `Create a vocabulary quiz for the word "${word}". The quiz should include:
1. A multiple-choice question testing understanding of the word's meaning
2. A question about the word's usage in context
3. A question about related words (synonyms/antonyms)

Format the response as a JSON object with the following structure:
{
  "word": "${word}",
  "difficulty": "medium",
  "questions": [
    {
      "question": "What is the meaning of ${word}?",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this is the correct answer"
    }
  ]
}

Make sure the questions are challenging but fair, and the explanations are educational.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: VOCA_AI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    const quiz = JSON.parse(content) as Quiz;

    // Validate the quiz structure
    if (!quiz.word || !quiz.questions || !Array.isArray(quiz.questions)) {
      throw new Error("Invalid quiz format");
    }

    // Validate each question
    quiz.questions.forEach((q, index) => {
      if (
        !q.question ||
        !q.options ||
        !Array.isArray(q.options) ||
        typeof q.correctAnswer !== "number" ||
        !q.explanation
      ) {
        throw new Error(`Invalid question format at index ${index}`);
      }
    });

    return quiz;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz. Please try again.");
  }
}
