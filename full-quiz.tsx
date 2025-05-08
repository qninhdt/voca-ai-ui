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
import { speakText, stopSpeaking } from "@/lib/utils";
import { getCardsForReview, updateCardMastery } from "@/lib/firebase";
import type { Card } from "@/lib/firebase";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type QuestionType =
  | "listen-and-guess"
  | "fill-in-the-blank"
  | "multiple-choice"
  | "definition-to-word";

interface QuizQuestion {
  id: string;
  type: QuestionType;
  card: Card;
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
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionQuestions, setSessionQuestions] = useState<QuizQuestion[]>([]);
  const [sessionQuestionIndex, setSessionQuestionIndex] = useState(0);
  const [showSessionResults, setShowSessionResults] = useState(false);
  const [sessionStats, setSessionStats] = useState({ mastered: 0, known: 0, unknown: 0, progress: 0, improvement: 0 });
  const [previousProgress, setPreviousProgress] = useState(0);

  // Use session-based currentQuestion only
  const currentQuestion = sessionQuestions[sessionQuestionIndex];

  useEffect(() => {
    loadQuizQuestions();
  }, [deckId]);

  const loadQuizQuestions = async () => {
    if (!deckId) return;
    
    try {
      setLoading(true);
      const cards = await getCardsForReview(deckId);
      
      // Generate questions for each card
      const questions: QuizQuestion[] = cards.flatMap((card: Card) => {
        const cardQuestions: QuizQuestion[] = [];
        
        // Add multiple choice question
        cardQuestions.push({
          id: `${card.id}-mc`,
          type: "multiple-choice",
          card,
          definition: card.definition,
          correctAnswer: card.term,
          options: generateOptions(card.term, cards)
        });

        // Add fill in the blank question
        cardQuestions.push({
          id: `${card.id}-fill`,
          type: "fill-in-the-blank",
          card,
          definition: card.definition,
          correctAnswer: card.term,
          definitionWithBlanks: generateBlanks(card.definition, card.term)
        });

        // Add listen and guess question
        cardQuestions.push({
          id: `${card.id}-listen`,
          type: "listen-and-guess",
          card,
          correctAnswer: card.term,
          options: generateOptions(card.term, cards),
          audioWord: card.term
        });

        // Add definition to word question
        cardQuestions.push({
          id: `${card.id}-def`,
          type: "definition-to-word",
          card,
          definition: card.definition,
          correctAnswer: card.term
        });

        return cardQuestions;
      });

      // Shuffle questions
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
      setQuizQuestions(shuffledQuestions);
    } catch (error) {
      console.error("Error loading quiz questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateOptions = (correctAnswer: string, allCards: Card[]): string[] => {
    const options = [correctAnswer];
    const otherTerms = allCards
      .filter(card => card.term !== correctAnswer)
      .map(card => card.term);
    
    // Shuffle and take 3 random terms
    const shuffled = otherTerms.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...options, ...shuffled].sort(() => Math.random() - 0.5);
  };

  const generateBlanks = (definition: string, term: string): string => {
    const words = definition.split(" ");
    const termWords = term.split(" ");
    const termLength = termWords.length;
    
    // Replace the term with blanks
    let result = definition;
    termWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      result = result.replace(regex, "_".repeat(word.length));
    });
    
    return result;
  };

  // Update the filled definition as the user types for fill-in-the-blank questions
  useEffect(() => {
    if (!currentQuestion) return;
    
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
    if (!currentQuestion) return;
    
    const input = e.target.value;
    if (input.length <= currentQuestion.correctAnswer.length) {
      setUserInput(input);
    }
  };

  const handleOptionSelect = (option: string) => {
    if (!currentQuestion || showFeedback) return;
    
    setSelectedOption(option);

    if (
      currentQuestion.type === "listen-and-guess" ||
      currentQuestion.type === "multiple-choice"
    ) {
      checkAnswer(option);
    }
  };

  const playAudio = async () => {
    if (!currentQuestion || !currentQuestion.audioWord) return;
    
    setIsPlaying(true);
    await speakText(currentQuestion.audioWord);
    setIsPlaying(false);
  };

  const stopAudio = async () => {
    await stopSpeaking();
    setIsPlaying(false);
  };

  // Function to generate a single question for a card
  const generateQuestion = (card: Card, allCards: Card[]): QuizQuestion => {
    // Randomly select question type
    const questionTypes: QuestionType[] = [
      "multiple-choice",
      "fill-in-the-blank",
      "listen-and-guess", 
      "definition-to-word"
    ];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    switch(type) {
      case "multiple-choice":
        return {
          id: `${card.id}-mc`,
          type,
          card,
          definition: card.definition,
          correctAnswer: card.term,
          options: generateOptions(card.term, allCards)
        };
      case "fill-in-the-blank":
        return {
          id: `${card.id}-fill`,
          type,
          card,
          definition: card.definition,
          correctAnswer: card.term,
          definitionWithBlanks: generateBlanks(card.definition, card.term)
        };
      case "listen-and-guess":
        return {
          id: `${card.id}-listen`,
          type,
          card,
          correctAnswer: card.term,
          options: generateOptions(card.term, allCards),
          audioWord: card.term
        };
      case "definition-to-word":
      default:
        return {
          id: `${card.id}-def`,
          type,
          card,
          definition: card.definition,
          correctAnswer: card.term
        };
    }
  };

  // Session question generation logic
  const getSessionQuestions = (allCards: Card[], sessionIdx: number): QuizQuestion[] => {
    // Always sorted by nextReview
    const sorted = allCards.slice().sort((a: Card, b: Card) => {
      const aTime = a.nextReview?.seconds || 0;
      const bTime = b.nextReview?.seconds || 0;
      return aTime - bTime;
    });
    let sessionCards: Card[] = [];
    if (sorted.length >= 10) {
      sessionCards = sorted.slice(sessionIdx * 10, sessionIdx * 10 + 10);
    } else {
      // If fewer than 10, repeat cards to fill up to 10, but shuffle so repeats are spaced out
      const repeats: Card[] = [];
      while (repeats.length < 10) {
        for (let i = 0; i < sorted.length && repeats.length < 10; i++) {
          repeats.push(sorted[i]);
        }
      }
      // Shuffle to space out repeats
      for (let i = repeats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [repeats[i], repeats[j]] = [repeats[j], repeats[i]];
      }
      sessionCards = repeats;
    }
    // Generate one question per card, random type
    return sessionCards.map((card: Card) => generateQuestion(card, allCards));
  };

  // On mount, load all cards for the deck
  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!deckId) return;
      const loadedCards = await getCardsForReview(deckId);
      setCards(loadedCards);
      setLoading(false);
    })();
  }, [deckId]);

  // Generate sessionQuestions on demand for each session
  useEffect(() => {
    setSessionQuestions(getSessionQuestions(cards, sessionIndex));
    setSessionQuestionIndex(0);
  }, [cards, sessionIndex]);

  // When session ends, show dialog
  useEffect(() => {
    if (sessionQuestionIndex >= sessionQuestions.length && sessionQuestions.length > 0) {
      // Calculate stats
      const mastered = sessionQuestions.filter(q => (q.card.mastery || 0) >= 4).length;
      const known = sessionQuestions.filter(q => (q.card.mastery || 0) > 0 && (q.card.mastery || 0) < 4).length;
      const unknown = sessionQuestions.filter(q => !q.card.mastery || q.card.mastery === 0).length;
      // For progress, use cards
      const total = cards.length;
      const totalMastered = cards.filter(q => (q.mastery || 0) >= 4).length;
      const progress = total > 0 ? Math.round((totalMastered / total) * 100) : 0;
      const improvement = progress - previousProgress;
      setSessionStats({ mastered, known, unknown, progress, improvement });
      setPreviousProgress(progress);
      setShowSessionResults(true);
    }
  }, [sessionQuestionIndex, sessionQuestions]);

  const checkAnswer = async (selectedAnswer?: string) => {
    if (!currentQuestion) return;
    
    let userAnswer = "";
    let isAnswerCorrect = false;

    switch (currentQuestion.type) {
      case "listen-and-guess":
      case "multiple-choice":
        userAnswer = selectedAnswer || selectedOption || "";
        break;
      case "fill-in-the-blank":
      case "definition-to-word":
        userAnswer = userInput.toLowerCase();
        break;
    }

    isAnswerCorrect = userAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    setShowFeedback(true);
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setScore(score + 1);
    }

    // Update card mastery based on answer
    try {
      const currentMastery = currentQuestion.card.mastery || 0;
      let newMastery = currentMastery;

      if (isAnswerCorrect) {
        // Increase mastery if correct
        newMastery = Math.min(currentMastery + 1, 5);
      } else {
        // Decrease mastery if incorrect, but not below 0
        newMastery = Math.max(currentMastery - 1, 0);
      }

      await updateCardMastery(deckId!, currentQuestion.card.id, newMastery);
    } catch (error) {
      console.error("Error updating card mastery:", error);
    }

    // For fill-in-the-blank, show the correct answer
    if (
      currentQuestion.type === "fill-in-the-blank" &&
      currentQuestion.definitionWithBlanks
    ) {
      const correctAnswer = currentQuestion.correctAnswer;
      const blanksPattern = /_+/g;
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
      if (sessionQuestionIndex < sessionQuestions.length - 1) {
        setSessionQuestionIndex(sessionQuestionIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        setShowFeedback(false);
        setUserInput("");
      } else {
        // Quiz completed
        setShowSessionResults(true);
      }
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!currentQuestion || showFeedback) return;
    
    if (e.key === "Enter") {
      if (
        (currentQuestion.type === "fill-in-the-blank" ||
         currentQuestion.type === "definition-to-word") &&
        userInput.length > 0
      ) {
        checkAnswer();
      } else if (
        (currentQuestion.type === "multiple-choice" ||
         currentQuestion.type === "listen-and-guess") &&
        selectedOption
      ) {
        checkAnswer();
      }
    }
  };

  const handleDontKnow = () => {
    if (!currentQuestion) return;
    
    setIsCorrect(false);
    setShowFeedback(true);

    // Update card mastery to 0
    try {
      updateCardMastery(deckId!, currentQuestion.card.id, 0);
    } catch (error) {
      console.error("Error updating card mastery:", error);
    }

    // For fill-in-the-blank, show the correct answer
    if (
      currentQuestion.type === "fill-in-the-blank" &&
      currentQuestion.definitionWithBlanks
    ) {
      const correctAnswer = currentQuestion.correctAnswer;
      const blanksPattern = /_+/g;
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
      if (sessionQuestionIndex < sessionQuestions.length - 1) {
        setSessionQuestionIndex(sessionQuestionIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
        setShowFeedback(false);
        setUserInput("");
      } else {
        // Quiz completed
        setShowSessionResults(true);
      }
    }, 2000);
  };

  // On continue, start next session
  const handleContinueSession = () => {
    setShowSessionResults(false);
    setSessionIndex(sessionIndex + 1);
    setSessionQuestionIndex(0);
  };

  // Render different UI based on question type
  const renderQuestionUI = () => {
    if (loading) {
      return <div className="text-center py-8">Loading questions...</div>;
    }

    if (!currentQuestion) {
      return <div className="text-center py-8">No questions available</div>;
    }

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
            </div>
          </>
        );

      case "fill-in-the-blank":
        return (
          <>
            <div className="flex items-center mb-2">
              <h2 className="font-bold text-lg">Fill in the blanks</h2>
              <button 
                className="ml-2 p-1 rounded-full hover:bg-[#252525]"
                onClick={() => speakText(currentQuestion.correctAnswer)}
              >
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
              <button 
                className="ml-2 p-1 rounded-full hover:bg-[#252525]"
                onClick={() => speakText(currentQuestion.correctAnswer)}
              >
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
                        id={`mc-${option}`}
                        disabled={showFeedback}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`mc-${option}`}
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
            </div>
          </>
        );

      case "definition-to-word":
        return (
          <>
            <div className="flex items-center mb-2">
              <h2 className="font-bold text-lg">What's the word?</h2>
              <button 
                className="ml-2 p-1 rounded-full hover:bg-[#252525]"
                onClick={() => speakText(currentQuestion.correctAnswer)}
              >
                <Volume2 className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div
              className={cn(
                "text-xl mb-8 p-4 rounded-xl bg-[#252525]"
              )}
            >
              {currentQuestion.definition}
            </div>

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

      <Dialog open={showSessionResults}>
        <DialogContent className="max-w-xs mx-auto rounded-2xl p-6 text-center bg-white text-black">
          <div className="text-4xl mb-2">😊</div>
          <div className="font-bold text-lg mb-2">Nice work!<br />You've got this.</div>
          <Button onClick={handleContinueSession} className="w-full bg-[#00D6C9] text-white text-lg font-semibold rounded-xl mb-4 mt-2">Continue</Button>
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className="text-xs text-gray-500">OVERALL PROGRESS</div>
              <div className="text-xl font-bold">{sessionStats.progress}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">ROUND IMPROVEMENT</div>
              <div className="text-xl font-bold">{sessionStats.improvement > 0 ? `+${sessionStats.improvement}%` : `${sessionStats.improvement}%`}</div>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="text-center">
              <div className="text-green-600 text-lg font-bold">{sessionStats.mastered}</div>
              <div className="text-xs text-gray-500">MASTERED</div>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-lg font-bold">{sessionStats.known}</div>
              <div className="text-xs text-gray-500">KNOWN</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 text-lg font-bold">{sessionStats.unknown}</div>
              <div className="text-xs text-gray-500">UNKNOWN</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}