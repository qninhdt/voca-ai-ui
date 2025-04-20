import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { Settings, X, Volume2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  id: string
  definition: string
  correctAnswer: string
  options: string[]
}

export default function QuizPage() {
  const navigate = useNavigate()
  const { id: deckId } = useParams()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

  // Mock quiz questions
  const quizQuestions: QuizQuestion[] = [
    {
      id: "1",
      definition: "conversation about things that are not important",
      correctAnswer: "chatter",
      options: ["chatter", "write", "corridor", "banquet"],
    },
    {
      id: "2",
      definition: "to lift, pull, or move something heavy with great effort",
      correctAnswer: "heave",
      options: ["heave", "clatter", "ivy", "ruddy"],
    },
    {
      id: "3",
      definition: "an evergreen plant that grows up walls and trees",
      correctAnswer: "ivy",
      options: ["ivy", "ruddy", "chatter", "clatter"],
    },
    {
      id: "4",
      definition: "(of a white person's skin) having a red color, often suggesting good health",
      correctAnswer: "ruddy",
      options: ["ruddy", "heave", "banquet", "corridor"],
    },
  ]

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)

    const isAnswerCorrect = answer === quizQuestions[currentQuestionIndex].correctAnswer
    setIsCorrect(isAnswerCorrect)

    if (isAnswerCorrect) {
      setScore(score + 1)
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setIsCorrect(null)
        setShowFeedback(false)
      } else {
        // Quiz completed - could navigate to results page
        // For now, just reset
        // navigate(`/quiz-results/${deckId}`)
      }
    }, 1500)
  }

  const handleDontKnow = () => {
    setSelectedAnswer(null)
    setIsCorrect(false)
    setShowFeedback(true)

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedAnswer(null)
        setIsCorrect(null)
        setShowFeedback(false)
      } else {
        // Quiz completed
      }
    }, 1500)
  }

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white">
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
          <button onClick={() => navigate(`/deck/${deckId}`)} className="p-2 rounded-full hover:bg-[#252525]">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-2 flex items-center gap-2">
        {quizQuestions.map((_, index) => (
          <div key={index} className="flex-1 relative h-2 rounded-full overflow-hidden">
            <div
              className={cn(
                "absolute inset-0 rounded-full",
                index < currentQuestionIndex
                  ? "bg-[#F5B700]"
                  : index === currentQuestionIndex
                    ? "bg-[#F5B700]"
                    : "bg-[#333333]",
              )}
            ></div>
            {index === currentQuestionIndex && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-black">{index + 1}</span>
              </div>
            )}
          </div>
        ))}
        <div className="ml-2 text-sm font-medium">
          {currentQuestionIndex + 1}/{quizQuestions.length}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-6">
        <div className="flex items-center mb-2">
          <h2 className="font-bold text-lg">Definition</h2>
          <button className="ml-2 p-1 rounded-full hover:bg-[#252525]">
            <Volume2 className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <p className="text-xl mb-8">{quizQuestions[currentQuestionIndex].definition}</p>

        <h3 className="font-bold mb-4">Choose matching term</h3>

        <div className="space-y-3">
          {quizQuestions[currentQuestionIndex].options.map((option) => (
            <button
              key={option}
              className={cn(
                "w-full p-4 rounded-xl border border-[#333333] text-left",
                selectedAnswer === option && isCorrect === true
                  ? "bg-green-500/20 border-green-500"
                  : selectedAnswer === option && isCorrect === false
                    ? "bg-red-500/20 border-red-500"
                    : "bg-[#252525] hover:bg-[#333333]",
                showFeedback &&
                  option === quizQuestions[currentQuestionIndex].correctAnswer &&
                  "bg-green-500/20 border-green-500",
              )}
              onClick={() => !showFeedback && handleAnswerSelect(option)}
              disabled={showFeedback}
            >
              {option}
            </button>
          ))}
        </div>
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
  )
} 