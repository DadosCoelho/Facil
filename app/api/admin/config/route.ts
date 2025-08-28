// app/api/admin/config/route.ts
'use server';

import { NextResponse } from 'next/server';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth';
import { getCampaignById, updateCampaign, getAllCampaigns } from '@/lib/firebase-db'; // NOVO: Funções de campanha
import { Campaign } from '@/types/Campaign'; // NOVO: Importar tipo Campaign

export async function GET(request: Request) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const campaignId = url.searchParams.get('campaignId');
  let campaign: Campaign | null = null;

  if (campaignId) {
    campaign = await getCampaignById(campaignId);
  } else {
    // Se nenhum campaignId específico, tenta encontrar uma ativa ou a primeira disponível
    const allCampaigns = await getAllCampaigns();
    campaign = allCampaigns.find(c => c.status === 'active') || allCampaigns[0] || null;
  }

  if (!campaign) {
    return NextResponse.json({ message: 'Nenhuma campanha encontrada ou selecionada' }, { status: 404 });
  }

  // Adapta o objeto Campaign para a estrutura esperada (similar ao antigo AppConfig)
  const appConfigResponse = {
    campaignId: campaign.id,
    campaignName: campaign.name,
    status: campaign.status,
    updatedAt: campaign.updatedAt,
    pricePerShare: campaign.pricePerShare,
    numbersPerBet: campaign.numbersPerBet,
    pixKey: campaign.pixKey,
    pixInstructions: campaign.pixInstructions,
    // Novos campos da campanha que podem ser expostos se necessário
    minSharesPerBet: campaign.minSharesPerBet,
    maxSharesPerBet: campaign.maxSharesPerBet,
    singleUseInvitesDefault: campaign.singleUseInvitesDefault,
    inviteExpirationDaysDefault: campaign.inviteExpirationDaysDefault,
  };

  return NextResponse.json(appConfigResponse);
}

export async function POST(request: Request) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const campaignId = url.searchParams.get('campaignId'); // Espera campaignId para atualização
  if (!campaignId) {
    return NextResponse.json({ message: 'ID da campanha ausente para atualização' }, { status: 400 });
  }

  let body: Partial<Omit<Campaign, 'id' | 'createdAt'>>;
  try {
    body = await request.json();
    if (body.status && !['active','paused','ended'].includes(body.status as any)) {
      return NextResponse.json({ message: 'Status inválido' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
  }

  try {
    const updated = await updateCampaign(campaignId, body);
    // Mapeia de volta para a estrutura esperada
    const appConfigResponse = {
      campaignId: updated.id,
      campaignName: updated.name,
      status: updated.status,
      updatedAt: updated.updatedAt,
      pricePerShare: updated.pricePerShare,
      numbersPerBet: updated.numbersPerBet,
      pixKey: updated.pixKey,
      pixInstructions: updated.pixInstructions,
      minSharesPerBet: updated.minSharesPerBet,
      maxSharesPerBet: updated.maxSharesPerBet,
      singleUseInvitesDefault: updated.singleUseInvitesDefault,
      inviteExpirationDaysDefault: updated.inviteExpirationDaysDefault,
    };
    return NextResponse.json(appConfigResponse);
  } catch (error) {
    console.error(`Failed to update campaign ${campaignId} config:`, error);
    return NextResponse.json({ message: 'Erro ao atualizar configuração da campanha' }, { status: 500 });
  }
}