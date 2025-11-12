// src/components/AITutor.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Send, Brain, Sparkles, RefreshCw, Calculator, Lightbulb, Zap, Pencil, Trash2, Plus } from 'lucide-react';
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

const GREETING: ChatMessage = {
  id: `greet-${Date.now()}`,
  type: 'ai',
  content: 'Xin chào! Tôi là AI Tutor của bạn. Hãy đặt câu hỏi để bắt đầu nhé.',
  timestamp: new Date(),
};

// Remove "practice" feature per request (Tạo bài tập)
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
    id: 'optimize',
    title: 'Tối ưu học tập',
    description: 'Gợi ý phương pháp học hiệu quả',
    icon: Zap,
    color: 'bg-purple-100 text-purple-600',
  },
];

const TEMPLATES: Record<string, string> = {
  solve: `Giải bài tập theo từng bước:
- Môn: 
- Cấp độ/khối lớp: 
- Đề bài gốc (nguyên văn):
- Yêu cầu trình bày: 
- Ràng buộc (nếu có): 
- Định dạng đầu ra: `,
  explain: `Giải thích khái niệm:
- Khái niệm/Thuật ngữ:
- Bối cảnh sử dụng:
- Mức độ chi tiết:
- Yêu cầu minh hoạ:
- Nếu có công thức: trình bày và giải thích các ký hiệu`,
  optimize: `Tối ưu kế hoạch học:
- Môn/Chủ đề:
- Mục tiêu:
- Thời gian sẵn có:
- Mức hiện tại:
- Phong cách học:`,
};

function toText(val: any): string {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    try { return JSON.stringify(val, null, 2); } catch { }
  }
  return String(val);
}

