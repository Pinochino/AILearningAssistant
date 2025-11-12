import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Search,
  Send,
  MessageSquare,
  Users,
  Bell,
  Clock,
  Check,
  CheckCheck,
  Reply,
  MoreVertical,
  Filter,
  Archive,
  Trash2,
  Star,
  StarOff
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MessagesService } from '../../services/messages';
import { NotificationsService } from '../../services/notifications';
import { UsersService } from '../../services/users';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { getSocket, ensureSocketConnected } from '../../lib/socket';

export function Messages() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const meId = (user as any)?.id || (user as any)?._id;
  const meEmail = String((user as any)?.email || '').toLowerCase();

  // ngay dưới các dùng hook auth
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div>Đang tải tin nhắn...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div>Vui lòng đăng nhập để xem tin nhắn</div>
      </div>
    );
  }
  // 🔌 Đảm bảo socket connect ngay khi vào màn Tin nhắn
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const socket = await ensureSocketConnected();
        if (!mounted) return;
        console.log('[Messages] socket connected:', socket?.id, socket?.connected);
      } catch (err) {
        console.warn('[Messages] ensureSocketConnected failed:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toText = (v: any) => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      // common API shapes
      if (typeof v.text === 'string') return v.text;
      if (typeof v.content === 'string') return v.content;
      return JSON.stringify(v);
    }
    return String(v);
  };
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // 1-1 compose
  const [isDirectOpen, setIsDirectOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userBase, setUserBase] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState(null as any);
  // group compose
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupQuery, setGroupQuery] = useState('');
  const [groupBase, setGroupBase] = useState<any[]>([]);
  const [groupResults, setGroupResults] = useState<any[]>([]);
  const [groupSelected, setGroupSelected] = useState<any[]>([]);
  // conversation actions (rename/delete)
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const prevConvRef = useRef<string>('');

  const getConversationName = (conv: any) => {
    const existing = conv?.name || conv?.title;
    if (existing) return existing;
    const isGroup = !!(conv?.isGroup || conv?.conversationType === 'group');
    if (isGroup) return existing || '';
    // derive recipient name for direct
    const parts = conv?.participants || [];
    const others = parts.filter((p: any) => String(p?._id || p?.id) !== String(meId));
    const rec = others[0];
    const nm = rec ? `${rec.firstName || rec.name || ''} ${rec.lastName || ''}`.trim() : '';
    return nm || existing || 'Cuộc trò chuyện';
  };

  // Load conversations (wait for auth ready)
  useEffect(() => {
    if (isAuthLoading) return;
    let mounted = true;
    (async () => {
      try {
        // Ensure socket handshake is authenticated before first data fetch
        try { await ensureSocketConnected(); } catch { }
        const res = await MessagesService.getConversations() as any;
        const listRaw = Array.isArray(res?.data) ? res.data : [];
        // Exclude AI Tutor conversations
        const list = (listRaw || []).filter((c: any) => c.conversationType !== 'ai' && !c.aiTutorId)
          .map((c: any) => ({ ...c, name: getConversationName(c) }));
        if (!mounted) return;
        setConversations(list);
        // Prefer opening a conversation that has no unread messages
        const firstRead = list.find((c: any) => Number(c.unreadCount || 0) === 0);
        if (firstRead) setSelectedConversation(firstRead._id || firstRead.id);
      } catch (e) {
        setConversations([]);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthLoading]);

  // preload users when direct dialog opens
  useEffect(() => {
    let active = true;
    (async () => {
      if (!isDirectOpen || isAuthLoading) return;
      try {
        const res = await UsersService.search({ limit: 50 }) as any;
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        const filteredOutMe = (list || []).filter((u: any) => {
          const uid = String(u._id || u.id || '');
          const role = String(u.role || '').toLowerCase();
          const roles = Array.isArray(u.roles) ? u.roles.map((x: any) => String(x).toLowerCase()) : [];
          const isAdmin = role.includes('admin') || roles.some((r: string) => r.includes('admin'));
          return uid !== String(meId) && !isAdmin;
        });
        if (active) { setUserBase(filteredOutMe); setUserResults(filteredOutMe); if (filteredOutMe.length > 0) setSelectedUser(filteredOutMe[0]); }
      } catch { if (active) { setUserBase([]); setUserResults([]); } }
    })();
    return () => { active = false; };
  }, [isDirectOpen, isAuthLoading, meId]);

  // client-side filter for direct
  useEffect(() => {
    const q = userQuery.toLowerCase();
    const filtered = (userBase as any[]).filter((u: any) => {
      const id = String(u._id || u.id || '').toLowerCase();
      const uname = String(u.username || '').toLowerCase();
      const name = String(u.name || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
      if (String(u._id || u.id) === String(meId)) return false;
      return !q || id.includes(q) || uname.includes(q) || name.includes(q);
    });
    setUserResults(filtered as any);
    if (!selectedUser && filtered.length > 0) setSelectedUser(filtered[0] as any);
  }, [userQuery, userBase]);

  // preload users when group dialog opens
  useEffect(() => {
    let active = true;
    (async () => {
      if (!isGroupOpen || isAuthLoading) return;
      try {
        const res = await UsersService.search({ limit: 50 }) as any;
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        const filteredOutMe = (list || []).filter((u: any) => {
          const uid = String(u._id || u.id || '');
          const role = String(u.role || '').toLowerCase();
          const roles = Array.isArray(u.roles) ? u.roles.map((x: any) => String(x).toLowerCase()) : [];
          const isAdmin = role.includes('admin') || roles.some((r: string) => r.includes('admin'));
          return uid !== String(meId) && !isAdmin;
        });
        if (active) { setGroupBase(filteredOutMe); setGroupResults(filteredOutMe); }
      } catch { if (active) { setGroupBase([]); setGroupResults([]); } }
    })();
    return () => { active = false; };
  }, [isGroupOpen, isAuthLoading, meId]);

  // client-side filter for group
  useEffect(() => {
    const q = groupQuery.toLowerCase();
    const filtered = (groupBase as any[]).filter((u: any) => {
      const id = String(u._id || u.id || '').toLowerCase();
      const uname = String(u.username || '').toLowerCase();
      const name = String(u.name || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
      if (String(u._id || u.id) === String(meId)) return false;
      return !q || id.includes(q) || uname.includes(q) || name.includes(q);
    });
    setGroupResults(filtered as any);
  }, [groupQuery, groupBase, meId]);

  // Load messages for selected conversation
  useEffect(() => {
    if (isAuthLoading || !selectedConversation) return;

    setMessages([]);

    (async () => {
      try {
        await ensureSocketConnected(); // <--- CHỜ SOCKET LOGIN XONG
        const socket = await ensureSocketConnected(); // use non-null Socket
        const prev = prevConvRef.current;
        if (prev && prev !== selectedConversation) {
          socket.emit('leave_conversation', { conversationId: prev });
        }
        // Join and wait for ack (or fallback timeout) to avoid races on first load
        const joined = new Promise<void>((resolve) => {
          const onJoined = (evt: any) => {
            if (String(evt?.conversationId) === String(selectedConversation)) {
              socket.off('joined_conversation', onJoined);
              resolve();
            }
          };
          socket.on('joined_conversation', onJoined);
          socket.emit('join_conversation', { conversationId: selectedConversation });
          setTimeout(() => {
            socket.off('joined_conversation', onJoined);
            resolve();
          }, 400);
        });
        prevConvRef.current = selectedConversation;
        await joined;
      } catch (err) {
        console.error("Socket join error:", err);
      }
    })();

    let canceled = false;
    const currentConv = selectedConversation;

    (async () => {
      setLoading(true);
      try {
        const res = await MessagesService.getConversationMessages(currentConv, { page: 1, limit: 50 }) as any;
        const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        const meIdLocal = meId;
        const list = raw.map((m: any) => {
          const senderId = m?.sender?._id || m?.sender?.id || m?.senderId;
          const isOwn = m?.isOwn !== undefined ? m.isOwn : (meIdLocal && senderId ? String(senderId) === String(meIdLocal) : false);
          const readBy = Array.isArray(m?.readBy) ? m.readBy : [];
          const hasMeRead = readBy.some((r: any) => String((r?.user || r)) === String(meIdLocal));
          const someoneElseRead = readBy.some((r: any) => String((r?.user || r)) !== String(meIdLocal));
          const isRead = isOwn ? !!someoneElseRead : undefined;
          return {
            ...m,
            isOwn,
            isRead,
            hasMeRead,
            senderName: m?.sender?.name || m?.senderName || m?.sender?.email || 'Người dùng',
            content: toText(m?.content ?? m?.text),
          };
        });
        if (!canceled && currentConv === selectedConversation) setMessages(list);
      } catch {
        if (!canceled) setMessages([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    // mark as read on open (fire-and-forget) and update local state
    (async () => {
      try {
        await MessagesService.markConversationAsRead(String(currentConv));
        setMessages((prev: any[]) => prev.map(m => (!m.isOwn ? { ...m, hasMeRead: true } : m)));
        try {
          window.dispatchEvent(new CustomEvent('conversation_read', { detail: { conversationId: String(currentConv) } }));
        } catch { }
      } catch { }
    })();

    return () => { canceled = true; };
  }, [selectedConversation, meId, isAuthLoading]);


  // socket realtime: listen to new_message
  useEffect(() => {
    let activeSocket: any = null;
    let cancelled = false;

    // handler uses latest closures (meId, selectedConversation come from deps)
    const handler = (evt: any) => {
      const cid = String(evt?.conversationId || evt?.conversation || '');
      if (!cid) return;
      const incomingId = String(evt?.id || evt?._id || '');
      const senderId = String(evt?.senderId || evt?.sender || '');
      const isOwn = String(meId) === senderId;
      const content = toText(evt?.content ?? evt?.text);
      const createdAt = evt?.createdAt || new Date().toISOString();
      const clientId = evt?.clientId as string | undefined;

      // update conversation preview list
      setConversations((prev: any[]) => {
        const list = [...prev];
        const idx = list.findIndex((c) => String(c._id || c.id) === cid);
        // existing logic unchanged...
        // (you can keep the existing body inside setConversations as-is)
        return list;
      });

      // update messages if this conversation is currently selected
      setMessages((prev: any[]) => {
        if (String(selectedConversation) !== cid) return prev;
        // Ignore if already have this server message id
        if (incomingId && prev.some((m: any) => String(m.id || m._id) === String(incomingId))) {
          return prev;
        }
        // If this is my own message and matches an optimistic clientId, replace it
        if (clientId && isOwn) {
          const idx = prev.findIndex((m: any) => m.clientId && String(m.clientId) === String(clientId));
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = {
              ...(next[idx] as any),
              _id: incomingId,
              id: incomingId,
              conversationId: cid,
              senderId,
              isOwn,
              content,
              createdAt,
              clientId,
              senderName: evt?.senderName || '',
            };
            return next;
          }
        }
        // Otherwise append as new message
        const item = {
          _id: incomingId,
          id: incomingId,
          conversationId: cid,
          senderId,
          isOwn,
          content,
          createdAt,
          clientId,
          senderName: evt?.senderName || '',
        };
        return [...prev, item];
      });
    };

    (async () => {
      // wait for auth/token => socket ready
      try {
        await ensureSocketConnected();
      } catch (err) {
        // if ensure times out, still try to get socket instance and attach - graceful fallback
        console.warn("ensureSocketConnected failed or timed out:", err);
      }

      if (cancelled) return;
      try {
        activeSocket = getSocket();
        if (activeSocket) {
          activeSocket.on('new_message', handler);
        }
      } catch (err) {
        console.warn("Failed to attach socket handler:", err);
      }
    })();

    return () => {
      cancelled = true;
      try {
        if (activeSocket) activeSocket.off('new_message', handler);
      } catch { }
    };
  }, [selectedConversation, meId, /* keep other deps the same as original */]);


  // Load announcements (notifications)
  useEffect(() => {
    if (isAuthLoading) return;
    let mounted = true;
    (async () => {
      try {
        const res = await NotificationsService.getAll() as any;
        if (!mounted) return;
        setAnnouncements(Array.isArray(res?.data) ? res.data : (res?.data?.items || []));
      } catch (e) {
        if (!mounted) return;
        setAnnouncements([]);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthLoading]);

  const currentConversation = useMemo(() =>
    conversations.find((c) => (c._id || c.id) === selectedConversation),
    [conversations, selectedConversation]
  );

  const currentMessages = messages;

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = {
      _id: `temp-${Date.now()}`,
      id: `temp-${Date.now()}`,
      conversation: selectedConversation,
      sender: { _id: meId },
      senderId: meId,
      isOwn: true,
      content: newMessage,
      createdAt: new Date().toISOString(),
      clientId,
    } as any;
    // optimistic append for immediate right align
    setMessages((prev) => [...prev, optimistic]);
    // update preview immediately
    setConversations((prev: any[]) => {
      const list = [...prev];
      const idx = list.findIndex((c) => String(c._id || c.id) === String(selectedConversation));
      if (idx >= 0) {
        const item = { ...list[idx], lastMessage: newMessage, updatedAt: new Date().toISOString() };
        list.splice(idx, 1);
        return [item, ...list];
      }
      return prev;
    });
    const convAtSend = selectedConversation;
    const text = newMessage;
    setNewMessage('');
    try {
      const sock = await ensureSocketConnected();
      sock.emit('send_message', { conversationId: convAtSend, content: text, clientId });
    } catch (err) {
      console.warn("Socket send failed, falling back to REST:", err);
      await MessagesService.createMessage({ conversationId: convAtSend, content: text });
      const res = await MessagesService.getConversationMessages(convAtSend, { page: 1, limit: 50 }) as any;
      if (convAtSend !== selectedConversation) return;
      const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
      const meIdLocal = meId;
      const list = raw.map((m: any) => {
        const senderId = m?.sender?._id || m?.sender?.id || m?.senderId;
        const isOwn = m?.isOwn !== undefined ? m.isOwn : (meIdLocal && senderId ? String(senderId) === String(meIdLocal) : false);
        return { ...m, isOwn, senderName: m?.sender?.name || m?.senderName || m?.sender?.email || 'Người dùng', content: toText(m?.content ?? m?.text) };
      });
      setMessages(list);
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return 'Không xác định';
    }
  };

  const filteredConversations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return conversations.filter((conv) => {
      const name = (conv.name || conv.title || '').toLowerCase();
      const subject = (conv.subject || '').toLowerCase();
      return name.includes(term) || subject.includes(term);
    });
  }, [conversations, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tin nhắn</h1>
          <p className="text-muted-foreground">Liên lạc với giáo viên và bạn bè</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDirectOpen} onOpenChange={setIsDirectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" /> Nhắn 1-1
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Bắt đầu trò chuyện 1-1</DialogTitle>
                <DialogDescription>Chọn 1 người để bắt đầu/tiếp tục trò chuyện</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Label>Tìm người nhận</Label>
                <Input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Tên đăng nhập / Tên" />
                <div className="max-h-64 overflow-y-auto border rounded">
                  {userResults.map((u: any) => (
                    <div key={u._id || u.id} className={`p-2 cursor-pointer hover:bg-muted ${selectedUser && (selectedUser._id || selectedUser.id) === (u._id || u.id) ? 'bg-muted' : ''}`} onClick={() => setSelectedUser(u)}>
                      <div className="text-sm font-medium">{u.name || `${u.firstName || ''} ${u.lastName || ''}`}</div>
                      <div className="text-xs text-muted-foreground">@{u.username || ''}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDirectOpen(false)}>Hủy</Button>
                  <Button disabled={!selectedUser} onClick={async () => {
                    if (!selectedUser) return;
                    const userId = selectedUser._id || selectedUser.id;
                    const conv: any = await MessagesService.getOrCreateDirect(String(userId));
                    const conversation = conv?.data || conv;
                    // Ensure 1-1 conversation shows recipient name
                    const recipientName = `${selectedUser.firstName || selectedUser.name || ''} ${selectedUser.lastName || ''}`.trim();
                    if (recipientName) conversation.name = recipientName;
                    const cid = conversation?._id || conversation?.id;
                    if (cid) {
                      setConversations((prev: any[]) => {
                        const exists = prev.find((c) => (c._id || c.id) === cid);
                        if (exists) return prev;
                        return [conversation, ...prev];
                      });
                      setSelectedConversation(cid);
                      setIsDirectOpen(false);
                    }
                  }}>Bắt đầu</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isGroupOpen} onOpenChange={setIsGroupOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" /> Tạo nhóm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo cuộc trò chuyện nhóm</DialogTitle>
                <DialogDescription>Chọn nhiều người và đặt tên nhóm</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Label>Tên nhóm</Label>
                <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="VD: Nhóm ôn thi" />
                <Label>Thêm thành viên</Label>
                <Input value={groupQuery} onChange={(e) => setGroupQuery(e.target.value)} placeholder="Tên đăng nhập / Tên" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded max-h-64 overflow-y-auto">
                    {groupResults.map((u: any) => (
                      <div key={u._id || u.id} className="p-2 cursor-pointer hover:bg-muted" onClick={() => {
                        const id = u._id || u.id;
                        setGroupSelected((prev) => prev.find((x: any) => (x._id || x.id) === id) ? prev : [...prev, u]);
                      }}>
                        <div className="text-sm font-medium">{u.name || `${u.firstName || ''} ${u.lastName || ''}`}</div>
                        <div className="text-xs text-muted-foreground">@{u.username || ''}</div>
                      </div>
                    ))}
                  </div>
                  <div className="border rounded max-h-64 overflow-y-auto">
                    {groupSelected.map((u: any) => (
                      <div key={u._id || u.id} className="p-2 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{u.name || `${u.firstName || ''} ${u.lastName || ''}`}</div>
                          <div className="text-xs text-muted-foreground">@{u.username || ''}</div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setGroupSelected((prev) => prev.filter((x: any) => (x._id || x.id) !== (u._id || u.id)))}>Gỡ</Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsGroupOpen(false)}>Hủy</Button>
                  <Button disabled={!groupName.trim() || groupSelected.length === 0} onClick={async () => {
                    const participants = groupSelected.map((u: any) => String(u._id || u.id));
                    const created: any = await MessagesService.createConversation({ participants, name: groupName, isGroup: true, conversationType: 'group' });
                    const conv = created?.data || created;
                    const cid = conv?._id || conv?.id;
                    if (cid) {
                      setConversations((prev: any[]) => [conv, ...prev]);
                      setSelectedConversation(cid);
                      setIsGroupOpen(false);
                      setGroupSelected([]); setGroupResults([]); setGroupName(''); setGroupQuery('');
                    }
                  }}>Tạo nhóm</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List (narrow) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Cuộc trò chuyện</CardTitle>
              <Badge variant="secondary">{conversations.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation._id || conversation.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 border-b ${selectedConversation === (conversation._id || conversation.id) ? 'bg-muted' : ''
                    }`}
                  onClick={() => {
                    setSelectedConversation(conversation._id || conversation.id);
                    // clear unread visually
                    setConversations((prev) => prev.map((c) => ((c._id || c.id) === (conversation._id || conversation.id) ? { ...c, unreadCount: 0 } : c)));
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {toText(conversation.name || 'C').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`truncate ${conversation.unreadCount > 0 && selectedConversation !== (conversation._id || conversation.id) ? 'font-semibold' : 'font-medium'}`}>
                          {toText(getConversationName(conversation))}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {conversation.updatedAt && new Date(conversation.updatedAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          {conversation.unreadCount > 0 && selectedConversation !== (conversation._id || conversation.id) && (
                            <span className="ml-1 inline-block h-2 w-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                      </div>
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 && selectedConversation !== (conversation._id || conversation.id) ? 'font-semibold' : 'text-muted-foreground'}`}>
                        {toText(conversation.lastMessage)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {toText(conversation.subject)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Messages Area (wide) */}
        <Card className="lg:col-span-2">
          {currentConversation ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {(currentConversation.name || 'C').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{getConversationName(currentConversation)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {currentConversation.subject || ''}
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const isGroup = !!(currentConversation?.isGroup || currentConversation?.conversationType === 'group');
                    if (!isGroup) {
                      return (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      );
                    }
                    return (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setNewName(String(currentConversation?.name || '')); setRenameOpen(true); }}>
                            <Reply className="mr-2 h-4 w-4" />
                            Đổi tên
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa cuộc trò chuyện
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  })()}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {currentMessages.map((message: any) => {
                    const isGroup = !!(currentConversation?.isGroup || currentConversation?.conversationType === 'group');
                    const initials = toText((message.sender?.name || message.senderName || message.sender?.email || 'U')).split(' ').map((n: string) => n[0]).join('').toUpperCase();
                    return (
                      <div
                        key={message._id || message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} items-start gap-2`}
                      >
                        {!message.isOwn && isGroup && (
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${message.isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                            }`}
                        >
                          {(() => {
                            const showHeader = isGroup && !message.isOwn; return showHeader ? (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs opacity-80">{toText(message.sender?.name || message.senderName || message.sender?.email || 'Người dùng')}</span>
                                <span className="text-[10px] opacity-60">
                                  {new Date(message.createdAt || message.timestamp || Date.now()).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            ) : null;
                          })()}
                          <p className={`text-sm ${!message.isOwn && message.hasMeRead === false ? 'font-semibold' : ''}`}>{toText(message.content ?? message.text)}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span />
                            {message.isOwn && (
                              <div className="flex items-center gap-1">
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage} size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-96">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chọn cuộc trò chuyện</h3>
                <p className="text-muted-foreground">
                  Chọn một cuộc trò chuyện để bắt đầu
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi tên cuộc trò chuyện</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Tên mới</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nhập tên mới" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameOpen(false)}>Hủy</Button>
              <Button onClick={async () => {
                if (!selectedConversation) return;
                const name = newName.trim();
                if (!name) return;
                await MessagesService.updateConversation(selectedConversation, { name });
                setConversations((prev) => prev.map((c) => ((c._id || c.id) === selectedConversation ? { ...c, name } : c)));
                setRenameOpen(false);
              }}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa cuộc trò chuyện</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa cuộc trò chuyện này?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={async () => {
              if (!selectedConversation) return;
              await MessagesService.deleteConversation(selectedConversation);
              setConversations((prev) => prev.filter((c) => (c._id || c.id) !== selectedConversation));
              setSelectedConversation('');
              setMessages([]);
              setDeleteOpen(false);
            }}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
