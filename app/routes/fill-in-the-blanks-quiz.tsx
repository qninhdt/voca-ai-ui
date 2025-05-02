import * as React from "react";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Settings, X, Volume2, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
  id: string;
  definition: string;
  correctAnswer: string;
  definitionWithBlanks: string;
}

export default function FillInBlanksQuizPage() {
  const navigate = useNavigate();
  const { id: deckId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [filledDefinition, setFilledDefinition] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock quiz questions with blanks
  const quizQuestions: QuizQuestion[] = [
    {
      id: "1",
      definition: "conversation about things that are not important",
      correctAnswer: "chatter",
      definitionWithBlanks:
        "conversation about things that are _ _ _ important",
    },
    {
      id: "2",
      definition: "to lift, pull, or move something heavy with great effort",
      correctAnswer: "heave",
      definitionWithBlanks:
        "to lift, pull, or move something _ _ _ _ _ with great effort",
    },
    {
      id: "3",
      definition: "an evergreen plant that grows up walls and trees",
      correctAnswer: "ivy",
      definitionWithBlanks: "an evergreen plant that grows up _ _ _ and trees",
    },
    {
      id: "4",
      definition:
        "(of a white person's skin) having a red color, often suggesting good health",
      correctAnswer: "ruddy",
      definitionWithBlanks:
        "(of a white person's skin) having a _ _ _ color, often suggesting good health",
    },
  ];

  // Focus the input field when the component mounts or question changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setUserInput("");
    setIsCorrect(null);
    setShowFeedback(false);
    setFilledDefinition(
      quizQuestions[currentQuestionIndex].definitionWithBlanks
    );
  }, [currentQuestionIndex]);

  // Update the filled definition as the user types
  useEffect(() => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const blanksPattern = /_ /g;
    let tempDefinition = currentQuestion.definitionWithBlanks;
    let inputIndex = 0;

    // Replace blanks with typed characters
    tempDefinition = tempDefinition.replace(blanksPattern, (match) => {
      if (inputIndex < userInput.length) {
        return userInput[inputIndex++] + " ";
      }
      return match;
    });

    setFilledDefinition(tempDefinition);
  }, [userInput, currentQuestionIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow input up to the length of the correct answer
    if (
      input.length <= quizQuestions[currentQuestionIndex].correctAnswer.length
    ) {
      setUserInput(input);
    }
  };

  const checkAnswer = () => {
    const isAnswerCorrect =
      userInput.toLowerCase() ===
      quizQuestions[currentQuestionIndex].correctAnswer.toLowerCase();
    setIsCorrect(isAnswerCorrect);
    setShowFeedback(true);

    if (isAnswerCorrect) {
      setScore(score + 1);
    }

    // Show the correct answer by filling in all blanks
    const correctAnswer = quizQuestions[currentQuestionIndex].correctAnswer;
    const blanksPattern = /_ /g;
    let tempDefinition =
      quizQuestions[currentQuestionIndex].definitionWithBlanks;
    let answerIndex = 0;

    tempDefinition = tempDefinition.replace(blanksPattern, (match) => {
      if (answerIndex < correctAnswer.length) {
        return correctAnswer[answerIndex++] + " ";
      }
      return match;
    });

    setFilledDefinition(tempDefinition);

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Quiz completed - could navigate to results page
        // For now, just reset
        // router.push(`/quiz-results`)
      }
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showFeedback && userInput.length > 0) {
      checkAnswer();
    }
  };

  const handleDontKnow = () => {
    setIsCorrect(false);
    setShowFeedback(true);

    // Show the correct answer
    const correctAnswer = quizQuestions[currentQuestionIndex].correctAnswer;
    const blanksPattern = /_ /g;
    let tempDefinition =
      quizQuestions[currentQuestionIndex].definitionWithBlanks;
    let answerIndex = 0;

    tempDefinition = tempDefinition.replace(blanksPattern, (match) => {
      if (answerIndex < correctAnswer.length) {
        return correctAnswer[answerIndex++] + " ";
      }
      return match;
    });

    setFilledDefinition(tempDefinition);

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Quiz completed
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-spin-slow"></div>
          <button className="ml-2">
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-[#252525]">
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate(`/deck/${deckId}`)}
            className="p-2 rounded-full hover:bg-[#252525]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <Progress
          value={(currentQuestionIndex / quizQuestions.length) * 100}
          className="h-2 bg-[#333333]"
          indicatorClassName="bg-[#F5B700]"
        />
        <div className="mt-2 text-sm font-medium text-right">
          {currentQuestionIndex + 1}/{quizQuestions.length}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-6 flex-1">
        <div className="flex items-center mb-2">
          <h2 className="font-bold text-lg">Fill in the blanks</h2>
          <button className="ml-2 p-1 rounded-full hover:bg-[#252525]">
            <Volume2 className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        {/* Definition with blanks that get filled */}
        <div
          className={cn(
            "text-xl mb-8 p-4 rounded-xl",
            isCorrect === true
              ? "bg-green-500/10"
              : isCorrect === false
              ? "bg-red-500/10"
              : "bg-[#252525]"
          )}
        >
          {filledDefinition}
        </div>

        {/* Hidden input to capture keystrokes */}
        <div className="mb-8">
          <label htmlFor="answer" className="font-bold mb-2 block">
            Type your answer:
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              id="answer"
              type="text"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={showFeedback}
              className={cn(
                "w-full p-4 rounded-xl border text-lg bg-[#252525]",
                isCorrect === true
                  ? "border-green-500"
                  : isCorrect === false
                  ? "border-red-500"
                  : "border-[#333333] focus:border-[#F5B700] focus:ring-1 focus:ring-[#F5B700]"
              )}
              placeholder="Type here..."
              autoComplete="off"
            />
            {!showFeedback && userInput.length > 0 && (
              <button
                onClick={checkAnswer}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#F5B700] text-black p-2 rounded-full"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={cn(
              "p-4 rounded-xl mb-8",
              isCorrect
                ? "bg-green-500/20 border border-green-500"
                : "bg-red-500/20 border border-red-500"
            )}
          >
            <p className="font-medium">
              {isCorrect
                ? "Correct! Well done."
                : `Incorrect. The correct answer is "${quizQuestions[currentQuestionIndex].correctAnswer}".`}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="mt-auto p-4 flex justify-between items-center">
        <button className="p-2 rounded-full hover:bg-[#252525]">
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white"
          onClick={handleDontKnow}
          disabled={showFeedback}
        >
          Don't know?
        </Button>
      </div>
    </div>
  );
}
