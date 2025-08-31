import { api } from './client';
import { Certificate, PaginatedResponse } from '@/types';

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

interface CertificateValidationResult {
  is_valid: boolean;
  certificate?: Certificate;
  error?: string;
}

export class CertificateAPI {
  // Get user's certificates
  static async getUserCertificates(
    page: number = 1,
    limit: number = 10,
    filters: CertificateFilters = {}
  ): Promise<PaginatedResponse<Certificate>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
      ),
    });

    const response = await api.protected.get<PaginatedResponse<Certificate>>(`/certificates?${params}`);
    return response;
  }

  // Get specific certificate
  static async getCertificate(id: number): Promise<Certificate> {
    const response = await api.protected.get<Certificate>(`/certificates/${id}`);
    return response;
  }

  // Generate new certificate
  static async generateCertificate(request: CertificateGenerationRequest): Promise<Certificate> {
    const response = await api.protected.post<Certificate>('/certificates/generate', request);
    return response;
  }

  // Download certificate PDF
  static async downloadCertificatePDF(id: number): Promise<Blob> {
    const response = await fetch(`/api/certificates/${id}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download certificate');
    }

    return response.blob();
  }

  // Validate certificate by number
  static async validateCertificate(certificateNumber: string): Promise<CertificateValidationResult> {
    const response = await api.public.get<CertificateValidationResult>(`/certificates/validate/${certificateNumber}`);
    return response;
  }

  // Get certificate verification URL
  static async getCertificateVerificationUrl(id: number): Promise<{ verification_url: string }> {
    const response = await api.protected.get<{ verification_url: string }>(`/certificates/${id}/verification-url`);
    return response;
  }

  // Check certificate eligibility
  static async checkCertificateEligibility(): Promise<{
    eligible_certificates: Array<{
      type: 'junior' | 'middle' | 'senior' | 'course' | 'achievement';
      title: string;
      description: string;
      requirements_met: boolean;
      requirements: string[];
    }>;
  }> {
    const response = await api.protected.get<{
      eligible_certificates: Array<{
        type: 'junior' | 'middle' | 'senior' | 'course' | 'achievement';
        title: string;
        description: string;
        requirements_met: boolean;
        requirements: string[];
      }>;
    }>('/certificates/eligibility');
    return response;
  }
}

// Mock data for development
export const mockCertificates: Certificate[] = [
  {
    id: 1,
    user_id: 1,
    type: 'junior',
    title: 'Junior Go Developer',
    description: 'Базовое владение языком программирования Go',
    certificate_number: 'GO-JUN-2024-001234',
    issued_at: '2024-01-20T10:00:00Z',
    valid_until: '2027-01-20T10:00:00Z',
    pdf_path: '/certificates/GO-JUN-2024-001234.pdf',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    type: 'course',
    title: 'Основы программирования на Go',
    description: 'Успешное завершение курса "Основы программирования на Go"',
    certificate_number: 'GO-CRS-2024-001235',
    issued_at: '2024-01-15T14:30:00Z',
    pdf_path: '/certificates/GO-CRS-2024-001235.pdf',
    created_at: '2024-01-15T14:30:00Z',
    updated_at: '2024-01-15T14:30:00Z',
  },
];

export const mockCertificateEligibility = {
  eligible_certificates: [
    {
      type: 'middle' as const,
      title: 'Middle Go Developer',
      description: 'Продвинутое владение языком программирования Go',
      requirements_met: false,
      requirements: [
        'Завершить 20 уроков (выполнено: 12/20)',
        'Решить 30 задач (выполнено: 18/30)',
        'Пройти 5 тестов с результатом 80%+ (выполнено: 3/5)',
        'Набрать 2000 баллов (выполнено: 1250/2000)',
      ],
    },
    {
      type: 'achievement' as const,
      title: 'Решатель задач',
      description: 'За решение 25 практических задач',
      requirements_met: false,
      requirements: [
        'Решить 25 задач (выполнено: 18/25)',
      ],
    },
    {
      type: 'achievement' as const,
      title: 'Знаток тестов',
      description: 'За успешное прохождение 5 тестов',
      requirements_met: false,
      requirements: [
        'Пройти 5 тестов с результатом 70%+ (выполнено: 3/5)',
      ],
    },
  ],
};