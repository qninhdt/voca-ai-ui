import { useNavigate } from "react-router"
import DeckEditor from "@/components/deck-editor"

export default function CreateDeckPage() {
  const navigate = useNavigate()

  const handleSave = () => {
    navigate("/collection")
  }

  return <DeckEditor onSave={handleSave} />
}
