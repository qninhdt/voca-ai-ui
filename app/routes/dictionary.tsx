"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"
import ProfileDrawer from "@/components/profile-drawer"
import { dictionaryData } from "@/data/dictionary-data"

export default function DictionaryPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredWords, setFilteredWords] = useState<any[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  // Word of the day
  const wordOfTheDay = {
    word: "ephemeral",
    phonetic: "/ɪˈfɛm(ə)rəl/",
    partOfSpeech: "adjective",
    definition: "lasting for a very short time",
  }

  // Recent words
  const recentWords = [
    { word: "cacophony", phonetic: "/kəˈkɒfəni/", partOfSpeech: "noun" },
    { word: "benevolent", phonetic: "/bəˈnɛvələnt/", partOfSpeech: "adjective" },
    { word: "abate", phonetic: "/əˈbeɪt/", partOfSpeech: "verb" },
  ]

  useEffect(() => {
    // Filter words based on search query
    if (searchQuery.length > 0) {
      const filtered = dictionaryData.filter((word) => word.word.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredWords(filtered)
      setShowDropdown(filtered.length > 0)
    } else {
      setFilteredWords([])
      setShowDropdown(false)
    }
  }, [searchQuery])

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const selectWord = (word: any) => {
    navigate(`/dictionary/${word.word.toLowerCase()}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#252525] border-b border-[#333333]">
        <div className="text-2xl font-bold text-[#F5B700]">VocaAI Dictionary</div>
        <ProfileDrawer username="qninh" email="qndt123@gmail.com" />
      </header>

      {/* Search Bar */}
      <div className="px-4 py-4" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search for words"
            className="w-full bg-[#252525] border-none pl-10 pr-10 text-gray-300 rounded-xl"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => {
                setSearchQuery("")
                setShowDropdown(false)
              }}
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-[#252525] rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {filteredWords.map((word) => (
                <button
                  key={word.id}
                  className="w-full px-4 py-3 text-left hover:bg-[#333333] flex items-center justify-between border-b border-[#333333] last:border-0"
                  onClick={() => selectWord(word)}
                >
                  <div>
                    <div className="font-medium">{word.word}</div>
                    <div className="text-xs text-gray-400">
                      {word.partOfSpeech} • {word.phonetic}
                    </div>
                  </div>
                  <div className="text-xs bg-[#333333] px-2 py-1 rounded-full text-gray-300">
                    {word.definitions[0].definition.substring(0, 20)}...
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dictionary home view */}
      <div className="px-4 py-2">
        {/* Word of the Day */}
        <div className="bg-[#252525] rounded-xl p-5 mb-6">
          <div className="text-[#F5B700] font-medium mb-2">WORD OF THE DAY</div>
          <h2 className="text-2xl font-bold">{wordOfTheDay.word}</h2>
          <div className="flex items-center mt-1 text-gray-400">
            <span className="mr-2">{wordOfTheDay.phonetic}</span>
            <span className="italic">{wordOfTheDay.partOfSpeech}</span>
          </div>
          <p className="mt-3">{wordOfTheDay.definition}</p>
          <Button
            className="mt-4 bg-[#333333] hover:bg-[#444444] text-white border-none"
            onClick={() => navigate(`/dictionary/${wordOfTheDay.word.toLowerCase()}`)}
          >
            View Details
          </Button>
        </div>

        {/* Recent Searches */}
        <h3 className="text-lg font-medium mb-3">Recent Searches</h3>
        <div className="grid grid-cols-2 gap-3">
          {recentWords.map((word, index) => (
            <button
              key={index}
              className="bg-[#252525] rounded-xl p-4 text-left"
              onClick={() => navigate(`/dictionary/${word.word.toLowerCase()}`)}
            >
              <h4 className="font-medium">{word.word}</h4>
              <div className="flex items-center mt-1 text-xs text-gray-400">
                <span className="mr-2">{word.phonetic}</span>
                <span className="italic">{word.partOfSpeech}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
