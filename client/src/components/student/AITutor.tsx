import { React, useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import {
  Send,
  Brain,
  Sparkles,
  BookOpen,
  MessageSquare,
  RefreshCw,
  Lightbulb,
  Calculator,
  FileText,
  Zap
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { GoogleGenAI, GoogleGenAi } from '@google/genai'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY

console.log(GEMINI_API_KEY)

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  subject?: string
}

const mockChatHistory: ChatMessage[] = [
  {
    id: '1',
    type: 'ai',
    content:
      'Xin chào! Tôi là AI Tutor của bạn. Tôi có thể giúp bạn giải đáp thắc mắc về các môn học, giải bài tập, và hướng dẫn học tập. Bạn muốn học gì hôm nay?',
    timestamp: new Date('2024-09-18T09:00:00')
  },
  {
    id: '2',
    type: 'user',
    content: 'Giúp tôi giải phương trình bậc hai: x² - 5x + 6 = 0',
    timestamp: new Date('2024-09-18T09:01:00'),
    subject: 'Toán học'
  },
  {
    id: '3',
    type: 'ai',
    content:
      'Tôi sẽ giúp bạn giải phương trình bậc hai x² - 5x + 6 = 0.\n\n**Cách 1: Phân tích thành nhân tử**\nx² - 5x + 6 = 0\nTìm hai số có tích = 6 và tổng = 5: là 2 và 3\n(x - 2)(x - 3) = 0\n\nVậy x = 2 hoặc x = 3\n\n**Cách 2: Công thức nghiệm**\nVới a = 1, b = -5, c = 6\nΔ = b² - 4ac = 25 - 24 = 1\nx = (5 ± 1)/2\nVậy x₁ = 3, x₂ = 2\n\n**Kết luận:** Phương trình có hai nghiệm x = 2 và x = 3.',
    timestamp: new Date('2024-09-18T09:01:30'),
    subject: 'Toán học'
  }
]

const mockSuggestions = [
  {
    id: '1',
    text: 'Giải thích định luật Newton thứ 2',
    subject: 'Vật lý',
    icon: '⚡'
  },
  {
    id: '2',
    text: 'Hướng dẫn viết phương trình hóa học',
    subject: 'Hóa học',
    icon: '🧪'
  },
  {
    id: '3',
    text: 'Phân tích tác phẩm "Chí Phèo"',
    subject: 'Văn học',
    icon: '📚'
  },
  {
    id: '4',
    text: 'Giải bài tập về hàm số',
    subject: 'Toán học',
    icon: '📊'
  }
]

const mockAIFeatures = [
  {
    id: '1',
    title: 'Giải bài tập',
    description: 'AI sẽ hướng dẫn giải từng bước chi tiết',
    icon: Calculator,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: '2',
    title: 'Giải thích khái niệm',
    description: 'Giải thích lý thuyết một cách dễ hiểu',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: '3',
    title: 'Tạo bài tập',
    description: 'Tạo bài tập luyện tập theo yêu cầu',
    icon: FileText,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: '4',
    title: 'Tối ưu học tập',
    description: 'Gợi ý phương pháp học hiệu quả',
    icon: Zap,
    color: 'bg-purple-100 text-purple-600'
  }
]

export function AITutor() {
  const [messages, setMessages] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      subject: selectedSubject !== 'all' ? selectedSubject : undefined
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content:
          'Tôi đang xử lý câu hỏi của bạn. Đây là một câu trả lời mẫu từ AI tutor. Trong thực tế, câu trả lời sẽ được tạo bởi mô hình AI dựa trên nội dung câu hỏi của bạn.',
        timestamp: new Date(),
        subject: selectedSubject !== 'all' ? selectedSubject : undefined
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 2000)
  }

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion.text)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

  const sendMessageToGemini = async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: inputValue,
    });
    setMessages(response.text)
    setInputValue('')
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1 className='flex items-center gap-3'>
          <Brain className='h-8 w-8 text-primary' />
          Gia sư AI
          <Badge className='gap-1'>
            <Sparkles className='h-3 w-3' />
            Beta
          </Badge>
        </h1>
        <p className='text-muted-foreground'>Trợ lý AI thông minh hỗ trợ học tập 24/7</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Chat Interface */}
        <div className='lg:col-span-3'>
          <Card className='h-[600px] flex flex-col'>
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarFallback className='bg-primary text-primary-foreground'>
                      <Brain className='h-4 w-4' />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className='text-lg'>AI Tutor</CardTitle>
                    <CardDescription>Trợ lý học tập thông minh</CardDescription>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className='w-40'>
                      <SelectValue placeholder='Môn học' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Tất cả môn</SelectItem>
                      <SelectItem value='math'>Toán học</SelectItem>
                      <SelectItem value='physics'>Vật lý</SelectItem>
                      <SelectItem value='chemistry'>Hóa học</SelectItem>
                      <SelectItem value='literature'>Văn học</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant='outline' size='sm'>
                    <RefreshCw className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className='flex-1 overflow-y-auto p-4 space-y-4'>
              {/* {Array.from(messages || []).map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <Avatar className='h-8 w-8 mt-1'>
                      <AvatarFallback className='bg-primary text-primary-foreground'>
                        <Brain className='h-4 w-4' />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[80%] space-y-1`}>
                    <div
                      className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                    >
                      <p className='whitespace-pre-wrap'>{message.content}</p>
                    </div>

                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {message.subject && (
                        <>
                          <span>•</span>
                          <Badge variant='outline' className='text-xs'>
                            {message.subject}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <Avatar className='h-8 w-8 mt-1'>
                      <AvatarFallback>HS</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))} */}
              <p>{messages}</p>

              {isTyping && (
                <div className='flex gap-3 justify-start'>
                  <Avatar className='h-8 w-8 mt-1'>
                    <AvatarFallback className='bg-primary text-primary-foreground'>
                      <Brain className='h-4 w-4' />
                    </AvatarFallback>
                  </Avatar>
                  <div className='bg-muted p-3 rounded-lg'>
                    <div className='flex items-center gap-1'>
                      <div className='flex space-x-1'>
                        <div className='w-2 h-2 bg-primary rounded-full animate-bounce'></div>
                        <div
                          className='w-2 h-2 bg-primary rounded-full animate-bounce'
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className='w-2 h-2 bg-primary rounded-full animate-bounce'
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                      <span className='text-sm text-muted-foreground ml-2'>AI đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className='p-4 border-t'>
              <div className='flex gap-2'>
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder='Hỏi AI tutor bất cứ điều gì...'
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                />
                <Button onClick={sendMessageToGemini} disabled={!inputValue.trim() || isTyping} className='gap-2'>
                  <Send className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Tính năng AI</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {mockAIFeatures.map((feature) => (
                <div key={feature.id} className='flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50'>
                  <div className={`p-2 rounded ${feature.color}`}>
                    <feature.icon className='h-4 w-4' />
                  </div>
                  <div>
                    <h4 className='font-medium text-sm'>{feature.title}</h4>
                    <p className='text-xs text-muted-foreground'>{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Gợi ý câu hỏi</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {mockSuggestions.map((suggestion) => (
                <Button
                  key={suggestion.id}
                  variant='outline'
                  size='sm'
                  className='w-full justify-start text-left h-auto p-3'
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className='flex items-start gap-2'>
                    <span className='text-lg'>{suggestion.icon}</span>
                    <div>
                      <p className='text-sm font-medium'>{suggestion.text}</p>
                      <Badge variant='secondary' className='text-xs mt-1'>
                        {suggestion.subject}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Thống kê sử dụng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span>Câu hỏi hôm nay</span>
                <span className='font-medium'>12</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Bài tập đã giải</span>
                <span className='font-medium'>45</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Thời gian trò chuyện</span>
                <span className='font-medium'>2.5h</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span>Môn học yêu thích</span>
                <span className='font-medium'>Toán học</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
