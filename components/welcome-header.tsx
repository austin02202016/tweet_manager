"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface WelcomeHeaderProps {
  userName: string
  clientName?: string
}

export function WelcomeHeader({ userName, clientName }: WelcomeHeaderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12"
    >
      <h1
        className="text-6xl font-bold tracking-tight mb-1"
        style={{
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "linear-gradient(to right, #fff, #c4cfd6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 40px rgba(29, 155, 240, 0.3)",
        }}
      >
        Hello, {userName}
      </h1>
      {clientName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="text-lg text-[#8899a6] pl-1"
        >
          Viewing <span className="text-[#1d9bf0] font-medium">{clientName}</span>
        </motion.p>
      )}
    </motion.div>
  )
}

