"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sun, TrendingUp, Calendar, Zap, Leaf, Download, Star, Phone, MapPin, AlertCircle } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useRouter } from "next/navigation"

interface AnalysisResult {
  solar_metrics: {
    daily_consumption: number
    annual_consumption: number
    required_system_size_kw: number
    number_of_panels: number
    estimated_cost: number
    annual_generation: number
    annual_savings: number
    payback_period_years: number
    co2_reduction_kg_per_year: number
    system_efficiency: number
    capacity_utilization: number
  }
  structured_analysis: {
    suitability_assessment: {
      overall_score: number
      factors: string[]
    }
    financial_analysis: {
      roi_percentage: number
      break_even_years: number
      total_savings_25_years: number
      investment_grade: string
    }
    technical_recommendations: string[]
    environmental_impact: {
      co2_reduction_tons: number
      equivalent_trees: number
      clean_energy_percentage: number
    }
    maintenance_schedule: string[]
    local_vendors: Array<{
      name: string
      rating: number
      experience_years: number
      specialization: string
      contact: string
      estimated_quote: string
      certifications: string[]
    }>
    government_incentives: {
      central_subsidy: number
      state_subsidy: number
      net_metering_available: boolean
      tax_benefits: string
    }
    installation_timeline: {
      site_survey: string
      approvals: string
      installation: string
      commissioning: string
    }
  }
  location: {
    address: string
    latitude: number
    longitude: number
  }
  weather_data: {
    average_sun_hours: number
    cloud_coverage: number
    temperature: number
    humidity: number
    weather_condition: string
    wind_speed: number
  }
  chart_data: {
    cost_vs_savings: {
      years: string[]
      costs: number[]
      savings: number[]
    }
    environmental_metrics: {
      carbon_reduction: number
      clean_energy: number
    }
  }
  recommendations: {
    is_suitable: boolean
    confidence_score: number
    priority_actions: string[]
  }
}

