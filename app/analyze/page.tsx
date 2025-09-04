"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Zap, Sun, Loader2, Crosshair, AlertCircle, CheckCircle, Target } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { MapSearch } from "@/components/map-search"

// API configuration - using environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

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
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null)
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false)
  const [locationSource, setLocationSource] = useState<'gps' | 'search' | 'click' | 'default'>('default')
  const [monthlyBill, setMonthlyBill] = useState([3000])
  const [roofSize, setRoofSize] = useState("")
  const [panelType, setPanelType] = useState("basic")
  const [includeSubsidy, setIncludeSubsidy] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState("")
  const router = useRouter()

  // Backend integration - Modified handleAnalyze function
  const handleAnalyze = async () => {
    if (!coordinates) {
      setAnalysisError("Please select a location first")
      return
    }

    setIsAnalyzing(true)
    setAnalysisError(null)
    setAnalysisProgress("Preparing analysis...")

    try {
      setAnalysisProgress("Sending data to AI analysis...")
      
      const requestData = {
        address: address,
        latitude: coordinates[0],
        longitude: coordinates[1],
        monthlyBill: monthlyBill[0],
        roofSize: roofSize,
        panelType: panelType,
        includeSubsidy: includeSubsidy
      }

      console.log('Sending analysis request:', requestData)

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        // Add timeout for better UX
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      setAnalysisProgress("Processing with AI...")
      const analysisResult = await response.json()
      
      console.log('Analysis completed:', analysisResult)

      setAnalysisProgress("Finalizing results...")
      
      // Store results for the results page
      if (typeof window !== 'undefined') {
        localStorage.setItem('solarAnalysisResult', JSON.stringify(analysisResult))
      }
      
      // Navigate to results page
      setTimeout(() => {
        router.push("/results")
      }, 1000)

    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisError(
        error instanceof Error 
          ? error.message 
          : 'Analysis failed. Please check your connection and try again.'
      )
    } finally {
      setIsAnalyzing(false)
      setAnalysisProgress("")
    }
  }

  const detectLocation = () => {
    setIsGeolocating(true)
    setAnalysisError(null)
    setIsLocationConfirmed(false)
    
    // Enhanced geolocation support check
    if (!navigator.geolocation) {
      setAnalysisError("Geolocation is not supported by this browser. Please search for your address manually.")
      setIsGeolocating(false)
      return
    }

    // Check permissions first (if supported)
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log('Geolocation permission status:', result.state)
        if (result.state === 'denied') {
          setAnalysisError("Location access is blocked. Please enable location permissions in your browser settings and refresh the page.")
          setIsGeolocating(false)
          return
        }
        requestLocation()
      }).catch(() => {
        // If permissions API fails, try direct geolocation
        requestLocation()
      })
    } else {
      requestLocation()
    }
  }

  const requestLocation = () => {
    console.log('Requesting geolocation...')
    setAnalysisProgress("Requesting location access...")

    const options = {
      enableHighAccuracy: true,
      timeout: 20000, // Increased to 20 seconds
      maximumAge: 300000, // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('Geolocation success:', position)
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const accuracy = position.coords.accuracy
        
        setCoordinates([lat, lng])
        setLocationAccuracy(accuracy)
        setLocationSource('gps')
        setIsLocationConfirmed(true)
        
        try {
          setAnalysisProgress("Getting your precise address...")
          
          // Try multiple geocoding services for better reliability
          let addressFound = false
          
          // Try OpenStreetMap Nominatim first
          try {
            const nominatimResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
              {
                headers: {
                  'User-Agent': 'SolarizeIt/1.0 (contact@solarize-it.com)'
                }
              }
            )
            
            if (nominatimResponse.ok) {
              const data = await nominatimResponse.json()
              if (data && data.display_name) {
                setAddress(data.display_name)
                addressFound = true
              }
            }
          } catch (err) {
            console.log('Nominatim failed, trying alternative...')
          }
          
          // Fallback to coordinate display if no address found
          if (!addressFound) {
            setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)} (Coordinates)`)
          }
          
        } catch (error) {
          console.error("Reverse geocoding error:", error)
          setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)} (Coordinates)`)
        } finally {
          setAnalysisProgress("")
        }
        
        setIsGeolocating(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        setIsGeolocating(false)
        setIsLocationConfirmed(false)
        
        let errorMessage = "Location detection failed"
        let suggestions = []
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied"
            suggestions = [
              "Click the location icon in your browser's address bar",
              "Allow location access when prompted", 
              "Check browser settings → Privacy & Security → Location",
              "Try refreshing the page and allowing location access"
            ]
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable"
            suggestions = [
              "Check if location services are enabled on your device",
              "Move to an area with better GPS signal",
              "Try connecting to WiFi for better location accuracy"
            ]
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out"
            suggestions = [
              "Check your internet connection",
              "Try again in a few seconds",
              "Move to an area with better signal"
            ]
            break
          default:
            errorMessage = "Unknown location error occurred"
            suggestions = [
              "Try refreshing the page",
              "Check browser permissions",
              "Use the search function instead"
            ]
            break
        }
        
        setAnalysisError(`${errorMessage}. Try: ${suggestions[0]} or search for your address manually.`)
      },
      options
    )
  }

  const handleMapClick = (lat: number, lng: number, addressFromMap?: string) => {
    setCoordinates([lat, lng])
    setAddress(addressFromMap || `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    setLocationSource('click')
    setIsLocationConfirmed(true)
    setLocationAccuracy(null) // No accuracy info for manual selection
  }

  const handleAddressSearch = async (searchAddress: string) => {
    if (!searchAddress.trim()) return

    try {
      setAnalysisProgress("Searching for location...")
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1&addressdetails=1`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const lat = Number.parseFloat(data[0].lat)
        const lng = Number.parseFloat(data[0].lon)
        setCoordinates([lat, lng])
        setAddress(data[0].display_name)
        setLocationSource('search')
        setIsLocationConfirmed(true)
        setLocationAccuracy(null)
      } else {
        setAnalysisError("Location not found. Please try a different search term or click on the map.")
        setIsLocationConfirmed(false)
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      setAnalysisError("Search failed. Please try again or click on the map.")
      setIsLocationConfirmed(false)
    } finally {
      setAnalysisProgress("")
    }
  }

  const confirmLocation = () => {
    if (coordinates) {
      setIsLocationConfirmed(true)
      setAnalysisError(null)
    }
  }

  const getLocationStatusBadge = () => {
    if (!coordinates) return null

    if (isLocationConfirmed) {
      let badgeText = "Location Confirmed"
      let badgeColor = "bg-green-100 text-green-800"
      
      switch (locationSource) {
        case 'gps':
          badgeText = `GPS Location (±${locationAccuracy ? Math.round(locationAccuracy) : '?'}m)`
          badgeColor = "bg-emerald-100 text-emerald-800"
          break
        case 'search':
          badgeText = "Searched Location"
          badgeColor = "bg-blue-100 text-blue-800"
          break
        case 'click':
          badgeText = "Manual Selection"
          badgeColor = "bg-purple-100 text-purple-800"
          break
      }
      
      return (
        <Badge className={`${badgeColor} mb-2`}>
          <CheckCircle className="w-3 h-3 mr-1" />
          {badgeText}
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-orange-100 text-orange-800 mb-2">
          <Target className="w-3 h-3 mr-1" />
          Location Selected - Please Confirm
        </Badge>
      )
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Analyze Solar Potential
          </h1>
          <p className="text-xl text-gray-600">
            Get personalized insights powered by AI in just a few clicks
          </p>
        </div>

        {/* Error Display */}
        {analysisError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <p>{analysisError}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setAnalysisError(null)}
              >
                Dismiss
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Location & Satellite View
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Location Status Display */}
            
              <div className="aspect-video rounded-lg mb-4 overflow-hidden border-2 border-dashed border-gray-300">
                <InteractiveMap coordinates={coordinates} onMapClick={handleMapClick} address={address} />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-base font-medium">
                    Search for Your Property Address
                  </Label>
                  <div className="mt-2">
                    <MapSearch
                      onLocationSelect={(lat, lng, address) => {
                        setCoordinates([lat, lng])
                        setAddress(address)
                        setLocationSource('search')
                        setIsLocationConfirmed(true)
                        setLocationAccuracy(null)
                      }}
                      placeholder="Enter your full address (e.g., 123 Main St, Mumbai, Maharashtra)"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Include city and state for better accuracy
                  </p>
                </div>

                <div className="flex gap-2">
               <Button
  variant="outline"
  onClick={() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeolocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Your Location:", latitude, longitude);
        setIsGeolocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGeolocating(false);
      }
    );
  }}
  disabled={isGeolocating || isAnalyzing}
  className="flex-1"
