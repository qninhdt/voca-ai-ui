"use client"

import { Home, BookOpen, Plus, MessageSquare, User } from "lucide-react"
import { Link } from "react-router"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function BottomNavigation() {
  const [activeTab, setActiveTab] = useState("home")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <>
      {/* Main Bottom Navigation */}
      <div className=" bottom-0 left-0 right-0 bg-[#252525] border-t border-[#333333] h-16 z-50">
        <div className="flex items-center justify-around h-full">
          <Link
            to="/"
            className={`flex flex-col items-center ${activeTab === "home" ? "text-[#F5B700]" : "text-gray-400"}`}
            onClick={() => setActiveTab("home")}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            to="/collection"
            className={`flex flex-col items-center ${activeTab === "collection" ? "text-[#F5B700]" : "text-gray-400"}`}
            onClick={() => setActiveTab("collection")}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs mt-1">Library</span>
          </Link>

          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center">
                <div className="bg-[#F5B700] rounded-full p-1">
                  <Plus className="h-5 w-5 text-black" />
                </div>
                <span className="text-xs mt-1 text-gray-400">Create</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-[#1A1A1A] text-white border-t border-[#333333] rounded-t-xl">
              <div className="py-4 px-2">
                <div className="w-12 h-1 bg-[#333333] rounded-full mx-auto mb-6"></div>
                <h3 className="text-lg font-medium mb-4">Create New</h3>
                <div className="space-y-4">
                  <Link
                    to="/create/folder"
                    className="flex items-center gap-3 p-3 bg-[#252525] rounded-xl"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    <div className="bg-[#333333] p-2 rounded-lg">
                      <BookOpen className="h-5 w-5 text-[#F5B700]" />
                    </div>
                    <span>Create a folder</span>
                  </Link>
                  <Link
                    to="/create/deck"
                    className="flex items-center gap-3 p-3 bg-[#252525] rounded-xl"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    <div className="bg-[#333333] p-2 rounded-lg">
                      <span className="text-[#F5B700] text-xl">🃏</span>
                    </div>
                    <span>Create a deck</span>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link
            to="/ai-chat"
            className={`flex flex-col items-center ${activeTab === "ai-chat" ? "text-[#F5B700]" : "text-gray-400"}`}
            onClick={() => setActiveTab("ai-chat")}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">AI Chat</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center ${activeTab === "profile" ? "text-[#F5B700]" : "text-gray-400"}`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </>
  )
}
