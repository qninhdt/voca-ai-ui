import { useState, useEffect } from "react"
import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createDeck, updateDeck, getDeck } from "@/lib/firebase"
import { auth } from "@/lib/firebase"
import { Link } from "react-router"

interface Card {
  id: string
  term: string
  definition: string
}

interface Deck {
  id: string
  title?: string
  description?: string
  cards?: Card[]
  updatedAt?: { seconds: number }
  createdAt?: { seconds: number }
}

interface DeckEditorProps {
  deckId?: string
  onSave?: () => void
}

export default function DeckEditor({ deckId, onSave }: DeckEditorProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (deckId) {
      setLoading(true)
      getDeck(deckId).then((deck) => {
        if (deck) {
          const typedDeck = deck as Deck
          setTitle(typedDeck.title || "")
          setDescription(typedDeck.description || "")
          setCards(typedDeck.cards || [])
        }
        setLoading(false)
      })
    }
  }, [deckId])

  const handleAddCard = () => {
    setCards([...cards, { id: Date.now().toString(), term: "", definition: "" }])
  }

  const handleChangeTerm = (id: string, value: string) => {
    setCards(cards.map(card => card.id === id ? { ...card, term: value } : card))
  }

  const handleChangeDefinition = (id: string, value: string) => {
    setCards(cards.map(card => card.id === id ? { ...card, definition: value } : card))
  }

  const handleSave = async () => {
    if (!title.trim()) return

    const user = auth.currentUser
    if (!user) {
      // Handle case where user is not logged in
      console.error("User must be logged in to create a deck")
      return
    }

    const deckData = {
      title: title.trim(),
      description: description.trim(),
      cards: cards.filter(card => card.term.trim() && card.definition.trim()),
      userId: user.uid
    }

    if (deckId) {
      await updateDeck(deckId, deckData)
    } else {
      await createDeck(deckData, user.uid)
    }

    if (onSave) {
      onSave()
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
          <h1 className="text-lg font-medium">{deckId ? "Edit Deck" : "Create Deck"}</h1>
        </div>
        <Button 
          onClick={handleSave}
          className="bg-[#F5B700] text-black hover:bg-[#E5A700]"
        >
          {deckId ? "Update" : "Create"}
        </Button>
      </header>

      {/* Deck Info */}
      <div className="p-4 space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Deck Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

      {/* Cards */}
      <div className="flex-1 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Cards</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleAddCard}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-[#252525] rounded-xl p-4 space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Term"
                  value={card.term}
                  onChange={(e) => handleChangeTerm(card.id, e.target.value)}
                  className="bg-[#333333] border-none"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Definition"
                  value={card.definition}
                  onChange={(e) => handleChangeDefinition(card.id, e.target.value)}
                  className="bg-[#333333] border-none resize-none"
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
