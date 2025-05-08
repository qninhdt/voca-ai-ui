import { useState, useEffect } from "react"
import { Search, Filter, BookOpen, FolderOpen, Beaker, GraduationCap, Clock, Sparkles, TrendingUp } from "lucide-react"
import { Link } from "react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ProfileDrawer from "@/components/profile-drawer"
import { getUserDecks, getUserFolders } from "@/lib/firebase"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

export default function HomePage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [masteryStats, setMasteryStats] = useState({
    totalCards: 0,
    masteredCards: 0,
    learningCards: 0,
    averageMastery: 0
  })

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setLoading(true)
        const [userDecks, userFolders] = await Promise.all([
          getUserDecks(user.uid),
          getUserFolders(user.uid)
        ])
        
        // Sort decks by updatedAt desc, fallback to createdAt
        const sortedDecks = userDecks
          .slice()
          .sort((a: Deck, b: Deck) => {
            const aTime = a.updatedAt?.seconds || a.createdAt?.seconds || 0
            const bTime = b.updatedAt?.seconds || b.createdAt?.seconds || 0
            return bTime - aTime
          })
        
        // Sort folders by updatedAt desc, fallback to createdAt
        const sortedFolders = userFolders
          .slice()
          .sort((a: Folder, b: Folder) => {
            const aTime = a.updatedAt?.seconds || a.createdAt?.seconds || 0
            const bTime = b.updatedAt?.seconds || b.createdAt?.seconds || 0
            return bTime - aTime
          })

        setDecks(sortedDecks)
        setFolders(sortedFolders)
        calculateMasteryStats(sortedDecks)
        setLoading(false)
      } else {
        setDecks([])
        setFolders([])
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const calculateMasteryStats = (decks: Deck[]) => {
    let totalCards = 0
    let masteredCards = 0
    let learningCards = 0
    let totalMastery = 0

    decks.forEach(deck => {
      deck.cards?.forEach(card => {
        totalCards++
        const mastery = card.mastery || 0
        totalMastery += mastery
        if (mastery >= 4) {
          masteredCards++
        } else {
          learningCards++
        }
      })
    })

    setMasteryStats({
      totalCards,
      masteredCards,
      learningCards,
      averageMastery: totalCards > 0 ? (totalMastery / totalCards) * 20 : 0 // Convert to percentage
    })
  }

  const recommendedSets = [
    { id: "5", title: "600 từ vựng toeic", terms: 305, author: "hgnam92" },
    { id: "6", title: "600 TOEIC vocabulary - 600", terms: 600, author: "PracticalEnglishVn", isTeacher: true },
  ]

  const trendingSets = [
    { id: "7", title: "Unit 11. Travelling in the future - Tiếng Anh 7 Global Success", terms: 64 },
    { id: "8", title: "Tiếng anh", terms: 83 },
  ]

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <div className="text-2xl font-bold text-[#F5B700]">VocaAI</div>
        <ProfileDrawer />
      </header>

      {/* Progress Section */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-medium">Your Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#252525] rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Total Decks</div>
            <div className="text-2xl font-medium">{decks.length}</div>
          </div>
          <div className="bg-[#252525] rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Total Cards</div>
            <div className="text-2xl font-medium">{masteryStats.totalCards}</div>
          </div>
          <div className="bg-[#252525] rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Mastered</div>
            <div className="text-2xl font-medium">{masteryStats.masteredCards}</div>
          </div>
          <div className="bg-[#252525] rounded-xl p-4">
            <div className="text-sm text-gray-400 mb-1">Learning</div>
            <div className="text-2xl font-medium">{masteryStats.learningCards}</div>
          </div>
        </div>
        <div className="bg-[#252525] rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-1">Average Mastery</div>
          <div className="text-2xl font-medium">{masteryStats.averageMastery.toFixed(1)}%</div>
        </div>
      </div>

      {/* Recent Sets */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Recent Sets</h2>
          <Link to="/collection">
            <Button variant="ghost" className="text-[#F5B700] hover:text-[#E5A700]">
              View All
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : decks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">No decks found.</div>
            <Link to="/create-deck">
              <Button className="bg-[#F5B700] text-black hover:bg-[#E5A700]">
                Create Your First Deck
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {decks.slice(0, 3).map((deck) => (
              <Link to={`/deck/${deck.id}`} key={deck.id}>
                <div className="bg-[#252525] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{deck.title}</h3>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="bg-[#333333] text-white border-none mr-2">
                          {deck.cards?.length || 0} terms
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
        )}
      </div>

      {/* Recent Folders */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Recent Folders</h2>
          <Link to="/collection">
            <Button variant="ghost" className="text-[#F5B700] hover:text-[#E5A700]">
              View All
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : folders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">No folders found.</div>
            <Link to="/create-folder">
              <Button className="bg-[#F5B700] text-black hover:bg-[#E5A700]">
                Create Your First Folder
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {folders.slice(0, 3).map((folder) => (
              <Link to={`/edit-folder/${folder.id}`} key={folder.id}>
                <div className="bg-[#252525] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{folder.name}</h3>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="bg-[#333333] text-white border-none mr-2">
                          {folder.deckIds.length} decks
                        </Badge>
                        {folder.description && (
                          <span className="text-sm text-gray-400">{folder.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-[#333333] p-2 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-[#F5B700]" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Sets */}
      <section className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Sparkles className="h-5 w-5 text-[#F5B700] mr-2" />
            <h2 className="text-lg font-medium">Recommended for You</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {recommendedSets.map((set) => (
            <Link to={`/deck/${set.id}`} key={set.id} className="block">
              <div className="bg-[#252525] rounded-xl p-4 h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-medium mb-2 line-clamp-2">{set.title}</h3>
                  <Badge variant="outline" className="bg-[#333333] text-white border-none">
                    {set.terms} terms
                  </Badge>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-[#F5B700] text-black text-xs">{set.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-400">{set.author}</span>
                  {set.isTeacher && <Badge className="bg-[#F5B700] text-black text-xs ml-auto">Teacher</Badge>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Sets */}
      <section className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-[#F5B700] mr-2" />
            <h2 className="text-lg font-medium">Trending Now</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {trendingSets.map((set) => (
            <Link to={`/deck/${set.id}`} key={set.id} className="block">
              <div className="bg-[#252525] rounded-xl p-4 h-full flex flex-col justify-between">
                <div>
                  <h3 className="font-medium mb-2 line-clamp-2">{set.title}</h3>
                  <Badge variant="outline" className="bg-[#333333] text-white border-none">
                    {set.terms} terms
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="bg-[#333333] h-1 w-full rounded-full overflow-hidden">
                    <div className="bg-[#F5B700] h-full rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
