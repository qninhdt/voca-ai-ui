import { useState, useEffect } from "react"
import { Search, Filter, BookOpen, FolderOpen, Beaker, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import ProfileDrawer from "@/components/profile-drawer"
import { getUserDecks, getUserFolders } from "@/lib/firebase"
import { auth } from "@/lib/firebase"

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

export default function CollectionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOption, setFilterOption] = useState("Recent")
  const [decks, setDecks] = useState<Deck[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

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
        setLoading(false)
      } else {
        setDecks([])
        setFolders([])
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Group decks by time period
  const now = new Date()
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastWeekDecks = decks.filter(deck => {
    const deckTime = new Date((deck.updatedAt?.seconds || deck.createdAt?.seconds || 0) * 1000)
    return deckTime >= lastWeek
  })
  const olderDecks = decks.filter(deck => {
    const deckTime = new Date((deck.updatedAt?.seconds || deck.createdAt?.seconds || 0) * 1000)
    return deckTime < lastWeek
  })

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <div className="text-2xl font-bold text-[#F5B700]">VocaAI</div>
        <ProfileDrawer />
      </header>

      {/* Library Title */}
      <div className="px-4 py-4">
        <h1 className="text-2xl font-bold">Your Library</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="flashcards" className="w-full">
        <div className="px-4 mb-4">
          <TabsList className="bg-[#252525] p-1 rounded-xl w-full grid grid-cols-2">
            <TabsTrigger
              value="flashcards"
              className="rounded-lg data-[state=active]:bg-[#F5B700] data-[state=active]:text-black"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Decks
            </TabsTrigger>
            <TabsTrigger
              value="folders"
              className="rounded-lg data-[state=active]:bg-[#F5B700] data-[state=active]:text-black"
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              Folders
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="flashcards" className="mt-0 px-4">
          <div className="flex justify-between items-center mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-[#252525] border-none text-white rounded-xl">
                  <Filter className="h-4 w-4 mr-2 text-[#F5B700]" />
                  {filterOption}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#252525] text-white border-[#333333]">
                <DropdownMenuItem onClick={() => setFilterOption("Recent")}>Recent</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterOption("Alphabetical")}>Alphabetical</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterOption("Created by me")}>Created by me</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search"
                className="w-full bg-[#252525] border-none pl-10 text-gray-300 h-9 text-sm rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
            <>
              {/* Last Week Section */}
              {lastWeekDecks.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase">Last Week</h2>
                  {lastWeekDecks.map((deck) => (
                    <Link to={`/deck/${deck.id}`} key={deck.id}>
                      <div className="bg-[#252525] rounded-xl p-4 mb-3 border-l-4 border-[#F5B700]">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-lg">{deck.title}</h3>
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

              {/* Older Decks Section */}
              {olderDecks.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase">Older</h2>
                  {olderDecks.map((deck) => (
                    <Link to={`/deck/${deck.id}`} key={deck.id}>
                      <div className="bg-[#252525] rounded-xl p-4 mb-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-lg">{deck.title}</h3>
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
            </>
          )}
        </TabsContent>

        <TabsContent value="folders" className="mt-0 px-4">
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
            <div className="space-y-4">
              {folders.map((folder) => (
                <Link to={`/folder/${folder.id}`} key={folder.id}>
                  <div className="bg-[#252525] rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg">{folder.name}</h3>
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
        </TabsContent>

        <TabsContent value="practice" className="mt-0 px-4">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <Beaker className="h-12 w-12 text-[#F5B700] mx-auto mb-2 opacity-50" />
              <p className="text-gray-400">No practice tests available</p>
              <Button className="mt-4 bg-[#F5B700] text-black hover:bg-[#E5A700]">Create Test</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="mt-0 px-4">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 text-[#F5B700] mx-auto mb-2 opacity-50" />
              <p className="text-gray-400">No classes available</p>
              <Button className="mt-4 bg-[#F5B700] text-black hover:bg-[#E5A700]">Join Class</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 