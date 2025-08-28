// app/api/admin/dashboard/route.ts
'use server';

import { NextResponse } from 'next/server';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth';
import { getCampaignById, getAllCampaigns } from '@/lib/firebase-db'; // NOVO: Importar funções de campanha

export async function GET(request: Request) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const campaignId = url.searchParams.get('campaignId');
  let selectedCampaign = null;

  if (campaignId) {
    selectedCampaign = await getCampaignById(campaignId);
  } else {
    // Se nenhum campaignId for fornecido, tenta encontrar a primeira campanha ativa como padrão
    const allCampaigns = await getAllCampaigns();
    selectedCampaign = allCampaigns.find(c => c.status === 'active') || allCampaigns[0];
  }

  // Dados mockados para o dashboard, usando o status da campanha
  const data = {
    totalBets: 128, // Idealmente, esses viriam de consultas às apostas associadas à campanha
    totalShares: 945, // Idem
    totalParticipants: 312, // Idem
    recentBets: 17, // Idem
    campaignStatus: selectedCampaign ? selectedCampaign.status : 'ended', // Usa status real da campanha Firebase
    campaignName: selectedCampaign ? selectedCampaign.name : 'Nenhuma Campanha Ativa',
    lastUpdate: new Date().toISOString(),
  };

  return NextResponse.json(data);
}