'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Download, 
  Share2, 
  Calendar, 
  Award,
  Shield,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCertificates, useDownloadCertificate } from '@/hooks/queries/useCertificates';
import { Certificate } from '@/types';

interface CertificateListProps {
  onCertificateSelect?: (certificate: Certificate) => void;
  selectedCertificateId?: number;
  compact?: boolean;
}

export const CertificateList: React.FC<CertificateListProps> = ({
  onCertificateSelect,
  selectedCertificateId,
  compact = false,
}) => {
  const { data: certificatesData, isLoading, error } = useCertificates();
  const downloadMutation = useDownloadCertificate();
  
  const certificates = certificatesData?.data || [];
  const pagination = {
    page: certificatesData?.page || 1,
    limit: certificatesData?.limit || 10,
    total: certificatesData?.total || 0,
    pages: certificatesData?.pages || 1,
  };

  const handleDownload = async (e: React.MouseEvent, certificateId: number) => {
    e.stopPropagation();
    downloadMutation.mutate(certificateId);
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading && certificates.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <p className="text-destructive mb-2">{error.message || 'Ошибка загрузки сертификатов'}</p>
          <Button size="sm" onClick={() => window.location.reload()} variant="outline">
            Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Сертификаты не найдены</h3>
          <p className="text-muted-foreground">
            Завершите курсы и достигните целей, чтобы получить сертификаты
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-full">
        <div className="space-y-4">
          {certificates.map((certificate) => {
            const isValid = isValidCertificate(certificate);
            const isSelected = selectedCertificateId === certificate.id;
            
            return (
              <Card
                key={certificate.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                } ${compact ? 'p-2' : ''}`}
                onClick={() => onCertificateSelect?.(certificate)}
              >
                <CardHeader className={compact ? 'pb-2' : 'pb-4'}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-3xl">
                        {getCertificateTypeIcon(certificate.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className={`${compact ? 'text-sm' : 'text-lg'} truncate`}>
                          {certificate.title}
                        </CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {certificate.description}
                        </CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {formatCertificateNumber(certificate.certificate_number)}
                          </Badge>
                          {isValid ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Действителен
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Истек
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {!compact && (
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Выдан: {formatDate(certificate.issued_at)}</span>
                        </div>
                        {certificate.valid_until && (
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            <span>До: {formatDate(certificate.valid_until)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => handleDownload(e, certificate.id)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Скачать PDF
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleShare(e, certificate.id)}
                        className="flex items-center gap-2"
                      >
                        <Share2 className="h-4 w-4" />
                        Поделиться
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Проверить
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};