import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { signInWithGoogle, logout, onAuthStateChange } from "../lib/firebase"
import type { User } from "firebase/auth"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { ArrowLeft, Edit2, ChevronDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export default function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("qninh")
  const [email, setEmail] = useState("qndt123@gmail.com")
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [selectedTheme, setSelectedTheme] = useState("dark")

  const languages = [
    { id: "en", name: "English" },
    { id: "vi", name: "Vietnamese" },
    { id: "ja", name: "Japanese" },
    { id: "ko", name: "Korean" },
    { id: "zh", name: "Chinese" },
  ]

  const themes = [
    { id: "light", name: "Light" },
    { id: "dark", name: "Dark" },
    { id: "system", name: "System" },
  ]

  const avatars = [
    { id: "1", url: "/user.png?height=40&width=40", color: "bg-blue-500" },
    { id: "2", url: "/user.png?height=40&width=40", color: "bg-green-500" },
    { id: "3", url: "/user.png?height=40&width=40", color: "bg-yellow-500" },
    { id: "4", url: "/user.png?height=40&width=40", color: "bg-red-500" },
    { id: "5", url: "/user.png?height=40&width=40", color: "bg-purple-500" },
    { id: "6", url: "/user.png?height=40&width=40", color: "bg-pink-500" },
    { id: "7", url: "/user.png?height=40&width=40", color: "bg-indigo-500" },
    { id: "8", url: "/user.png?height=40&width=40", color: "bg-gray-500" },
    { id: "9", url: "/user.png?height=40&width=40", color: "bg-orange-500" },
    { id: "10", url: "/user.png?height=40&width=40", color: "bg-teal-500" },
    { id: "11", url: "/user.png?height=40&width=40", color: "bg-cyan-500" },
    { id: "12", url: "/user.png?height=40&width=40", color: "bg-lime-500" },
    { id: "13", url: "/user.png?height=40&width=40", color: "bg-emerald-500" },
    { id: "14", url: "/user.png?height=40&width=40", color: "bg-violet-500" },
    { id: "15", url: "/user.png?height=40&width=40", color: "bg-fuchsia-500" },
    { id: "16", url: "/user.png?height=40&width=40", color: "bg-amber-500" },
  ]

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user: User | null) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  const handleSignOut = async () => {
    try {
      await logout()
      navigate("/welcome")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in to access your profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignIn} className="w-full">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
              <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.displayName || "User"}</CardTitle>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          {theme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-red-500 mb-2">Danger zone</h2>
              <div className="bg-[#252525] rounded-xl p-4 border border-red-900/30">
                <Button variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500/10" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 