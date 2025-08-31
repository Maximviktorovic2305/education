'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Target, 
  CheckCircle2, 
  Clock,
  Trophy,
  Book,
  Code,
  TestTube,
  Star
} from 'lucide-react';
import { useCertificateStore } from '@/store/certificate';

interface CertificateEligibilityProps {
  onGenerate?: (type: string) => void;
}

export const CertificateEligibility: React.FC<CertificateEligibilityProps> = ({
  onGenerate,
}) => {
  const {
    eligibleCertificates,
    isLoading,
    isGenerating,
    error,
    fetchEligibleCertificates,
    generateCertificate,
    clearError,
    getCertificateTypeTitle,
    getCertificateTypeIcon,
  } = useCertificateStore();

  useEffect(() => {
    fetchEligibleCertificates();
  }, [fetchEligibleCertificates]);

  const handleGenerate = async (type: 'junior' | 'middle' | 'senior' | 'course' | 'achievement') => {
    const certificate = await generateCertificate(type);
    if (certificate && onGenerate) {
      onGenerate(type);
    }
  };

  const getRequirementIcon = (requirement: string) => {
    if (requirement.includes('урок')) return Book;
    if (requirement.includes('задач')) return Code;
    if (requirement.includes('тест')) return TestTube;
    if (requirement.includes('балл')) return Trophy;
    return Target;
  };

  const parseRequirement = (requirement: string) => {
    // Parse requirement like "Завершить 20 уроков (выполнено: 12/20)"
    const match = requirement.match(/(.+?)\s*\(выполнено:\s*(\d+)\/(\d+)\)/);
    if (match) {
      const [, description, completed, total] = match;
      return {
        description: description.trim(),
        completed: parseInt(completed),
        total: parseInt(total),
        percentage: (parseInt(completed) / parseInt(total)) * 100,
      };
    }
    return {
      description: requirement,
      completed: 0,
      total: 1,
      percentage: 0,
    };
  };

  if (isLoading) {
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
          <p className="text-destructive mb-2">{error}</p>
          <Button size="sm" onClick={clearError} variant="outline">
            Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Доступные сертификаты</h3>
        <p className="text-muted-foreground">
          Выполните требования, чтобы получить сертификаты
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eligibleCertificates.map((certificate, index) => (
          <Card key={index} className={`relative ${certificate.requirements_met ? 'border-green-200 bg-green-50/50' : ''}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {getCertificateTypeIcon(certificate.type)}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {certificate.title}
                  </CardTitle>
                  <CardDescription>
                    {certificate.description}
                  </CardDescription>
                </div>
                {certificate.requirements_met && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Готов к получению
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Требования:
                  </h4>
                  
                  <div className="space-y-3">
                    {certificate.requirements.map((requirement, reqIndex) => {
                      const parsed = parseRequirement(requirement);
                      const IconComponent = getRequirementIcon(requirement);
                      
                      return (
                        <div key={reqIndex} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1">{parsed.description}</span>
                            <span className="text-muted-foreground">
                              {parsed.completed}/{parsed.total}
                            </span>
                          </div>
                          <Progress value={parsed.percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  {certificate.requirements_met ? (
                    <Button
                      onClick={() => handleGenerate(certificate.type)}
                      disabled={isGenerating}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Генерация...' : 'Получить сертификат'}
                    </Button>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-4 w-4" />
                        <span>Выполните все требования</span>
                      </div>
                      <Button disabled variant="outline" className="w-full">
                        Сертификат недоступен
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <CardTitle>Достижения</CardTitle>
          </div>
          <CardDescription>
            Получайте сертификаты за особые достижения в обучении
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eligibleCertificates
              .filter(cert => cert.type === 'achievement')
              .map((achievement, index) => (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl mb-2">{getCertificateTypeIcon(achievement.type)}</div>
                  <h4 className="font-medium mb-1">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{achievement.description}</p>
                  
                  {achievement.requirements_met ? (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Готов к получению
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      В процессе
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};