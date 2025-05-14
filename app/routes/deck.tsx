import { useState, useEffect } from "react"
import { Star, Volume2, Edit, MoreHorizontal, ArrowLeft, Bookmark, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useParams, useNavigate } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import ProfileDrawer from "@/components/profile-drawer"
import { getDeck, updateCardMastery, deleteDeck, getSessionTracks } from "@/lib/firebase"
import type { SessionTrack } from "@/lib/firebase"
import { speakText, stopSpeaking } from "@/lib/utils"
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Card {
  id: string;
  term: string;
  definition: string;
  mastery?: number;
}

interface Deck {
  id: string;
  title?: string;
  description?: string;
  cards?: Card[];
  author?: string;
  authorImage?: string;
  folder?: string;
  updatedAt?: { seconds: number };
  createdAt?: { seconds: number };
}

export default function DeckPage() {
  const navigate = useNavigate()
  const params = useParams()
  const deckId = params.id

  const [viewMode, setViewMode] = useState<"main" | "flashcards">("main")
  const [showDefinitions, setShowDefinitions] = useState(true)
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sessionTracks, setSessionTracks] = useState<SessionTrack[]>([]);

  useEffect(() => {
    if (deckId) {
      setLoading(true)
      getDeck(deckId).then((fetchedDeck) => {
        if (fetchedDeck) {
          setDeck(fetchedDeck as Deck)
        }
        setLoading(false)
      })
    }
  }, [deckId])

  useEffect(() => {
    async function fetchTracks() {
      if (deckId) {
        const tracks = await getSessionTracks(deckId as string);
        setSessionTracks(tracks.sort((a, b) => a.timestamp - b.timestamp));
      }
    }
    fetchTracks();
  }, [deckId]);

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

  const handleMasteryUpdate = async (cardId: string, newMastery: number) => {
    if (!deckId) return
    await updateCardMastery(deckId, cardId, newMastery)
    // Update local state
    setDeck(prev => {
      if (!prev) return null
      return {
        ...prev,
        cards: prev.cards?.map(card => 
          card.id === cardId ? { ...card, mastery: newMastery } : card
        )
      }
    })
  }

  const handleSpeak = async (text: string) => {
    await speakText(text)
  }

  const getMasteryStats = () => {
    if (!deck?.cards) return { total: 0, learning: 0, mastered: 0 }
    
    const total = deck.cards.length
    const learning = deck.cards.filter(card => (card.mastery || 0) < 4).length
    const mastered = total - learning
    
    return { total, learning, mastered }
  }

  const studyModes = [
    { id: "flashcards", name: "Flashcards", icon: "🃏", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
    { id: "learn", name: "Learn", icon: "🔄", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
    // { id: "test", name: "Test", icon: "📝", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
    // { id: "blocks", name: "Blocks", icon: "🧩", color: "bg-[#333333]", textColor: "text-[#F5B700]", isNew: true },
    // { id: "blast", name: "Blast", icon: "🚀", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
    // { id: "match", name: "Match", icon: "🔍", color: "bg-[#333333]", textColor: "text-[#F5B700]" },
  ]

  if (loading) {
    return <div className="text-gray-400">Loading...</div>
  }

  if (!deck) {
    return <div className="text-gray-400">Deck not found</div>
  }

  const stats = getMasteryStats()

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <button onClick={handleBack} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="text-2xl font-bold text-[#F5B700]">VocaAI</div>
        <ProfileDrawer />
      </header>

      {/* Main Content */}
      <div className="flex flex-col">
        {/* Folder and Title */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span className="mr-1">📁</span>
            {deck.folder || "No folder"}
          </div>
          <h1 className="text-2xl font-bold mt-1">{deck.title}</h1>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 px-4 py-2">
          {/* <Button
            variant="outline"
            size="sm"
            className="rounded-xl bg-[#333333] border-none text-[#F5B700]"
          >
            <Bookmark className="h-4 w-4 mr-1" />
            Saved
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl bg-[#333333] border-none text-white">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button> */}
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl bg-[#333333] border-none text-white"
            onClick={() => navigate(`/edit-deck/${deckId}`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl bg-[#333333] border-none text-red-400"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
          {/* <Button variant="outline" size="sm" className="rounded-xl bg-[#333333] border-none text-white">
            <MoreHorizontal className="h-4 w-4" />
          </Button> */}
        </div>

        {/* Stats */}
        <div className="px-4 py-3">
          <div className="bg-[#252525] rounded-xl p-4">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F5B700]">{stats.total}</div>
                <div className="text-xs text-gray-400">Total Terms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F5B700]">{stats.learning}</div>
                <div className="text-xs text-gray-400">Learning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#F5B700]">
                  {Math.round((stats.mastered / stats.total) * 100)}%
                </div>
                <div className="text-xs text-gray-400">Mastered</div>
              </div>
            </div>
          </div>
        </div>

        {sessionTracks.length > 1 && (
          <div className="px-4 py-3">
            <h3 className="text-lg font-bold mb-2 text-[#F5B700]">Progress Over Time</h3>
            <div className="bg-[#252525] rounded-xl p-4">
              <Line
                data={{
                  labels: sessionTracks.map((_, i) => `Session ${i + 1}`),
                  datasets: [
                    {
                      label: 'Avg Mastery',
                      data: sessionTracks.map(t => t.avgMastery),
                      borderColor: '#F5B700',
                      backgroundColor: 'rgba(245,183,0,0.2)',
                      tension: 0.3,
                      yAxisID: 'y',
                    },
                    {
                      label: 'Mastered Words',
                      data: sessionTracks.map(t => t.masteredCount),
                      borderColor: '#00FF99',
                      backgroundColor: 'rgba(0,255,153,0.2)',
                      tension: 0.3,
                      yAxisID: 'y1',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      labels: { color: '#fff' },
                    },
                    title: {
                      display: false,
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: '#fff' },
                      grid: { color: '#444' },
                    },
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                      title: { display: true, text: 'Avg Mastery', color: '#F5B700' },
                      min: 0,
                      max: 5,
                      ticks: { color: '#F5B700', stepSize: 1 },
                      grid: { color: '#333' },
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
                      title: { display: true, text: 'Mastered Words', color: '#00FF99' },
                      min: 0,
                      max: Math.max(...sessionTracks.map(t => t.masteredCount), 5),
                      ticks: { color: '#00FF99', stepSize: 1 },
                      grid: { drawOnChartArea: false },
                    },
                  },
                }}
                height={180}
              />
            </div>
          </div>
        )}

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

        {/* Flashcards List */}
        <div className="px-4 py-4 mt-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold">Terms ({deck.cards?.length || 0})</h2>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl bg-[#333333] border-none text-white"
              onClick={() => setShowDefinitions(!showDefinitions)}
            >
              {showDefinitions ? "Hide definitions" : "Show definitions"}
            </Button>
          </div>

          {deck.cards?.map((card) => (
            <div key={card.id} className="bg-[#252525] rounded-xl p-4 mb-3">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">{card.term}</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleSpeak(card.term)}>
                    <Volume2 className="h-5 w-5 text-gray-400" />
                  </button>
                  <button onClick={() => navigate(`/edit-deck/${deckId}`)}>
                    <Edit className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
              {showDefinitions && <p className="text-gray-300 mt-2">{card.definition}</p>}
              <div className="mt-2">
                <Progress
                  value={((card.mastery || 0) / 5) * 100}
                  className="h-1 bg-[#333333]"
                  indicatorClassName="bg-[#F5B700]"
                />
                <div className="text-xs text-gray-400 mt-1">
                  Mastery: {card.mastery || 0}/5
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#181818] rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2 text-red-400">Delete Deck?</h2>
          <p className="text-lg text-gray-200 mb-6 text-center">Are you sure you want to delete this deck? This action cannot be undone.</p>
          <div className="flex gap-4 mt-2">
            <Button
              className="bg-red-400 text-black font-bold px-6 py-2 rounded-xl"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                if (deckId) {
                  await deleteDeck(deckId as string);
                  setShowDeleteDialog(false);
                  navigate('/collection');
                }
                setDeleting(false);
              }}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              variant="outline"
              className="px-6 py-2 rounded-xl border border-gray-600 text-gray-200"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 