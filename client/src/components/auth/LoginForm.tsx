import { React, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, Brain, ShieldUser } from 'lucide-react';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(username, password);
    if (!success) {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  const quickLogin = (role: string) => {
    if (role === 'admin') {
      setUsername('admin');
    } else if (role === 'teacher') {
      setUsername('teacher1');
    } else {
      setUsername('student1');
    }
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-primary rounded-full p-3">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">AI Learning Assistant</h1>
          <p className="text-muted-foreground">Đăng nhập để tiếp tục học tập</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Đăng nhập</CardTitle>
            <CardDescription>
              Nhập thông tin đăng nhập của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  placeholder="admin, teacher1, student1..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>

            {/* Quick Login Options */}
            <div className="mt-6 space-y-3">
              <div className="text-center text-sm text-muted-foreground">
                Hoặc đăng nhập nhanh với:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('admin')}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <ShieldUser className="h-4 w-4 mb-1" />
                  <span className="text-xs">Admin</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('teacher')}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <BookOpen className="h-4 w-4 mb-1" />
                  <span className="text-xs">Giáo viên</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('student')}
                  className="flex flex-col items-center p-3 h-auto"
                >
                  <Brain className="h-4 w-4 mb-1" />
                  <span className="text-xs">Học sinh</span>
                </Button>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Demo - Mật khẩu cho tất cả tài khoản: <code>password</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}