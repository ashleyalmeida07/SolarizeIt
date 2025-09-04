"use client"
import { GoogleGenerativeAI } from "@google/generative-ai"
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY!)

export async function fetchGeminiResponse(message: string): Promise<string> {
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-latest" })
  const result = await model.generateContent(message)
  const response = await result.response
  return response.text()
}

import { useState,useEffect,useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot, User } from "lucide-react"

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      message:
        "Hi! I'm your solar assistant. I can help you with questions about solar policies, subsidies, and installation processes. How can I help you today?",
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
}, [messages])

const [inputMessage, setInputMessage] = useState("")

const handleSendMessage = async () => {
  if (!inputMessage.trim()) return

  const newMessage = {
    id: messages.length + 1,
    type: "user",
    message: inputMessage,
  }

  setMessages([...messages, newMessage])
  setInputMessage("")

  const botReply = await fetchGeminiResponse(inputMessage)

  const botMessage = {
    id: messages.length + 2,
    type: "bot",
    message: botReply,
  }

  setMessages((prev) => [...prev, botMessage])
}

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-2xl z-50 border-0">
      <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Solar Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-emerald-700 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-80">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2 max-w-[80%] ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.type === "user" ? "bg-emerald-100" : "bg-gray-100"
                    }`}
                  >
                    {msg.type === "user" ? (
                      <User className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Bot className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      msg.type === "user" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            ))}
              <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-5 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about solar policies, costs..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} size="icon" className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
