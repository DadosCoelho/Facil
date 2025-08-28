// app/api/admin/invites/route.ts
'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth';
import { getCampaignById, getAllCampaigns } from '@/lib/firebase-db'; // NOVO: Funções de campanha para defaults
import { sign } from '@/lib/jwt'; 

type InviteBody = {
  campaignId?: string; // Agora se refere a um ID de Campanha do Firebase
  singleUse?: boolean;
  expDays?: number;
  participant?: { name?: string; email?: string };
};

export async function POST(request: Request) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  let body: InviteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  let targetCampaign = null;
  if (body.campaignId) {
    targetCampaign = await getCampaignById(body.campaignId);
  } else {
    // Se nenhum campaignId for fornecido, tenta encontrar a primeira ativa como padrão
    const allCampaigns = await getAllCampaigns();
    targetCampaign = allCampaigns.find(c => c.status === 'active');
  }

  if (!targetCampaign) {
    return NextResponse.json({ message: 'Campanha não especificada ou ativa não encontrada.' }, { status: 400 });
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const expSeconds = nowSeconds + Math.max(1, Math.floor((body.expDays ?? targetCampaign.inviteExpirationDaysDefault ?? 7) * 86400)); // Usa padrão da campanha ou 7 dias
  const inviteId = crypto.randomUUID();

  const payload = {
    inviteId,
    campaignId: targetCampaign.id,
    campaignName: targetCampaign.name,
    singleUse: body.singleUse ?? targetCampaign.singleUseInvitesDefault ?? true, // Usa padrão da campanha ou true
    exp: expSeconds,
    participant: body.participant || undefined,
  };

  const secret = process.env.JWT_SECRET || 'dev-secret';
  const signedToken = sign(payload, secret);

  const link = `${process.env.NEXT_PUBLIC_APP_URL || ''}/invite/${signedToken}`; 

  return NextResponse.json({
    link,
    tokenPreview: signedToken.slice(0, 24) + '…',
    inviteId,
    expiresAt: new Date(expSeconds * 1000).toISOString(),
    campaignId: payload.campaignId,
    campaignName: payload.campaignName,
  });
}