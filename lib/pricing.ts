import { Workshop, Material, Style, ProfileShape } from './supabase';

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

const PROFILE_MULTIPLIER: Record<ProfileShape, number> = {
  square: 1,
  rectangular: 1.08,
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
  profileShape: ProfileShape
): { min: number; max: number; base: number } {
  const weight = WEIGHT_PER_MB[material];
  const pricePerKgValue = pricePerKg(workshop, material);
  const styleMultiplier = STYLE_MULTIPLIER[style];
  const profileMultiplier = PROFILE_MULTIPLIER[profileShape];

  const base =
    (weight * pricePerKgValue + workshop.labor_price_per_mb) *
    lengthMb *
    styleMultiplier *
    profileMultiplier *
    (1 + workshop.margin_percent / 100);

  return {
    base: Math.round(base),
    min: Math.round(base * 0.