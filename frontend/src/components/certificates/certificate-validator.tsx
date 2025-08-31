'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  User,
  Award,
} from 'lucide-react';
import { useCertificateValidation } from '@/hooks/queries/useCertificates';

export const CertificateValidator: React.FC = () => {
  const [certificateNumber, setCertificateNumber] = useState('');
  const [searchNumber, setSearchNumber] = useState('');
  
  const { data: validationResult, isLoading: isValidating, error } = useCertificateValidation(searchNumber);

  const handleValidate = async () => {
    if (!certificateNumber.trim()) return;
    setSearchNumber(certificateNumber.trim());
  };

  const handleClear = () => {
    setCertificateNumber('');
    setSearchNumber('');
  };

  const formatCertificateNumber = (number: string) => {
    return number.replace(/(.{4})/g, '$1-').slice(0, -1);
  };

  const getCertificateTypeIcon = (type: string) => {
    switch (type) {
      case 'junior': return '🎓';
      case 'middle': return '📘';
      case 'senior': return '👨‍💻';
      case 'course': return '📚';
      case 'achievement': return '🏆';
      default: return '📜';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Проверка сертификата</CardTitle>
          <CardDescription>
            Введите номер сертификата для проверки его подлинности и действительности
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Введите номер сертификата (например: GO-JUN-2024-001234)"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleValidate()}
                className="flex-1"
              />
              <Button 
                onClick={handleValidate} 
                disabled={!certificateNumber.trim() || isValidating}
              >
                {isValidating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {validationResult && (
              <div className="mt-6">
                {validationResult.is_valid && validationResult.certificate ? (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                        <div>
                          <CardTitle className="text-green-800">
                            Сертификат действителен
                          </CardTitle>
                          <CardDescription className="text-green-700">
                            Сертификат найден и является подлинным
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">
                            {getCertificateTypeIcon(validationResult.certificate.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {validationResult.certificate.title}
                            </h3>
                            <p className="text-muted-foreground">
                              {validationResult.certificate.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Номер сертификата:</span>
                            </div>
                            <p className="text-sm font-mono bg-background p-2 rounded border">
                              {formatCertificateNumber(validationResult.certificate.certificate_number)}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Дата выдачи:</span>
                            </div>
                            <p className="text-sm">
                              {formatDate(validationResult.certificate.issued_at)}
                            </p>
                          </div>

                          {validationResult.certificate.valid_until && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Действителен до:</span>
                              </div>
                              <p className="text-sm">
                                {formatDate(validationResult.certificate.valid_until)}
                              </p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Статус:</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Действителен
                            </Badge>
                          </div>
                        </div>

                        <div className="pt-4 border-t">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Shield className="h-3 w-3" />
                            <span>
                              Этот сертификат выдан платформой изучения Go и подтверждает
                              достижения владельца в изучении языка программирования Go.
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <XCircle className="h-8 w-8 text-red-600" />
                        <div>
                          <CardTitle className="text-red-800">
                            Сертификат не найден
                          </CardTitle>
                          <CardDescription className="text-red-700">
                            {validationResult.error || 'Сертификат с указанным номером не существует'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-red-800">
                          Возможные причины:
                        </p>
                        <ul className="text-sm text-red-700 space-y-1 ml-4">
                          <li>• Номер сертификата введен неверно</li>
                          <li>• Сертификат был отозван или аннулирован</li>
                          <li>• Сертификат не был выдан нашей платформой</li>
                        </ul>
                        
                        <div className="pt-3 border-t border-red-200">
                          <p className="text-xs text-red-600">
                            Если вы считаете, что это ошибка, обратитесь в службу поддержки.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={handleClear}>
                    Проверить другой сертификат
                  </Button>
                </div>
              </div>
            )}

            {!validationResult && !error && (
              <div className="text-center py-8">
                <div className="text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Введите номер сертификата для проверки
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Как проверить сертификат?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">1</div>
              <p>Найдите номер сертификата в правом верхнем углу документа</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">2</div>
              <p>Введите полный номер в поле выше (формат: GO-XXX-YYYY-NNNNNN)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">3</div>
              <p>Нажмите кнопку поиска для проверки подлинности</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};