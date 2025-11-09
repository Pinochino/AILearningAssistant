import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Search,
  Plus,
  Send,
  Reply,
  Forward,
  Archive,
  Trash2,
  Star,
  StarOff,
  Filter,
  MoreVertical,
  Users,
  BookOpen,
  Clock,
  Check,
  CheckCheck,
  Download,
  MessageSquare
} from 'lucide-react';
import { MessagesService } from '../../services/messages';
import { NotificationsService } from '../../services/notifications';
import { UsersService } from '../../services/users';
import { useAuth } from '../../hooks/useAuth';
import { getSocket, ensureSocketConnected } from '../../lib/socket';

export function Messages() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const meId = (user as any)?.id || (user as any)?._id;
  const meEmail = String((user as any)?.email || '').toLowerCase();
  const toText = (v: any) => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      if (typeof (v as any).text === 'string') return (v as any).text;
      if (typeof (v as any).content === 'string') return (v as any).content;
      return JSON.stringify(v);
    }
    return String(v);
  };
  const getConversationName = (conv: any) => {
    const existing = conv?.name || conv?.title;
    if (existing) return existing;
    const isGroup = !!(conv?.isGroup || conv?.conversationType === 'group');
    if (isGroup) return existing || '';
    const parts = conv?.participants || [];
    const others = parts.filter((p: any) => String(p?._id || p?.id) !== String(meId));
    const rec = others[0];
    const nm = rec ? `${rec.firstName || rec.name || ''} ${rec.lastName || ''}`.trim() : '';
    return nm || existing || 'Cuộc trò chuyện';
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [replyContent, setReplyContent] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // compose new message for current conversation
  const [composeBody, setComposeBody] = useState<string>('');
  // new: direct compose state
  const [isDirectOpen, setIsDirectOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userBase, setUserBase] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState(null as any);
  // new: group compose state
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupQuery, setGroupQuery] = useState('');
  const [groupBase, setGroupBase] = useState<any[]>([]);
  const [groupResults, setGroupResults] = useState<any[]>([]);
  const [groupSelected, setGroupSelected] = useState<any[]>([]);
  // conversation actions
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const prevConvRef = useRef<string>('');

  // Load conversations
  useEffect(() => {
    if (isAuthLoading) return;
    let mounted = true;
    (async () => {
      try {
        // Ensure socket handshake is authenticated before first data fetch
        try { await ensureSocketConnected(); } catch { }
        const res = await MessagesService.getConversations() as any;
        const list = (Array.isArray(res?.data) ? res.data : [])
          .filter((c: any) => c.conversationType !== 'ai' && !c.aiTutorId)
          .map((c: any) => ({ ...c, name: getConversationName(c) }));
        if (!mounted) return;
        setConversations(list);
        // Do NOT auto-open an unread conversation: pick the first read one if available
        const firstRead = list.find((c: any) => Number(c.unreadCount || 0) === 0);
        if (firstRead) setSelectedConversation(firstRead._id || firstRead.id);
        else setSelectedConversation(null);
      } catch {
        setConversations([]);
      }
    })();
    return () => { mounted = false; };
  }, [isAuthLoading]);

  const currentConversation = useMemo(() =>
    conversations.find((c) => (c._id || c.id) === selectedConversation),
    [conversations, selectedConversation]
  );

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
        if (active) { setUserBase(filteredOutMe); setUserResults(filteredOutMe); }
      } catch { if (active) { setUserBase([]); setUserResults([]); } }
    })();
    return () => { active = false; };
  }, [isDirectOpen, meId, isAuthLoading]);

  // client-side filter for direct
  useEffect(() => {
    const q = userQuery.toLowerCase();
    const filtered = userBase.filter((u: any) => {
      const id = String(u._id || u.id || '').toLowerCase();
      const uname = String(u.username || '').toLowerCase();
      const name = String(u.name || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
      if (String(u._id || u.id) === String(meId)) return false;
      return !q || id.includes(q) || uname.includes(q) || name.includes(q);
    });
    setUserResults(filtered);
    if (!selectedUser && filtered.length > 0) setSelectedUser(filtered[0]);
  }, [userQuery, userBase, meId]);

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
  }, [isGroupOpen, meId, isAuthLoading]);

  // client-side filter for group
  useEffect(() => {
    const q = groupQuery.toLowerCase();
    const filtered = groupBase.filter((u: any) => {
      const id = String(u._id || u.id || '').toLowerCase();
      const uname = String(u.username || '').toLowerCase();
      const name = String(u.name || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
      if (String(u._id || u.id) === String(meId)) return false;
      return !q || id.includes(q) || uname.includes(q) || name.includes(q);
    });
    setGroupResults(filtered);
  }, [groupQuery, groupBase, meId]);

  // Load messages of selected conversation with race guard and join socket room
  useEffect(() => {
    if (isAuthLoading || !selectedConversation) return;
    setMessages([]);
    (async () => {
      try {
        await ensureSocketConnected();
        const socket = await ensureSocketConnected();
        const prev = prevConvRef.current;
        if (prev && prev !== selectedConversation) {
          socket.emit('leave_conversation', { conversationId: prev });
        }
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
        prevConvRef.current = selectedConversation as string;
        await joined;
      } catch (e) {
        // ignore join error; REST fetch will still load history
      }
    })();
    let canceled = false;
    const currentConv = selectedConversation;
    (async () => {
      setLoading(true);
      try {
        const res = await MessagesService.getConversationMessages(currentConv, { page: 1, limit: 50 }) as any;
        const raw = Array.isArray(res?.data) ? res.data : (res?.data?.items || []);
        const meIdLocal = (user as any)?.id || (user as any)?._id;
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
        if (canceled) return;
        if (currentConv !== selectedConversation) return;
        setMessages(list);
      } catch {
        if (canceled) return;
        setMessages([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    // mark as read on open (fire-and-forget) and update local state
    (async () => {
      try {
        await MessagesService.markConversationAsRead(String(currentConv));
        setMessages((prev: any[]) => prev.map(m => (!m.isOwn ? { ...m, hasMeRead: true } : m)));
      } catch { }
    })();
    return () => { canceled = true; };
  }, [selectedConversation, isAuthLoading]);

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
        // create incoming message object the same as previous code
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


  // no embedded notifications in Messages view

  const filteredConversations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return conversations.filter((c) => (c.name || '').toLowerCase().includes(term));
  }, [conversations, searchTerm]);

  const unreadCount = 0; // backend can supply, for now 0
  const starredCount = 0;

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedConversation) return;
    const clientId = `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = {
      _id: `temp-${Date.now()}`,
      id: `temp-${Date.now()}`,
      conversation: selectedConversation,
      sender: { _id: meId },
      senderId: meId,
      isOwn: true,
      content: replyContent,
      createdAt: new Date().toISOString(),
      clientId,
    } as any;
    setMessages((prev) => [...prev, optimistic]);
    // update preview immediately
    setConversations((prev: any[]) => {
      const list = [...prev];
      const idx = list.findIndex((c) => String(c._id || c.id) === String(selectedConversation));
      if (idx >= 0) {
        const item = { ...list[idx], lastMessage: replyContent, updatedAt: new Date().toISOString() };
        list.splice(idx, 1);
        return [item, ...list];
      }
      return prev;
    });
    const convAtSend = selectedConversation;
    const text = replyContent;
    setReplyContent('');
    try {
      await ensureSocketConnected();
      const sock = getSocket();
      if (sock?.connected) {
        sock.emit('send_message', { conversationId: convAtSend, content: text, clientId });
      } else {
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
    } catch { }
  };

  const handleStar = (_id: string) => { };
  const handleArchive = (_id: string) => { };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('vi-VN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Tin nhắn</h1>
          <p className="text-muted-foreground">
            Quản lý tin nhắn và thông báo với sinh viên
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isDirectOpen} onOpenChange={setIsDirectOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Nhắn 1-1
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Nhắn tin trực tiếp</DialogTitle>
                <DialogDescription>Chọn 1 người để bắt đầu/tiếp tục trò chuyện</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Label>Tìm người nhận</Label>
                <Input value={userQuery} onChange={(e) => setUserQuery(e.target.value)} placeholder="Tên đăng nhập / Tên" />
                <div className="max-h-64 overflow-y-auto border rounded">
                  {userResults.length === 0 && (
                    <div className="p-3 text-sm text-muted-foreground">Không có kết quả</div>
                  )}
                  {userResults.map((u) => (
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
                    const recipientName = `${selectedUser.firstName || selectedUser.name || ''} ${selectedUser.lastName || ''}`.trim();
                    if (recipientName) conversation.name = recipientName;
                    const cid = conversation?._id || conversation?.id;
                    if (cid) {
                      // ensure conversations list contains it
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
                <Users className="h-4 w-4" />
                Tạo nhóm
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tạo cuộc trò chuyện nhóm</DialogTitle>
                <DialogDescription>Chọn nhiều người và đặt tên nhóm</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Label>Tên nhóm</Label>
                <Input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="VD: Nhóm lớp 12A1" />
                <Label>Thêm thành viên</Label>
                <Input value={groupQuery} onChange={(e) => setGroupQuery(e.target.value)} placeholder="Tên đăng nhập / Tên" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="border rounded max-h-64 overflow-y-auto">
                    {groupResults.length === 0 && (
                      <div className="p-3 text-sm text-muted-foreground">Không có kết quả</div>
                    )}
                    {groupResults.map((u) => (
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
                    {groupSelected.map((u) => (
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

          {/* Removed compose new message button per request */}
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm tin nhắn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc tin nhắn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ({conversations.length})</SelectItem>
                <SelectItem value="unread">Chưa đọc ({unreadCount})</SelectItem>
                <SelectItem value="starred">Đã gắn sao ({starredCount})</SelectItem>
                <SelectItem value="high">Ưu tiên cao</SelectItem>
                <SelectItem value="archived">Đã lưu trữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations - narrower column */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cuộc trò chuyện</CardTitle>
              <CardDescription>Danh sách các cuộc trò chuyện</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredConversations.map((c) => (
                  <div
                    key={c._id || c.id}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${selectedConversation === (c._id || c.id) ? 'bg-muted' : ''}`}
                    onClick={() => {
                      setSelectedConversation(c._id || c.id);
                      setConversations((prev) => prev.map((x) => ((x._id || x.id) === (c._id || c.id) ? { ...x, unreadCount: 0 } : x)));
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {toText(c.name || 'C').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`truncate ${c.unreadCount > 0 && selectedConversation !== (c._id || c.id) ? 'font-semibold' : 'font-medium'}`}>{toText(getConversationName(c))}</h3>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">
                              {c.updatedAt && new Date(c.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {c.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">{c.unreadCount}</Badge>
                            )}
                            {c.unreadCount > 0 && selectedConversation !== (c._id || c.id) && (
                              <span className="ml-1 inline-block h-2 w-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className={`text-sm truncate ${c.unreadCount > 0 && selectedConversation !== (c._id || c.id) ? 'font-semibold' : 'text-muted-foreground'}`}>
                          {toText(c.lastMessage)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Detail - wider column */}
        <div className="lg:col-span-2 space-y-4">
          {selectedConversation ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{getConversationName(currentConversation)}</CardTitle>
                  {(() => {
                    const isGroup = !!(currentConversation?.isGroup || currentConversation?.conversationType === 'group');
                    if (!isGroup) {
                      return (
                        <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
              <CardContent>
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((m: any) => {
                    const isOwn = !!m.isOwn;
                    const isGroup = !!(currentConversation?.isGroup || currentConversation?.conversationType === 'group');
                    const initials = toText((m.sender?.name || m.senderName || m.sender?.email || 'U')).split(' ').map((n: string) => n[0]).join('').toUpperCase();
                    return (
                      <div key={m._id || m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-start gap-2`}>
                        {!isOwn && isGroup && (
                          <Avatar className="h-6 w-6 mt-1">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          {isGroup && !isOwn && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs opacity-80">{toText(m.sender?.name || m.senderName || m.sender?.email || 'Người dùng')}</span>
                              <span className="text-[10px] opacity-60">{formatTimestamp(m.createdAt || m.timestamp || new Date().toISOString())}</span>
                            </div>
                          )}
                          <p className={`text-sm ${!isOwn && m.hasMeRead === false ? 'font-semibold' : ''}`}>{toText(m.content ?? m.text)}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span />
                            {isOwn && (
                              <div className="flex items-center gap-1">
                                {m.isRead ? (
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
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Nhập phản hồi..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                    />
                    <Button size="sm" onClick={() => handleReply()} disabled={!replyContent.trim()}>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chọn một tin nhắn để xem chi tiết</p>
              </CardContent>
            </Card>
          )}

          {/* Announcements removed from Messages view */}
        </div>
      </div>
      {/* Rename Dialog */}
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
              if (!selectedConversation) return;
              await MessagesService.deleteConversation(selectedConversation);
              setConversations((prev) => prev.filter((c) => (c._id || c.id) !== selectedConversation));
              setSelectedConversation(null);
              setMessages([]);
              setDeleteOpen(false);
            }}>Xóa</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
