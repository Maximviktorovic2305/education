'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { ProgressOverview } from '@/components/progress/progress-overview';
import { ProgressStats } from '@/components/progress/progress-stats';
import { CertificateList } from '@/components/certificates/certificate-list';
import { useAuthStore } from '@/store/auth';
import { useProgressStore } from '@/store/progress';
import { useCertificateStore } from '@/store/certificate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  ArrowLeft, 
  User, 
  LogOut, 
  Settings, 
  Trophy, 
  BarChart3, 
  Award,
  Calendar,
  Mail,
  Shield,
  Edit,
  Camera,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { userStats, learningStreak } = useProgressStore();
  const { certificates } = useCertificateStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSaveProfile = () => {
    // Mock save functionality
    console.log('Saving profile:', editForm);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} дней назад`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} месяцев назад`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} лет назад`;
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Назад
              </Link>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">Профиль пользователя</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="mb-8">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
              <CardContent className="relative p-8">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-2xl font-bold">{user?.name}</h2>
                      <Badge className="capitalize">
                        {userStats?.current_level || 'junior'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Участник {formatMemberSince(user?.created_at || '')}</span>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-background/50 rounded-lg border">
                        <div className="text-2xl font-bold text-primary">{userStats?.total_points || 0}</div>
                        <div className="text-xs text-muted-foreground">Баллы</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">{userStats?.completed_lessons || 0}</div>
                        <div className="text-xs text-muted-foreground">Уроки</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">{certificates.length}</div>
                        <div className="text-xs text-muted-foreground">Сертификаты</div>
                      </div>
                      <div className="text-center p-3 bg-background/50 rounded-lg border">
                        <div className="text-2xl font-bold text-orange-600">{learningStreak?.current_streak || 0}</div>
                        <div className="text-xs text-muted-foreground">Дней подряд</div>
                      </div>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Редактировать
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Обзор
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Прогресс
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Сертификаты
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Настройки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ProgressOverview compact={false} />
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <ProgressStats detailed={true} />
            </TabsContent>

            <TabsContent value="certificates" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Мои сертификаты</h3>
                  <CertificateList compact={true} />
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Статистика сертификатов
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Всего получено:</span>
                          <span className="font-medium">{certificates.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Действительных:</span>
                          <span className="font-medium text-green-600">{certificates.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Уровневых:</span>
                          <span className="font-medium">
                            {certificates.filter(c => ['junior', 'middle', 'senior'].includes(c.type)).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>За курсы:</span>
                          <span className="font-medium">
                            {certificates.filter(c => c.type === 'course').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>За достижения:</span>
                          <span className="font-medium">
                            {certificates.filter(c => c.type === 'achievement').length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Личная информация</CardTitle>
                    <CardDescription>
                      Управляйте своими персональными данными
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Имя</Label>
                        <div className="flex gap-2">
                          <Input
                            id="name"
                            value={isEditing ? editForm.name : user?.name || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            disabled={!isEditing}
                          />
                          {isEditing && (
                            <div className="flex gap-1">
                              <Button size="sm" onClick={handleSaveProfile}>
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={isEditing ? editForm.email : user?.email || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Роль</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {user?.role || 'user'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Дата регистрации</Label>
                        <div className="text-sm text-muted-foreground">
                          {user?.created_at ? formatDate(user.created_at) : 'Неизвестно'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Безопасность
                    </CardTitle>
                    <CardDescription>
                      Настройки безопасности и приватности
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start">
                        Изменить пароль
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        Настройки приватности
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start">
                        Управление сессиями
                      </Button>
                      
                      <div className="pt-4 border-t">
                        <Button variant="destructive" className="w-full">
                          Удалить аккаунт
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          Это действие необратимо. Все ваши данные будут удалены.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-w-90vw">
            <CardHeader>
              <CardTitle>Редактировать профиль</CardTitle>
              <CardDescription>
                Измените свою личную информацию
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Имя</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProfile} className="flex-1">
                    Сохранить
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                    Отмена
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AuthGuard>
  );
}