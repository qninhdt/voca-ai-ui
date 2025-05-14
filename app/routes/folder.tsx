import { useState, useEffect } from "react"
import { useParams, Link } from "react-router"
import { BookOpen, FolderOpen, Edit, Trash2, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFolder, getUserDecks, deleteDeck } from "@/lib/firebase"
import { auth } from "@/lib/firebase"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  updatedAt?: { seconds: number };
  createdAt?: { seconds: number };
  userId: string;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  deckIds: string[];
  userId: string;
  updatedAt?: { seconds: number };
  createdAt?: { seconds: number };
}

export default function FolderPage() {
  const { id } = useParams()
  const [folder, setFolder] = useState<Folder | null>(null)
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCards: 0,
    masteredCards: 0,
    averageMastery: 0,
    totalDecks: 0
  })

  useEffect(() => {
    const loadFolderData = async () => {
      if (!id) return
      
      setLoading(true)
      const folderData = await getFolder(id)
      if (!folderData) return

      setFolder(folderData)
      
      // Get all decks in the folder
      const allDecks = await getUserDecks(folderData.userId)
      const folderDecks = allDecks.filter(deck => folderData.deckIds.includes(deck.id))
      setDecks(folderDecks)

      // Calculate stats
      const totalCards = folderDecks.reduce((sum, deck) => sum + (deck.cards?.length || 0), 0)
      const masteredCards = folderDecks.reduce((sum, deck) => {
        return sum + (deck.cards?.filter(card => card.mastery === 5).length || 0)
      }, 0)
      const totalMastery = folderDecks.reduce((sum, deck) => {
        return sum + (deck.cards?.reduce((cardSum, card) => cardSum + (card.mastery || 0), 0) || 0)
      }, 0)
      const averageMastery = totalCards > 0 ? totalMastery / totalCards : 0

      setStats({
        totalCards,
        masteredCards,
        averageMastery,
        totalDecks: folderDecks.length
      })
      
      setLoading(false)
    }

    loadFolderData()
  }, [id])

  const handleDeleteFolder = async () => {
    if (!folder) return
    
    // Delete all decks in the folder
    for (const deckId of folder.deckIds) {
      await deleteDeck(deckId)
    }
    
    // Redirect to collection page
    window.location.href = "/collection"
  }

  if (loading) {
    return <div className="text-gray-400 p-4">Loading...</div>
  }

  if (!folder) {
    return <div className="text-gray-400 p-4">Folder not found</div>
  }

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-[#F5B700]" />
          <h1 className="text-2xl font-bold">{folder.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link to={`/edit-folder/${folder.id}`}>
            <Button variant="outline" className="bg-[#252525] border-none text-white">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-[#252525] border-none text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#252525] text-white border-[#333333]">
              <DialogHeader>
                <DialogTitle>Delete Folder</DialogTitle>
              </DialogHeader>
              <p className="text-gray-400">Are you sure you want to delete this folder and all its decks? This action cannot be undone.</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" className="bg-[#333333] border-none text-white">
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-red-500 border-none text-white"
                  onClick={handleDeleteFolder}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Stats Section */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#252525] rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Cards</div>
            <div className="text-2xl font-bold mt-1">{stats.totalCards}</div>
          </div>
          <div className="bg-[#252525] rounded-xl p-4">
            <div className="text-gray-400 text-sm">Mastered Cards</div>
            <div className="text-2xl font-bold mt-1">{stats.masteredCards}</div>
          </div>
          <div className="bg-[#252525] rounded-xl p-4">
            <div className="text-gray-400 text-sm">Average Mastery</div>
            <div className="text-2xl font-bold mt-1">{stats.averageMastery.toFixed(1)}</div>
          </div>
          <div className="bg-[#252525] rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Decks</div>
            <div className="text-2xl font-bold mt-1">{stats.totalDecks}</div>
          </div>
        </div>
      </div>

      {/* Decks List */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Decks in this folder</h2>
        <div className="space-y-4">
          {decks.map((deck) => (
            <Link to={`/deck/${deck.id}`} key={deck.id}>
              <div className="bg-[#252525] rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{deck.title}</h3>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="bg-[#333333] text-white border-none mr-2">
                        {deck.cards?.length || 0} terms
                      </Badge>
                      <Badge variant="outline" className="bg-[#333333] text-white border-none">
                        {deck.cards?.filter(card => card.mastery === 5).length || 0} mastered
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-[#333333] p-2 rounded-lg">
                    <BookOpen className="h-5 w-5 text-[#F5B700]" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
