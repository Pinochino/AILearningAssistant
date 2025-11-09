// components/AnnouncementCreator.tsx
import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export function AnnouncementCreator({ onCreate }: { onCreate: (title: string, content: string) => void }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const MAX_TITLE_CHARS = 80;
    const titleChars = useMemo(() => title.length, [title]);
    const remaining = Math.max(0, MAX_TITLE_CHARS - titleChars);

    const handleCreate = () => {
        if (!title.trim() || !content.trim()) return;
        onCreate(title.trim(), content.trim());
        setTitle('');
        setContent('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tạo thông báo mới</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Tiêu đề (còn {remaining}/{MAX_TITLE_CHARS} ký tự)</div>
                    <Input
                        placeholder="Tiêu đề thông báo"
                        value={title}
                        onChange={(e) => {
                            const raw = e.target.value || '';
                            if (raw.length <= MAX_TITLE_CHARS) {
                                setTitle(raw);
                            } else {
                                setTitle(raw.slice(0, MAX_TITLE_CHARS));
                            }
                        }}
                    />
                </div>
                <div>
                    <Textarea
                        placeholder="Nội dung thông báo"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="max-h-60 overflow-y-auto"
                    />
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleCreate} disabled={!title.trim() || !content.trim()}>Đăng thông báo</Button>
                </div>
            </CardContent>
        </Card>
    );
}
