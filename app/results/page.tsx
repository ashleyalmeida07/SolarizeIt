"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sun, TrendingUp, Calendar, Zap, Leaf, Download, Star, Phone, MapPin } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function ResultsPage() {
  const chartData = [
    { year: "Year 1", cost: 150000, savings: 25000 },
    { year: "Year 2", cost: 0, savings: 35000 },
    { year: "Year 3", cost: 0, savings: 40000 },
    { year: "Year 4", cost: 0, savings: 45000 },
    { year: "Year 5", cost: 0, savings: 50000 },
  ]

  const vendors = [
    {
      name: "SolarTech Solutions",
      rating: 4.8,
      reviews: 245,
      price: "₹1.2L - ₹1.5L",
      location: "Mumbai",
      speciality: "Residential Solar",
    },
    {
      name: "GreenEnergy Pro",
      rating: 4.7,
      reviews: 189,
      price: "₹1.1L - ₹1.4L",
      location: "Navi Mumbai",
      speciality: "Commercial & Residential",
    },
    {
      name: "EcoSolar India",
      rating: 4.6,
      reviews: 156,
      price: "₹1.3L - ₹1.6L",
      location: "Thane",
      speciality: "Premium Installations",
    },
  ]

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800">✅ Analysis Complete</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Your Solar Analysis Results</h1>
          <p className="text-xl text-gray-600">Based on your location, energy usage, and local conditions</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">₹1.5L</p>
              <p className="text-emerald-100">Total Savings (10 years)</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">3.5</p>
              <p className="text-yellow-800">Years Payback</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-sky-500 to-sky-600 text-white">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">4,200</p>
              <p className="text-sky-100">kWh/year Generated</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <Leaf className="h-8 w-8 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">2.1</p>
              <p className="text-green-100">Tons CO₂ Saved/year</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Cost vs Savings Chart */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Cost vs Savings Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  cost: {
                    label: "Cost",
                    color: "hsl(var(--chart-1))",
                  },
                  savings: {
                    label: "Savings",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="cost" fill="var(--color-cost)" name="Cost" />
                    <Bar dataKey="savings" fill="var(--color-savings)" name="Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Environmental Impact */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <div className="text-4xl mb-2">🌳</div>
                <p className="text-2xl font-bold text-green-700">52 Trees</p>
                <p className="text-green-600">Equivalent trees planted annually</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Carbon Footprint Reduction</span>
                    <span className="text-sm text-gray-500">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Clean Energy Generation</span>
                    <span className="text-sm text-gray-500">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Vendors */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              Recommended Solar Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {vendors.map((vendor, index) => (
                <Card key={index} className="border hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{vendor.name}</h3>
                        <p className="text-sm text-gray-500">{vendor.speciality}</p>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        #{index + 1}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 font-medium">{vendor.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({vendor.reviews} reviews)</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {vendor.location}
                      </div>

                      <div className="text-lg font-semibold text-emerald-600">{vendor.price}</div>

                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        <Phone className="mr-2 h-4 w-4" />
                        Get Quote
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8">
            <Download className="mr-2 h-5 w-5" />
            Download Premium Report
          </Button>
          <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8">
            Compare Providers
          </Button>
        </div>
      </div>
    </div>
  )
}
