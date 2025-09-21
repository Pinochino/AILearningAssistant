import { React, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Settings, Database, Mail, Shield, Globe, Palette, Bell, Save, RefreshCw, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '../ui/alert'

export function SystemSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    general: {
      siteName: 'AI Learning Assistant',
      siteDescription: 'Nền tảng học tập thông minh với AI',
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      maintenanceMode: false
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@ailearning.edu.vn',
      fromName: 'AI Learning Assistant'
    },
    security: {
      enableTwoFactor: true,
      sessionTimeout: '24',
      passwordMinLength: '8',
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      weeklyReports: true,
      marketingEmails: false
    },
    ai: {
      geminiApiKey: '',
      maxOutputTokens: '2000',
      temperature: '0.7',
      model: 'gemini-1.5-pro'
    }
  })

  const handleSave = async (section: string) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    // Show success message
  }

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div>
        <h1>Cài đặt hệ thống</h1>
        <p className='text-muted-foreground'>Quản lý cấu hình và thiết lập hệ thống</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue='general' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='general' className='gap-2'>
            <Settings className='h-4 w-4' />
            Chung
          </TabsTrigger>
          <TabsTrigger value='email' className='gap-2'>
            <Mail className='h-4 w-4' />
            Email
          </TabsTrigger>
          <TabsTrigger value='security' className='gap-2'>
            <Shield className='h-4 w-4' />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value='notifications' className='gap-2'>
            <Bell className='h-4 w-4' />
            Thông báo
          </TabsTrigger>
          <TabsTrigger value='ai' className='gap-2'>
            <Database className='h-4 w-4' />
            AI
          </TabsTrigger>
          <TabsTrigger value='backup' className='gap-2'>
            <RefreshCw className='h-4 w-4' />
            Sao lưu
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value='general' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
              <CardDescription>Cấu hình cơ bản của hệ thống</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='siteName'>Tên website</Label>
                  <Input
                    id='siteName'
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='language'>Ngôn ngữ</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='vi'>Tiếng Việt</SelectItem>
                      <SelectItem value='en'>English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='siteDescription'>Mô tả website</Label>
                <Textarea
                  id='siteDescription'
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                />
              </div>

              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Chế độ bảo trì</Label>
                  <p className='text-sm text-muted-foreground'>Kích hoạt để ngăn người dùng truy cập hệ thống</p>
                </div>
                <Switch
                  checked={settings.general.maintenanceMode}
                  onCheckedChange={(checked) => updateSetting('general', 'maintenanceMode', checked)}
                />
              </div>

              <div className='flex justify-end'>
                <Button onClick={() => handleSave('general')} disabled={isLoading}>
                  {isLoading && <RefreshCw className='mr-2 h-4 w-4 animate-spin' />}
                  <Save className='mr-2 h-4 w-4' />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value='email' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt Email</CardTitle>
              <CardDescription>Cấu hình SMTP để gửi email</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='smtpHost'>SMTP Host</Label>
                  <Input
                    id='smtpHost'
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='smtpPort'>SMTP Port</Label>
                  <Input
                    id='smtpPort'
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSetting('email', 'smtpPort', e.target.value)}
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='smtpUsername'>Username</Label>
                  <Input
                    id='smtpUsername'
                    type='email'
                    value={settings.email.smtpUsername}
                    onChange={(e) => updateSetting('email', 'smtpUsername', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='smtpPassword'>Password</Label>
                  <Input
                    id='smtpPassword'
                    type='password'
                    value={settings.email.smtpPassword}
                    onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='fromEmail'>Email gửi</Label>
                  <Input
                    id='fromEmail'
                    type='email'
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='fromName'>Tên người gửi</Label>
                  <Input
                    id='fromName'
                    value={settings.email.fromName}
                    onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                  />
                </div>
              </div>

              <div className='flex justify-between'>
                <Button variant='outline'>Gửi email test</Button>
                <Button onClick={() => handleSave('email')} disabled={isLoading}>
                  {isLoading && <RefreshCw className='mr-2 h-4 w-4 animate-spin' />}
                  <Save className='mr-2 h-4 w-4' />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value='security' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt bảo mật</CardTitle>
              <CardDescription>Cấu hình các chính sách bảo mật</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label>Xác thực 2 bước</Label>
                  <p className='text-sm text-muted-foreground'>Yêu cầu xác thực 2 bước cho tất cả người dùng</p>
                </div>
                <Switch
                  checked={settings.security.enableTwoFactor}
                  onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='sessionTimeout'>Thời gian session (giờ)</Label>
                  <Input
                    id='sessionTimeout'
                    type='number'
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='passwordMinLength'>Độ dài mật khẩu tối thiểu</Label>
                  <Input
                    id='passwordMinLength'
                    type='number'
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting('security', 'passwordMinLength', e.target.value)}
                  />
                </div>
              </div>

              <div className='space-y-3'>
                <Label>Yêu cầu mật khẩu</Label>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='requireUppercase'>Chữ hoa</Label>
                    <Switch
                      id='requireUppercase'
                      checked={settings.security.requireUppercase}
                      onCheckedChange={(checked) => updateSetting('security', 'requireUppercase', checked)}
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='requireNumbers'>Số</Label>
                    <Switch
                      id='requireNumbers'
                      checked={settings.security.requireNumbers}
                      onCheckedChange={(checked) => updateSetting('security', 'requireNumbers', checked)}
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='requireSpecialChars'>Ký tự đặc biệt</Label>
                    <Switch
                      id='requireSpecialChars'
                      checked={settings.security.requireSpecialChars}
                      onCheckedChange={(checked) => updateSetting('security', 'requireSpecialChars', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className='flex justify-end'>
                <Button onClick={() => handleSave('security')} disabled={isLoading}>
                  {isLoading && <RefreshCw className='mr-2 h-4 w-4 animate-spin' />}
                  <Save className='mr-2 h-4 w-4' />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value='ai' className='space-y-4'>
          <Alert>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              Cài đặt AI sẽ ảnh hưởng đến tất cả tính năng AI trong hệ thống. Hãy cẩn thận khi thay đổi.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Cài đặt AI (Gemini)</CardTitle>
              <CardDescription>Cấu hình các tham số cho Gemini</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='geminiApiKey'>Gemini API Key</Label>
                <Input
                  id='geminiApiKey'
                  type='password'
                  placeholder='AIza-...'
                  value={settings.ai.geminiApiKey || ''}
                  onChange={(e) => updateSetting('ai', 'geminiApiKey', e.target.value)}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='geminiModel'>Model</Label>
                  <Select value={settings.ai.model} onValueChange={(value) => updateSetting('ai', 'model', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='gemini-1.5-pro'>Gemini 1.5 Pro</SelectItem>
                      <SelectItem value='gemini-1.5-flash'>Gemini 1.5 Flash</SelectItem>
                      <SelectItem value='gemini-1.0-pro'>Gemini 1.0 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='maxOutputTokens'>Max Output Tokens</Label>
                  <Input
                    id='maxOutputTokens'
                    type='number'
                    value={settings.ai.maxOutputTokens || ''}
                    onChange={(e) => updateSetting('ai', 'maxOutputTokens', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='temperature'>Temperature</Label>
                  <Input
                    id='temperature'
                    type='number'
                    step='0.1'
                    min='0'
                    max='2'
                    value={settings.ai.temperature}
                    onChange={(e) => updateSetting('ai', 'temperature', e.target.value)}
                  />
                </div>
              </div>

              <div className='flex justify-between'>
                <Button variant='outline'>Test kết nối Gemini</Button>
                <Button onClick={() => handleSave('ai')} disabled={isLoading}>
                  {isLoading && <RefreshCw className='mr-2 h-4 w-4 animate-spin' />}
                  <Save className='mr-2 h-4 w-4' />
                  Lưu thay đổi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value='backup' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Sao lưu & Phục hồi</CardTitle>
              <CardDescription>Quản lý việc sao lưu dữ liệu hệ thống</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <Card>
                  <CardContent className='p-4'>
                    <div className='space-y-2'>
                      <h3 className='font-medium'>Sao lưu tự động</h3>
                      <p className='text-sm text-muted-foreground'>Lần sao lưu cuối: 18/09/2024 02:00</p>
                      <Badge variant='secondary'>Đang hoạt động</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className='p-4'>
                    <div className='space-y-2'>
                      <h3 className='font-medium'>Dung lượng sao lưu</h3>
                      <p className='text-sm text-muted-foreground'>2.4 GB / 10 GB đã sử dụng</p>
                      <Badge variant='outline'>24% sử dụng</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className='flex gap-4'>
                <Button className='gap-2'>
                  <Database className='h-4 w-4' />
                  Tạo bản sao lưu ngay
                </Button>
                <Button variant='outline' className='gap-2'>
                  <RefreshCw className='h-4 w-4' />
                  Phục hồi từ sao lưu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
