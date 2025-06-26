"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Satellite, MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InteractiveMapProps {
  coordinates: [number, number] | null
  onMapClick: (lat: number, lng: number, address?: string) => void
  address: string
}

export default function InteractiveMap({ coordinates, onMapClick, address }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [mapType, setMapType] = useState<"street" | "satellite">("satellite")
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      if (!window.L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = initializeMap
        document.head.appendChild(script)
      } else {
        initializeMap()
      }
    }

    const initializeMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = window.L

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
      }).setView(coordinates || [19.076, 72.8777], 15)

      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      })

      const satelliteLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "© Esri, Maxar, Earthstar Geographics",
          maxZoom: 19,
        },
      )

      if (mapType === "satellite") {
        satelliteLayer.addTo(map)
      } else {
        streetLayer.addTo(map)
      }

      map._streetLayer = streetLayer
      map._satelliteLayer = satelliteLayer

      if (coordinates) {
        const customIcon = L.divIcon({
          html: `
            <div style="
              background: #059669;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                color: white;
                font-size: 14px;
                transform: rotate(45deg);
                font-weight: bold;
              ">📍</div>
            </div>
          `,
          className: "custom-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        })

        markerRef.current = L.marker(coordinates, { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; padding: 8px;">
              <strong>Selected Location</strong><br/>
              <small>${address}</small>
            </div>
          `)
      }

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng

        if (markerRef.current) {
          map.removeLayer(markerRef.current)
        }
        const customIcon = L.divIcon({
          html: `
            <div style="
              background: #059669;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                color: white;
                font-size: 14px;
                transform: rotate(45deg);
                font-weight: bold;
              ">📍</div>
            </div>
          `,
          className: "custom-marker",
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        })

        markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(map)

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          )
          const data = await response.json()
          const addressFromCoords = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`

          markerRef.current
            .bindPopup(`
            <div style="text-align: center; padding: 8px;">
              <strong>Selected Location</strong><br/>
              <small>${addressFromCoords}</small>
            </div>
          `)
            .openPopup()

          onMapClick(lat, lng, addressFromCoords)
        } catch (error) {
          console.error("Reverse geocoding error:", error)
          onMapClick(lat, lng)
        }
      })

      mapInstanceRef.current = map
      setIsMapLoaded(true)
    }

    loadLeaflet()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && coordinates) {
      const map = mapInstanceRef.current
      const L = window.L

      map.setView(coordinates, 15)

      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      const customIcon = L.divIcon({
        html: `
          <div style="
            background: #059669;
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              color: white;
              font-size: 14px;
              transform: rotate(45deg);
              font-weight: bold;
            ">📍</div>
          </div>
        `,
        className: "custom-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      })

      markerRef.current = L.marker(coordinates, { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: center; padding: 8px;">
            <strong>Selected Location</strong><br/>
            <small>${address}</small>
          </div>
        `)
    }
  }, [coordinates, address])

  const switchMapType = (type: "street" | "satellite") => {
    if (!mapInstanceRef.current || !isMapLoaded) return

    const map = mapInstanceRef.current
    setMapType(type)

    if (map._streetLayer && map.hasLayer(map._streetLayer)) {
      map.removeLayer(map._streetLayer)
    }
    if (map._satelliteLayer && map.hasLayer(map._satelliteLayer)) {
      map.removeLayer(map._satelliteLayer)
    }

    if (type === "satellite") {
      map._satelliteLayer.addTo(map)
    } else {
      map._streetLayer.addTo(map)
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <Button
          variant={mapType === "satellite" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMapType("satellite")}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        >
          <Satellite className="h-4 w-4" />
        </Button>
        <Button
          variant={mapType === "street" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMapType("street")}
          className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
        >
          <MapIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000] max-w-xs">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span className="text-gray-700">Click anywhere on the map to select your location</span>
        </div>
      </div>

      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Loading interactive map...</p>
          </div>
        </div>
      )}
    </div>
  )
}

declare global {
  interface Window {
    L: any
  }
}
