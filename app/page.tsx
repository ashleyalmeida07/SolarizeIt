"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Sun, Calculator, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const partners = ["Tata Solar", "Jason Solar", "Ashley Energies","Jaden Solar Panels", "Elson Luminous Power"]

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-yellow-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        />

        <div
          className="absolute top-20 right-20 w-32 h-32 bg-yellow-400 rounded-full opacity-80 animate-pulse"
          style={{
            transform: `rotate(${scrollY * 0.1}deg) scale(${1 + scrollY * 0.0005})`,
          }}
        >
          <div className="absolute inset-2 bg-yellow-300 rounded-full animate-spin">
            <div className="absolute inset-2 bg-yellow-200 rounded-full" />
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-transparent to-yellow-300 opacity-30"
              style={{
                transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                animation: `pulse 3s ease-in-out infinite ${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <Badge className="mb-6 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            🌱 Sustainable Energy Solutions
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Find out if <span className="text-emerald-600">solar works</span> for your roof
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Using satellite imagery, weather data, and electricity rates to compute ROI, payback period, and show the
            best solar provider nearby.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/analyze">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all "
              >
                <Calculator className="mr-2 h-5 w-5" />
                Analyze My Roof
              </Button>
            </Link>

            <Link href="/analyze">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg rounded-xl"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Drop a Pin on Map
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-10 w-16 h-12 bg-blue-900 rounded transform rotate-12 opacity-60 animate-bounce" />
        <div className="absolute bottom-20 right-32 w-20 h-14 bg-blue-800 rounded transform -rotate-6 opacity-70 animate-bounce delay-300" />
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to discover your solar potential
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: MapPin,
                title: "Drop a Pin or Enter Address",
                description:
                  "Simply point to your location on our interactive map or type in your address to get started.",
              },
              {
                step: "02",
                icon: Sun,
                title: "We Analyze Everything",
                description:
                  "Our AI analyzes satellite imagery, weather patterns, and local energy costs to assess your roof's potential.",
              },
              {
                step: "03",
                icon: Calculator,
                title: "Get ROI & Vendor Suggestions",
                description:
                  "Receive detailed ROI calculations, payback periods, and recommendations for the best local solar providers.",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="relative group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardContent className="p-8 text-center">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                      {item.step}
                    </div>
                  </div>

                  <div className="mb-6 mt-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-emerald-200 transition-colors">
                      <item.icon className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>

                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Leading Solar Partners</h2>
            <p className="text-gray-600">We work with India's top solar companies to bring you the best deals</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Sun className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="font-medium text-gray-900 text-sm">{partner}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emerald-600 to-sky-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Go Solar?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of homeowners who've made the switch to clean, affordable solar energy.
          </p>

          <Link href="/analyze">
            <Button
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Your Solar Journey
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
