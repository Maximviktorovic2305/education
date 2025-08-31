import { create } from 'zustand';
import { Certificate } from '@/types';
import { CertificateAPI, mockCertificates, mockCertificateEligibility } from '@/api/certificates';

interface CertificateFilters {
  type?: string;
  status?: 'valid' | 'expired';
  issued_year?: number;
}

interface CertificatePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface CertificateEligibility {
  type: 'junior' | 'middle' | 'senior' | 'course' | 'achievement';
  title: string;
  description: string;
  requirements_met: boolean;
  requirements: string[];
}

interface CertificateValidationResult {
  is_valid: boolean;
  certificate?: Certificate;
  error?: string;
}

interface CertificateState {
  // Certificates data
  certificates: Certificate[];
  currentCertificate: Certificate | null;
  eligibleCertificates: CertificateEligibility[];
  
  // Validation
  validationResult: CertificateValidationResult | null;
  
  // Filters and pagination
  filters: CertificateFilters;
  pagination: CertificatePagination;
  
  // Loading and error states
  isLoading: boolean;
  isGenerating: boolean;
  isValidating: boolean;
  error: string | null;
  
  // Actions
  fetchCertificates: (page?: number) => Promise<void>;
  fetchCertificate: (id: number) => Promise<void>;
  fetchEligibleCertificates: () => Promise<void>;
  generateCertificate: (type: 'junior' | 'middle' | 'senior' | 'course' | 'achievement', options?: Record<string, unknown>) => Promise<Certificate | null>;
  downloadCertificate: (id: number) => Promise<void>;
  validateCertificate: (certificateNumber: string) => Promise<void>;
  shareCertificate: (id: number) => Promise<string>;
  setFilters: (filters: Partial<CertificateFilters>) => void;
  clearError: () => void;
  clearValidation: () => void;
  
  // Utility functions
  getCertificateTypeTitle: (type: string) => string;
  getCertificateTypeIcon: (type: string) => string;
  isValidCertificate: (certificate: Certificate) => boolean;
  formatCertificateNumber: (number: string) => string;
}

export const useCertificateStore = create<CertificateState>((set, get) => ({
  // Initial state
  certificates: mockCertificates, // Initialize with mock data
  currentCertificate: null,
  eligibleCertificates: mockCertificateEligibility.eligible_certificates,
  validationResult: null,
  
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: mockCertificates.length,
    pages: Math.ceil(mockCertificates.length / 10),
  },
  
  isLoading: false,
  isGenerating: false,
  isValidating: false,
  error: null,
  
  // Actions
  fetchCertificates: async (page = 1) => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });
    
    try {
      // Use mock data for now
      const mockResponse = {
        data: mockCertificates,
        total: mockCertificates.length,
        page,
        limit: pagination.limit,
        pages: Math.ceil(mockCertificates.length / pagination.limit),
      };
      
      set({
        certificates: mockResponse.data,
        pagination: {
          page: mockResponse.page,
          limit: mockResponse.limit,
          total: mockResponse.total,
          pages: mockResponse.pages,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch certificates',
        isLoading: false,
      });
    }
  },
  
  fetchCertificate: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // Use mock data for now
      const certificate = mockCertificates.find(c => c.id === id);
      if (!certificate) {
        throw new Error('Certificate not found');
      }
      
      set({
        currentCertificate: certificate,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch certificate',
        isLoading: false,
      });
    }
  },
  
  fetchEligibleCertificates: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Use mock data for now
      set({
        eligibleCertificates: mockCertificateEligibility.eligible_certificates,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch eligible certificates',
        isLoading: false,
      });
    }
  },
  
  generateCertificate: async (type: 'junior' | 'middle' | 'senior' | 'course' | 'achievement', options: Record<string, unknown> = {}) => {
    set({ isGenerating: true, error: null });
    
    try {
      // Mock certificate generation
      const newCertificate: Certificate = {
        id: Date.now(),
        user_id: 1,
        type,
        title: get().getCertificateTypeTitle(type),
        description: `Сертификат ${get().getCertificateTypeTitle(type)}`,
        certificate_number: `GO-${type.toUpperCase().substring(0, 3)}-${new Date().getFullYear()}-${Math.random().toString().substring(2, 8)}`,
        issued_at: new Date().toISOString(),
        valid_until: type !== 'achievement' ? new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        pdf_path: `/certificates/GO-${type}-${Date.now()}.pdf`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Add to certificates list
      const { certificates } = get();
      set({
        certificates: [newCertificate, ...certificates],
        currentCertificate: newCertificate,
        isGenerating: false,
      });
      
      return newCertificate;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to generate certificate',
        isGenerating: false,
      });
      return null;
    }
  },
  
  downloadCertificate: async (id: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // Mock download
      const certificate = get().certificates.find(c => c.id === id);
      if (!certificate) {
        throw new Error('Certificate not found');
      }
      
      // Create a mock PDF blob
      const pdfContent = `Certificate: ${certificate.title}\nNumber: ${certificate.certificate_number}\nIssued: ${certificate.issued_at}`;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificate.certificate_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to download certificate',
        isLoading: false,
      });
    }
  },
  
  validateCertificate: async (certificateNumber: string) => {
    set({ isValidating: true, error: null, validationResult: null });
    
    try {
      // Mock validation
      const certificate = mockCertificates.find(c => c.certificate_number === certificateNumber);
      
      if (certificate) {
        const isValid = get().isValidCertificate(certificate);
        set({
          validationResult: {
            is_valid: isValid,
            certificate: certificate,
          },
          isValidating: false,
        });
      } else {
        set({
          validationResult: {
            is_valid: false,
            error: 'Certificate not found',
          },
          isValidating: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to validate certificate',
        isValidating: false,
      });
    }
  },
  
  shareCertificate: async (id: number) => {
    try {
      const certificate = get().certificates.find(c => c.id === id);
      if (!certificate) {
        throw new Error('Certificate not found');
      }
      
      // Mock sharing URL
      const shareUrl = `${window.location.origin}/certificates/verify/${certificate.certificate_number}`;
      
      // Copy to clipboard if available
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      
      return shareUrl;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to share certificate',
      });
      throw error;
    }
  },
  
  setFilters: (newFilters: Partial<CertificateFilters>) => {
    const { filters } = get();
    set({
      filters: { ...filters, ...newFilters },
      pagination: { ...get().pagination, page: 1 },
    });
    get().fetchCertificates(1);
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  clearValidation: () => {
    set({ validationResult: null });
  },
  
  // Utility functions
  getCertificateTypeTitle: (type: string) => {
    switch (type) {
      case 'junior': return 'Junior Go Developer';
      case 'middle': return 'Middle Go Developer';
      case 'senior': return 'Senior Go Developer';
      case 'course': return 'Завершение курса';
      case 'achievement': return 'Достижение';
      default: return 'Сертификат';
    }
  },
  
  getCertificateTypeIcon: (type: string) => {
    switch (type) {
      case 'junior': return '🌱';
      case 'middle': return '🌿';
      case 'senior': return '🌳';
      case 'course': return '📚';
      case 'achievement': return '🏆';
      default: return '📜';
    }
  },
  
  isValidCertificate: (certificate: Certificate) => {
    if (!certificate.valid_until) return true; // No expiration date
    return new Date(certificate.valid_until) > new Date();
  },
  
  formatCertificateNumber: (number: string) => {
    // Format: GO-JUN-2024-001234 -> GO-JUN-2024-001234
    return number.replace(/(.{2})(.{3})(.{4})(.{6})/, '$1-$2-$3-$4');
  },
}));