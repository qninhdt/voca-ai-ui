import { useState, useEffect } from "react"
import { ArrowLeft, Search, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Link, useNavigate, useParams } from "react-router"
import { getFolder, updateFolder, getUserDecks, addDeckToFolder, removeDeckFromFolder } from "@/lib/firebase"
import { auth } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"

interface Deck {
  id: string;
  title?: string;
  description?: string;
  cards?: { id: string; term: string; definition: string }[];
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

export default function EditFolderPage() {
  const navigate = useNavigate()
  const params = useParams()
  const folderId = params.id as string

  const [folder, setFolder] = useState<Folder | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [allDecks, setAllDecks] = useState<Deck[]>([])
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([])
  const [folderDecks, setFolderDecks] = useState<Deck[]>([])

  useEffect(() => {
    const loadData = async () => {
      const user = auth.currentUser
      if (!user) {
        navigate("/collection")
        return
      }

      try {
        const folderData = await getFolder(folderId)
        if (!folderData) {
          navigate("/collection")
          return
        }

        setFolder(folderData)
        setName(folderData.name)
        setDescription(folderData.description || "")

        // Load all user's decks
        const decks = await getUserDecks(user.uid)
        setAllDecks(decks)

        // Filter decks that are in the folder
        const folderDeckIds = new Set(folderData.deckIds)
        const inFolder = decks.filter(deck => folderDeckIds.has(deck.id))
        const notInFolder = decks.filter(deck => !folderDeckIds.has(deck.id))
        
        setFolderDecks(inFolder)
        setFilteredDecks(notInFolder)
      } catch (error) {
        console.error("Error loading folder:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [folderId, navigate])

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const filtered = allDecks.filter(deck => 
        !folderDecks.some(fd => fd.id === deck.id) && // Not already in folder
        (deck.title?.toLowerCase().includes(query) || 
         deck.description?.toLowerCase().includes(query))
      )
      setFilteredDecks(filtered)
    } else {
      const notInFolder = allDecks.filter(deck => 
        !folderDecks.some(fd => fd.id === deck.id)
      )
      setFilteredDecks(notInFolder)
    }
  }, [searchQuery, allDecks, folderDecks])

  const handleSave = async () => {
    if (!name.trim() || !folder) return

    setSaving(true)
    try {
      await updateFolder(folderId, {
        name: name.trim(),
        description: description.trim()
      })
      navigate("/collection")
    } catch (error) {
      console.error("Error updating folder:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddDeck = async (deckId: string) => {
    try {
      await addDeckToFolder(folderId, deckId)
      const deck = allDecks.find(d => d.id === deckId)
      if (deck) {
        setFolderDecks([...folderDecks, deck])
        setFilteredDecks(filteredDecks.filter(d => d.id !== deckId))
      }
    } catch (error) {
      console.error("Error adding deck to folder:", error)
    }
  }

  const handleRemoveDeck = async (deckId: string) => {
    try {
      await removeDeckFromFolder(folderId, deckId)
      const deck = folderDecks.find(d => d.id === deckId)
      if (deck) {
        setFolderDecks(folderDecks.filter(d => d.id !== deckId))
        setFilteredDecks([...filteredDecks, deck])
      }
    } catch (error) {
      console.error("Error removing deck from folder:", error)
    }
  }

  if (loading) {
    return <div className="text-gray-400">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <Link to="/collection">
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <h1 className="text-lg font-medium">Edit Folder</h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="bg-[#F5B700] text-black hover:bg-[#E5A700]"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </header>

      {/* Folder Info */}
      <div className="p-4 space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Folder Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#252525] border-none text-lg font-medium"
          />
        </div>
        <div>
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#252525] border-none resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Decks in Folder */}
      <div className="px-4 py-2">
        <h2 className="text-lg font-medium mb-3">Decks in Folder</h2>
        <div className="space-y-3">
          {folderDecks.map((deck) => (
            <div key={deck.id} className="bg-[#252525] rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{deck.title}</h3>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-[#333333] text-white border-none mr-2">
                      {deck.cards?.length || 0} terms
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveDeck(deck.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Decks */}
      <div className="px-4 py-2">
        <h2 className="text-lg font-medium mb-3">Add Decks</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search decks..."
            className="w-full bg-[#252525] border-none pl-10 text-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          {filteredDecks.map((deck) => (
            <div key={deck.id} className="bg-[#252525] rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{deck.title}</h3>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-[#333333] text-white border-none mr-2">
                      {deck.cards?.length || 0} terms
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleAddDeck(deck.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 