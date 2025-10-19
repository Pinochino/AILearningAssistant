import { React, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, Brain, ShieldUser } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (!success) {
      setError('Email hoặc mật khẩu không đúng');
    }
  };

  const quickLogin = (account: string) => {
    const accounts: Record<string, string> = {
      'admin': 'admin@gmail.com',
      'teacher1': 'teacher1@example.com',
      'teacher2': 'teacher2@example.com',
      'teacher3': 'teacher3@example.com',
      'student1': 'student1@example.com',
      'student2': 'student2@example.com',
      'student3': 'student3@example.com',
      'student4': 'student4@example.com',
      'student5': 'student5@example.com',
    };
    
    setEmail(accounts[account] || '');
    setPassword('123456');
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              
              {/* Admin */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">Admin</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('admin')}
                  className="w-full justify-start"
                >
                  <ShieldUser className="h-4 w-4 mr-2" />
                  <span className="text-xs">admin@gmail.com</span>
                </Button>
              </div>

              {/* Teachers */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">Giáo viên</div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('teacher1')}
                    className="flex flex-col items-center p-2 h-auto"
                  >
                    <BookOpen className="h-3 w-3 mb-1" />
                    <span className="text-xs">GV 1</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('teacher2')}
                    className="flex flex-col items-center p-2 h-auto"
                  >
                    <BookOpen className="h-3 w-3 mb-1" />
                    <span className="text-xs">GV 2</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('teacher3')}
                    className="flex flex-col items-center p-2 h-auto"
                  >
                    <BookOpen className="h-3 w-3 mb-1" />
                    <span className="text-xs">GV 3</span>
                  </Button>
                </div>
              </div>

              {/* Students */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">Học sinh</div>
                <div className="grid grid-cols-5 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('student1')}
                    className="flex flex-col items-center p-2 h-auto"
                  >
                    <Brain className="h-3 w-3 mb-1" />
                    <span className="text-xs">HS 1</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('student2')}
                    className="flex flex-col items-center p-2 h-auto"
                  >
                    <Brain className="h-3 w-3 mb-1" />
                    <span className="text-xs">HS 2</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('student3')}
                    className="flex flex-col items-center p-2 h-auto"
                  >
                    <Brain className="h-3 w-3 mb-1" />
                    <span className="text-xs">HS 3</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('student4')}
                    className="flex flex-col items-center p-2 h-auto"
                  >
                    <Brain className="h-3 w-3 mb-1" />
                    <span className="text-xs">HS 4</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => quickLogin('student5')}
                    className="flex flex-col items-center p-2 h-auto"
                  >
                    <Brain className="h-3 w-3 mb-1" />
                    <span className="text-xs">HS 5</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Tất cả tài khoản dùng mật khẩu: <code className="bg-muted px-2 py-1 rounded">123456</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}