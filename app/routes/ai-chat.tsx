import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Copy, ThumbsUp, Volume2, Share2, Send, Mic, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"
import ProfileDrawer from "@/components/profile-drawer"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

type Assistant = {
  id: string
  name: string
  description: string
  avatar?: string
}

export default function AIChatPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Describe to me the basic principles of healthy eating briefly, but with all the important aspects, please. Also you can tell me a little more about the topic of sports and training",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: "2",
      content:
        "Basic principles of a healthy diet: Balance. Make sure your diet contains all the essential macro and micronutrients in the correct proportions: carbohydrates, proteins, fats, vitamins, and minerals. It is important to maintain a balance of calories to meet your body's needs, but not to overeat.",
      sender: "ai",
      timestamp: new Date(Date.now() - 1000 * 60 * 4),
    },
    {
      id: "3",
      content: "Tell me more about it, please",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
  ])

  const [selectedAssistant, setSelectedAssistant] = useState<Assistant>({
    id: "1",
    name: "Study Coach",
    description: "Learning strategies & study tips",
    avatar: "/placeholder.svg?height=40&width=40",
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const assistants: Assistant[] = [
    {
      id: "1",
      name: "Study Coach",
      description: "Learning strategies & study tips",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Language Tutor",
      description: "Vocabulary & grammar help",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Quiz Master",
      description: "Test preparation & practice",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: "user",
        timestamp: new Date(),
      }

      setMessages([...messages, newMessage])
      setMessage("")

      // Simulate AI response after a short delay
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content:
            "I'm your AI study assistant. I can help you learn more effectively by providing study techniques, explaining concepts, and creating practice materials tailored to your needs.",
          sender: "ai",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiResponse])
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A] text-white overflow-hidden">
      {/* Header - Fixed */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333] z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-md bg-[#F5B700] flex items-center justify-center mr-3">
            <span className="text-black font-bold">✦</span>
          </div>
          <div>
            <div className="font-medium">{selectedAssistant.name}</div>
            <div className="text-xs text-gray-400">{selectedAssistant.description}</div>
          </div>
        </div>
        <ProfileDrawer />
      </header>

      {/* Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-4`}>
            {msg.sender === "ai" && (
              <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                <AvatarImage src={selectedAssistant.avatar || "/placeholder.svg"} alt={selectedAssistant.name} />
                <AvatarFallback className="bg-[#F5B700] text-black">{selectedAssistant.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-[#F5B700] text-black rounded-br-none"
                  : "bg-[#252525] text-white rounded-bl-none"
              }`}
            >
              <p>{msg.content}</p>
            </div>
            {msg.sender === "user" && (
              <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback className="bg-[#333333]">U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Message actions for AI messages */}
        {messages.length > 0 && messages[messages.length - 1].sender === "ai" && (
          <div className="flex items-center space-x-2 ml-10">
            <button className="p-2 rounded-full bg-[#252525] hover:bg-[#333333]">
              <Copy className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-full bg-[#252525] hover:bg-[#333333]">
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-full bg-[#252525] hover:bg-[#333333]">
              <Volume2 className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-full bg-[#252525] hover:bg-[#333333]">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom section - Fixed */}
      <div className="border-t border-[#333333] bg-[#1A1A1A] z-10">
        {/* Quick prompts */}
        <div className="px-4 py-2 flex space-x-2 overflow-x-auto">
          <Button variant="outline" size="sm" className="bg-[#252525] border-none text-white whitespace-nowrap">
            Study tips
          </Button>
          <Button variant="outline" size="sm" className="bg-[#252525] border-none text-white whitespace-nowrap">
            Explain concept
          </Button>
          <Button variant="outline" size="sm" className="bg-[#252525] border-none text-white whitespace-nowrap">
            Create flashcards
          </Button>
          <Button variant="outline" size="sm" className="bg-[#252525] border-none text-white whitespace-nowrap">
            Quiz me
          </Button>
        </div>

        {/* Input area */}
        <div className="p-4">
          <div className="relative flex items-center">
            <button className="absolute left-3 p-1">
              <Plus className="h-5 w-5 text-gray-400" />
            </button>
            <Input
              type="text"
              placeholder="Send message..."
              className="w-full bg-[#252525] border-none pl-10 pr-10 py-3 rounded-full text-white"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <div className="absolute right-3 flex items-center space-x-2">
              <button className="p-1">
                <Mic className="h-5 w-5 text-gray-400" />
              </button>
              <button
                className={`p-1 ${message.trim() ? "text-[#F5B700]" : "text-gray-400"}`}
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 