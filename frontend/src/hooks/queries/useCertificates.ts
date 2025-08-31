'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CertificateAPI } from '@/api/certificates';
import { queryKeys } from '@/lib/queryKeys';
import { getAccessToken } from '@/lib/queryClient';

interface CertificateFilters {
  type?: string;
  status?: 'valid' | 'expired';
  issued_year?: number;
}

interface CertificateGenerationRequest {
  type: 'junior' | 'middle' | 'senior' | 'course' | 'achievement';
  course_id?: number;
  achievement_id?: number;
  custom_title?: string;
}

// Certificate list queries
export const useCertificates = (
  page: number = 1,
  limit: number = 10,
  filters?: CertificateFilters
) => {
  return useQuery({
    queryKey: queryKeys.certificates.list({ page, limit, ...filters }),
    queryFn: () => CertificateAPI.getUserCertificates(page, limit, filters),
    enabled: !!getAccessToken(),
    staleTime: 10 * 60 * 1000, // Certificates don't change often - 10 minutes
  });
};

// Individual certificate queries
export const useCertificate = (id: number) => {
  return useQuery({
    queryKey: queryKeys.certificates.detail(id),
    queryFn: () => CertificateAPI.getCertificate(id),
    enabled: !!getAccessToken() && !!id,
    staleTime: 30 * 60 * 1000, // Certificate details cached for 30 minutes
  });
};

// Certificate eligibility check
export const useCertificateEligibility = () => {
  return useQuery({
    queryKey: queryKeys.certificates.eligibility(),
    queryFn: () => CertificateAPI.checkCertificateEligibility(),
    enabled: !!getAccessToken(),
    staleTime: 5 * 60 * 1000, // Eligibility can change based on progress
  });
};

// Certificate validation (public query)
export const useCertificateValidation = (certificateNumber: string) => {
  return useQuery({
    queryKey: queryKeys.certificates.validation(certificateNumber),
    queryFn: () => CertificateAPI.validateCertificate(certificateNumber),
    enabled: !!certificateNumber && certificateNumber.length > 0,
    staleTime: 10 * 60 * 1000, // Validation results can be cached
  });
};

// Certificate verification URL
export const useCertificateVerificationUrl = (id: number) => {
  return useQuery({
    queryKey: [...queryKeys.certificates.detail(id), 'verification-url'] as const,
    queryFn: () => CertificateAPI.getCertificateVerificationUrl(id),
    enabled: !!getAccessToken() && !!id,
    staleTime: 60 * 60 * 1000, // Verification URLs are stable for 1 hour
  });
};

// Certificate generation mutation
export const useGenerateCertificate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CertificateGenerationRequest) => 
      CertificateAPI.generateCertificate(request),
    
    onSuccess: (newCertificate) => {
      // Add the new certificate to the cache
      queryClient.setQueryData(
        queryKeys.certificates.detail(newCertificate.id),
        newCertificate
      );
      
      // Invalidate certificate lists to include the new certificate
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.certificates.lists()
      });
      
      // Invalidate eligibility to update available certificates
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.certificates.eligibility()
      });
      
      // Update user stats to reflect new certificate
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.progress.userStats()
      });
      
      toast.success('Сертификат успешно создан!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при создании сертификата');
    },
  });
};

// Certificate download mutation
export const useDownloadCertificate = () => {
  return useMutation({
    mutationFn: (id: number) => CertificateAPI.downloadCertificatePDF(id),
    
    onSuccess: (blob, certificateId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Сертификат загружен');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при загрузке сертификата');
    },
  });
};

