// app/api/admin/campaigns/[id]/route.ts
'use server';

import { NextResponse } from 'next/server';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth';
import { getCampaignById, updateCampaign, deleteCampaign } from '@/lib/firebase-db';
import { Campaign } from '@/types/Campaign';

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  const { id } = params;
  try {
    const campaign = await getCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ message: 'Campanha não encontrada' }, { status: 404 });
    }
    return NextResponse.json(campaign);
  } catch (error) {
    console.error(`Failed to fetch campaign ${id}:`, error);
    return NextResponse.json({ message: 'Erro ao buscar campanha' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  const { id } = params;
  let body: Partial<Omit<Campaign, 'id' | 'createdAt'>>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  try {
    const updatedCampaign = await updateCampaign(id, body);
    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error(`Failed to update campaign ${id}:`, error);
    return NextResponse.json({ message: 'Erro ao atualizar campanha' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  const { id } = params;
  try {
    await deleteCampaign(id);
    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete campaign ${id}:`, error);
    return NextResponse.json({ message: 'Erro ao remover campanha' }, { status: 500 });
  }
}