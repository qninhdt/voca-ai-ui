"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Bookmark, Share2, Volume2, Copy } from "lucide-react"
import { useParams, useNavigate } from "react-router"

export default function WordDefinitionPage() {
  const navigate = useNavigate()
  const params = useParams()
  const wordParam = params.word as string

  const [wordData, setWordData] = useState<any>(null)
  const [isStarred, setIsStarred] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    setWordData(null)
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordParam}`)
      .then(res => {
        if (!res.ok) throw new Error('Word not found')
        return res.json()
      })
      .then(data => {
        setWordData(data[0])
        setLoading(false)
      })
      .catch(() => {
        setError('Word not found')
        setLoading(false)
      })
  }, [wordParam])

  const toggleStar = () => {
    setIsStarred(!isStarred)
    // In a real app, you would update this in a database or local storage
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could add a toast notification here
  }

  const playPronunciation = () => {
    if (wordData?.phonetics?.length) {
      const audio = wordData.phonetics.find((p: any) => p.audio)
      if (audio && audio.audio) {
        const url = audio.audio.startsWith('http') ? audio.audio : `https:${audio.audio}`
        const audioObj = new Audio(url)
        audioObj.play()
      }
    }
  }

  const shareWord = () => {
    // Placeholder for share functionality
    console.log("Sharing word")
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (error || !wordData) {
    return (
      <div className="flex flex-col min-h-screen bg-[#1A1A1A] text-white items-center justify-center">
        <div className="text-xl">{error || 'Word not found'}</div>
        <button className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded" onClick={() => navigate('/dictionary')}>Back to Dictionary</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#232526] to-[#1A1A1A] text-white pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#252525] border-b border-[#333333]">
        <button onClick={() => navigate("/dictionary")} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="text-xl font-bold text-[#F5B700]">VocaAI Dictionary</div>
        <div className="w-6"></div> {/* Empty div for spacing */}
      </header>

      {/* Word Card */}
      <div className="flex flex-col items-center mt-6 px-4">
        <div className="bg-[#232526] shadow-lg rounded-2xl w-full max-w-xl p-6 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold text-center mb-1 text-white">{wordData.word}</h1>
          <p className="text-center text-[#F5B700] text-lg mb-4">{wordData.phonetic || (wordData.phonetics && wordData.phonetics[0]?.text)}</p>

          {/* Action Buttons */}
          <div className="flex justify-center mt-2 space-x-8">
            <button title="Copy" className="flex flex-col items-center text-gray-400 hover:text-[#F5B700] transition" onClick={() => copyToClipboard(wordData.word)}>
              <div className="bg-[#333333] p-3 rounded-full hover:bg-[#F5B700]/20 transition">
                <Copy className="h-6 w-6" />
              </div>
              <span className="text-xs mt-1">Copy</span>
            </button>
            <button title="Save" className="flex flex-col items-center text-gray-400 hover:text-[#F5B700] transition" onClick={toggleStar}>
              <div className={`bg-[#333333] p-3 rounded-full hover:bg-[#F5B700]/20 transition`}>
                <Bookmark className={`h-6 w-6 ${isStarred ? "text-[#F5B700] fill-[#F5B700]" : ""}`} />
              </div>
              <span className="text-xs mt-1">Save</span>
            </button>
            <button title="Share" className="flex flex-col items-center text-gray-400 hover:text-[#F5B700] transition" onClick={shareWord}>
              <div className="bg-[#333333] p-3 rounded-full hover:bg-[#F5B700]/20 transition">
                <Share2 className="h-6 w-6" />
              </div>
              <span className="text-xs mt-1">Share</span>
            </button>
            <button title="Listen" className="flex flex-col items-center text-gray-400 hover:text-[#F5B700] transition" onClick={playPronunciation}>
              <div className="bg-[#333333] p-3 rounded-full hover:bg-[#F5B700]/20 transition">
                <Volume2 className="h-6 w-6" />
              </div>
              <span className="text-xs mt-1">Listen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex justify-center mt-8 mb-4">
        <div className="h-1 w-24 bg-[#F5B700] rounded-full opacity-70"></div>
      </div>

      {/* Meanings */}
      <div className="flex flex-col items-center px-4">
        <div className="w-full max-w-xl space-y-5">
          {wordData.meanings && wordData.meanings.map((meaning: any, idx: number) => (
            <div key={idx} className="bg-[#232323] rounded-xl p-5 flex flex-col shadow-md border-l-4 border-[#F5B700]">
              <div className="flex items-center mb-2">
                <h2 className="text-[#F5B700] font-semibold text-lg mr-2">{meaning.partOfSpeech}</h2>
              </div>
              <div className="space-y-3">
                {meaning.definitions.map((def: any, i: number) => (
                  <div key={i} className="pl-2">
                    <p className="text-white text-base leading-relaxed">{def.definition}</p>
                    {def.example && <p className="text-gray-400 mt-1 italic">"{def.example}"</p>}
                    {def.synonyms && def.synonyms.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">Synonyms: <span className="text-[#F5B700]">{def.synonyms.join(", ")}</span></div>
                    )}
                    {def.antonyms && def.antonyms.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">Antonyms: <span className="text-red-400">{def.antonyms.join(", ")}</span></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {wordData.origin && (
            <div className="bg-[#232323] rounded-xl p-5 flex flex-col shadow-md border-l-4 border-[#4FC3F7]">
              <div className="text-[#4FC3F7] font-semibold mb-2 text-lg">Origin</div>
              <p className="text-white text-base leading-relaxed">{wordData.origin}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
