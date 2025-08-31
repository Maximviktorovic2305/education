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
