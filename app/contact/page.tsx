"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Mail, Phone, MapPin, Send, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

export default function ContactPage() {
  const [formType, setFormType] = useState("vendor")

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800">🤝 Partner With Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our network of solar partners or get in touch for enterprise solutions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex gap-4 mb-6">
              <Button
                variant={formType === "vendor" ? "default" : "outline"}
                onClick={() => setFormType("vendor")}
                className={formType === "vendor" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Solar Vendor
              </Button>
              <Button
                variant={formType === "enterprise" ? "default" : "outline"}
                onClick={() => setFormType("enterprise")}
                className={formType === "enterprise" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                <Users className="mr-2 h-4 w-4" />
                Enterprise
              </Button>
            </div>

            {formType === "vendor" && (
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-600" />
                    Solar Vendor Partnership
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendorName">Company Name</Label>
                      <Input id="vendorName" placeholder="Solar Solutions Inc." />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input id="contactPerson" placeholder="John Doe" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendorEmail">Email</Label>
                      <Input id="vendorEmail" type="email" placeholder="contact@solarsolutions.com" />
                    </div>
                    <div>
                      <Label htmlFor="vendorPhone">Phone</Label>
                      <Input id="vendorPhone" placeholder="+91 98765 43210" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="serviceArea">Area of Service</Label>
                    <Input id="serviceArea" placeholder="Mumbai, Navi Mumbai, Thane" />
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" placeholder="https://www.solarsolutions.com" />
                  </div>

                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2">1-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="vendorMessage">Additional Information</Label>
                    <Textarea
                      id="vendorMessage"
                      placeholder="Tell us about your services, certifications, and why you'd like to partner with us..."
                      rows={4}
                    />
                  </div>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Send className="mr-2 h-4 w-4" />
                    Submit Partnership Request
                  </Button>
                </CardContent>
              </Card>
            )}

            {formType === "enterprise" && (
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Enterprise Solutions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgName">Organization Name</Label>
                      <Input id="orgName" placeholder="ABC Housing Society" />
                    </div>
                    <div>
                      <Label htmlFor="orgType">Organization Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="housing-society">Housing Society</SelectItem>
                          <SelectItem value="architect">Architect Firm</SelectItem>
                          <SelectItem value="developer">Real Estate Developer</SelectItem>
                          <SelectItem value="corporate">Corporate Office</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="entEmail">Email</Label>
                      <Input id="entEmail" type="email" placeholder="contact@abchousing.com" />
                    </div>
                    <div>
                      <Label htmlFor="entPhone">Phone</Label>
                      <Input id="entPhone" placeholder="+91 98765 43210" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="projectAddress">Project Address</Label>
                    <Input id="projectAddress" placeholder="Complete address of the project" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectSize">Project Size</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (1-10 units)</SelectItem>
                          <SelectItem value="medium">Medium (11-50 units)</SelectItem>
                          <SelectItem value="large">Large (51-200 units)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (200+ units)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeline">Timeline</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate (1-3 months)</SelectItem>
                          <SelectItem value="short">Short term (3-6 months)</SelectItem>
                          <SelectItem value="medium">Medium term (6-12 months)</SelectItem>
                          <SelectItem value="long">Long term (12+ months)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="entMessage">Project Details</Label>
                    <Textarea
                      id="entMessage"
                      placeholder="Describe your project requirements, expected outcomes, and any specific needs..."
                      rows={4}
                    />
                  </div>

                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Send className="mr-2 h-4 w-4" />
                    Request Demo & Quote
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">contact@solarizeit@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-gray-600">
                      Fr.CRCE, Bandra West
                      <br />
                      Mumbai, Maharashtra 400001
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {[
                    { icon: Facebook, color: "text-blue-600", bg: "bg-blue-100" },
                    { icon: Twitter, color: "text-sky-600", bg: "bg-sky-100" },
                    { icon: Linkedin, color: "text-blue-700", bg: "bg-blue-100" },
                    { icon: Instagram, color: "text-pink-600", bg: "bg-pink-100" },
                  ].map((social, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="icon"
                      className={`${social.bg} ${social.color} border-0 hover:scale-110 transition-transform`}
                    >
                      <social.icon className="h-5 w-5" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

           
          </div>
        </div>
      </div>
    </div>
  )
}
