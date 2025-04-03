"use client"

import { useEffect, useState } from "react"
import type { Client } from "@/types/client"

interface ClientSelectorProps {
  selectedClient: Client | null
  onClientSelect: (client: Client) => void
}

export function ClientSelector({ selectedClient, onClientSelect }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients")
        if (!response.ok) {
          throw new Error("Failed to fetch clients")
        }
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("Error fetching clients:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [])

  if (loading) {
    return <div>Loading clients...</div>
  }

  return (
    <div className="relative">
      <select
        value={selectedClient?.id || ""}
        onChange={(e) => {
          const client = clients.find((c) => c.id === e.target.value)
          if (client) {
            onClientSelect(client)
          }
        }}
        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">Select a client</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </div>
  )
} 