// Batch download certificates
export const useBatchDownloadCertificates = () => {
  const downloadCertificate = useDownloadCertificate();
  
  return useMutation({
    mutationFn: async (certificateIds: number[]) => {
      const downloadPromises = certificateIds.map(id => 
        CertificateAPI.downloadCertificatePDF(id)
          .then(blob => ({ id, blob }))
          .catch(error => ({ id, error }))
      );
      
      return Promise.all(downloadPromises);
    },
    
    onSuccess: (results) => {
      let successCount = 0;
      let errorCount = 0;
      
      results.forEach(result => {
        if ('blob' in result) {
          // Create download for successful downloads
          const url = window.URL.createObjectURL(result.blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificate-${result.id}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          successCount++;
        } else {
          errorCount++;
        }
      });
      
      if (successCount > 0) {
        toast.success(`Загружено ${successCount} сертификатов`);
      }
      if (errorCount > 0) {
        toast.error(`Ошибка загрузки ${errorCount} сертификатов`);
      }
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при пакетной загрузке сертификатов');
    },
  });
};

// Helper hooks for certificate management
export const useUserCertificateStats = () => {
  const { data: certificates } = useCertificates();
  const { data: eligibility } = useCertificateEligibility();
  
  const stats = {
    totalCertificates: certificates?.data?.length ?? 0,
    availableForGeneration: eligibility?.eligible_certificates?.filter(
      cert => cert.requirements_met
    ).length ?? 0,
    inProgress: eligibility?.eligible_certificates?.filter(
      cert => !cert.requirements_met
    ).length ?? 0,
  };
  
  return {
    stats,
    certificates: certificates?.data ?? [],
    eligibility: eligibility?.eligible_certificates ?? [],
    isLoading: !certificates || !eligibility,
  };
};

// Quick generate certificate for eligible types
export const useQuickGenerateCertificate = () => {
  const generateCertificate = useGenerateCertificate();
  const { data: eligibility } = useCertificateEligibility();
  
  return useMutation({
    mutationFn: (type: 'junior' | 'middle' | 'senior' | 'course' | 'achievement') => {
      const eligibleCert = eligibility?.eligible_certificates?.find(
        cert => cert.type === type && cert.requirements_met
      );
      
      if (!eligibleCert) {
        throw new Error('Сертификат недоступен для создания');
      }
      
      return generateCertificate.mutateAsync({ type });
    },
    
    onSuccess: () => {
      toast.success('Сертификат успешно создан!');
    },
    
    onError: (error: any) => {
      toast.error(error.message || 'Ошибка при создании сертификата');
    },
  });
};

// Prefetch helpers
export const usePrefetchCertificateData = () => {
  const queryClient = useQueryClient();
  
  return () => {
    // Prefetch certificates list
    queryClient.prefetchQuery({
      queryKey: queryKeys.certificates.list({}),
      queryFn: () => CertificateAPI.getUserCertificates(),
      staleTime: 10 * 60 * 1000,
    });
    
    // Prefetch eligibility
    queryClient.prefetchQuery({
      queryKey: queryKeys.certificates.eligibility(),
      queryFn: () => CertificateAPI.checkCertificateEligibility(),
      staleTime: 5 * 60 * 1000,
    });
  };
};

// Certificate progress tracking
export const useCertificateProgress = (type: string) => {
  const { data: eligibility } = useCertificateEligibility();
  
  const certificateData = eligibility?.eligible_certificates?.find(
    cert => cert.type === type
  );
  
  if (!certificateData) {
    return null;
  }
  
  // Calculate overall progress percentage
  const totalRequirements = certificateData.requirements.length;
  const completedRequirements = certificateData.requirements.filter(req => 
    req.includes('выполнено:') && 
    req.match(/\(выполнено: (\d+)\/(\d+)\)/) &&
    parseInt(req.match(/\(выполнено: (\d+)\/(\d+)\)/)![1]) >= 
    parseInt(req.match(/\(выполнено: (\d+)\/(\d+)\)/)![2])
  ).length;
  
  const progressPercentage = (completedRequirements / totalRequirements) * 100;
  
  return {
    type: certificateData.type,
    title: certificateData.title,
    description: certificateData.description,
    requirements: certificateData.requirements,
    requirementsMet: certificateData.requirements_met,
    progressPercentage,
    completedRequirements,
    totalRequirements,
  };
};