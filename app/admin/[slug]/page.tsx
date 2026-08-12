'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  supabase,
  Workshop,
  ConfiguratorRequest,
  RequestStatus,
} from '@/lib/supabase';
import {
  MATERIAL_LABELS,
  FINISH_LABELS,
  STYLE_LABELS,
  STATUS_LABELS,
} from '@/lib/pricing';

const CARD_BG = '#211b16';
const CARD_BORDER = '#3a2f26';
const INPUT_BG = '#1c1712';
const TEXT_MUTED = '#a89a8c';
const TEXT_FAINT = '#8a8178';
const EMBER = '#ff5722';

export default function AdminPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [requests, setRequests] = useState<ConfiguratorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'requests' | 'settings'>('requests');
  const [savedMsg, setSavedMsg] = useState(false);

  const [priceSteelBlack, setPriceSteelBlack] = useState('');
  const [priceSteelInox, setPriceSteelInox] = useState('');
  const [priceAluminum, setPriceAluminum] = useState('');
  const [laborPrice, setLaborPrice] = useState('');
  const [margin, setMargin] = useState('');

  async function loadData() {
    const { data: ws } = await supabase
      .from('workshops')
      .select('*')
      .eq('slug', slug)
      .single();

    if (ws) {
      setWorkshop(ws);
      setPriceSteelBlack(String(ws.price_steel_black));
      setPriceSteelInox(String(ws.price_steel_inox));
      setPriceAluminum(String(ws.price_aluminum));
      setLaborPrice(String(ws.labor_price_per_mb));
      setMargin(String(ws.margin_percent));

      const { data: reqs } = await supabase
        .from('configurator_requests')
        .select('*')
        .eq('workshop_id', ws.id)
        .order('created_at', { ascending: false });

      setRequests(reqs || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function updateStatus(id: string, status: Requ