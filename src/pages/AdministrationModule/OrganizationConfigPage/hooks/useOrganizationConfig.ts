// src/pages/OrganizationConfigPage/hooks/useOrganizationConfig.ts
import { useState, useEffect, useCallback } from 'react';
import type { Organization } from '../../../../types/database.types';

export type ViewState = 'OVERVIEW' | 'LOADING' | 'ERROR';

export interface UseOrganizationConfigReturn {
  viewState: ViewState;
  organization: Organization | null;
  associatedFarmsCount: number;
  fetchData: () => Promise<void>;
  setViewState: (state: ViewState) => void;
}

export const useOrganizationConfig = (
  initialOrganizationId = 'org-123'
): UseOrganizationConfigReturn => {
  const [viewState, setViewState] = useState<ViewState>('LOADING');
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [associatedFarmsCount, setAssociatedFarmsCount] = useState<number>(0);

  const fetchData = useCallback(async () => {
    setViewState('LOADING');
    try {
      // -------------------------------------------------------------
      // Sustituir este bloque por tu cliente HTTP (ej. fetch / axios / supabase)
      // const res = await fetch(`/api/organizations/${initialOrganizationId}`);
      // if (!res.ok) throw new Error('Error al consultar organización');
      // const data = await res.json();
      // -------------------------------------------------------------

      // Simulación de delay de red (1 segundo)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData: Organization = {
        id: initialOrganizationId,
        name: 'Ganadería Serra Verde',
        legal_name: 'Ganadería Serra Verde S.A.S.',
        tax_id: '900.482.193-1',
        email: 'contacto@serraverde.com',
        phone: '+57 300 123 4567',
        status: 'active',
        created_at: new Date().toISOString()
      };

      setOrganization(mockData);
      setAssociatedFarmsCount(2);
      setViewState('OVERVIEW');
    } catch (err) {
      console.error('[Organization Config Fetch Error]:', err);
      setViewState('ERROR');
    }
  }, [initialOrganizationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    viewState,
    organization,
    associatedFarmsCount,
    fetchData,
    setViewState
  };
};