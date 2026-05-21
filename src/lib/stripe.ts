import { loadStripe } from '@stripe/stripe-js'
import type { GivingType } from '@/lib/supabase'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined

if (!publishableKey || publishableKey.trim() === '') {
  throw new Error(
    'VITE_STRIPE_PUBLISHABLE_KEY is missing. Add it to .env.local — see .env.example for required variables.'
  )
}

// Singleton — calling loadStripe multiple times with the same key returns
// the same cached Promise. Store it here so JSX imports share one instance.
export const stripePromise = loadStripe(publishableKey)

export const STRIPE_CONFIG = {
  currency: 'cad' as const,

  // Giving types where the donor can opt in to cover Stripe processing fees
  // so that 100% of the donation reaches the campaign.
  feeCoverableGivingTypes: ['zakat', 'fidya', 'kaffarah'] as GivingType[],

  // Default tip percentage pre-selected in checkout
  defaultTipPercent: 10,

  // Quick-select tip options shown as buttons
  tipOptions: [5, 10, 15, 20] as const,

  // Maddad operational fee deducted from each donation before org payout (%)
  platformFeePercent: 3,
} as const
