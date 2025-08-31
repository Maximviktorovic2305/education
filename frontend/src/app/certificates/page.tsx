'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { CertificateList } from '@/components/certificates/certificate-list';
import { CertificateEligibility } from '@/components/certificates/certificate-eligibility';
import { CertificateValidator } from '@/components/certificates/certificate-validator';
import { useProfile, useLogout } from '@/hooks/queries/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, LogOut, Award, Target, Shield } from 'lucide-react';
import { Certificate } from '@/types';
import Link from 'next/link';

export default function CertificatesPage() {
  const { data: user } = useProfile();
  const logoutMutation = useLogout();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const handleCertificateSelect = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleCertificateGenerated = (type: string) => {
    // Switch to certificates tab after generation
    console.log('Certificate generated:', type);
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
                  <Award className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">Сертификаты</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => logoutMutation.mutate()}>
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Сертификаты достижений
            </h2>
            <p className="text-muted-foreground">
              Управляйте своими сертификатами и отслеживайте прогресс получения новых
            </p>
          </div>

          <Tabs defaultValue="my-certificates" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="my-certificates" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Мои сертификаты
              </TabsTrigger>
              <TabsTrigger value="available" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Доступные
              </TabsTrigger>
              <TabsTrigger value="verify" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Проверка
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-certificates" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Certificate List */}
                <div className="lg:col-span-2">
                  <CertificateList
                    onCertificateSelect={handleCertificateSelect}
                    selectedCertificateId={selectedCertificate?.id}
                  />
                </div>

                {/* Certificate Preview */}
                <div className="lg:col-span-1">
                  {selectedCertificate ? (
                    <div className="sticky top-6">
                      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6 border-2 border-dashed border-primary/30">
                        <div className="text-center space-y-4">
                          <div className="text-4xl">{selectedCertificate.type === 'junior' ? '🌱' : selectedCertificate.type === 'middle' ? '🌿' : selectedCertificate.type === 'senior' ? '🌳' : selectedCertificate.type === 'course' ? '📚' : '🏆'}</div>
                          <h3 className="text-xl font-bold">{selectedCertificate.title}</h3>
                          <p className="text-sm text-muted-foreground">{selectedCertificate.description}</p>
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">Номер сертификата</div>
                            <div className="font-mono text-sm bg-background p-2 rounded border">
                              {selectedCertificate.certificate_number}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Выдан: {new Date(selectedCertificate.issued_at).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="sticky top-6">
                      <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
                        <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">
                          Выберите сертификат для просмотра деталей
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="available" className="space-y-6">
              <CertificateEligibility onGenerate={handleCertificateGenerated} />
            </TabsContent>

            <TabsContent value="verify" className="space-y-6">
              <CertificateValidator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}