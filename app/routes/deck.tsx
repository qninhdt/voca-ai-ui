import { useState } from "react"
import { Star, Volume2, Edit, MoreHorizontal, ArrowLeft, Bookmark, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useParams, useNavigate } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import ProfileDrawer from "@/components/profile-drawer"

export default function DeckPage() {
  const navigate = useNavigate()
  const params = useParams()
  const deckId = params.id

  const [viewMode, setViewMode] = useState<"main" | "flashcards">("main")
  const [showDefinitions, setShowDefinitions] = useState(true)

  // Mock data for the deck
  const deck = {
    id: deckId,
    title: "HP 1.6 - 1.7",
    folder: "HAIRY POTTER",
    author: "qninh",
    authorImage: "/placeholder.svg?height=24&width=24",
    saved: true,
    totalTerms: 87,
    stillLearning: 21,
    progress: 1,
    totalProgress: 7,
  }

  // Mock data for flashcards
  const flashcards = [
    {
      id: "1",
      term: "ruddy",
      definition: "(of a white person's skin) having a red color, often suggesting good health",
      starred: false,
    },
    {
      id: "2",
      term: "chatter",
      definition: "to talk for a long time about things that are not important",
      starred: false,
    },
    {
      id: "3",
      term: "chatter",
      definition: "conversation about things that are not important",
      starred: false,
    },
    {
      id: "4",
      term: "heave",
      definition: "to lift, pull, or move something heavy with great effort",
      starred: false,
    },
    {
      id: "5",
      term: "clatter",
      definition:
        "to make continuous loud noises by hitting hard objects against each other, or to cause objects to do this",
      starred: false,
    },
    {
      id: "6",
      term: "ivy",
      definition: "an evergreen plant (= one that never loses its leaves) that grows up walls and trees",
      starred: false,
    },
  ]

  const studyModes = [
    { id: "flashcards", name: "Flashcards", icon: "🃏", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
    { id: "learn", name: "Learn", icon: "🔄", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
    { id: "test", name: "Test", icon: "📝", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
    { id: "blocks", name: "Blocks", icon: "🧩", color: "bg-[#333333]", textColor: "text-[#F5B700]", isNew: true },
    { id: "blast", name: "Blast", icon: "🚀", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
    { id: "match", name: "Match", icon: "🔍", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
  ]

  const handleModeSelect = (mode: string) => {
    if (mode === "flashcards") {
      navigate(`/learn/${deckId}`)
    } else if (mode === "learn") {
      navigate(`/quiz/${deckId}`)
    }
  }

  const handleBack = () => {
    if (viewMode === "main") {
      navigate("/collection")
    } else {
      setViewMode("main")
    }
  }

  const renderMainView = () => (
    <div className="flex flex-col">
      {/* Folder and Title */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <span className="mr-1">📁</span>
          {deck.folder}
        </div>
        <h1 className="text-2xl font-bold mt-1">{deck.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={deck.authorImage || "/placeholder.svg"} alt={deck.author} />
            <AvatarFallback className="bg-[#F5B700] text-black text-xs">{deck.author.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-400">{deck.author}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 px-4 py-2">
        <Button
          variant="outline"
          size="sm"
          className={`rounded-xl ${
            deck.saved ? "bg-[#333333] border-none text-[#F5B700]" : "bg-[#333333] border-none text-gray-400"
          }`}
        >
          <Bookmark className="h-4 w-4 mr-1" />
          Saved
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl bg-[#333333] border-none text-white">
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl bg-[#333333] border-none text-white ml-auto">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="px-4 py-3">
        <div className="bg-[#252525] rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F5B700]">{deck.totalTerms}</div>
              <div className="text-xs text-gray-400">Total Terms</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F5B700]">{deck.stillLearning}</div>
              <div className="text-xs text-gray-400">Learning</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F5B700]">
                {Math.round(((deck.totalTerms - deck.stillLearning) / deck.totalTerms) * 100)}%
              </div>
              <div className="text-xs text-gray-400">Mastered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Study Modes Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 py-3">
        {studyModes.map((mode) => (
          <button
            key={mode.id}
            className="bg-[#252525] rounded-xl p-4 flex flex-col items-center justify-center h-24"
            onClick={() => handleModeSelect(mode.id)}
          >
            <div className={`w-10 h-10 rounded-full ${mode.color} flex items-center justify-center mb-2`}>
              <span className={`text-xl ${mode.textColor}`}>{mode.icon}</span>
            </div>
            <div className="flex items-center">
              <span>{mode.name}</span>
              {mode.isNew && <Badge className="ml-2 bg-[#F5B700] text-black text-xs">New</Badge>}
            </div>
          </button>
        ))}
      </div>

      {/* Learn Progress */}
      <div className="bg-[#252525] rounded-xl mx-4 p-4 mt-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center mr-2">
              <span className="text-lg text-[#F5B700]">🔄</span>
            </div>
            <span className="font-medium">Continue Learning</span>
          </div>
          <span className="text-gray-400">
            {deck.progress} / {deck.totalProgress}
          </span>
        </div>
        <Progress
          value={(deck.progress / deck.totalProgress) * 100}
          className="h-1 bg-[#333333]"
          indicatorClassName="bg-[#F5B700]"
        />
        <div className="mt-4">
          <p className="text-gray-300">an evergreen plant (= one that never loses its</p>
        </div>
        <Button
          className="w-full mt-4 bg-[#F5B700] text-black hover:bg-[#E5A700]"
          onClick={() => navigate(`/quiz/${deckId}`)}
        >
          Continue Learning
        </Button>
      </div>

      {/* Flashcards List */}
      <div className="px-4 py-4 mt-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">Terms ({flashcards.length})</h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl bg-[#333333] border-none text-white"
            onClick={() => setShowDefinitions(!showDefinitions)}
          >
            {showDefinitions ? "Hide definitions" : "Show definitions"}
          </Button>
        </div>

        {flashcards.slice(0, 3).map((card) => (
          <div key={card.id} className="bg-[#252525] rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg">{card.term}</h3>
              <div className="flex gap-2">
                <button>
                  <Star className="h-5 w-5 text-gray-400" />
                </button>
                <button>
                  <Volume2 className="h-5 w-5 text-gray-400" />
                </button>
                <button>
                  <Edit className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>
            {showDefinitions && <p className="text-gray-300 mt-2">{card.definition}</p>}
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full mt-2 border-dashed border-[#333333] text-gray-400 hover:bg-[#252525]"
          onClick={() => navigate(`/learn/${deckId}`)}
        >
          View all {flashcards.length} terms
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <button onClick={handleBack} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="text-2xl font-bold text-[#F5B700]">VocaAI</div>
        <ProfileDrawer username="qninh" email="qndt123@gmail.com" />
      </header>

      {/* Main Content */}
      {viewMode === "main" ? renderMainView() : null}
    </div>
  )
} 