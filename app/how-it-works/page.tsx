"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Satellite, CloudSun, Zap, FileText, MapPin, BarChart3, Shield, Cpu } from "lucide-react"

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState("satellite")

  const features = [
    {
      id: "satellite",
      icon: Satellite,
      title: "Satellite Imagery Analysis",
      description: "High-resolution satellite data to assess roof conditions",
      details: [
        "Real-time satellite imagery from multiple sources",
        "AI-powered roof detection and measurement",
        "Shading analysis from nearby structures",
        "Roof orientation and tilt calculations",
      ],
    },
    {
      id: "weather",
      icon: CloudSun,
      title: "Weather Data Integration",
      description: "Comprehensive weather patterns and solar irradiance data",
      details: [
        "Historical weather data analysis",
        "Solar irradiance measurements",
        "Seasonal variation calculations",
        "Climate impact assessments",
      ],
    },
    {
      id: "rates",
      icon: Zap,
      title: "Real-time Electricity Rates",
      description: "Current electricity pricing and tariff structures",
      details: [
        "Live electricity rate fetching",
        "Time-of-use tariff analysis",
        "Net metering calculations",
        "Future rate projections",
      ],
    },
    {
      id: "policy",
      icon: FileText,
      title: "Local Policy Engine",
      description: "Government subsidies and local regulations",
      details: [
        "State and central government subsidies",
        "Local building regulations",
        "Grid connection requirements",
        "Tax incentive calculations",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800">🔬 Advanced Technology</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How SolarizeIt Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our advanced AI-powered platform combines multiple data sources to provide the most accurate solar analysis
            for your property.
          </p>
        </div>

        {/* Technology Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Cpu, title: "AI-Powered", desc: "Machine learning algorithms" },
            { icon: Shield, title: "Accurate", desc: "99.2% precision rate" },
            { icon: BarChart3, title: "Comprehensive", desc: "Multi-factor analysis" },
            { icon: MapPin, title: "Location-Specific", desc: "Hyper-local data" },
          ].map((item, index) => (
            <Card key={index} className="text-center shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Technology Tabs */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Technology Deep Dive</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                {features.map((feature) => (
                  <TabsTrigger
                    key={feature.id}
                    value={feature.id}
                    className="flex flex-col items-center gap-2 p-4 h-auto"
                  >
                    <feature.icon className="h-5 w-5" />
                    <span className="text-xs">{feature.title.split(" ")[0]}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {features.map((feature) => (
                <TabsContent key={feature.id} value={feature.id} className="mt-0">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <feature.icon className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                          <p className="text-gray-600">{feature.description}</p>
                        </div>
                      </div>

                      <ul className="space-y-3">
                        {feature.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0" />
                            <span className="text-gray-700">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-8 text-center">
                      <div className="w-32 h-32 bg-card rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <feature.icon className="h-16 w-16 text-emerald-600" />
                      </div>
                      <p className="text-gray-600">
                        Visual representation of {feature.title.toLowerCase()} would be displayed here
                      </p>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Process Flow */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Analysis Process Flow</h2>

          <div className="relative">
            {/* Flow Steps */}
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { step: "01", title: "Location Input", desc: "Address or coordinates" },
                { step: "02", title: "Data Collection", desc: "Satellite & weather data" },
                { step: "03", title: "AI Analysis", desc: "Machine learning processing" },
                { step: "04", title: "Calculations", desc: "ROI & savings computation" },
                { step: "05", title: "Results", desc: "Personalized recommendations" },
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>

                  {index < 4 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-emerald-200 -translate-x-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
