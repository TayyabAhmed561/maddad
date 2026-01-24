import { useState, useCallback } from "react";
import type { DonationFrequency } from "@/types/giving";

export interface RecurringDonation {
  id: string;
  amount: number;
  frequency: DonationFrequency;
  givingType: string;
  partner: string;
  status: "active" | "paused" | "cancelled";
  nextDate: string;
  createdAt: string;
}

interface UseRecurringDonationReturn {
  donations: RecurringDonation[];
  isLoading: boolean;
  pauseDonation: (id: string) => Promise<void>;
  resumeDonation: (id: string) => Promise<void>;
  cancelDonation: (id: string) => Promise<void>;
}

// Mock recurring donations for demonstration
const mockRecurringDonations: RecurringDonation[] = [
  {
    id: "rec-1",
    amount: 100,
    frequency: "monthly",
    givingType: "zakat",
    partner: "Islamic Relief",
    status: "active",
    nextDate: "2024-02-15",
    createdAt: "2023-12-15"
  },
  {
    id: "rec-2",
    amount: 50,
    frequency: "weekly",
    givingType: "meal-sponsorship",
    partner: "Community Iftar Network",
    status: "active",
    nextDate: "2024-01-28",
    createdAt: "2024-01-01"
  }
];

/**
 * Hook for managing recurring donations
 * In production, this would fetch from and sync with a backend
 */
export function useRecurringDonation(): UseRecurringDonationReturn {
  const [donations, setDonations] = useState<RecurringDonation[]>(mockRecurringDonations);
  const [isLoading, setIsLoading] = useState(false);

  const pauseDonation = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setDonations(prev => prev.map(d => 
      d.id === id ? { ...d, status: "paused" as const } : d
    ));
    setIsLoading(false);
  }, []);

  const resumeDonation = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setDonations(prev => prev.map(d => 
      d.id === id ? { ...d, status: "active" as const } : d
    ));
    setIsLoading(false);
  }, []);

  const cancelDonation = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setDonations(prev => prev.map(d => 
      d.id === id ? { ...d, status: "cancelled" as const } : d
    ));
    setIsLoading(false);
  }, []);

  return {
    donations,
    isLoading,
    pauseDonation,
    resumeDonation,
    cancelDonation
  };
}
