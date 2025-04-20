"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Settings, CreditCard, Sun, Moon, LogOut } from "lucide-react"
import { Link } from "react-router"
import { useTheme } from "@/components/theme-provider"

interface ProfileDrawerProps {
  username: string
  email: string
  avatarUrl?: string
}

export default function ProfileDrawer({ username, email, avatarUrl }: ProfileDrawerProps) {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="focus:outline-none">
          <Avatar className="h-9 w-9 border-2 border-[#F5B700] cursor-pointer">
            <AvatarImage src={avatarUrl || "/placeholder.svg?height=36&width=36"} alt={username} />
            <AvatarFallback className="bg-[#F5B700] text-black">{username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-[#1A1A1A] border-l border-[#333333] p-0">
        <div className="flex flex-col h-full">
          {/* Profile Header */}
          <div className="bg-[#252525] p-6 flex flex-col items-center border-b border-[#333333]">
            <Avatar className="h-20 w-20 border-2 border-[#F5B700] mb-4">
              <AvatarImage src={avatarUrl || "/placeholder.svg?height=80&width=80"} alt={username} />
              <AvatarFallback className="bg-[#F5B700] text-black text-xl">
                {username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-lg">{username}</h3>
            <p className="text-gray-400 text-sm">{email}</p>
          </div>

          {/* Menu Items */}
          <div className="flex-1">
            <Link
              to="/achievements"
              className="flex items-center px-6 py-4 hover:bg-[#252525] border-b border-[#333333]"
              onClick={() => setOpen(false)}
            >
              <Trophy className="h-5 w-5 text-[#F5B700] mr-3" />
              <span>Achievements</span>
            </Link>

            <Link
              to="/profile"
              className="flex items-center px-6 py-4 hover:bg-[#252525] border-b border-[#333333]"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-5 w-5 text-[#F5B700] mr-3" />
              <span>Settings</span>
            </Link>

            <Link
              to="/subscription"
              className="flex items-center px-6 py-4 hover:bg-[#252525] border-b border-[#333333]"
              onClick={() => setOpen(false)}
            >
              <CreditCard className="h-5 w-5 text-[#F5B700] mr-3" />
              <span>Manage subscription</span>
            </Link>

            <button
              className="w-full flex items-center px-6 py-4 hover:bg-[#252525] border-b border-[#333333] text-left"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-[#F5B700] mr-3" />
              ) : (
                <Moon className="h-5 w-5 text-[#F5B700] mr-3" />
              )}
              <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
          </div>

          {/* Log Out */}
          <button className="flex items-center px-6 py-4 hover:bg-[#252525] text-red-500 border-t border-[#333333]">
            <LogOut className="h-5 w-5 mr-3" />
            <span>Log out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
