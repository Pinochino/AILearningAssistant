// components/AnnouncementCreator.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export function AnnouncementCreator({ onCreate }: { onCreate: (title: string, content: string) => void }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

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
                <Input
                    placeholder="Tiêu đề thông báo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                    placeholder="Nội dung thông báo"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                />
                <div className="flex justify-end">
                    <Button onClick={handleCreate} disabled={!title.trim() || !content.trim()}>Đăng thông báo</Button>
                </div>
            </CardContent>
        </Card>
    );
}
