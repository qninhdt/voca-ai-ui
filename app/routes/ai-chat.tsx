import { useState, useRef, useEffect } from "react"
import { ArrowLeft, Copy, ThumbsUp, Volume2, Share2, Send, Mic, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"
import ProfileDrawer from "@/components/profile-drawer"
import { client, VOCA_AI_SYSTEM_PROMPT } from "@/lib/chatbot"
import { speakText, stopSpeaking } from "@/lib/utils"
import { auth, getRecentlyLearnedWords, type LearnedWord } from "@/lib/firebase"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function AIChatPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [recentWords, setRecentWords] = useState<LearnedWord[]>([])
  const [isLoadingWords, setIsLoadingWords] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadRecentWords = async () => {
      try {
        const user = auth.currentUser
        if (!user) {
          navigate('/login')
          return
        }
        const words = await getRecentlyLearnedWords(user.uid)
        setRecentWords(words)
      } catch (error) {
        console.error('Error loading recent words:', error)
      } finally {
        setIsLoadingWords(false)
      }
    }

    loadRecentWords()
  }, [navigate])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text: string = message) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system" as const,
            content: VOCA_AI_SYSTEM_PROMPT
          },
          ...messages.map(msg => ({
            role: msg.sender === "user" ? "user" as const : "assistant" as const,
            content: msg.content
          })),
          {
            role: "user" as const,
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.choices[0].message.content || "I apologize, but I couldn't generate a response.",
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error. Please try again.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTextToSpeech = async (text: string) => {
    if (isSpeaking) {
      await stopSpeaking()
      setIsSpeaking(false)
      return
    }

    setIsSpeaking(true)
    await speakText(text)
    setIsSpeaking(false)
  }

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  const handleWordClick = (word: LearnedWord) => {
    const query = `Can you explain the word "${word.word}"?`
    handleSendMessage(query)
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
            <div className="font-medium">VocaAI</div>
            <div className="text-xs text-gray-400">Vocabulary learning assistant</div>
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
                <AvatarImage src="/bot.png" alt="VocaAI" />
                <AvatarFallback className="bg-[#F5B700] text-black">V</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                msg.sender === "user"
                  ? "bg-[#F5B700] text-black rounded-br-none"
                  : "bg-[#252525] text-white rounded-bl-none"
              }`}
            >
              {msg.sender === "ai" ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      p: ({ children }) => <p className="mb-4">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-500 pl-4 italic mb-4">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }) => (
                        <a href={href} className="text-[#F5B700] hover:underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.sender === "user" && (
              <Avatar className="h-8 w-8 ml-2 mt-1 flex-shrink-0">
                <AvatarImage src="/user.png?height=32&width=32" alt="User" />
                <AvatarFallback className="bg-[#333333]">U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
              <AvatarImage src="/bot.png" alt="VocaAI" />
              <AvatarFallback className="bg-[#F5B700] text-black">V</AvatarFallback>
            </Avatar>
            <div className="bg-[#252525] text-white rounded-2xl rounded-bl-none p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Message actions for AI messages */}
        {messages.length > 0 && messages[messages.length - 1].sender === "ai" && !isLoading && (
          <div className="flex items-center space-x-2 ml-10">
            <button 
              className="p-2 rounded-full bg-[#252525] hover:bg-[#333333]"
              onClick={() => handleCopyMessage(messages[messages.length - 1].content)}
            >
              <Copy className="h-4 w-4" />
            </button>
            <button 
              className={`p-2 rounded-full ${isSpeaking ? "bg-[#F5B700]" : "bg-[#252525] hover:bg-[#333333]"}`}
              onClick={() => handleTextToSpeech(messages[messages.length - 1].content)}
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom section - Fixed */}
      <div className="border-t border-[#333333] bg-[#1A1A1A] z-10">
        {/* Recent words */}
        <div className="px-4 py-2">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Recently Learned Words</h3>
          {isLoadingWords ? (
            <div className="flex justify-center py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          ) : recentWords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recentWords.map((word) => (
                <Button
                  key={word.id}
                  variant="outline"
                  size="sm"
                  className="bg-[#252525] border-none text-white hover:bg-[#333333]"
                  onClick={() => handleWordClick(word)}
                >
                  {word.word}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">No words learned yet. Start learning to see your progress here!</p>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 mb-16">
          <div className="relative flex items-center">
            <button className="absolute left-3 p-1">
              <Plus className="h-5 w-5 text-gray-400" />
            </button>
            <Input
              type="text"
              placeholder="Ask about any word..."
              className="w-full bg-[#252525] border-none pl-10 pr-10 py-3 rounded-full text-white"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <div className="absolute right-3 flex items-center space-x-2">
              <button
                className={`p-1 ${message.trim() && !isLoading ? "text-[#F5B700]" : "text-gray-400"}`}
                onClick={() => handleSendMessage()}
                disabled={!message.trim() || isLoading}
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