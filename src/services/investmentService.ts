import { useEffect, useState } from 'react';
import { apiFetch } from './apiClient';
import type { HatoScope } from './hatoDataService';

export interface AnimalInvestment {
  animalId: string;
  tagNumber: string | null;
  name: string | null;
  lotId: string | null;
  lotName: string | null;
  acquisitionCost: number;
  assignedCosts: number;
  feedingCost: number;
  farmOverhead: number;
  totalInvestment: number;
  breakEvenPrice: number;
}

export interface FarmInvestment {
  farmId: string;
  activeAnimalCount: number;
  totalInvestment: number;
  averageInvestment: number;
  animals: AnimalInvestment[];
}

/**
 * Consulta el dinero invertido por animal en la finca activa. El cálculo vive en el
 * backend; si no hay conexión se degrada a "sin datos" en lugar de inventar cifras.
 */
export function useInvestmentSummary(scope: HatoScope | null): {
  summary: FarmInvestment | null;
  isLoading: boolean;
  error: string | null;
} {
  const [summary, setSummary] = useState<FarmInvestment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const farmId = scope?.farmId ?? null;

  useEffect(() => {
    if (!farmId) return;
    let active = true;
    const synchronize = async () => {
      if (!navigator.onLine) {
        if (active) {
          setSummary(null);
          setError(null);
          setIsLoading(false);
        }
        return;
      }
      if (active) setIsLoading(true);
      try {
        const response = await apiFetch(`/investment-summary?farm_id=${encodeURIComponent(farmId)}`);
        if (!response.ok) throw new Error(`No se pudo calcular la inversión (${response.status}).`);
        const payload: unknown = await response.json();
        if (active) {
          setSummary(payload as FarmInvestment);
          setError(null);
        }
      } catch (cause: unknown) {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'No se pudo calcular la inversión.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void synchronize();
    return () => {
      active = false;
    };
  }, [farmId]);

  return { summary, isLoading, error };
}

export function investmentByAnimalId(summary: FarmInvestment | null): Map<string, AnimalInvestment> {
  const map = new Map<string, AnimalInvestment>();
  if (summary) {
    for (const item of summary.animals) map.set(item.animalId, item);
  }
  return map;
}
