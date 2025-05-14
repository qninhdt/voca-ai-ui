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

export async function generateAIQuiz(word: string) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a vocabulary quiz generator. Create an engaging question to test understanding of the word "${word}". 
          The response should be in JSON format with the following structure:
          {
            "question": "The question text",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": "The correct option",
            "explanation": "A brief explanation of why this is the correct answer"
          }
          
          Guidelines:
          - Make the question challenging but fair
          - Include 4 options, with only one correct answer
          - The explanation should be educational and help reinforce learning
          - Keep the question and options concise
          - Make sure the correct answer is one of the provided options`,
        },
        {
          role: "user",
          content: `Generate a quiz question for the word "${word}"`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from AI");

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating AI quiz:", error);
    throw error;
  }
}