// Remove basic Markdown formatting to display clean text in chat
function stripMarkdown(md: string): string {
  if (!md) return '';
  return md
    // code blocks and inline code: drop backticks but keep code
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))
    .replace(/`([^`]+)`/g, '$1')
    // headings
    .replace(/^#{1,6}\s+/gm, '')
    // bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // blockquotes
    .replace(/^>\s?/gm, '')
    // images [alt](url) and links -> keep text
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1')
    // unordered lists -> bullet
    .replace(/^\s*[-*+]\s+/gm, '• ')
    // ordered lists keep number and dot
    .replace(/^\s*(\d+)\.\s+/gm, '$1. ')
    .trim();
}

export function AITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiConversations, setAiConversations] = useState<any[]>([]);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetConvId, setTargetConvId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef(new Map<string, HTMLDivElement | null>());
  const allowAutoScroll = useRef(false);
  const didInitialPosition = useRef(false);

  // Auto grow textarea
  const autoGrow = (el?: HTMLTextAreaElement | null) => {
    const node = el || textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    const max = 160; // px max-height (~10 lines)
    const newH = Math.min(node.scrollHeight, max);
    node.style.height = `${newH}px`;
    node.style.overflowY = node.scrollHeight > max ? 'auto' : 'hidden';
  };

  useEffect(() => { autoGrow(); }, [inputValue]);

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Initial load: conversations list & load current messages (but keep greeting if none)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const convsRes: any = await MessagesService.getConversations();
        const allConvs = Array.isArray(convsRes?.data) ? convsRes.data : (Array.isArray(convsRes) ? convsRes : []);
        const aiConvs = allConvs.filter((c: any) => (c.conversationType === 'ai') || c.aiTutorId);
        if (mounted) setAiConversations(aiConvs);

        // if there is an AI conv, pick the first but don't clobber greeting unless server has messages
        if (aiConvs.length > 0) {
          const firstId = aiConvs[0]._id || aiConvs[0].id;
          setConversationId(firstId);
          try {
            const list: any = await MessagesService.getConversationMessages(firstId, { page: 1, limit: 50 });
            const items = Array.isArray(list?.data) ? list.data : (Array.isArray(list?.items) ? list.items : []);
            const mapped: ChatMessage[] = (items || []).map((m: any) => ({
              id: m._id || m.id,
              type: (m.type === 'ai' || m.sender?.role === 'system' || m.sender?.isAI) ? 'ai' : 'user',
              content: toText(m.content ?? m.text),
              timestamp: new Date(m.createdAt || Date.now()),
            }));
            if (mounted && mapped.length) setMessages(mapped);
          } catch (e) {
            // ignore, keep greeting
          }
        } else {
          // ensure there's at least one server-side AI conversation available for create-on-send flows
          // we intentionally don't add it to the sidebar until user sends the first message
          try {
            const created: any = await MessagesService.getOrCreateAi();
            const convObj = created?.data || created;
            const currentId = convObj?._id || convObj?.id || convObj?.conversationId || convObj?.conversation?._id || null;
            if (mounted && currentId) {
              setConversationId(currentId);
              // do not add to aiConversations list yet (per requirement: only after first user message)
            }
          } catch (e) {
            // ignore
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const content = inputValue;
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = { id: tempId, type: 'user', content, timestamp: new Date() };

    setMessages(prev => [...prev, optimistic]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Ensure conversation exists (might have been created earlier but not in sidebar)
      let convId = conversationId;
      let convObj: any = null;
      if (!convId) {
        const convRes: any = await MessagesService.getOrCreateAi();
        convObj = convRes?.data || convRes;
        convId = convObj?.id || convObj?._id || convObj?.conversationId || convObj?.conversation?._id || null;
        if (!convId) throw new Error('Không lấy được AI conversation');
        setConversationId(convId);
        // DO NOT add to sidebar yet; we'll add after successful message persist below
      }

      // Persist user message
      await MessagesService.createMessage({ conversationId: convId, content, type: 'text' });

      // Send to AI
      await MessagesService.sendToAi({ prompt: content, conversationId: convId });

      // Refresh messages from server
      const list: any = await MessagesService.getConversationMessages(convId, { page: 1, limit: 50 });
      const items = Array.isArray(list?.data) ? list.data : (Array.isArray(list?.items) ? list.items : []);
      const mapped: ChatMessage[] = (items || []).map((m: any) => ({
        id: m._id || m.id,
        type: (m.type === 'ai' || m.sender?.role === 'system' || m.sender?.isAI) ? 'ai' : 'user',
        content: toText(m.content ?? m.text),
        timestamp: new Date(m.createdAt || Date.now()),
      }));
      setMessages(mapped);

      // AFTER we confirmed messages exist, ensure conversation appears in sidebar
      // If convObj not available (we didn't create it now) try to build a minimal convObj to add
      if (convObj) {
        const cid = convObj._id || convObj.id || convObj.conversationId || convObj.conversation?._id;
        if (cid && !aiConversations.some((c: any) => (c._id || c.id) === cid)) {
          setAiConversations(prev => [convObj, ...prev]);
        }
      } else {
        // maybe conversation existed earlier but wasn't in sidebar for some reason
        if (convId && !aiConversations.some((c: any) => (c._id || c.id) === convId)) {
          // try to fetch conv meta from server list
          try {
            const convsRes: any = await MessagesService.getConversations();
            const allConvs = Array.isArray(convsRes?.data) ? convsRes.data : (Array.isArray(convsRes) ? convsRes : []);
            const found = allConvs.find((c: any) => (c._id || c.id) === convId);
            if (found) setAiConversations(prev => [found, ...prev]);
          } catch (e) {
            // fallback: push a minimal placeholder
            setAiConversations(prev => [{ _id: convId, name: 'AI Tutor' }, ...prev]);
          }
        }
      }
    } catch (e) {
      // revert optimistic
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error('Gửi tin nhắn thất bại.');
    } finally {
      setIsTyping(false);
    }
  };

  // When clicking AI feature: prefill template and focus + autoGrow
  const handleFeatureClick = (featureId: string) => {
    const tpl = TEMPLATES[featureId] || '';
    // place caret at end so user can edit
    setInputValue(tpl);
    setTimeout(() => {
      textareaRef.current?.focus();
      autoGrow();
      // move caret to end
      if (textareaRef.current) {
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 0);
  };

  // Sidebar: create new conv but do NOT add to sidebar until first message (per requirement)
  const handleCreateNewConversation = async () => {
    setLoading(true);
    try {
      const newIdMarker = `ai-${Date.now()}`;
      const created: any = await MessagesService.getOrCreateAi(newIdMarker);
      const convObj = created?.data || created;
      const cid = convObj?._id || convObj?.id || convObj?.conversationId || convObj?.conversation?._id;
      if (cid) {
        setConversationId(cid);
        // do not add to aiConversations here — will be added after first user message
        // but we can load its messages (likely none) and show greeting
        setMessages([GREETING]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Derived simple usage stats from client-side messages (if you want real server stats, need backend endpoint)
  const stats = (() => {
    const now = new Date();
    const isSameDay = (d: Date) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    const questionsToday = messages.filter(m => m.type === 'user' && isSameDay(m.timestamp)).length;
    const solvedExercises = messages.filter(m => m.type === 'ai' && /giải bài|bài tập|đáp án/i.test(m.content)).length;
    const approxMinutes = Math.max(0, Math.floor(messages.length * 0.5)); // heuristic: 30s per message -> minutes
    // favourite topic naive: find most used keyword from messages (simple heuristic)
    const subjectGuess = (() => {
      const bucket: Record<string, number> = {};
      messages.forEach(m => {
        const txt = m.content.toLowerCase();
        ['toán', 'vật lý', 'hóa', 'văn', 'tin', 'anh'].forEach(k => { if (txt.includes(k)) bucket[k] = (bucket[k] || 0) + 1; });
      });
      const sorted = Object.entries(bucket).sort((a, b) => b[1] - a[1]);
      return sorted[0]?.[0] || '—';
    })();
    return { questionsToday, solvedExercises, approxMinutes, subjectGuess };
  })();

  return (
    <div className="min-h-screen flex">

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-0">
        {/* Chat Interface - centered */}
        <div className="lg:col-span-3 flex flex-col justify-start h-full min-h-0 overflow-hidden">
          <Card className="w-full max-w-4xl flex flex-col min-h-0 max-h-[90vh]">
            {/* Messages inside scrollable area (inside chat box) */}
            <CardContent ref={messagesContainerRef} className="overflow-y-auto min-h-0 p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  ref={(el) => { messageRefs.current.set(message.id, el); }}
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
                      className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                    >
                      <p className="whitespace-pre-wrap">{message.type === 'ai' ? stripMarkdown(message.content) : message.content}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatTimestamp(message.timestamp)}</span>
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

            {/* Prompt inside chat box at the bottom */}
            <div className="border-t p-1">
              <div className="mx-auto w-full">
                <div className="bg-background p-3">
                  <div className="flex gap-2 items-end">
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Hỏi AI tutor bất cứ điều gì..."
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      className="w-full resize-none rounded-md border p-2 text-sm focus:outline-none focus:ring"
                      style={{ minHeight: 38, maxHeight: 140 }}
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
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - scrollable only */}
        <div className="lg:col-span-1 space-y-4 h-screen overflow-y-auto">
          {/* AI conversations list */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Cuộc trò chuyện AI</CardTitle>
                <Button size="icon" onClick={handleCreateNewConversation}>
                  <Plus className="h-4 w-4" />
                </Button>
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
                            setMessages(mapped.length ? mapped : [GREETING]);
                          } finally {
                            setLoading(false);
                          }
                        }}>
                          <div className="font-medium text-sm truncate">{title}</div>
                        </button>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => { setTargetConvId(cid); setRenameValue(title); setRenameOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => { setTargetConvId(cid); setDeleteOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {aiConversations.length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground">Chưa có cuộc trò chuyện. Nhấn + để tạo (sẽ xuất hiện trong danh sách sau khi gửi tin nhắn đầu tiên).</div>
                )}
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
                <button key={feature.id} onClick={() => handleFeatureClick(feature.id)} className="w-full text-left">
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50">
                    <div className={`p-2 rounded ${feature.color}`}>
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Usage Stats (client-derived) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thống kê sử dụng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm"><span>Câu hỏi hôm nay</span><span className="font-medium">{stats.questionsToday}</span></div>
              <div className="flex justify-between text-sm"><span>Bài tập đã giải (approx.)</span><span className="font-medium">{stats.solvedExercises}</span></div>
              <div className="flex justify-between text-sm"><span>Thời gian trò chuyện (ước)</span><span className="font-medium">{stats.approxMinutes} phút</span></div>
              <div className="flex justify-between text-sm"><span>Môn hay dùng</span><span className="font-medium">{stats.subjectGuess}</span></div>
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
            <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} placeholder="Nhập tên mới" className="w-full rounded border p-2" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameOpen(false)}>Hủy</Button>
              <Button onClick={async () => {
                if (!targetConvId) return;
                await MessagesService.updateConversation(targetConvId, { name: renameValue.trim() });
                setAiConversations((prev) => prev.map((x: any) => (x._id || x.id) === targetConvId ? { ...x, name: renameValue.trim() } : x));
                setRenameOpen(false);
                toast.success('Đổi tên cuộc trò chuyện thành công!');
              }}>Lưu</Button>
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
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={async () => {
              if (!targetConvId) return;
              await MessagesService.deleteConversation(targetConvId);
              setAiConversations((prev) => prev.filter((x: any) => (x._id || x.id) !== targetConvId));
              if (conversationId === targetConvId) setConversationId(null);
              setDeleteOpen(false);
              toast.success('Xóa cuộc trò chuyện thành công!');
            }}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}