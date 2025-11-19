import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import {
  Settings,
  Database,
  Mail,
  Shield,
  Globe,
  Palette,
  Bell,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export function SystemSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'AI Learning Assistant',
      siteDescription: 'Nền tảng học tập thông minh với AI',
      language: 'vi',
      timezone: 'Asia/Ho_Chi_Minh',
      maintenanceMode: false,
    },
    ai: {
      geminiApiKey: '',
      maxOutputTokens: '2000',
      temperature: '0.7',
      model: 'gemini-2.5-pro',
    },
  });

  const handleSave = async (section: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Show success message
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Cài đặt hệ thống</h1>
        <p className="text-muted-foreground">
          Quản lý cấu hình và thiết lập hệ thống
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            Chung
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Database className="h-4 w-4" />
            AI
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sao lưu
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
              <CardDescription>
                Cấu hình cơ bản của hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Tên website</Label>
                  <Input
                    disabled
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select
                    disabled
                    value={settings.general.language}
                    onValueChange={(value: any) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Mô tả website</Label>
                <Textarea
                  disabled
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt AI</CardTitle>
              <CardDescription>
                Cấu hình các tham số cho AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="geminiApiKey">API Key</Label>
                <div className="relative">
                  <Input
                    disabled
                    id="geminiApiKey"
                    type="password"
                    placeholder="••••••••••••••••••••••••••••••••••••••"
                    value={settings.ai.geminiApiKey || ""}
                    onChange={(e) => updateSetting("ai", "geminiApiKey", e.target.value)}
                    className="font-mono tracking-wider"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="geminiModel">Model</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Gemini 2.5 Pro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem disabled value="gemini-1.5-pro">Gemini 2.5 Pro</SelectItem>
                      <SelectItem disabled value="gemini-1.5-flash">Gemini 2.5 Flash</SelectItem>
                      <SelectItem disabled value="gemini-1.0-pro">Gemini 2.0 Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOutputTokens">Max Output Tokens</Label>
                  <Input
                    disabled
                    id="maxOutputTokens"
                    type="number"
                    value={settings.ai.maxOutputTokens || ""}
                    onChange={(e) => updateSetting("ai", "maxOutputTokens", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    disabled
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={settings.ai.temperature}
                    onChange={(e) => updateSetting("ai", "temperature", e.target.value)}
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>


        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sao lưu & Phục hồi</CardTitle>
              <CardDescription>
                Quản lý việc sao lưu dữ liệu hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Sao lưu tự động</h3>
                      <p className="text-sm text-muted-foreground">
                        Lần sao lưu cuối: 18/09/2025 02:00
                      </p>
                      <Badge variant="secondary">Đang hoạt động</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Dung lượng sao lưu</h3>
                      <p className="text-sm text-muted-foreground">
                        2.4 GB / 10 GB đã sử dụng
                      </p>
                      <Badge variant="outline">24% sử dụng</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}