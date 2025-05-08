import { useNavigate, useParams } from "react-router"
import DeckEditor from "@/components/deck-editor"

export default function EditDeckPage() {
  const navigate = useNavigate()
  const params = useParams()
  const deckId = params.id as string

  const handleSave = () => {
    navigate(`/deck/${deckId}`)
  }

  return <DeckEditor deckId={deckId} onSave={handleSave} />
} 