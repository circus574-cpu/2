import { Workshop, Material, Style, ProfileSize } from './supabase';

const WEIGHT_PER_MB: Record<Material, number> = {
  steel_black: 8,
  steel_inox: 8,
  aluminum: 4,
};

const STYLE_MULTIPLIER: Record<Style, number> = {
  vertical_bars: 1,
  glass: 1.4,
  cable: 1.15,
};

export const PROFILE_SIZES: ProfileSize[] = [
  '20x20',
  '25x25',
  '30x30',
  '40x40',
  '40x20',
  '50x30',
  '50x50',
];

export const PROFILE_LABELS: Record<ProfileSize, string> = {
  '20x20': 'Profil 20×20 mm',
  '25x25': 'Profil 25×25 mm',
  '30x30': 'Profil 30×30 mm',
  '40x40': 'Profil 40×40 mm',
  '40x20': 'Profil 40×20 mm',
  '50x30': 'Profil 50×30 mm',
  '50x50': 'Profil 50×50 mm',
};

export function pricePerKg(workshop: Workshop, material: Material): number {
  switch (material) {
    case 'steel_black':
      return workshop.price_steel_black;
    case 'steel_inox':
      return workshop.price_steel_inox;
    case 'aluminum':
      return workshop.price_aluminum;
  }
}

export function calculatePrice(
  workshop: Workshop,
  lengthMb: number,
  material: Material,
  style: Style,
  profileSize: ProfileSize
): { min: number; max: number; base: number } {
  const weight = WEIGHT_PER_MB[material];
  const pricePerKgValue = pricePerKg(workshop, material);
  const styleMultiplier = STYLE_MULTIPLIER[style];
  const profileMultiplier = workshop.profile_multipliers?.[profileSize] ?? 1;

  const base =
    (weight * pricePerKgValue + workshop.labor_price_per_mb) *
    lengthMb *
    styleMultiplier *
    profileMultiplier *
    (1 + workshop.margin_percent / 100);

  return {
    base: Math.round(base),
    min: Math.round(base * 0.85),
    max: Math.round(base * 1.15),
  };
}

export const MATERIAL_LABELS: Record<Material, string> = {
  steel_black: 'Stal czarna',
  steel_inox: 'Stal nierdzewna (inox)',
  aluminum: 'Aluminium',
};

export const FINISH_LABELS: Record<string, string> = {
  powder_coating: 'Malowanie proszkowe',
  galvanized: 'Cynkowanie',
  raw: 'Surowa',
};

export const STYLE_LABELS: Record<Style, string> = {
  vertical_bars: 'Pręty pionowe',
  glass: 'Szkło',
  cable: 'Linki stalowe',
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'Nowe',
  contacted: 'W kontakcie',
  accepted: 'Zaakceptowane',
  rejected: 'Odrzucone',
};