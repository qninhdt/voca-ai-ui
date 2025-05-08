import { useState } from "react";
import { useNavigate } from "react-router";
import { signUpWithEmail } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signUpWithEmail(email, password, username);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#1A1A1A] text-white">
      <form onSubmit={handleSignUp} className="bg-[#252525] p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-yellow-400">Sign Up</h2>
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-4 rounded bg-[#181818] border border-[#333] text-white"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded bg-[#181818] border border-[#333] text-white"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 rounded bg-[#181818] border border-[#333] text-white"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-400 mb-4">{error}</div>}
        <Button type="submit" className="w-full bg-yellow-400 text-black font-bold" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
        <div className="mt-4 text-sm text-gray-400 text-center">
          Already have an account?{" "}
          <span className="text-yellow-400 cursor-pointer" onClick={() => navigate('/login')}>Log in</span>
        </div>
      </form>
    </div>
  );
} 