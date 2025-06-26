"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Search, X } from "lucide-react"

interface MapSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  placeholder?: string
}

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  place_id: string
}

export function MapSearch({ onLocationSelect, placeholder = "Search for a location..." }: MapSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  const searchLocations = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in&addressdetails=1`,
      )
      const data = await response.json()
      setResults(data)
      setShowResults(true)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(query)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)
    onLocationSelect(lat, lng, result.display_name)
    setQuery(result.display_name)
    setShowResults(false)
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setShowResults(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            {results.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleResultClick(result)}
                className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex items-start gap-2 transition-colors"
              >
                <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{result.display_name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50">
          <Card className="p-4 text-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mx-auto mb-2"></div>
            <span className="text-sm text-gray-600">Searching...</span>
          </Card>
        </div>
      )}
    </div>
  )
}