>
  {isGeolocating ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {analysisProgress || "Getting Location..."}
    </>
  ) : (
    <>
      <Crosshair className="mr-2 h-4 w-4" />
      Use My GPS Location
    </>
  )}
</Button>

                  
                  {coordinates && !isLocationConfirmed && (
                    <Button 
                      onClick={confirmLocation}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                  )}
                </div>

                {/* Enhanced Location Help Text */}
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
                <Checkbox 
                  id="subsidy" 
                  checked={includeSubsidy} 
                  onCheckedChange={(checked) => setIncludeSubsidy(checked === true)} 
                />
                <Label htmlFor="subsidy" className="text-sm">
                  Include subsidy & local policy details
                </Label>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!coordinates || !isLocationConfirmed || isAnalyzing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg rounded-xl disabled:bg-gray-400"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {analysisProgress || "Analyzing Your Roof..."}
                  </>
                ) : !coordinates ? (
                  <>
                    <MapPin className="mr-2 h-5 w-5" />
                    Select Location First
                  </>
                ) : !isLocationConfirmed ? (
                  <>
                    <Target className="mr-2 h-5 w-5" />
                    Confirm Location to Continue
                  </>
                ) : (
                  <>
                    <Sun className="mr-2 h-5 w-5" />
                    Analyze Roof with AI
                  </>
                )}
              </Button>

              {coordinates && isLocationConfirmed && (
                <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✓ Ready for analysis at {address}
                </div>
              )}
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
              <p className="text-gray-600">
                {analysisProgress || "Processing satellite imagery, weather data, and AI calculations..."}
              </p>
              <div className="mt-4 text-sm text-gray-500">
                This may take 10-30 seconds for comprehensive analysis
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}