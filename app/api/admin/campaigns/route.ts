// app/api/admin/campaigns/route.ts
'use server';

import { NextResponse } from 'next/server';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth'; // Import custom auth utility
import { createCampaign, getAllCampaigns } from '@/lib/firebase-db';
import { Campaign } from '@/types/Campaign';

export async function GET(request: Request) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const campaigns = await getAllCampaigns();
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json({ message: 'Erro ao buscar campanhas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  let body: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>;
  try {
    body = await request.json();
    // Validação básica (validação mais detalhada com Zod pode ser adicionada)
    if (!body.name || !body.status || !body.pricePerShare || !body.numbersPerBet) {
      return NextResponse.json({ message: 'Dados mínimos da campanha ausentes.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  try {
    const newCampaign = await createCampaign(body);
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ message: 'Erro ao criar campanha' }, { status: 500 });
  }
}
