import { useCallback } from 'react'
import { useDonationCheckout } from '@/hooks/useDonationCheckout'
import type { DonationCheckoutState, DonationCheckoutActions } from '@/hooks/useDonationCheckout'
import type { RecurringFrequency } from '@/lib/supabase'

// ── Extended state ────────────────────────────────────────────────────────────

export interface RecurringDonationCheckoutState extends DonationCheckoutState {
  // frequency is already in DonationCheckoutState ('one-time' | 'weekly' | 'monthly' | 'yearly')
  // This hook enforces that it is never 'one-time'.
}

export interface RecurringDonationCheckoutActions extends DonationCheckoutActions {
  setRecurringFrequency: (f: RecurringFrequency) => void
  submitRecurringDonation: (campaignId: string, confirmedTipAmount?: number) => Promise<{ clientSecret: string }>
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRecurringDonationCheckout(): [
  RecurringDonationCheckoutState,
  RecurringDonationCheckoutActions,
] {
  const [state, actions] = useDonationCheckout()

  // Ensure frequency is always a recurring value
  const setRecurringFrequency = useCallback(
    (f: RecurringFrequency) => actions.setFrequency(f),
    [actions]
  )

  // TODO: Replace with a dedicated create-subscription Edge Function once
  // Stripe Subscription wiring is implemented (Phase 2). For launch, recurring
  // donations use Payment Intents with frequency stored in metadata.
  // The create-payment-intent Edge Function already records frequency on the
  // donation row, enabling subscription migration without data changes.
  const submitRecurringDonation = useCallback(
    async (campaignId: string, confirmedTipAmount = 0): Promise<{ clientSecret: string }> => {
      if (state.frequency === 'one-time') {
        // Enforce recurring — default to monthly if caller forgot to set frequency
        actions.setFrequency('monthly')
      }
      return actions.submitDonation(campaignId, confirmedTipAmount)
    },
    [state.frequency, actions]
  )

  const extendedActions: RecurringDonationCheckoutActions = {
    ...actions,
    setRecurringFrequency,
    submitRecurringDonation,
  }

  return [state, extendedActions]
}