export default function ResultsPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getStoredResults = () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('solarAnalysisResult') || sessionStorage.getItem('solarAnalysisResult')
      }
      return null
    }

    const storedResults = getStoredResults()
    
    if (!storedResults) {
      setError("No analysis data found. Please run an analysis first.")
      setLoading(false)
      return
    }

    try {
      const parsedResults = JSON.parse(storedResults)
      console.log('Loaded analysis results:', parsedResults)
      setAnalysisResult(parsedResults)
    } catch (err) {
      console.error('Error parsing analysis results:', err)
      setError("Invalid analysis data. Please run a new analysis.")
    }
    
    setLoading(false)
  }, [])

  const generateWordReport = () => {
    if (!analysisResult) return

    const { solar_metrics, structured_analysis, location, weather_data } = analysisResult

    // Create Word document content
    const documentContent = `
SOLAR ANALYSIS REPORT
Generated on: ${new Date().toLocaleDateString()}

=================================================================

PROPERTY INFORMATION
=================================================================
Address: ${location.address}
Coordinates: ${location.latitude}, ${location.longitude}

WEATHER CONDITIONS
=================================================================
Average Sun Hours per Day: ${weather_data.average_sun_hours}
Temperature: ${weather_data.temperature}°C
Weather Condition: ${weather_data.weather_condition}
Cloud Coverage: ${weather_data.cloud_coverage}%
Humidity: ${weather_data.humidity}%

SYSTEM SPECIFICATIONS
=================================================================
Required System Size: ${solar_metrics.required_system_size_kw} kW
Number of Panels: ${solar_metrics.number_of_panels}
Daily Energy Consumption: ${Math.round(solar_metrics.daily_consumption)} kWh
Annual Energy Consumption: ${Math.round(solar_metrics.annual_consumption)} kWh
Estimated System Cost: ₹${Math.round(solar_metrics.estimated_cost / 100000 * 10) / 10} Lakhs

FINANCIAL ANALYSIS
=================================================================
Annual Savings: ₹${Math.round(solar_metrics.annual_savings / 1000)}K
Payback Period: ${solar_metrics.payback_period_years} years
ROI Percentage: ${structured_analysis.financial_analysis.roi_percentage}%
Investment Grade: ${structured_analysis.financial_analysis.investment_grade}
25-Year Total Savings: ₹${Math.round(structured_analysis.financial_analysis.total_savings_25_years / 100000)} Lakhs

SUITABILITY ASSESSMENT
=================================================================
Overall Suitability Score: ${structured_analysis.suitability_assessment.overall_score}%

Key Factors:
${structured_analysis.suitability_assessment.factors.map(factor => `• ${factor}`).join('\n')}

ENVIRONMENTAL IMPACT
=================================================================
CO2 Reduction: ${structured_analysis.environmental_impact.co2_reduction_tons} tons per year
Equivalent Trees Planted: ${structured_analysis.environmental_impact.equivalent_trees} trees
Clean Energy Generation: ${structured_analysis.environmental_impact.clean_energy_percentage}%

TECHNICAL RECOMMENDATIONS
=================================================================
${structured_analysis.technical_recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

RECOMMENDED SOLAR VENDORS
=================================================================
${structured_analysis.local_vendors.map((vendor, index) => `
${index + 1}. ${vendor.name}
   Rating: ${vendor.rating}/5 stars
   Experience: ${vendor.experience_years} years
   Specialization: ${vendor.specialization}
   Contact: ${vendor.contact}
   Estimated Quote: ${vendor.estimated_quote}
   Certifications: ${vendor.certifications.join(', ')}
`).join('\n')}

GOVERNMENT INCENTIVES
=================================================================
Central Subsidy: ${structured_analysis.government_incentives.central_subsidy}%
State Subsidy: ${structured_analysis.government_incentives.state_subsidy}%
Net Metering: ${structured_analysis.government_incentives.net_metering_available ? 'Available' : 'Not Available'}
Tax Benefits: ${structured_analysis.government_incentives.tax_benefits}

INSTALLATION TIMELINE
=================================================================
Site Survey: ${structured_analysis.installation_timeline.site_survey}
Approvals: ${structured_analysis.installation_timeline.approvals}
Installation: ${structured_analysis.installation_timeline.installation}
Commissioning: ${structured_analysis.installation_timeline.commissioning}

=================================================================
This report was generated by SolarizeIt AI Analysis System
For more information, visit: www.solarize-it.com
=================================================================
    `.trim()

    // Create and download the Word document
    const blob = new Blob([documentContent], {
      type: 'application/msword'
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Solar_Analysis_Report_${new Date().toISOString().split('T')[0]}.doc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    )
  }

  if (error || !analysisResult) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-900 mb-2">Analysis Data Not Found</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <Button 
                onClick={() => router.push('/analyze')} 
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Start New Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Extract dynamic data from AI analysis results
  const { solar_metrics, structured_analysis, location, weather_data, chart_data, recommendations } = analysisResult
  
  // Use dynamic chart data from AI response
  const chartDataForDisplay = chart_data?.cost_vs_savings ? 
    chart_data.cost_vs_savings.years.map((year, index) => ({
      year,
      cost: chart_data.cost_vs_savings.costs[index] || 0,
      savings: chart_data.cost_vs_savings.savings[index] || 0
    })) :
    [
      { year: "Year 1", cost: solar_metrics.estimated_cost, savings: Math.round(solar_metrics.annual_savings * 0.5) },
      { year: "Year 2", cost: 0, savings: Math.round(solar_metrics.annual_savings * 0.7) },
      { year: "Year 3", cost: 0, savings: Math.round(solar_metrics.annual_savings * 0.8) },
      { year: "Year 4", cost: 0, savings: Math.round(solar_metrics.annual_savings * 0.9) },
      { year: "Year 5", cost: 0, savings: solar_metrics.annual_savings },
    ]

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800">✅ Analysis Complete</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Your Solar Analysis Results</h1>
          <p className="text-xl text-gray-600">Based on your location, energy usage, and local conditions</p>
        </div>

        {/* Dynamic Key Metrics from AI */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">
                ₹{Math.round(solar_metrics.annual_savings / 1000)}K
              </p>
              <p className="text-emerald-100">Annual Savings</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">
                {solar_metrics.payback_period_years || structured_analysis.financial_analysis.break_even_years}
              </p>
              <p className="text-yellow-800">Years Payback</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-sky-500 to-sky-600 text-white">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">
                {Math.round(weather_data.average_sun_hours * 365)}
              </p>
              <p className="text-sky-100">Hours of Sunlight/year</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <Leaf className="h-8 w-8 mx-auto mb-3" />
              <p className="text-3xl font-bold mb-1">
                {structured_analysis.suitability_assessment.overall_score}%
              </p>
              <p className="text-green-100">Suitability Score</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Dynamic Cost vs Savings Chart */}
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
                  <BarChart data={chartDataForDisplay}>
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

          {/* Dynamic Environmental Impact */}
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
                <p className="text-2xl font-bold text-green-700">
                  {structured_analysis.environmental_impact.equivalent_trees} Trees
                </p>
                <p className="text-green-600">Equivalent trees planted annually</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Carbon Footprint Reduction</span>
                    <span className="text-sm text-gray-500">
                      {Math.round(structured_analysis.environmental_impact.co2_reduction_tons * 10)}%
                    </span>
                  </div>
                  <Progress value={Math.round(structured_analysis.environmental_impact.co2_reduction_tons * 10)} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Clean Energy Generation</span>
                    <span className="text-sm text-gray-500">{structured_analysis.environmental_impact.clean_energy_percentage}%</span>
                  </div>
                  <Progress value={structured_analysis.environmental_impact.clean_energy_percentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Section with Structured Display */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              AI-Powered Analysis Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-emerald-600">Suitability Assessment</h3>
                <div className="space-y-2">
                  {structured_analysis.suitability_assessment.factors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3 text-blue-600">Financial Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">ROI Percentage:</span>
                    <span className="font-medium">{structured_analysis.financial_analysis.roi_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Investment Grade:</span>
                    <span className="font-medium">{structured_analysis.financial_analysis.investment_grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">25-Year Savings:</span>
                    <span className="font-medium">₹{Math.round(structured_analysis.financial_analysis.total_savings_25_years / 100000)}L</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic AI-Generated Vendors */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              AI-Recommended Solar Vendors
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Personalized recommendations for your location: {location.address}
            </p>
          </CardHeader>
          <CardContent>
            {structured_analysis.local_vendors && structured_analysis.local_vendors.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {structured_analysis.local_vendors.map((vendor, index) => (
                  <Card key={index} className="border hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{vendor.name}</h3>
                          <p className="text-sm text-gray-500">{vendor.specialization}</p>
                          <p className="text-xs text-gray-400">{vendor.experience_years} years experience</p>
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
                          <span className="text-sm text-gray-500">AI Verified</span>
                        </div>

                        <div className="text-sm text-gray-500">
                          Certifications: {vendor.certifications.join(', ')}
                        </div>

                        <div className="text-lg font-semibold text-emerald-600">
                          {vendor.estimated_quote}
                        </div>

                        <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => window.location.href = `tel:${vendor.contact}`}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        {vendor.contact}
                      </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">AI vendor recommendations not available for this analysis.</p>
                <Button variant="outline" onClick={() => router.push('/analyze')}>
                  Run New Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic System Specifications */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-600" />
              System Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {solar_metrics.required_system_size_kw} kW
                </div>
                <div className="text-sm text-gray-600">System Size</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {solar_metrics.number_of_panels}
                </div>
                <div className="text-sm text-gray-600">Solar Panels</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  {Math.round(solar_metrics.daily_consumption)} kWh
                </div>
                <div className="text-sm text-gray-600">Daily Consumption</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 mb-1">
                  ₹{Math.round(solar_metrics.estimated_cost / 100000 * 10) / 10}L
                </div>
                <div className="text-sm text-gray-600">Estimated Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Next Steps from AI */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader>
            <CardTitle>AI-Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {structured_analysis.technical_recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Government Incentives from AI */}
        {structured_analysis.government_incentives && (
          <Card className="shadow-xl border-0 mb-8">
            <CardHeader>
              <CardTitle>Government Incentives & Subsidies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Available Subsidies</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Central Subsidy:</span>
                      <span className="font-medium">{structured_analysis.government_incentives.central_subsidy}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>State Subsidy:</span>
                      <span className="font-medium">{structured_analysis.government_incentives.state_subsidy}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Additional Benefits</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Net Metering:</span>
                      <span className="font-medium">{structured_analysis.government_incentives.net_metering_available ? 'Available' : 'Not Available'}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {structured_analysis.government_incentives.tax_benefits}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-emerald-600 hover:bg-emerald-700 px-8"
            onClick={generateWordReport}
          >
            <Download className="mr-2 h-5 w-5" />
            Download Word Report
          </Button>
       
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => router.push('/analyze')}
            className="px-8"
          >
            New Analysis
          </Button>
        </div>
      </div>
    </div>
  )
}