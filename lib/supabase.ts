import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Workshop = {
  id: string;
  name: string;
  slug: string;
  contact_email: string | null;
  contact_phone: string | null;
  price_steel_black: number;
  price_steel_inox: number;
  price_aluminum: number;
  labor_price_per_mb: number;
  margin_percent: number;
};

export type Material = 'steel_black' | 'steel_inox' | 'aluminum';
export type Finish = 'powder_coating' | 'galvanized' | 'raw';
export type Style = 'vertical_bars' | 'glass' | 'cable';
export type ProfileShape = 'square' | 'rectangular';
export type RequestStatus = 'new' | 'contacted' | 'accepted' | 'rejected';

export type ConfiguratorRequest = {
  id: string;
  workshop_id: string;
  length_mb: number;
  height_cm: number;
  material: Material;
  finish: Finish;
  style: Style;
  profile_shape: ProfileShape;
  estimated_price_min: number | null;
  estimated_price_max: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  notes: string | null;
  status: RequestStatus;
  created_at: string;
};