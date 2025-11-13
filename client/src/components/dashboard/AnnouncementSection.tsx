// components/AnnouncementSection.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Megaphone, Pencil, Trash2 } from 'lucide-react';

export type Announcement = {
    id: string;
    title: string;
    content: string;
    author: string;
    date: string;
};

export function AnnouncementSection({ announcements, canManage = false, onEdit, onDelete }: { announcements: Announcement[]; canManage?: boolean; onEdit?: (id: string) => void; onDelete?: (id: string) => void; }) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const limited = announcements.slice(0, 5);
    const shouldTruncate = (text: string) => (text || '').trim().split(/\s+/).length > 40;
    const truncate = (text: string) => {
        const parts = (text || '').trim().split(/\s+/);
        if (parts.length <= 40) return text;
        return parts.slice(0, 40).join(' ') + '…';
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"> <Megaphone color="#de3f3f" className="h-4 w-4" /> Thông báo chung</CardTitle>
                {announcements.length > 5 && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">Xem tất cả</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle>Tất cả thông báo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 flex-1 overflow-y-auto pr-4">
                                {announcements.map((a) => (
                                    <div key={a.id} className="border-b pb-3 last:border-b-0">
                                        <h4 className="font-medium">{a.title}</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
                                        <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                                            <span>{a.date}</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{a.author}</Badge>
                                                {canManage && (
                                                    <>
                                                        <Button size="icon" variant="ghost" onClick={() => onEdit ? onEdit(a.id) : null}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={() => onDelete ? onDelete(a.id) : null}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent className="space-y-3">
                {limited.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có thông báo nào.</p>
                ) : (
                    limited.map((a) => (
                        <div key={a.id} className="border-b pb-3 last:border-b-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <h4 className="font-medium">{a.title}</h4>
                                    {shouldTruncate(a.content) ? (
                                        <div className="mt-1">
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {expanded[a.id] ? a.content : truncate(a.content)}
                                            </p>
                                            <Button
                                                variant="link"
                                                className="px-0 h-auto text-sm"
                                                onClick={() => setExpanded((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                                            >
                                                {expanded[a.id] ? 'Ẩn bớt' : 'Xem thêm'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.content}</p>
                                    )}
                                    <div className="text-xs text-muted-foreground mt-2">{a.date}</div>
                                </div>
                                <div className="shrink-0 flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">{a.author}</Badge>
                                    {canManage && (
                                        <>
                                            <Button size="icon" variant="ghost" onClick={() => onEdit ? onEdit(a.id) : null}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost"
                                                className="text-destructive hover:text-destructive" onClick={() => onDelete ? onDelete(a.id) : null}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}