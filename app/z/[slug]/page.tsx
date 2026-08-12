'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase, Workshop, Material, Finish, Style } from '@/lib/supabase';
import {
  calculatePrice,
  MATERIAL_LABELS,
  FINISH_LABELS,
  STYLE_LABELS,
} from '@/lib/pricing';

type Step = 'dimensions' | 'material' | 'finish' | 'style' | 'contact' | 'done';

const CARD_BG = '#211b16';
const CARD_BORDER = '#3a2f26';
const INPUT_BG = '#1c1712';
const TEXT_MUTED = '#a89a8c';
const TEXT_FAINT = '#8a8178';
const EMBER = '#ff5722';

export default function ConfiguratorPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState<Step>('dimensions');
  const [lengthMb, setLengthMb] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [material, setMaterial] = useState<Material | null>(null);
  const [finish, setFinish] = useState<Finish | null>(null);
  const [style, setStyle] = useState<Style | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadWorkshop() {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setWorkshop(data);
      }
      setLoading(false);
    }
    loadWorkshop();
  }, [slug]);

  const price = useMemo(() => {
    if (!workshop || !lengthMb || !material || !style) return null;
    const len = parseFloat(lengthMb);
    if (isNaN(len) || len <= 0) return null;
    return calculatePrice(workshop, len, material, style