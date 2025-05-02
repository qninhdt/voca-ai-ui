"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Bookmark, Share2, Volume2, Copy } from "lucide-react"
import { useParams, useNavigate } from "react-router"
import { dictionaryData } from "@/data/dictionary-data"

export default function WordDefinitionPage() {
  const navigate = useNavigate()
  const params = useParams()
  const wordParam = params.word as string

  const [word, setWord] = useState<any>(null)
  const [isStarred, setIsStarred] = useState(false)

  useEffect(() => {
    const foundWord = dictionaryData.find((w) => w.word.toLowerCase() === wordParam.toLowerCase())

    if (foundWord) {
      setWord(foundWord)
      setIsStarred(foundWord.starred || false)
    } else {
      // Word not found, redirect back to dictionary
      navigate("/dictionary")
    }
  }, [wordParam, navigate])

  const toggleStar = () => {
    setIsStarred(!isStarred)
    // In a real app, you would update this in a database or local storage
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add a toast notification here
  }

  const playPronunciation = () => {
    // Placeholder for audio pronunciation functionality
    console.log("Playing pronunciation")
  }

  const shareWord = () => {
    // Placeholder for share functionality
    console.log("Sharing word")
  }

  if (!word) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#252525] border-b border-[#333333]">
        <button onClick={() => navigate("/dictionary")} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="text-xl font-bold text-[#F5B700]">VocaAI Dictionary</div>
        <div className="w-6"></div> {/* Empty div for spacing */}
      </header>

      {/* Word Definition */}
      <div className="flex flex-col">
        {/* Word Header */}
        <div className="bg-[#252525] p-4 rounded-t-xl">
          <h1 className="text-2xl font-bold text-center">{word.word}</h1>
          <p className="text-center text-gray-400 text-sm">{word.partOfSpeech}</p>

          {/* Action Buttons */}
          <div className="flex justify-center mt-4 space-x-6">
            <button className="flex flex-col items-center text-gray-400" onClick={() => copyToClipboard(word.word)}>
              <div className="bg-[#333333] p-2 rounded-full">
                <Copy className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Copy</span>
            </button>
            <button className="flex flex-col items-center text-gray-400" onClick={toggleStar}>
              <div className="bg-[#333333] p-2 rounded-full">
                <Bookmark className={`h-5 w-5 ${isStarred ? "text-[#F5B700] fill-[#F5B700]" : ""}`} />
              </div>
              <span className="text-xs mt-1">Save</span>
            </button>
            <button className="flex flex-col items-center text-gray-400" onClick={shareWord}>
              <div className="bg-[#333333] p-2 rounded-full">
                <Share2 className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Share</span>
            </button>
            <button className="flex flex-col items-center text-gray-400" onClick={playPronunciation}>
              <div className="bg-[#333333] p-2 rounded-full">
                <Volume2 className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1">Listen</span>
            </button>
          </div>
        </div>

        {/* Definition Content */}
        <div className="bg-[#1A1A1A] p-4 space-y-4">
          {/* Translations */}
          {word.translations && word.translations.length > 0 && (
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-[#F5B700] font-medium">Meaning [{word.translations[0].code}]</h2>
                <button onClick={() => copyToClipboard(word.translations[0].text)}>
                  <Copy className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <p className="text-black text-lg">{word.translations[0].text}</p>
            </div>
          )}

          {/* English Definition */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-[#F5B700] font-medium">Definition [EN]</h2>
              <button onClick={() => copyToClipboard(word.definitions[0].definition)}>
                <Copy className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <p className="text-black">{word.definitions[0].definition}</p>
            {word.definitions[0].example && (
              <p className="text-gray-600 mt-2 italic">"{word.definitions[0].example}"</p>
            )}
          </div>

          {/* Additional Definitions */}
          {word.definitions.length > 1 && (
            <div className="bg-white rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-[#F5B700] font-medium">Additional Meanings</h2>
                <button
                  onClick={() =>
                    copyToClipboard(
                      word.definitions
                        .slice(1)
                        .map((d: any) => d.definition)
                        .join("\n"),
                    )
                  }
                >
                  <Copy className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-3">
                {word.definitions.slice(1).map((def: any, index: number) => (
                  <div key={index}>
                    <p className="text-black">{def.definition}</p>
                    {def.example && <p className="text-gray-600 mt-1 italic">"{def.example}"</p>}
                    {def.context && (
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{def.context}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
