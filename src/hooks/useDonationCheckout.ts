import { useState, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { STRIPE_CONFIG } from '@/lib/stripe'
import { useAuth } from '@/hooks/useAuth'
import type { GivingType, DonationFrequency } from '@/lib/supabase'

export type CheckoutStep = 'amount' | 'details' | 'tip' | 'payment' | 'confirmation'

// ── Request / response shape shared with the create-payment-intent Edge Function
export interface CreatePaymentIntentRequest {
  campaignId: string
  amount: number
  givingType: GivingType
  frequency: DonationFrequency
  tipAmount: number
  coverFees: boolean
  isAnonymous: boolean
  donorId: string | null
}

export interface CreatePaymentIntentResponse {
  clientSecret: string
}

export interface DonationCheckoutState {
  // Inputs
  amount: number
  givingType: GivingType
  frequency: DonationFrequency
  isAnonymous: boolean
  hideAmount: boolean
  duaIntention: string
  tipAmount: number     // confirmed tip (set when tip step resolves; 0 = not yet chosen or skipped)
  coverFees: boolean
  step: CheckoutStep
  // Computed
  processingFee: number
  totalCharged: number
  charityReceives: number // = amount (platform fee is 0)
  // Meta
  isSubmitting: boolean
  error: string | null
}

export interface DonationCheckoutActions {
  setAmount: (n: number) => void
  setGivingType: (t: GivingType) => void
  setFrequency: (f: DonationFrequency) => void
  setIsAnonymous: (v: boolean) => void
  setHideAmount: (v: boolean) => void
  setDuaIntention: (v: string) => void
  setTipAmount: (n: number) => void
  setCoverFees: (v: boolean) => void
  nextStep: () => void
  prevStep: () => void
  // confirmedTipAmount is passed explicitly to avoid stale closure issues
  submitDonation: (campaignId: string, confirmedTipAmount: number) => Promise<{ clientSecret: string }>
  clearError: () => void
}

const STEPS: CheckoutStep[] = ['amount', 'details', 'tip', 'payment', 'confirmation']

export function useDonationCheckout(): [DonationCheckoutState, DonationCheckoutActions] {
  const { user } = useAuth()

  const [amount, setAmountState] = useState(50)
  const [givingType, setGivingTypeState] = useState<GivingType>('sadaqah')
  const [frequency, setFrequencyState] = useState<DonationFrequency>('one-time')
  const [isAnonymous, setIsAnonymousState] = useState(false)
  const [hideAmount, setHideAmountState] = useState(false)
  const [duaIntention, setDuaIntentionState] = useState('')
  const [tipAmount, setTipAmountState] = useState(0)
  const [coverFees, setCoverFeesState] = useState(false)
  const [step, setStep] = useState<CheckoutStep>('amount')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Computed values ─────────────────────────────────────────────────────────
  // CAD Stripe rate: 2.9% + $0.30
  const processingFee = useMemo(
    () => Math.round((amount * 0.029 + 0.3) * 100) / 100,
    [amount]
  )
  // Platform fee is 0 — charity receives the full donation amount
  const charityReceives = amount
  const totalCharged = useMemo(
    () =>
      Math.round(
        (coverFees ? amount + processingFee + tipAmount : amount + tipAmount) * 100
      ) / 100,
    [amount, processingFee, tipAmount, coverFees]
  )

  // ── Setters ─────────────────────────────────────────────────────────────────
  const setAmount = useCallback((n: number) => setAmountState(n), [])
  const setGivingType = useCallback((t: GivingType) => {
    setGivingTypeState(t)
    if (!STRIPE_CONFIG.feeCoverableGivingTypes.includes(t)) {
      setCoverFeesState(false)
    }
  }, [])
  const setFrequency = useCallback((f: DonationFrequency) => setFrequencyState(f), [])
  const setIsAnonymous = useCallback((v: boolean) => setIsAnonymousState(v), [])
  const setHideAmount = useCallback((v: boolean) => setHideAmountState(v), [])
  const setDuaIntention = useCallback((v: string) => setDuaIntentionState(v), [])
  const setTipAmount = useCallback((n: number) => setTipAmountState(n), [])
  const setCoverFees = useCallback((v: boolean) => setCoverFeesState(v), [])
  const clearError = useCallback(() => setError(null), [])

  // ── Step navigation ─────────────────────────────────────────────────────────
  const nextStep = useCallback(() => {
    setStep(s => {
      const idx = STEPS.indexOf(s)
      return STEPS[idx + 1] ?? s
    })
  }, [])
  const prevStep = useCallback(() => {
    setStep(s => {
      const idx = STEPS.indexOf(s)
      return STEPS[idx - 1] ?? s
    })
  }, [])

  // ── Submission ──────────────────────────────────────────────────────────────
  const submitDonation = useCallback(
    async (campaignId: string, confirmedTipAmount: number): Promise<{ clientSecret: string }> => {
      setIsSubmitting(true)
      setError(null)
      // Store for confirmation display
      setTipAmountState(confirmedTipAmount)

      const body: CreatePaymentIntentRequest = {
        campaignId,
        amount,
        givingType,
        frequency,
        tipAmount: confirmedTipAmount,
        coverFees,
        isAnonymous,
        donorId: user?.id ?? null,
      }

      const { data, error: fnError } = await supabase.functions.invoke<CreatePaymentIntentResponse>(
        'create-payment-intent',
        { body }
      )

      setIsSubmitting(false)

      if (fnError || !data?.clientSecret) {
        const msg = fnError?.message ?? 'Failed to initiate payment. Please try again.'
        setError(msg)
        throw new Error(msg)
      }

      return { clientSecret: data.clientSecret }
    },
    [amount, givingType, frequency, coverFees, isAnonymous, user]
  )

  const state: DonationCheckoutState = {
    amount,
    givingType,
    frequency,
    isAnonymous,
    hideAmount,
    duaIntention,
    tipAmount,
    coverFees,
    step,
    processingFee,
    totalCharged,
    charityReceives,
    isSubmitting,
    error,
  }

  const actions: DonationCheckoutActions = {
    setAmount,
    setGivingType,
    setFrequency,
    setIsAnonymous,
    setHideAmount,
    setDuaIntention,
    setTipAmount,
    setCoverFees,
    nextStep,
    prevStep,
    submitDonation,
    clearError,
  }

  return [state, actions]
}
