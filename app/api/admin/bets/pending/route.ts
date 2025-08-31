// Facil/app/api/admin/bets/pending/route.ts
'use server';

import { NextResponse } from 'next/server';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth';
// Mude a importação para a nova função agrupada
import { getPendingInviteGroupsByCampaign } from '@/lib/firebase-db'; 

export async function GET(request: Request) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const campaignId = url.searchParams.get('campaignId'); // NOVO: Captura o campaignId do parâmetro de busca

  try {
    // Passa o campaignId para a função do Firebase. Se não for fornecido, a função busca todos os pendentes.
    const pendingInviteGroups = await getPendingInviteGroupsByCampaign(campaignId || undefined); 
    return NextResponse.json(pendingInviteGroups);
  } catch (error) {
    console.error('Erro ao buscar convites pendentes:', error);
    return NextResponse.json({ message: 'Erro ao carregar convites pendentes.' }, { status: 500 });
  }
}