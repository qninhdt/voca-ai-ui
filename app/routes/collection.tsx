import { useState } from "react"
import { Search, Filter, BookOpen, FolderOpen, Beaker, GraduationCap } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Link } from "react-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import ProfileDrawer from "@/components/profile-drawer"

export default function CollectionPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOption, setFilterOption] = useState("Recent")

  const lastWeekSets = [
    { id: "1", title: "HP 1.6 - 1.7", terms: 67, author: "qninh", authorImage: "/placeholder.svg?height=24&width=24" },
  ]

  const marchSets = [
    {
      id: "2",
      title: "Linux commands",
      terms: 49,
      author: "emilysingley",
      authorImage: "/placeholder.svg?height=24&width=24",
    },
    {
      id: "3",
      title: "Basic Linux commands",
      terms: 33,
      author: "brian_kozik",
      authorImage: "/placeholder.svg?height=24&width=24",
    },
    { id: "4", title: "HP 1.4 - 1.5", terms: 143, author: "qninh", authorImage: "/placeholder.svg?height=24&width=24" },
    { id: "5", title: "HP 1.1", terms: 96, author: "qninh", authorImage: "/placeholder.svg?height=24&width=24" },
  ]

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <div className="text-2xl font-bold text-[#F5B700]">VocaAI</div>
        <ProfileDrawer username="qninh" email="qndt123@gmail.com" />
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

          {/* Last Week Section */}
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase">Last Week</h2>
            {lastWeekSets.map((set) => (
              <Link to={`/deck/${set.id}`} key={set.id}>
                <div className="bg-[#252525] rounded-xl p-4 mb-3 border-l-4 border-[#F5B700]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">{set.title}</h3>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="bg-[#333333] text-white border-none mr-2">
                          {set.terms} terms
                        </Badge>
                        <div className="flex items-center">
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarFallback className="bg-[#F5B700] text-black text-xs">
                              {set.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-400">{set.author}</span>
                        </div>
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

          {/* March 2023 Section */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 mb-3 uppercase">March 2023</h2>
            {marchSets.map((set) => (
              <Link to={`/deck/${set.id}`} key={set.id}>
                <div className="bg-[#252525] rounded-xl p-4 mb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-lg">{set.title}</h3>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="bg-[#333333] text-white border-none mr-2">
                          {set.terms} terms
                        </Badge>
                        <div className="flex items-center">
                          <Avatar className="h-5 w-5 mr-1">
                            <AvatarFallback className="bg-[#F5B700] text-black text-xs">
                              {set.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-400">{set.author}</span>
                        </div>
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
        </TabsContent>

        <TabsContent value="folders" className="mt-0 px-4">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <FolderOpen className="h-12 w-12 text-[#F5B700] mx-auto mb-2 opacity-50" />
              <p className="text-gray-400">No folders yet</p>
              <Button className="mt-4 bg-[#F5B700] text-black hover:bg-[#E5A700]">Create Folder</Button>
            </div>
          </div>
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