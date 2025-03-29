"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      window.location.href = "/" // Redirect to dashboard
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827]">
      <div className="bg-[#1a2234] p-8 rounded-lg shadow-xl w-full max-w-md border border-[#2a3347]">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-[#3b82f6] rounded-full p-2 w-10 h-10 flex items-center justify-center">
            <LogIn className="text-white h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-white">TweetManager</h1>
        </div>

        <h2 className="text-xl font-semibold mb-6 text-white">Login to your account</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#111827] border border-[#2a3347] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent"
              required
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-[#111827] border border-[#2a3347] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent pr-10"
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <a href="#" className="text-sm text-[#3b82f6] hover:text-[#60a5fa]">
                Forgot password?
              </a>
            </div>
          </div>

          {error && (
            <div className="bg-[#331a1a] border border-[#f87171] text-[#f87171] p-3 rounded-md text-sm">{error}</div>
          )}

          <button
            type="submit"
            className="w-full bg-[#3b82f6] text-white p-3 rounded-md hover:bg-[#2563eb] transition-colors font-medium"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <a href="#" className="text-[#3b82f6] hover:text-[#60a5fa]">
            Sign up
          </a>
        </div>
      </div>
    </div>
  )
}

