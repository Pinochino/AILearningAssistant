// components/AnnouncementSection.tsx
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export type Announcement = {
    id: string;
    title: string;
    content: string;
    author: string;
    date: string;
};

export function AnnouncementSection({ announcements }: { announcements: Announcement[] }) {
    const [open, setOpen] = useState(false);
    const limited = announcements.slice(0, 3);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>📢 Thông báo chung</CardTitle>
                {announcements.length > 3 && (
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">Xem tất cả</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Tất cả thông báo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                {announcements.map((a) => (
                                    <div key={a.id} className="border-b pb-3 last:border-b-0">
                                        <h4 className="font-medium">{a.title}</h4>
                                        <p className="text-sm text-muted-foreground">{a.content}</p>
                                        <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                                            <span>{a.date}</span>
                                            <Badge variant="outline">{a.author}</Badge>
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
                                    <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                                    <div className="text-xs text-muted-foreground mt-2">{a.date}</div>
                                </div>
                                <div className="shrink-0">
                                    <Badge variant="outline" className="text-xs">{a.author}</Badge>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
