import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { ChevronLeft, ChevronRight, Star, Volume2, Settings, X, Play, Maximize2, ChevronDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn, speakText } from "@/lib/utils"
import { getDeck } from "@/lib/firebase"

interface Flashcard {
  id: string
  term: string
  definition: string
  starred?: boolean
}

export default function FlashcardLearningPage() {
  const navigate = useNavigate()
  const params = useParams()
  const deckId = params.id as string

  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showDefinition, setShowDefinition] = useState(false)
  const [trackProgress, setTrackProgress] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeck() {
      setLoading(true)
      if (deckId) {
        const deck = await getDeck(deckId)
        setFlashcards(deck?.cards || [])
      }
      setLoading(false)
    }
    fetchDeck()
  }, [deckId])

  const toggleStar = () => {
    const updatedFlashcards = [...flashcards]
    updatedFlashcards[currentCardIndex].starred = !updatedFlashcards[currentCardIndex].starred
    setFlashcards(updatedFlashcards)
  }

  const nextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowDefinition(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowDefinition(false)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      nextCard()
    } else if (e.key === "ArrowLeft") {
      prevCard()
    } else if (e.key === " ") {
      setShowDefinition(!showDefinition)
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [currentCardIndex, showDefinition])

  if (loading) {
    return <div className="flex flex-col min-h-full items-center justify-center text-gray-400">Loading...</div>
  }
  if (!flashcards.length) {
    return <div className="flex flex-col min-h-full items-center justify-center text-gray-400">No cards in this deck.</div>
  }

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A]">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2 p-2 rounded-full hover:bg-[#252525]">
            <ChevronDown className="h-5 w-5" />
          </button>
          <span className="font-medium">
            {currentCardIndex + 1} / {flashcards.length}
          </span>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-md aspect-[3/4] bg-[#252525] rounded-xl flex flex-col items-center justify-center p-6 relative cursor-pointer shadow-lg",
            showDefinition ? "bg-[#2A2A2A]" : "bg-[#252525]",
          )}
          onClick={() => setShowDefinition(!showDefinition)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              className="p-2 rounded-full hover:bg-[#333333] transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                speakText(flashcards[currentCardIndex].term)
              }}
            >
              <Volume2 className="h-5 w-5 text-gray-400" />
            </button>
            <button
              className="p-2 rounded-full hover:bg-[#333333] transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                toggleStar()
              }}
            >
              <Star
                className={cn(
                  "h-5 w-5",
                  flashcards[currentCardIndex].starred ? "text-[#F5B700] fill-[#F5B700]" : "text-gray-400",
                )}
              />
            </button>
          </div>

          <div className="text-center">
            {!showDefinition ? (
              <h2 className="text-3xl font-bold">{flashcards[currentCardIndex].term}</h2>
            ) : (
              <div>
                <p className="text-sm text-gray-400 mb-2">Definition</p>
                <p className="text-xl">{flashcards[currentCardIndex].definition}</p>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 w-full px-6 text-center text-sm text-gray-400">
            {!showDefinition ? "Tap to see definition" : "Tap to see term"}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="p-4 bg-[#1A1A1A]">
        <div className="flex justify-center items-center mb-6">
          <button
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mr-4",
              currentCardIndex === 0 ? "text-gray-600 bg-[#252525]" : "text-white bg-[#252525] hover:bg-[#333333]",
            )}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextCard}
            disabled={currentCardIndex === flashcards.length - 1}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              currentCardIndex === flashcards.length - 1
                ? "text-gray-600 bg-[#252525]"
                : "text-white bg-[#252525] hover:bg-[#333333]",
            )}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button className="p-2 text-gray-400">
            <Play className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-2">Track progress</span>
            <Switch
              checked={trackProgress}
              onCheckedChange={setTrackProgress}
              className="data-[state=checked]:bg-[#F5B700]"
            />
          </div>

          <button onClick={toggleFullscreen} className="p-2 text-gray-400">
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 