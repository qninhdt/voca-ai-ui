import { useState } from "react";
import { useNavigate } from "react-router";
import { loginWithEmail } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-[#1A1A1A] text-white">
      <form onSubmit={handleLogin} className="bg-[#252525] p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-yellow-400">Log In</h2>
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
          {loading ? "Logging in..." : "Log In"}
        </Button>
        <div className="mt-4 text-sm text-gray-400 text-center">
          Don't have an account?{" "}
          <span className="text-yellow-400 cursor-pointer" onClick={() => navigate('/signup')}>Sign up</span>
        </div>
      </form>
    </div>
  );
} 