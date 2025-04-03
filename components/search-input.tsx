"use client"

import { Search } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  return (
    <div className="relative w-full sm:w-64">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-[#8899a6]" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#253341] text-white rounded-md pl-10 pr-4 py-2 border border-[#38444d] focus:border-[#1d9bf0] focus:ring-2 focus:ring-[#1d9bf033] focus:outline-none transition-colors duration-200"
      />
    </div>
  )
} 