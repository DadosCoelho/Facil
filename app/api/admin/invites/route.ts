// Facil/app/api/admin/invites/route.ts
'use server';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth';
import { getCampaignById, getAllCampaigns } from '@/lib/firebase-db'; 
import { sign } from '@/lib/jwt'; 

type InviteBody = {
  campaignId?: string; 
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
      const allCampaigns = await getAllCampaigns();
      targetCampaign = allCampaigns.find(c => c.status === 'active');
    }

    if (!targetCampaign) {
      return NextResponse.json({ message: 'Campanha não especificada ou ativa não encontrada.' }, { status: 400 });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    let expSeconds: number;

    // =========================================================================
    // Lógica NOVO: Define a expiração do convite com base na data de fechamento da campanha
    // =========================================================================
    const defaultInviteExpirationDays = targetCampaign.inviteExpirationDaysDefault ?? 7; // Padrão da campanha ou 7 dias
    const minExpirationSeconds = nowSeconds + defaultInviteExpirationDays * 86400; // Mínimo de 7 dias a partir de agora

    if (targetCampaign.closesAt) {
      const closesAtDate = new Date(targetCampaign.closesAt);
      const closesAtSeconds = Math.floor(closesAtDate.getTime() / 1000);
      
      // Se a data de fechamento da campanha for no futuro, usa ela.
      // Caso contrário (se já passou ou for muito próximo), usa a validade mínima padrão.
      if (closesAtSeconds > nowSeconds) { // A data de fechamento da campanha ainda não passou
        expSeconds = closesAtSeconds;
      } else { // A data de fechamento já passou ou é hoje, então dá 7 dias (ou o default da campanha) a partir de agora
        expSeconds = minExpirationSeconds;
      }
    } else {
      // Se a campanha não tiver closesAt definido, usa a validade mínima padrão
      expSeconds = minExpirationSeconds;
    }
    // =========================================================================

    const inviteId = crypto.randomUUID();

    const payload = {
      inviteId,
      campaignId: targetCampaign.id,
      campaignName: targetCampaign.name,
      // O campo singleUse sempre será true, conforme seu pedido para remover a opção
      singleUse: true, 
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