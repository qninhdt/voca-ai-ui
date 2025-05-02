import * as React from "react";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Settings,
  X,
  Volume2,
  RefreshCw,
  ArrowRight,
  Check,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type QuestionType =
  | "listen-and-guess"
  | "fill-in-the-blank"
  | "multiple-choice";

interface QuizQuestion {
  id: string;
  type: QuestionType;
  definition?: string;
  correctAnswer: string;
  definitionWithBlanks?: string;
  options?: string[];
  audioUrl?: string;
  audioWord?: string;
}

export default function ComprehensiveQuizPage() {
  const navigate = useNavigate();
  const { id: deckId } = useParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [filledDefinition, setFilledDefinition] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock quiz questions with different types
  const quizQuestions: QuizQuestion[] = [
    {
      id: "1",
      type: "listen-and-guess",
      correctAnswer: "chatter",
      options: ["chatter", "write", "corridor", "banquet"],
      audioUrl: "/audio/chatter.mp3", // This would be a real audio file path in production
      audioWord: "chatter", // For simulation since we don't have actual audio files
    },
    {
      id: "2",
      type: "fill-in-the-blank",
      definition: "conversation about things that are not important",
      correctAnswer: "chatter",
      definitionWithBlanks:
        "conversation about things that are _ _ _ important",
    },
    {
      id: "3",
      type: "multiple-choice",
      definition: "to lift, pull, or move something heavy with great effort",
      correctAnswer: "heave",
      options: ["heave", "clatter", "ivy", "ruddy"],
    },
    {
      id: "4",
      type: "listen-and-guess",
      correctAnswer: "ruddy",
      options: ["ruddy", "heave", "banquet", "corridor"],
      audioUrl: "/audio/ruddy.mp3",
      audioWord: "ruddy",
    },
    {
      id: "5",
      type: "fill-in-the-blank",
      definition:
        "(of a white person's skin) having a red color, often suggesting good health",
      correctAnswer: "ruddy",
      definitionWithBlanks:
        "(of a white person's skin) having a _ _ _ color, often suggesting good health",
    },
  ];

  const currentQuestion = quizQuestions[currentQuestionIndex];

  // Update the filled definition as the user types for fill-in-the-blank questions
  useEffect(() => {
    if (
      currentQuestion.type === "fill-in-the-blank" &&
      currentQuestion.definitionWithBlanks
    ) {
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
    }
  }, [userInput, currentQuestion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow input up to the length of the correct answer
    if (input.length <= currentQuestion.correctAnswer.length) {
      setUserInput(input);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (showFeedback) return;
    setSelectedOption(option);

    if (
      currentQuestion.type === "listen-and-guess" ||
      currentQuestion.type === "multiple-choice"
    ) {
      checkAnswer(option);
    }
  };

  const playAudio = () => {
    // In a real implementation, you would play the actual audio file
    // For this example, we'll use the Web Speech API to simulate audio
    if (currentQuestion.audioWord) {
      setIsPlaying(true);

      // Using Web Speech API for demonstration
      // In a real app, you would use the audio element with the audioUrl
      const utterance = new SpeechSynthesisUtterance(currentQuestion.audioWord);
      utterance.rate = 0.9;
      utterance.onend = () => {
        setIsPlaying(false);
      };
      speechSynthesis.speak(utterance);

      // If you have actual audio files:
      // if (audioRef.current) {
      //   audioRef.current.play()
      //   audioRef.current.onended = () => setIsPlaying(false)
      // }
    }
  };

  const stopAudio = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);

    // If you have actual audio files:
    // if (audioRef.current) {
    //   audioRef.current.pause()
    //   audioRef.current.currentTime = 0
    //   setIsPlaying(false)
    // }
  };

  const checkAnswer = (selectedAnswer?: string) => {
    let userAnswer = "";
    let isAnswerCorrect = false;

    // Get user answer based on question type
    switch (currentQuestion.type) {
      case "listen-and-guess":
      case "multiple-choice":
        userAnswer = selectedAnswer || selectedOption || "";
        break;
      case "fill-in-the-blank":
        userAnswer = userInput.toLowerCase();
        break;
    }

    // Check if answer is correct
    isAnswerCorrect =
      userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    setShowFeedback(true);
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore(score + 1);
    }

    // For fill-in-the-blank, show the correct answer by filling in all blanks
    if (
      currentQuestion.type === "fill-in-the-blank" &&
      currentQuestion.definitionWithBlanks
    ) {
      const correctAnswer = currentQuestion.correctAnswer;
      const blanksPattern = /_ /g;
      let tempDefinition = currentQuestion.definitionWithBlanks;
      let answerIndex = 0;

      tempDefinition = tempDefinition.replace(blanksPattern, (match) => {
        if (answerIndex < correctAnswer.length) {
          return correctAnswer[answerIndex++] + " ";
        }
        return match;
      });

      setFilledDefinition(tempDefinition);
    }

    // Stop audio if it's playing
    if (currentQuestion.type === "listen-and-guess") {
      stopAudio();
    }

    setTimeout(() => {
      console.log("Checking answer:", selectedAnswer);
      console.log("ShowFeedback:", showFeedback); // We know this is true now
      console.log("IsCorrect:", isAnswerCorrect); // Use the constant instead of state
    }, 0);

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        setShowFeedback(false);
      } else {
        // Quiz completed - could navigate to results page
        // For now, just show a completion message
        alert(
          `Quiz completed! Your score: ${score + (isAnswerCorrect ? 1 : 0)}/${
            quizQuestions.length
          }`
        );
      }
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showFeedback) {
      if (
        (currentQuestion.type === "fill-in-the-blank" &&
          userInput.length > 0) ||
        ((currentQuestion.type === "multiple-choice" ||
          currentQuestion.type === "listen-and-guess") &&
          selectedOption)
      ) {
        checkAnswer();
      }
    }
  };

  const handleDontKnow = () => {
    setIsCorrect(false);
    setShowFeedback(true);

    // For fill-in-the-blank, show the correct answer
    if (
      currentQuestion.type === "fill-in-the-blank" &&
      currentQuestion.definitionWithBlanks
    ) {
      const correctAnswer = currentQuestion.correctAnswer;
      const blanksPattern = /_ /g;
      let tempDefinition = currentQuestion.definitionWithBlanks;
      let answerIndex = 0;

      tempDefinition = tempDefinition.replace(blanksPattern, (match) => {
        if (answerIndex < correctAnswer.length) {
          return correctAnswer[answerIndex++] + " ";
        }
        return match;
      });

      setFilledDefinition(tempDefinition);
    }

    // Stop audio if it's playing
    if (currentQuestion.type === "listen-and-guess") {
      stopAudio();
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Quiz completed
        alert(`Quiz completed! Your score: ${score}/${quizQuestions.length}`);
      }
    }, 2000);
  };

  // Render different UI based on question type
  const renderQuestionUI = () => {
    switch (currentQuestion.type) {
      case "listen-and-guess":
        return (
          <>
            <div className="flex items-center mb-2">
              <h2 className="font-bold text-lg">Listen and guess</h2>
            </div>

            <div className="mb-8 flex flex-col items-center">
              <button
                onClick={isPlaying ? stopAudio : playAudio}
                className="w-20 h-20 rounded-full bg-[#F5B700] flex items-center justify-center mb-6 hover:bg-[#E5A700] transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-10 w-10 text-black" />
                ) : (
                  <Play className="h-10 w-10 text-black ml-1" />
                )}
              </button>
              <p className="text-center text-gray-400">
                {isPlaying ? "Playing audio..." : "Click to play the audio"}
              </p>

              {/* Hidden audio element for actual audio files */}
              <audio
                ref={audioRef}
                src={currentQuestion.audioUrl}
                className="hidden"
              />
            </div>

            <div className="mb-8">
              <h3 className="font-bold mb-4">Choose the word you heard:</h3>
              <RadioGroup
                value={selectedOption || ""}
                onValueChange={handleOptionSelect}
              >
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <div
                      key={option}
                      className={cn(
                        "flex items-center space-x-2 p-4 rounded-xl border",
                        showFeedback && option === currentQuestion.correctAnswer
                          ? "bg-green-500/20 border-green-500"
                          : showFeedback &&
                            option === selectedOption &&
                            option !== currentQuestion.correctAnswer
                          ? "bg-red-500/20 border-red-500"
                          : option === selectedOption
                          ? "bg-[#333333] border-[#F5B700]"
                          : "bg-[#252525] border-[#333333]"
                      )}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`listen-${option}`}
                        disabled={showFeedback}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`listen-${option}`}
                        className="flex-1 cursor-pointer text-lg font-medium"
                        onClick={() =>
                          !showFeedback && handleOptionSelect(option)
                        }
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* {!showFeedback && selectedOption && (
                <Button
                  onClick={checkAnswer}
                  className="w-full mt-4 bg-[#F5B700] text-black hover:bg-[#E5A700]"
                >
                  Submit Answer
                </Button>
              )} */}
            </div>
          </>
        );

      case "fill-in-the-blank":
        return (
          <>
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

            {/* Input to capture keystrokes */}
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
                    onClick={() => checkAnswer()}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[#F5B700] text-black p-2 rounded-full"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        );

      case "multiple-choice":
        return (
          <>
            <div className="flex items-center mb-2">
              <h2 className="font-bold text-lg">Multiple Choice</h2>
              <button className="ml-2 p-1 rounded-full hover:bg-[#252525]">
                <Volume2 className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="text-xl mb-8 p-4 rounded-xl bg-[#252525]">
              {currentQuestion.definition}
            </div>

            <div className="mb-8">
              <h3 className="font-bold mb-4">Choose the correct answer:</h3>
              <RadioGroup
                value={selectedOption || ""}
                onValueChange={handleOptionSelect}
              >
                <div className="space-y-3">
                  {currentQuestion.options?.map((option) => (
                    <div
                      key={option}
                      className={cn(
                        "flex items-center space-x-2 p-4 rounded-xl border",
                        showFeedback && option === currentQuestion.correctAnswer
                          ? "bg-green-500/20 border-green-500"
                          : showFeedback &&
                            option === selectedOption &&
                            option !== currentQuestion.correctAnswer
                          ? "bg-red-500/20 border-red-500"
                          : option === selectedOption
                          ? "bg-[#333333] border-[#F5B700]"
                          : "bg-[#252525] border-[#333333]"
                      )}
                    >
                      <RadioGroupItem
                        value={option}
                        id={`choice-${option}`}
                        disabled={showFeedback}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`choice-${option}`}
                        className="flex-1 cursor-pointer text-lg font-medium"
                        onClick={() =>
                          !showFeedback && handleOptionSelect(option)
                        }
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* {!showFeedback && selectedOption && (
                <Button
                  onClick={checkAnswer}
                  className="w-full mt-4 bg-[#F5B700] text-black hover:bg-[#E5A700]"
                >
                  Submit Answer
                </Button>
              )} */}
            </div>
          </>
        );

      default:
        return <div>Unknown question type</div>;
    }
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
        {renderQuestionUI()}

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
              {isCorrect ? (
                <span className="flex items-center">
                  <Check className="h-5 w-5 mr-2" /> Correct! Well done.
                </span>
              ) : (
                <span>
                  Incorrect. The correct answer is "
                  {currentQuestion.correctAnswer}".
                </span>
              )}
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
