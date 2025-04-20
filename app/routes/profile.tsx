import { useState } from "react"
import { useNavigate } from "react-router"
import { ArrowLeft, Edit2, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("qninh")
  const [email, setEmail] = useState("qndt123@gmail.com")
  const [accountType, setAccountType] = useState("student")
  const [selectedAvatar, setSelectedAvatar] = useState("/placeholder.svg?height=80&width=80")

  // Mock avatar options
  const avatarOptions = [
    { id: "1", url: "/placeholder.svg?height=40&width=40", color: "bg-blue-500" },
    { id: "2", url: "/placeholder.svg?height=40&width=40", color: "bg-green-500" },
    { id: "3", url: "/placeholder.svg?height=40&width=40", color: "bg-purple-500" },
    { id: "4", url: "/placeholder.svg?height=40&width=40", color: "bg-pink-500" },
    { id: "5", url: "/placeholder.svg?height=40&width=40", color: "bg-yellow-500" },
    { id: "6", url: "/placeholder.svg?height=40&width=40", color: "bg-red-500" },
    { id: "7", url: "/placeholder.svg?height=40&width=40", color: "bg-indigo-500" },
    { id: "8", url: "/placeholder.svg?height=40&width=40", color: "bg-orange-500" },
    { id: "9", url: "/placeholder.svg?height=40&width=40", color: "bg-teal-500" },
    { id: "10", url: "/placeholder.svg?height=40&width=40", color: "bg-cyan-500" },
    { id: "11", url: "/placeholder.svg?height=40&width=40", color: "bg-lime-500" },
    { id: "12", url: "/placeholder.svg?height=40&width=40", color: "bg-emerald-500" },
    { id: "13", url: "/placeholder.svg?height=40&width=40", color: "bg-violet-500" },
    { id: "14", url: "/placeholder.svg?height=40&width=40", color: "bg-fuchsia-500" },
    { id: "15", url: "/placeholder.svg?height=40&width=40", color: "bg-rose-500" },
    { id: "16", url: "/placeholder.svg?height=40&width=40", color: "bg-amber-500" },
  ]

  return (
    <div className="flex flex-col min-h-full bg-[#1A1A1A] text-white pb-16">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#1A1A1A] border-b border-[#333333]">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="text-xl font-bold">Settings</div>
        <div className="w-6"></div> {/* Empty div for spacing */}
      </header>

      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>

        {/* Subscription Section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-[#F5B700] mb-2">Manage subscription</h2>
          <div className="bg-[#252525] rounded-xl p-4 border border-[#333333]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Free Plan</h3>
                <p className="text-sm text-gray-400">Upgrade for more features</p>
              </div>
              <Button className="bg-[#F5B700] text-black hover:bg-[#E5A700]">Upgrade</Button>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div>
          <h2 className="text-lg font-medium text-[#F5B700] mb-2">Personal information</h2>
          <div className="bg-[#252525] rounded-xl overflow-hidden border border-[#333333]">
            {/* Profile Picture */}
            <div className="p-4 border-b border-[#333333]">
              <h3 className="text-sm font-medium mb-3">Profile picture</h3>
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20 border-2 border-[#F5B700]">
                  <AvatarImage src={selectedAvatar || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback className="bg-[#F5B700] text-black">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    className={`rounded-full p-1 ${selectedAvatar === avatar.url ? "border-2 border-[#F5B700]" : ""}`}
                    onClick={() => setSelectedAvatar(avatar.url)}
                  >
                    <div className={`w-12 h-12 rounded-full ${avatar.color} flex items-center justify-center`}>
                      <span className="text-white text-xl">{String.fromCharCode(64 + Number.parseInt(avatar.id))}</span>
                    </div>
                  </button>
                ))}
                <button className="rounded-full p-1">
                  <div className="w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center">
                    <span className="text-white text-xl">+</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Username */}
            <div className="p-4 border-b border-[#333333]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium mb-1">Username</h3>
                  <p>{username}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[#F5B700]">
                  <Edit2 className="h-4 w-4" />
                  <span className="ml-1">Edit</span>
                </Button>
              </div>
            </div>

            {/* Email */}
            <div className="p-4 border-b border-[#333333]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium mb-1">Email</h3>
                  <p>{email}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-[#F5B700]">
                  <Edit2 className="h-4 w-4" />
                  <span className="ml-1">Edit</span>
                </Button>
              </div>
            </div>

            {/* Account Type */}
            <div className="p-4">
              <h3 className="text-sm font-medium mb-2">Account type</h3>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger className="bg-[#333333] border-none">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent className="bg-[#252525] border-[#333333]">
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-[#F5B700] mb-2">App settings</h2>
          <div className="bg-[#252525] rounded-xl overflow-hidden border border-[#333333]">
            <div className="p-4 border-b border-[#333333]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-400">Manage notification preferences</p>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="p-4 border-b border-[#333333]">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Privacy</h3>
                  <p className="text-sm text-gray-400">Control your privacy settings</p>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Language</h3>
                  <p className="text-sm text-gray-400">English (US)</p>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-red-500 mb-2">Danger zone</h2>
          <div className="bg-[#252525] rounded-xl p-4 border border-red-900/30">
            <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500/10">
              Delete account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 