import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { Settings, X, Volume2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, playAudio, speakText } from "@/lib/utils"
import { generateSessionQuestions } from "@/lib/spaced-repetition"
import type { Question } from "@/lib/spaced-repetition"
import { updateCardMastery, getDeck, saveSessionTrack } from "@/lib/firebase"
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function QuizPage() {
  const navigate = useNavigate()
  const { id: deckId } = useParams()

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [fillBlankInput, setFillBlankInput] = useState("");
  const [audioPlayed, setAudioPlayed] = useState(false);
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [masteryStats, setMasteryStats] = useState<{ mastered: number, average: number } | null>(null);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      if (deckId) {
        const qs = await generateSessionQuestions(deckId as string);
        setQuestions(qs);
      }
      setLoading(false);
    }
    fetchQuestions();
  }, [deckId]);

  useEffect(() => {
    async function fetchStats() {
      if (sessionFinished && deckId) {
        const deck = await getDeck(deckId as string);
        if (deck && deck.cards && deck.cards.length > 0) {
          const mastered = deck.cards.filter(card => (card.mastery || 0) >= 4).length;
          const average = deck.cards.reduce((sum, card) => sum + (card.mastery || 0), 0) / deck.cards.length;
          setMasteryStats({ mastered, average: Math.round(average * 100) / 100 });
          await saveSessionTrack(deckId as string, Math.round(average * 100) / 100, mastered);
        }
      }
    }
    fetchStats();
  }, [sessionFinished, deckId]);

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">Loading questions...</div>;
  }

  if (!questions.length) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">No questions available.</div>;
  }

  const current = questions[currentQuestionIndex];

  const handleAnswerSelect = async (answer: string) => {
    setSelectedAnswer(answer)
    setShowFeedback(true)
    
    // Check if the answer is correct based on question type
    const correct = current.type === "ai-quiz" 
      ? answer === current.correctAnswer
      : answer.trim().toLowerCase() === current.card.term.trim().toLowerCase();
    
    setIsCorrect(correct)
    if (correct) setScore(score + 1)
    try {
      await updateCardMastery(deckId as string, current.card.id, Math.max(0, (current.card.mastery || 0) + (correct ? 1 : -1)))
    } catch (e) {}
    
    if (current.type === "ai-quiz") {
      setShowContinue(true);
    } else {
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer(null)
          setIsCorrect(null)
          setShowFeedback(false)
          setFillBlankInput("")
          setAudioPlayed(false)
        } else {
          setSessionFinished(true);
        }
      }, 1500)
    }
  }

  const handleContinue = () => {
    setShowContinue(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setIsCorrect(null)
      setShowFeedback(false)
      setFillBlankInput("")
      setAudioPlayed(false)
    } else {
      setSessionFinished(true);
    }
  }

  const handleDontKnow = async () => {
    setSelectedAnswer(null)
    setIsCorrect(false)
    setShowFeedback(true)
    try {
      await updateCardMastery(deckId as string, current.card.id, Math.max(0, (current.card.mastery || 0) - 1))
    } catch (e) {}
    
    if (current.type === "ai-quiz") {
      setShowContinue(true);
    } else {
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          setSelectedAnswer(null)
          setIsCorrect(null)
          setShowFeedback(false)
          setFillBlankInput("")
          setAudioPlayed(false)
        } else {
          setSessionFinished(true);
        }
      }, 1500)
    }
  }

  const handleRedoSession = async () => {
    setSessionFinished(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setShowFeedback(false);
    setFillBlankInput("");
    setAudioPlayed(false);
    setShowContinue(false);
    setLoading(true);
    setMasteryStats(null);
    if (deckId) {
      const qs = await generateSessionQuestions(deckId as string);
      setQuestions(qs);
    }
    setLoading(false);
  }

  return (
    <>
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 animate-spin-slow"></div>
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
          {questions.map((_, index) => (
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
            {currentQuestionIndex + 1}/{questions.length}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-6">
        <div className="flex items-center mb-2">
            {/* show the label Definition if the question is not listening */}
            {current.type !== "listening" && current.type !== "ai-quiz" && (
              <h2 className="font-bold text-lg">Definition</h2>
            )}
            {current.type === "listening" && (
              <div className="w-full flex flex-col items-center justify-center my-6">
                <div className="bg-[#181818] rounded-2xl shadow-lg px-8 py-6 flex flex-col items-center border border-[#252525] max-w-md w-full">
                  <button
                    className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-white via-yellow-500 to-yellow-500 shadow-xl border-4 border-[#252525] focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95 ring-2 ring-yellow-400/30 animate-pulse-once"
                    onClick={async () => {
                      await speakText(current.card.term);
                      setAudioPlayed(true);
                    }}
                    disabled={showFeedback}
                    aria-label="Play word"
                  >
                    <svg className="w-14 h-14 text-white drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polygon points="8,5 19,12 8,19" fill="currentColor" />
                    </svg>
                  </button>
                  <span className="mt-3 text-base font-semibold text-yellow-300 drop-shadow-sm">Tap to play word</span>
                </div>
              </div>
            )}
            {current.type !== "listening" && current.type !== "ai-quiz" && (
              <button className="ml-2 p-1 rounded-full hover:bg-[#252525]" onClick={() => speakText(current.card.term)}>
                <Volume2 className="h-4 w-4 text-gray-400" />
              </button>
            )}
        </div>

          {/* show the definition if question is multiple choice and fill in the blank */}
          {current.type !== "listening" && current.type !== "ai-quiz" && (
            <p className="text-lg text-gray-200">{current.card.definition}</p>
          )} 

          {/* show AI question if type is ai-quiz */}
          {current.type === "ai-quiz" && current.aiQuestion && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-medium bg-[#F5B700]/20 text-[#F5B700] rounded-full border border-[#F5B700]/30">
                  AI Question
                </span>
              </div>
              <p className="text-lg text-gray-200">{current.aiQuestion}</p>
            </div>
          )}

          {/* show the label Choose matching term if the question is multiple choice */}
          <h3 className="font-bold mb-4 mt-8">
            {current.type === "fill-blank" 
              ? "Type your answer" 
              : current.type === "ai-quiz" 
                ? "Select the correct answer" 
                : "Choose matching term"}
          </h3>

        <div className="space-y-3">
            {/* Multiple Choice, Listening & AI Quiz */}
            {((current.type === "multiple-choice" || current.type === "ai-quiz") || 
              (current.type === "listening" && audioPlayed)) && current.options && (
              current.options.map((option) => (
                <button
                  key={option}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-colors duration-300",
                    selectedAnswer === option && isCorrect === true
                      ? "bg-green-500/20 border-green-500"
                      : selectedAnswer === option && isCorrect === false
                        ? "bg-red-500/20 border-red-500"
                        : "bg-[#252525] border-[#333333] hover:bg-[#333333]",
                    showFeedback &&
                      ((current.type === "ai-quiz" && option === current.correctAnswer) ||
                       (current.type !== "ai-quiz" && option === current.card.term)) &&
                      "bg-green-500/20 border-green-500",
                  )}
                  onClick={() => !showFeedback && handleAnswerSelect(option)}
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))
            )}

            {/* Fill in the Blank */}
            {current.type === "fill-blank" && (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (!showFeedback) handleAnswerSelect(fillBlankInput)
                }}
                className="flex flex-col gap-3"
              >
                <input
                  type="text"
                  className={cn(
                    "w-full p-4 rounded-xl border bg-[#252525] text-white transition-colors duration-300 focus:outline-none",
                    showFeedback && isCorrect === true && "border-green-500",
                    showFeedback && isCorrect === false && "border-red-500",
                    !showFeedback && "border-[#333333] focus:border-blue-400"
                  )}
                  placeholder="Type your answer..."
                  value={fillBlankInput}
                  onChange={e => setFillBlankInput(e.target.value)}
                  disabled={showFeedback}
                  autoFocus
                />
                <Button type="submit" disabled={showFeedback || !fillBlankInput.trim()}>
                  Submit
                </Button>
                {showFeedback && (
                  <div
                    className={cn(
                      "mt-2 text-base font-semibold transition-all duration-300",
                      isCorrect ? "text-green-400 animate-pulse" : "text-red-400 animate-shake"
                    )}
                  >
                    {isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${current.card.term}`}
                  </div>
                )}
              </form>
            )}

            {/* AI Quiz Explanation */}
            {current.type === "ai-quiz" && showFeedback && current.aiExplanation && (
              <><div className="mt-4 p-4 bg-[#252525] rounded-xl border border-[#333333]">
                <p className="text-gray-200">{current.aiExplanation}</p>
              </div>
              
              {showContinue && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleContinue}
                    className="bg-[#F5B700] text-black hover:bg-[#E5A700]"
                  >
                    Continue
                  </Button>
                </div>
              )}
              </>
            )}
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

      <Dialog open={sessionFinished} onOpenChange={setSessionFinished}>
        <DialogContent className="bg-[#181818] rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-yellow-400">Session Complete!</h2>
          <p className="text-lg text-gray-200 mb-6">You finished this learning session.<br/>Score: {score} / {questions.length}</p>
          {masteryStats && (
            <table className="w-full mb-6 text-center border-separate border-spacing-y-2">
              <tbody>
                <tr>
                  <td className="text-gray-300 font-semibold">Mastered Words</td>
                  <td className="text-yellow-400 font-bold">{masteryStats.mastered}</td>
                </tr>
                <tr>
                  <td className="text-gray-300 font-semibold">Average Mastery</td>
                  <td className="text-yellow-400 font-bold">{masteryStats.average}</td>
                </tr>
              </tbody>
            </table>
          )}
          <div className="flex gap-3">
            <Button className="bg-yellow-400 text-black font-bold px-6 py-2 rounded-xl" onClick={handleRedoSession}>
              Redo Session
            </Button>
            <Button className="bg-[#252525] text-yellow-400 font-bold px-6 py-2 rounded-xl border border-yellow-400" onClick={() => navigate(`/deck/${deckId}`)}>
              Exit to Deck
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 