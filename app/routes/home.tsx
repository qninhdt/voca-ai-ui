import { useState } from "react"
import { Search, BookOpen, Sparkles, Clock, TrendingUp } from "lucide-react"
import { Link } from "react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import ProfileDrawer from "@/components/profile-drawer"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const recentSets = [
    { id: "1", title: "HP 1.6 - 1.7", terms: 67, author: "you" },
    { id: "2", title: "Linux commands", terms: 49, author: "emilysingley" },
    { id: "3", title: "Basic Linux commands", terms: 33, author: "brian_kozik" },
    { id: "4", title: "HP 1.4 - 1.5", terms: 143, author: "you" },
  ]

  const recommendedSets = [
    { id: "5", title: "600 từ vựng toeic", terms: 305, author: "hgnam92" },
    { id: "6", title: "600 TOEIC vocabulary - 600", terms: 600, author: "PracticalEnglishVn", isTeacher: true },
  ]

  const trendingSets = [
    { id: "7", title: "Unit 11. Travelling in the future - Tiếng Anh 7 Global Success", terms: 64 },
    { id: "8", title: "Tiếng anh", terms: 83 },
  ]

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <div className="text-2xl font-bold text-[#F5B700]">VocaAI</div>
        <div className="flex items-center gap-3">
          <ProfileDrawer username="qninh" email="qndt123@gmail.com" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search for flashcards"
            className="w-full bg-[#252525] border-none pl-10 text-gray-300 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-2">
        <div className="bg-[#252525] rounded-xl p-4">
          <h2 className="text-sm font-medium text-gray-400 mb-3">YOUR PROGRESS</h2>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F5B700]">12</div>
              <div className="text-xs text-gray-400">Decks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F5B700]">347</div>
              <div className="text-xs text-gray-400">Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F5B700]">85%</div>
              <div className="text-xs text-gray-400">Mastered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sets */}
      <section className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-[#F5B700] mr-2" />
            <h2 className="text-lg font-medium">Recently Viewed</h2>
          </div>
          <Link to="/collection" className="text-sm text-[#F5B700]">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recentSets.map((set) => (
            <Link to={`/deck/${set.id}`} key={set.id}>
              <div className="bg-[#252525] rounded-xl p-4 mb-3 border-l-4 border-[#F5B700]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{set.title}</h3>
                    <p className="text-sm text-gray-400">
                      {set.terms} terms • by {set.author}
                    </p>
                  </div>
                  <div className="bg-[#333333] rounded-full px-3 py-1 text-xs">
                    <BookOpen className="h-4 w-4 inline-block mr-1 text-[#F5B700]" />
                    Study
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
