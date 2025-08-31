// Facil/app/api/campaign-bets/route.ts
'use server';

import { NextResponse } from 'next/server';
// Importe as funções que agora aceitam o paymentStatusFilter
import { getCampaignBetsFromFirebase, getCampaignById, getAllCampaigns, PaymentStatus } from '@/lib/firebase-db';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const campaignIdParam = url.searchParams.get('campaignId');
  const paymentStatusParam = url.searchParams.get('paymentStatus'); // NOVO: Captura o parâmetro paymentStatus

  let currentCampaignId: string | null = campaignIdParam;
  let campaignName: string = 'Campanha Desconhecida';

  // Se nenhum campaignId for fornecido via URL, tenta encontrar a campanha ativa
  if (!currentCampaignId) {
    const allCampaigns = await getAllCampaigns();
    const activeCampaign = allCampaigns.find(c => c.status === 'active');
    if (activeCampaign) {
      currentCampaignId = activeCampaign.id;
    } else if (allCampaigns.length > 0) {
        currentCampaignId = allCampaigns[0].id; // Fallback para a primeira campanha encontrada
    }
  }

  if (!currentCampaignId) {
    return NextResponse.json({ message: 'Nenhuma campanha encontrada ou especificada para exibir as apostas.' }, { status: 404 });
  }

  try {
    const campaign = await getCampaignById(currentCampaignId);
    if (campaign) {
      campaignName = campaign.name;
    }

    // Converta o parâmetro de string para o tipo PaymentStatus
    const filterStatus: PaymentStatus | undefined = 
        paymentStatusParam === 'pending' || paymentStatusParam === 'approved' || paymentStatusParam === 'rejected'
        ? (paymentStatusParam as PaymentStatus)
        : undefined;

    // Passe o filtro de status para a função do Firebase
    const bets = await getCampaignBetsFromFirebase(currentCampaignId, filterStatus);

    // Formata as apostas incluindo o nome do participante salvo
    const formattedBets = bets.map(bet => ({
      ...bet,
      participantName: bet.participantName || `Participante ${bet.inviteId.substring(0, 4)}...`, // Usa o nome salvo ou um placeholder
    }));

    // Calcula totais
    const totalBets = formattedBets.length;
    const totalShares = formattedBets.reduce((sum, bet) => sum + (bet.shares || 0), 0);

    return NextResponse.json({
      campaignId: currentCampaignId,
      campaignName,
      totalBets,
      totalShares,
      bets: formattedBets,
    });

  } catch (error) {
    console.error('Erro ao buscar dados das apostas da campanha:', error);
    return NextResponse.json({ message: 'Erro ao carregar dados do dashboard de apostas da campanha.' }, { status: 500 });
  }
}