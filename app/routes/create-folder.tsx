import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Link, useNavigate } from "react-router"
import { createFolder } from "@/lib/firebase"
import { auth } from "@/lib/firebase"

export default function CreateFolderPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return

    const user = auth.currentUser
    if (!user) {
      console.error("User must be logged in to create a folder")
      return
    }

    setLoading(true)
    try {
      await createFolder({
        name: name.trim(),
        description: description.trim(),
        deckIds: [],
        userId: user.uid
      })
      navigate("/collection")
    } catch (error) {
      console.error("Error creating folder:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <div className="flex items-center gap-2">
          <Link to="/collection">
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <h1 className="text-lg font-medium">Create Folder</h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={loading || !name.trim()}
          className="bg-[#F5B700] text-black hover:bg-[#E5A700]"
        >
          {loading ? "Creating..." : "Create"}
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

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="bg-[#252525] rounded-xl p-8 mb-4">
            <div className="text-gray-400 text-sm">
              Add decks to this folder after creating it
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 