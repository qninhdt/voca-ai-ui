import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="h-screen w-full bg-[#1A1A1A] text-white relative overflow-hidden">
      <div className="h-full flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#F5B700] to-[#FF9500] flex items-center justify-center mb-4">
            <span className="text-black text-4xl font-bold">V</span>
          </div>
          <h1 className="text-3xl font-bold text-[#F5B700]">VocaAI</h1>
          <p className="text-gray-400 mt-2 text-center">Your personal vocabulary assistant</p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-3">Welcome to VocaAI</h2>
          <p className="text-gray-400 max-w-md">
            Enhance your vocabulary with flashcards, quizzes, and AI-powered learning tools.
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Button
            onClick={() => navigate('/login')}
            className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl"
          >
            Log In
          </Button>
          <Button
            onClick={() => navigate('/signup')}
            className="w-full h-12 bg-[#252525] hover:bg-[#333333] text-yellow-400 font-bold border border-yellow-400 rounded-xl"
          >
            Sign Up
          </Button>
        </div>

        {/* Terms */}
        <p className="text-gray-500 text-xs mt-8 text-center max-w-xs">
          By continuing, you agree to VocaAI's Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#F5B700]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#F5B700]/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
    </div>
  )
}

