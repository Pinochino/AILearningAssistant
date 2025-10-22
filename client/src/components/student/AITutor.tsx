import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Send, Brain, Sparkles, RefreshCw, Calculator, Lightbulb, FileText, Zap, Pencil, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { MessagesService } from '../../services/messages';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  subject?: string;
}

// Static AI features to display in sidebar
const aiFeatures = [
  {
    id: 'solve',
    title: 'Giải bài tập',
    description: 'AI hướng dẫn từng bước chi tiết',
    icon: Calculator,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'explain',
    title: 'Giải thích khái niệm',
    description: 'Giải thích lý thuyết dễ hiểu',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 'practice',
    title: 'Tạo bài tập',
    description: 'Sinh bài tập luyện theo yêu cầu',
    icon: FileText,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 'optimize',
    title: 'Tối ưu học tập',
    description: 'Gợi ý phương pháp học hiệu quả',
    icon: Zap,
    color: 'bg-purple-100 text-purple-600',
  },
];

function toText(val: any): string {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    try { return JSON.stringify(val, null, 2); } catch { }
  }
  return String(val);
}

export function AITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiConversations, setAiConversations] = useState<any[]>([]);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetConvId, setTargetConvId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const content = inputValue;
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      type: 'user',
      content,
      timestamp: new Date(),
      subject: selectedSubject !== 'all' ? selectedSubject : undefined,
    };

    setMessages(prev => [...prev, optimistic]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Ensure AI conversation exists
      let convId = conversationId;
      if (!convId) {
        const convRes: any = await MessagesService.getOrCreateAi();
        const convObj = convRes?.data || convRes;
        convId = convObj?.id || convObj?._id || convObj?.conversationId || convObj?.conversation?._id || null;
        if (!convId) throw new Error('Không lấy được AI conversation');
        setConversationId(convId);
      }

      // Persist user message
      await MessagesService.createMessage({ conversationId: convId, content, type: 'text' });

      // Ask AI and wait for response
      await MessagesService.sendToAi({ prompt: content, conversationId: convId });

      // Refresh messages from server for consistency
      const list: any = await MessagesService.getConversationMessages(convId, { page: 1, limit: 50 });
      const items = Array.isArray(list?.data) ? list.data : (Array.isArray(list?.items) ? list.items : []);
      const mapped: ChatMessage[] = (items || []).map((m: any) => ({
        id: m._id || m.id,
        type: (m.type === 'ai' || m.sender?.role === 'system' || m.sender?.isAI) ? 'ai' : 'user',
        content: toText(m.content ?? m.text),
        timestamp: new Date(m.createdAt || Date.now()),
      }));
      setMessages(mapped);
    } catch (e) {
      // Revert optimistic if failed
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion.text);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Initial load: ensure AI conversation and load messages
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Load all conversations and filter AI
        const convsRes: any = await MessagesService.getConversations();
        const allConvs = Array.isArray(convsRes?.data) ? convsRes.data : [];
        const aiConvs = allConvs.filter((c: any) => (c.conversationType === 'ai') || c.aiTutorId);
        if (mounted) setAiConversations(aiConvs);

        let currentId = conversationId;
        if (!currentId) {
          // Ensure at least one AI conversation exists
          if (aiConvs.length > 0) {
            currentId = aiConvs[0]._id || aiConvs[0].id;
          } else {
            const created: any = await MessagesService.getOrCreateAi();
            const convObj = created?.data || created;
            currentId = convObj?._id || convObj?.id || convObj?.conversationId || convObj?.conversation?._id || null;
            if (currentId) {
              if (mounted) setAiConversations([convObj]);
            }
          }
        }
        if (mounted) setConversationId(currentId);
        if (currentId) {
          const list: any = await MessagesService.getConversationMessages(currentId, { page: 1, limit: 50 });
          const items = Array.isArray(list?.data) ? list.data : (Array.isArray(list?.items) ? list.items : []);
          const mapped: ChatMessage[] = (items || []).map((m: any) => ({
            id: m._id || m.id,
            type: (m.type === 'ai' || m.sender?.role === 'system' || m.sender?.isAI) ? 'ai' : 'user',
            content: toText(m.content ?? m.text),
            timestamp: new Date(m.createdAt || Date.now()),
          }));
          if (mounted) setMessages(mapped.length ? mapped : [{ id: `greet-${Date.now()}`, type: 'ai', content: 'Xin chào! Tôi là AI Tutor của bạn. Hãy đặt câu hỏi để bắt đầu nhé.', timestamp: new Date() }]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRename = async () => {
    if (!targetConvId) return;
    await MessagesService.updateConversation(targetConvId, { name: renameValue.trim() });
    setAiConversations((prev) => prev.map((x: any) => (x._id || x.id) === targetConvId ? { ...x, name: renameValue.trim() } : x));
    setRenameOpen(false);
    toast.success('Đổi tên cuộc trò chuyện thành công!');
  };

  const handleDelete = async () => {
    if (!targetConvId) return;
    await MessagesService.deleteConversation(targetConvId);
    setAiConversations((prev) => prev.filter((x: any) => (x._id || x.id) !== targetConvId));
    if (conversationId === targetConvId) setConversationId(null);
    setDeleteOpen(false);
    toast.success('Xóa cuộc trò chuyện thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          Gia sư AI
          <Badge className="gap-1">
            <Sparkles className="h-3 w-3" />
            Beta
          </Badge>
        </h1>
        <p className="text-muted-foreground">
          Trợ lý AI thông minh hỗ trợ học tập 24/7
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">AI Tutor</CardTitle>
                    <CardDescription>Trợ lý học tập thông minh</CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả môn</SelectItem>
                      <SelectItem value="math">Toán học</SelectItem>
                      <SelectItem value="physics">Vật lý</SelectItem>
                      <SelectItem value="chemistry">Hóa học</SelectItem>
                      <SelectItem value="literature">Văn học</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!conversationId) return;
                      setLoading(true);
                      try {
                        const list: any = await MessagesService.getConversationMessages(conversationId, { page: 1, limit: 50 });
                        const items = Array.isArray(list?.data) ? list.data : (Array.isArray(list?.items) ? list.items : []);
                        const mapped: ChatMessage[] = (items || []).map((m: any) => ({
                          id: m._id || m.id,
                          type: (m.type === 'ai' || m.sender?.role === 'system' || m.sender?.isAI) ? 'ai' : 'user',
                          content: toText(m.content ?? m.text),
                          timestamp: new Date(m.createdAt || Date.now()),
                        }));
                        setMessages(mapped.length ? mapped : [{ id: `greet-${Date.now()}`, type: 'ai', content: 'Xin chào! Tôi là AI Tutor của bạn. Hãy đặt câu hỏi để bắt đầu nhé.', timestamp: new Date() }]);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Brain className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[80%] space-y-1`}>
                    <div
                      className={`p-3 rounded-lg ${message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                        }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatTimestamp(message.timestamp)}</span>
                      {message.subject && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {message.subject}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>

                  {message.type === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>HS</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Brain className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">AI đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Hỏi AI tutor bất cứ điều gì..."
                  onKeyPress={handleKeyPress}
                  disabled={isTyping || loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping || loading}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI conversations list */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Cuộc trò chuyện AI</CardTitle>
                <Button size="sm" onClick={async () => {
                  setLoading(true);
                  try {
                    const newId = `ai-${Date.now()}`;
                    const created: any = await MessagesService.getOrCreateAi(newId);
                    const convObj = created?.data || created;
                    const cid = convObj?._id || convObj?.id || convObj?.conversationId || convObj?.conversation?._id;
                    if (cid) {
                      setAiConversations((prev) => [convObj, ...prev]);
                      setConversationId(cid);
                      const list: any = await MessagesService.getConversationMessages(cid, { page: 1, limit: 50 });
                      const items = Array.isArray(list?.data) ? list.data : (Array.isArray(list?.items) ? list.items : []);
                      const mapped: ChatMessage[] = (items || []).map((m: any) => ({
                        id: m._id || m.id,
                        type: (m.type === 'ai' || m.sender?.role === 'system' || m.sender?.isAI) ? 'ai' : 'user',
                        content: toText(m.content ?? m.text),
                        timestamp: new Date(m.createdAt || Date.now()),
                      }));
                      setMessages(mapped.length ? mapped : [{ id: `greet-${Date.now()}`, type: 'ai', content: 'Xin chào! Tôi là AI Tutor của bạn. Hãy đặt câu hỏi để bắt đầu nhé.', timestamp: new Date() }]);
                    }
                  } finally {
                    setLoading(false);
                  }
                }}>Thêm cuộc trò chuyện mới</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {aiConversations.map((c: any) => {
                  const cid = c._id || c.id;
                  const title = c.name || c.aiTutorId || 'AI Tutor';
                  return (
                    <div key={cid} className={`p-3 border-b ${conversationId === cid ? 'bg-muted' : ''}`}>
                      <div className="flex items-center justify-between">
                        <button className="text-left flex-1 truncate" onClick={async () => {
                          setConversationId(cid);
                          setLoading(true);
                          try {
                            const list: any = await MessagesService.getConversationMessages(cid, { page: 1, limit: 50 });
                            const items = Array.isArray(list?.data) ? list.data : (Array.isArray(list?.items) ? list.items : []);
                            const mapped: ChatMessage[] = (items || []).map((m: any) => ({
                              id: m._id || m.id,
                              type: (m.type === 'ai' || m.sender?.role === 'system' || m.sender?.isAI) ? 'ai' : 'user',
                              content: toText(m.content ?? m.text),
                              timestamp: new Date(m.createdAt || Date.now()),
                            }));
                            setMessages(mapped.length ? mapped : [{ id: `greet-${Date.now()}`, type: 'ai', content: 'Xin chào! Tôi là AI Tutor của bạn. Hãy đặt câu hỏi để bắt đầu nhé.', timestamp: new Date() }]);
                          } finally {
                            setLoading(false);
                          }
                        }}>
                          <div className="font-medium text-sm truncate">{title}</div>
                        </button>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => {
                            setTargetConvId(cid);
                            setRenameValue(title);
                            setRenameOpen(true);
                          }}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => {
                            setTargetConvId(cid);
                            setDeleteOpen(true);
                          }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tính năng AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiFeatures.map((feature) => (
                <div key={feature.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50">
                  <div className={`p-2 rounded ${feature.color}`}>
                    <feature.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thống kê sử dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span>Câu hỏi hôm nay</span><span className="font-medium">—</span></div>
              <div className="flex justify-between text-sm"><span>Bài tập đã giải</span><span className="font-medium">—</span></div>
              <div className="flex justify-between text-sm"><span>Thời gian trò chuyện</span><span className="font-medium">—</span></div>
              <div className="flex justify-between text-sm"><span>Môn học yêu thích</span><span className="font-medium">—</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={renameValue} onChange={(e)=>setRenameValue(e.target.value)} placeholder="Nhập tên mới" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=> setRenameOpen(false)}>Hủy</Button>
              <Button onClick={handleRename}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa cuộc trò chuyện</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa cuộc trò chuyện này?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=> setDeleteOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}