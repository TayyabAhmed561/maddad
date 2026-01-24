import { useState, useCallback } from "react";
import type { DonationFrequency, GivingPartner, DonorPreferences } from "@/types/giving";

export interface DonationState {
  amount: number;
  customAmount: string;
  frequency: DonationFrequency;
  selectedPartner: GivingPartner | null;
  anonymous: boolean;
  hideAmount: boolean;
  duaIntention: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

export interface DonationActions {
  setAmount: (amount: number) => void;
  setCustomAmount: (value: string) => void;
  setFrequency: (frequency: DonationFrequency) => void;
  setSelectedPartner: (partner: GivingPartner | null) => void;
  setAnonymous: (value: boolean) => void;
  setHideAmount: (value: boolean) => void;
  setDuaIntention: (value: string) => void;
  processDonation: () => Promise<void>;
  reset: () => void;
}

const initialState: DonationState = {
  amount: 0,
  customAmount: "",
  frequency: "one-time",
  selectedPartner: null,
  anonymous: true,
  hideAmount: false,
  duaIntention: "",
  isLoading: false,
  isSuccess: false,
  error: null
};

interface UseDonationOptions {
  defaultAmount?: number;
  defaultFrequency?: DonationFrequency;
  defaultAnonymous?: boolean;
  onSuccess?: (donationData: DonorPreferences & { amount: number }) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for managing donation state and logic
 * Used across all giving pages to maintain consistency
 */
export function useDonation(options: UseDonationOptions = {}): [DonationState, DonationActions] {
  const {
    defaultAmount = 0,
    defaultFrequency = "one-time",
    defaultAnonymous = true,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<DonationState>({
    ...initialState,
    amount: defaultAmount,
    frequency: defaultFrequency,
    anonymous: defaultAnonymous
  });

  const setAmount = useCallback((amount: number) => {
    setState(prev => ({ ...prev, amount, customAmount: "" }));
  }, []);

  const setCustomAmount = useCallback((value: string) => {
    setState(prev => ({ 
      ...prev, 
      customAmount: value,
      amount: parseFloat(value) || 0
    }));
  }, []);

  const setFrequency = useCallback((frequency: DonationFrequency) => {
    setState(prev => ({ ...prev, frequency }));
  }, []);

  const setSelectedPartner = useCallback((partner: GivingPartner | null) => {
    setState(prev => ({ ...prev, selectedPartner: partner }));
  }, []);

  const setAnonymous = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, anonymous: value }));
  }, []);

  const setHideAmount = useCallback((value: boolean) => {
    setState(prev => ({ ...prev, hideAmount: value }));
  }, []);

  const setDuaIntention = useCallback((value: string) => {
    setState(prev => ({ ...prev, duaIntention: value }));
  }, []);

  const processDonation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call - in production this would be a real backend call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const donationData: DonorPreferences & { amount: number } = {
        amount: state.customAmount ? parseFloat(state.customAmount) || 0 : state.amount,
        anonymous: state.anonymous,
        hideAmount: state.hideAmount,
        frequency: state.frequency,
        duaIntention: state.duaIntention || undefined
      };

      setState(prev => ({ ...prev, isLoading: false, isSuccess: true }));
      onSuccess?.(donationData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Donation failed");
      setState(prev => ({ ...prev, isLoading: false, error: error.message }));
      onError?.(error);
    }
  }, [state, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      ...initialState,
      amount: defaultAmount,
      frequency: defaultFrequency,
      anonymous: defaultAnonymous
    });
  }, [defaultAmount, defaultFrequency, defaultAnonymous]);

  const actions: DonationActions = {
    setAmount,
    setCustomAmount,
    setFrequency,
    setSelectedPartner,
    setAnonymous,
    setHideAmount,
    setDuaIntention,
    processDonation,
    reset
  };

  return [state, actions];
}

/**
 * Get the effective donation amount from state
 */
export function getEffectiveAmount(state: DonationState): number {
  return state.customAmount ? parseFloat(state.customAmount) || 0 : state.amount;
}
