'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase, Workshop, Material, Finish, Style, ProfileShape } from '@/lib/supabase';
import {
  calculatePrice,
  MATERIAL_LABELS,
  FINISH_LABELS,
  STYLE_LABELS,
  PROFILE_LABELS,
} from '@/lib/pricing';

type Step = 'dimensions' | 'material' | 'profile' | 'finish' | 'style' | 'contact' | 'done';
const STEP_ORDER: Step[] = ['dimensions', 'material', 'profile', 'finish', 'style', 'contact'];

const CARD_BG = '#211b16';
const CARD_BORDER = '#3a2f26';
const INPUT_BG = '#1c1712';
const TEXT_MUTED = '#a89a8c';
const TEXT_FAINT = '#8a8178';
const EMB