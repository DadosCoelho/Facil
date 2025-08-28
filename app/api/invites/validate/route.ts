// app/api/invites/validate/route.ts
'use server';

import { NextResponse } from 'next/server';
import { verifyInviteToken } from '@/lib/jwt';
import { getCampaignById } from '@/lib/firebase-db'; // NOVO: Importar para verificar status da campanha
import { CampaignStatus } from '@/types/Campaign'; // NOVO: Importar tipo

export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  const token = body.token;
  if (!token) return NextResponse.json({ message: 'Token ausente' }, { status: 400 });

  try {
    const payload = await verifyInviteToken(token);

    if (!payload?.exp || typeof payload.exp !== 'number') {
      return NextResponse.json({ message: 'Token sem expiração' }, { status: 400 });
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSeconds) {
      return NextResponse.json({ message: 'Token expirado' }, { status: 401 });
    }

    // NOVO: Verificar se a campanha associada ao invite está ativa
    const campaignId = payload.campaignId;
    if (!campaignId) {
      return NextResponse.json({ message: 'Token de convite sem ID de campanha' }, { status: 400 });
    }
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return NextResponse.json({ message: 'Campanha associada ao convite não encontrada' }, { status: 404 });
    }
    if (campaign.status !== 'active') {
      return NextResponse.json({ message: `Campanha "${campaign.name}" está ${campaign.status}` }, { status: 403 });
    }

    return NextResponse.json({
      inviteId: payload.inviteId,
      campaignId: payload.campaignId,
      campaignName: campaign.name, // Usar o nome da campanha do Firebase
      singleUse: payload.singleUse,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
      participant: payload.participant || null,
      // NOVO: Adicionar informações da campanha que podem ser úteis para o frontend
      campaignDetails: {
        campaignName: campaign.name, // Adiciona o nome da campanha para acesso fácil
        pricePerShare: campaign.pricePerShare,
        numbersPerBet: campaign.numbersPerBet,
        pixKey: campaign.pixKey,
        pixInstructions: campaign.pixInstructions,
      }
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message || 'Token inválido' }, { status: 401 });
  }
}