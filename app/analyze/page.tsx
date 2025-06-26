"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Zap, Sun, Loader2, Crosshair } from "lucide-react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

import { MapSearch } from "@/components/map-search"

const InteractiveMap = dynamic(() => import("@/components/interactive-map"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
})

export default function AnalyzePage() {
  const [address, setAddress] = useState("")
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [monthlyBill, setMonthlyBill] = useState([3000])
  const [roofSize, setRoofSize] = useState("")
  const [panelType, setPanelType] = useState("basic")
  const [includeSubsidy, setIncludeSubsidy] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const router = useRouter()

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      router.push("/results")
    }, 3000)
  }

  const detectLocation = () => {
    setIsGeolocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCoordinates([lat, lng])
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          setIsGeolocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsGeolocating(false)
          // Fallback to Mumbai coordinates
          setCoordinates([19.076, 72.8777])
          setAddress("Mumbai, Maharashtra (approximate)")
        },
      )
    } else {
      setIsGeolocating(false)
      // Fallback to Mumbai coordinates
      setCoordinates([19.076, 72.8777])
      setAddress("Mumbai, Maharashtra (geolocation not supported)")
    }
  }

  const handleMapClick = (lat: number, lng: number, addressFromMap?: string) => {
    setCoordinates([lat, lng])
    setAddress(addressFromMap || `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
  }

  const handleAddressSearch = async (searchAddress: string) => {
    if (!searchAddress.trim()) return

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const lat = Number.parseFloat(data[0].lat)
        const lng = Number.parseFloat(data[0].lon)
        setCoordinates([lat, lng])
        setAddress(data[0].display_name)
      }
    } catch (error) {
      console.error("Geocoding error:", error)
    }
  }

  useEffect(() => {
    if (!coordinates) {
      setCoordinates([19.076, 72.8777])
      setAddress("Mumbai, Maharashtra")
    }
  }, [coordinates])

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Analyze Your Roof's Solar Potential</h1>
          <p className="text-xl text-gray-600">Get personalized insights in just a few clicks</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Location & Satellite View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg mb-4 overflow-hidden">
                <InteractiveMap coordinates={coordinates} onMapClick={handleMapClick} address={address} />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Search or Enter Your Address</Label>
                  <div className="mt-1">
                    <MapSearch
                      onLocationSelect={(lat, lng, address) => {
                        setCoordinates([lat, lng])
                        setAddress(address)
                      }}
                      placeholder="Search for your location..."
                    />
                  </div>
                </div>

                <Button variant="outline" onClick={detectLocation} disabled={isGeolocating} className="w-full">
                  {isGeolocating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Detecting Location...
                    </>
                  ) : (
                    <>
                      <Crosshair className="mr-2 h-4 w-4" />
                      Use My Current Location
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Energy Analysis Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Monthly Electricity Bill</Label>
                <div className="mt-2">
                  <Slider
                    value={monthlyBill}
                    onValueChange={setMonthlyBill}
                    max={10000}
                    min={500}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>₹500</span>
                    <span className="font-medium text-emerald-600">₹{monthlyBill[0]}</span>
                    <span>₹10,000+</span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="roofSize">Roof Size (Optional)</Label>
                <Input
                  id="roofSize"
                  placeholder="e.g., 1000 sq ft"
                  value={roofSize}
                  onChange={(e) => setRoofSize(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-base font-medium">Panel Preference</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Button
                    variant={panelType === "basic" ? "default" : "outline"}
                    onClick={() => setPanelType("basic")}
                    className={panelType === "basic" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    Basic Panels
                  </Button>
                  <Button
                    variant={panelType === "premium" ? "default" : "outline"}
                    onClick={() => setPanelType("premium")}
                    className={panelType === "premium" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    Premium Panels
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="subsidy" checked={includeSubsidy} onCheckedChange={setIncludeSubsidy} />
                <Label htmlFor="subsidy" className="text-sm">
                  Include subsidy & local policy details
                </Label>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!coordinates || isAnalyzing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg rounded-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Your Roof...
                  </>
                ) : (
                  <>
                    <Sun className="mr-2 h-5 w-5" />
                    Analyze Roof
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {isAnalyzing && (
          <Card className="mt-8 shadow-xl border-0">
            <CardContent className="p-8 text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-4 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sun className="h-8 w-8 text-yellow-800" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Solar Potential</h3>
              <p className="text-gray-600">Processing satellite imagery, weather data, and local energy rates...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
