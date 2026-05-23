import { createClient } from '@supabase/supabase-js'

// ── Environment variable validation ───────────────────────────────────────
// Fail fast at module load time rather than at the first database call.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || supabaseUrl.trim() === '') {
  throw new Error(
    'VITE_SUPABASE_URL is missing. Add it to .env.local — see .env.example for all required variables.'
  )
}
if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
  throw new Error(
    'VITE_SUPABASE_ANON_KEY is missing. Add it to .env.local — see .env.example for all required variables.'
  )
}

// ── JSON ──────────────────────────────────────────────────────────────────
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ── Database type ─────────────────────────────────────────────────────────
// Manually maintained to match supabase/migrations/20260518000001_initial_schema.sql.
// When columns are added or changed, update this type to match.
export type Database = {
  public: {
    Tables: {

      // ── organizations ──────────────────────────────────────────────────
      organizations: {
        Row: {
          id: string
          legal_name: string
          display_name: string
          slug: string
          ontario_charity_registration_number: string | null
          description: string | null
          website_url: string | null
          logo_url: string | null
          contact_email: string | null
          contact_phone: string | null
          verification_status: Database['public']['Enums']['verification_status']
          trust_score: number | null
          lat: number | null
          lng: number | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          legal_name: string
          display_name: string
          slug: string
          ontario_charity_registration_number?: string | null
          description?: string | null
          website_url?: string | null
          logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          verification_status?: Database['public']['Enums']['verification_status']
          trust_score?: number | null
          lat?: number | null
          lng?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>
      }

      // ── campaigns ──────────────────────────────────────────────────────
      campaigns: {
        Row: {
          id: string
          campaign_type: Database['public']['Enums']['campaign_type']
          organization_id: string | null
          title: string
          slug: string
          description: string | null
          cover_image_url: string | null
          category: Database['public']['Enums']['campaign_category']
          giving_type: Database['public']['Enums']['giving_type'] | null
          zakat_eligible: boolean
          location_label: string
          lat: number | null
          lng: number | null
          country_code: string
          urgency: number
          goal_amount: number | null
          raised_amount: number
          currency: string
          beneficiary_name: string | null
          endorsed_by_name: string | null
          endorsed_by_type: 'masjid' | 'organization' | null
          verification_status: Database['public']['Enums']['verification_status']
          is_active: boolean
          coverage_items: Json
          privacy_level: string
          starts_at: string | null
          ends_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          campaign_type?: Database['public']['Enums']['campaign_type']
          organization_id?: string | null
          title: string
          slug: string
          description?: string | null
          cover_image_url?: string | null
          category: Database['public']['Enums']['campaign_category']
          giving_type?: Database['public']['Enums']['giving_type'] | null
          zakat_eligible?: boolean
          location_label: string
          lat?: number | null
          lng?: number | null
          country_code?: string
          urgency?: number
          goal_amount?: number | null
          raised_amount?: number
          currency?: string
          beneficiary_name?: string | null
          endorsed_by_name?: string | null
          endorsed_by_type?: 'masjid' | 'organization' | null
          verification_status?: Database['public']['Enums']['verification_status']
          is_active?: boolean
          coverage_items?: Json
          privacy_level?: string
          starts_at?: string | null
          ends_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>
      }

      // ── donors ─────────────────────────────────────────────────────────
      donors: {
        Row: {
          id: string
          full_name: string | null
          display_name: string | null
          email: string
          address_street: string | null
          address_city: string | null
          address_province: string | null
          address_postal_code: string | null
          address_country: string | null
          role: DonorRole
          stripe_customer_id: string | null
          marketing_consent: boolean
          data_deletion_requested_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string   // Must match auth.users.id — not auto-generated
          full_name?: string | null
          display_name?: string | null
          email: string
          address_street?: string | null
          address_city?: string | null
          address_province?: string | null
          address_postal_code?: string | null
          address_country?: string | null
          role?: DonorRole
          stripe_customer_id?: string | null
          marketing_consent?: boolean
          data_deletion_requested_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['donors']['Insert'], 'id'>>
      }

      // ── donations ──────────────────────────────────────────────────────
      donations: {
        Row: {
          id: string
          campaign_id: string
          donor_id: string | null
          giving_type: Database['public']['Enums']['giving_type']
          amount: number
          currency: string
          platform_fee_amount: number
          net_amount: number   // GENERATED ALWAYS AS (amount - platform_fee_amount)
          status: Database['public']['Enums']['donation_status']
          frequency: DonationFrequency
          recurring_donation_id: string | null
          is_anonymous: boolean
          hide_amount: boolean
          dua_intention: string | null
          stripe_payment_intent_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          donor_id?: string | null
          giving_type: Database['public']['Enums']['giving_type']
          amount: number
          currency?: string
          platform_fee_amount?: number
          // net_amount is GENERATED — omitted from Insert
          status?: Database['public']['Enums']['donation_status']
          frequency?: DonationFrequency
          recurring_donation_id?: string | null
          is_anonymous?: boolean
          hide_amount?: boolean
          dua_intention?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['donations']['Insert'], 'net_amount'>>
      }

      // ── receipts ───────────────────────────────────────────────────────
      receipts: {
        Row: {
          id: string
          donation_id: string
          receipt_serial_number: string   // Auto-generated by trigger
          charity_legal_name: string
          charity_registration_number: string
          donor_full_name: string
          // Shape: { street, city, province, postal_code, country }
          donor_address: Json
          donation_amount: number
          eligible_amount_for_tax: number
          currency: string
          donation_date: string           // ISO date string YYYY-MM-DD
          digital_signature_text: string
          is_anonymous: boolean
          pdf_storage_path: string | null
          email_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          receipt_serial_number?: string  // Omit to let trigger auto-generate
          charity_legal_name: string
          charity_registration_number: string
          donor_full_name: string
          donor_address: Json
          donation_amount: number
          eligible_amount_for_tax: number
          currency?: string
          donation_date: string
          digital_signature_text: string
          is_anonymous?: boolean
          pdf_storage_path?: string | null
          email_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['receipts']['Insert'], 'donation_id'>>
      }

      // ── recurring_donations ────────────────────────────────────────────
      recurring_donations: {
        Row: {
          id: string
          donor_id: string
          campaign_id: string | null
          giving_type: Database['public']['Enums']['giving_type']
          amount: number
          currency: string
          frequency: RecurringFrequency
          status: RecurringStatus
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          next_billing_date: string | null
          created_at: string
          updated_at: string
          cancelled_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          donor_id: string
          campaign_id?: string | null
          giving_type: Database['public']['Enums']['giving_type']
          amount: number
          currency?: string
          frequency: RecurringFrequency
          status?: RecurringStatus
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          next_billing_date?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['recurring_donations']['Insert'], 'donor_id'>>
      }

      // ── scheduled_donations ────────────────────────────────────────────
      scheduled_donations: {
        Row: {
          id: string
          donor_id: string
          campaign_id: string | null
          giving_type: Database['public']['Enums']['giving_type']
          amount: number
          currency: string
          scheduled_date: string        // YYYY-MM-DD
          status: ScheduledDonationStatus
          campaign_series: CampaignSeries | null
          stripe_payment_intent_id: string | null
          processed_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          donor_id: string
          campaign_id?: string | null
          giving_type: Database['public']['Enums']['giving_type']
          amount: number
          currency?: string
          scheduled_date: string
          status?: ScheduledDonationStatus
          campaign_series?: CampaignSeries | null
          stripe_payment_intent_id?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['scheduled_donations']['Insert'], 'donor_id'>>
      }

      // ── organization_applications ─────────────────────────────────────
      organization_applications: {
        Row: {
          id: string
          org_name: string
          org_type: 'registered_charity' | 'masjid' | 'university_msa' | 'community_group'
          province: string
          website_url: string | null
          org_description: string
          campaign_title: string
          campaign_type: string
          campaign_category: string
          campaign_goal_cad: number | null
          campaign_description: string
          zakat_eligible: boolean
          contact_name: string
          contact_role: string
          contact_email: string
          contact_phone: string | null
          cra_number: string | null
          how_heard: string | null
          document_paths: Json
          status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_needed'
          admin_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_organization_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          org_name: string
          org_type: 'registered_charity' | 'masjid' | 'university_msa' | 'community_group'
          province?: string
          website_url?: string | null
          org_description: string
          campaign_title: string
          campaign_type: string
          campaign_category: string
          campaign_goal_cad?: number | null
          campaign_description: string
          zakat_eligible?: boolean
          contact_name: string
          contact_role: string
          contact_email: string
          contact_phone?: string | null
          cra_number?: string | null
          how_heard?: string | null
          document_paths?: Json
          status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'more_info_needed'
          admin_notes?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_organization_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['organization_applications']['Insert']>
      }

      // ── maddad_waitlist ────────────────────────────────────────────────
      maddad_waitlist: {
        Row: {
          id: string
          email: string
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          source?: string
          created_at?: string
        }
        Update: {
          source?: string
        }
      }

      // ── verification_submissions ───────────────────────────────────────
      verification_submissions: {
        Row: {
          id: string
          submission_type: SubmissionType
          organization_id: string | null
          campaign_id: string | null
          status: Database['public']['Enums']['verification_status']
          submitted_by: string | null
          submitted_at: string | null
          submitter_notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          submission_type: SubmissionType
          organization_id?: string | null
          campaign_id?: string | null
          status?: Database['public']['Enums']['verification_status']
          submitted_by?: string | null
          submitted_at?: string | null
          submitter_notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['verification_submissions']['Insert']>
      }

      // ── verification_decisions ─────────────────────────────────────────
      verification_decisions: {
        Row: {
          id: string
          submission_id: string
          decided_by: string | null
          decision: 'under_review' | 'approved' | 'rejected'
          notes: string | null
          decided_at: string
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          decided_by?: string | null
          decision: 'under_review' | 'approved' | 'rejected'
          notes?: string | null
          decided_at?: string
          created_at?: string
        }
        Update: never   // Append-only table
      }

      // ── evidence_items ─────────────────────────────────────────────────
      evidence_items: {
        Row: {
          id: string
          submission_id: string | null
          campaign_id: string | null
          organization_id: string | null
          evidence_type: Database['public']['Enums']['evidence_type']
          title: string
          description: string | null
          status: EvidenceStatus
          confidence_score: number
          visibility: EvidenceVisibility
          evidence_date: string | null
          submitted_by: string | null
          verifier_display_name: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          submission_id?: string | null
          campaign_id?: string | null
          organization_id?: string | null
          evidence_type: Database['public']['Enums']['evidence_type']
          title: string
          description?: string | null
          status?: EvidenceStatus
          confidence_score?: number
          visibility?: EvidenceVisibility
          evidence_date?: string | null
          submitted_by?: string | null
          verifier_display_name?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['evidence_items']['Insert']>
      }

      // ── evidence_media ─────────────────────────────────────────────────
      evidence_media: {
        Row: {
          id: string
          evidence_id: string
          url: string
          storage_path: string | null
          media_type: MediaType
          thumbnail_url: string | null
          caption: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          evidence_id: string
          url: string
          storage_path?: string | null
          media_type: MediaType
          thumbnail_url?: string | null
          caption?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['evidence_media']['Insert'], 'evidence_id'>>
      }

      // ── campaign_updates ───────────────────────────────────────────────
      campaign_updates: {
        Row: {
          id: string
          campaign_id: string
          title: string
          content: string
          progress_percent: number | null
          posted_by: string | null
          posted_at: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          content: string
          progress_percent?: number | null
          posted_by?: string | null
          posted_at?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['campaign_updates']['Insert'], 'campaign_id'>>
      }

      // ── campaign_update_media ──────────────────────────────────────────
      campaign_update_media: {
        Row: {
          id: string
          update_id: string
          url: string
          storage_path: string | null
          media_type: 'image' | 'video'
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          update_id: string
          url: string
          storage_path?: string | null
          media_type?: 'image' | 'video'
          sort_order?: number
          created_at?: string
        }
        Update: Partial<Omit<Database['public']['Tables']['campaign_update_media']['Insert'], 'update_id'>>
      }

      // ── supporter_messages ─────────────────────────────────────────────
      supporter_messages: {
        Row: {
          id: string
          campaign_id: string
          donation_id: string | null
          donor_id: string | null
          message: string
          is_anonymous: boolean
          display_name: string
          posted_at: string
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          donation_id?: string | null
          donor_id?: string | null
          message: string
          is_anonymous?: boolean
          display_name: string
          posted_at?: string
          created_at?: string
          deleted_at?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['supporter_messages']['Insert'], 'campaign_id'>>
      }

      // ── update_subscriptions ───────────────────────────────────────────
      update_subscriptions: {
        Row: {
          id: string
          campaign_id: string
          donor_id: string | null
          email: string | null
          whatsapp: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          donor_id?: string | null
          email?: string | null
          whatsapp?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: Partial<Omit<Database['public']['Tables']['update_subscriptions']['Insert'], 'campaign_id'>>
      }

      // ── donation_audit_log ─────────────────────────────────────────────
      donation_audit_log: {
        Row: {
          id: string
          donation_id: string
          previous_status: Database['public']['Enums']['donation_status'] | null
          new_status: Database['public']['Enums']['donation_status']
          changed_by: string | null
          event_type: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          donation_id: string
          previous_status?: Database['public']['Enums']['donation_status'] | null
          new_status: Database['public']['Enums']['donation_status']
          changed_by?: string | null
          event_type: string
          metadata?: Json | null
          created_at?: string
        }
        Update: never   // Append-only table
      }
    }

    Views: {
      // ── platform_stats ─────────────────────────────────────────────────
      // Live aggregate stats for /impact page. All values in CAD.
      // deleted_at IS NULL filter present on all donation aggregates.
      platform_stats: {
        Row: {
          total_raised_cad: number
          total_donors: number
          total_donations: number
          active_campaigns: number
          verified_organizations: number
          regions_covered: number
          total_zakat_raised_cad: number
          total_zakat_donations: number
        }
      }
    }

    Enums: {
      campaign_category:
        | 'food'
        | 'shelter'
        | 'medical'
        | 'education'
        | 'masjid'
        | 'fidya'
        | 'qurbani'
        | 'zakat'

      giving_type:
        | 'zakat'
        | 'fidya'
        | 'kaffarah'
        | 'qurbani'
        | 'sadaqah_jariyah'
        | 'meal_sponsorship'
        | 'sadaqah'

      campaign_type:
        | 'need'
        | 'appeal'
        | 'community_appeal'

      verification_status:
        | 'draft'
        | 'submitted'
        | 'under_review'
        | 'approved'
        | 'rejected'

      evidence_type:
        | 'org_registration'
        | 'org_financial_audit'
        | 'org_board_resolution'
        | 'org_tax_status'
        | 'campaign_need_photo'
        | 'campaign_need_video'
        | 'campaign_budget_breakdown'
        | 'campaign_endorsement_letter'
        | 'campaign_beneficiary_consent'
        | 'campaign_referral_attestation'
        | 'campaign_document_proof'
        | 'campaign_budget_quote'
        | 'campaign_verifier_interview'
        | 'milestone_progress_photo'
        | 'milestone_progress_video'
        | 'milestone_receipt'
        | 'milestone_delivery_confirmation'
        | 'milestone_completion_report'
        | 'milestone_beneficiary_feedback'

      donation_status:
        | 'pending'
        | 'processing'
        | 'succeeded'
        | 'failed'
        | 'refunded'
        | 'disputed'
    }

    Functions: Record<string, never>
  }
}

// ── Narrow types for CHECK-constraint columns ──────────────────────────────
// These are DB-enforced string constraints (not Postgres enums).
// Typed here so the app never passes an invalid value.

export type DonorRole = 'donor' | 'charity_admin' | 'verifier' | 'platform_admin'
export type DonationFrequency = 'one-time' | 'weekly' | 'monthly' | 'yearly'
export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly'
export type RecurringStatus = 'active' | 'paused' | 'cancelled'
export type SubmissionType = 'organization' | 'campaign'
export type EvidenceStatus = 'pending' | 'approved' | 'rejected'
export type EvidenceVisibility = 'public' | 'private'
export type MediaType = 'image' | 'video' | 'pdf' | 'link'
export type ScheduledDonationStatus = 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled'
export type CampaignSeries = 'dhul_hijjah' | 'ramadan' | 'custom'

// ── Convenience type helpers ───────────────────────────────────────────────
// Usage:  Tables<'campaigns'>        → the Row type
//         InsertTables<'donations'>  → the Insert type
//         UpdateTables<'receipts'>   → the Update type
//         Enums<'giving_type'>       → the enum union

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

// ── Named row types (import these throughout the app) ─────────────────────
export type Organization         = Tables<'organizations'>
export type Campaign             = Tables<'campaigns'>
export type Donor                = Tables<'donors'>
export type Donation             = Tables<'donations'>
export type Receipt              = Tables<'receipts'>
export type RecurringDonation    = Tables<'recurring_donations'>
export type ScheduledDonation    = Tables<'scheduled_donations'>
export type VerificationSubmission = Tables<'verification_submissions'>
export type VerificationDecision = Tables<'verification_decisions'>
export type EvidenceItem         = Tables<'evidence_items'>
export type EvidenceMedia        = Tables<'evidence_media'>
export type CampaignUpdate       = Tables<'campaign_updates'>
export type SupporterMessage     = Tables<'supporter_messages'>
export type UpdateSubscription   = Tables<'update_subscriptions'>
export type DonationAuditLog     = Tables<'donation_audit_log'>
export type PlatformStats        = Database['public']['Views']['platform_stats']['Row']

// ── Named enum types ───────────────────────────────────────────────────────
export type CampaignCategory     = Enums<'campaign_category'>
export type GivingType           = Enums<'giving_type'>
export type CampaignType         = Enums<'campaign_type'>
export type VerificationStatus   = Enums<'verification_status'>
export type EvidenceTypeEnum     = Enums<'evidence_type'>
export type DonationStatus       = Enums<'donation_status'>

// ── Donor address shape (stored as JSONB on receipts) ─────────────────────
export interface DonorAddress {
  street: string
  city: string
  province: string
  postal_code: string
  country: string
}

// ── Typed Supabase client ──────────────────────────────────────────────────
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage across page refreshes
    persistSession: true,
    // Auto-refresh the JWT before it expires
    autoRefreshToken: true,
    // Detect session from URL hash after OAuth redirects
    detectSessionInUrl: true,
  },
})
