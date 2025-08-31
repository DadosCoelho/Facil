// Facil/app/api/bets/authorize/route.ts
'use server';

import { NextResponse } from 'next/server';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth';
import { updateBetPaymentStatus, PaymentStatus } from '@/lib/firebase-db';

export async function POST(request: Request) {
  console.log('--- [API: /api/admin/bets/authorize] Início da requisição POST ---');
  
  // 1. Verificação de Autenticação Admin
  if (!ensureAdmin(request)) {
    console.warn('[API: authorize] Tentativa de acesso não autorizado.');
    return unauthorizedResponse();
  }
  console.log('[API: authorize] Admin autenticado com sucesso.');

  let body: { betId: string; status: PaymentStatus };
  try {
    // 2. Parse do Corpo da Requisição
    body = await request.json();
    console.log('[API: authorize] Corpo da requisição recebido:', body);

    // 3. Validação do Corpo da Requisição
    if (!body.betId || !['approved', 'rejected'].includes(body.status)) {
      console.warn('[API: authorize] Dados inválidos no corpo da requisição:', body);
      return NextResponse.json({ message: 'ID da aposta ou status inválido.' }, { status: 400 });
    }
  } catch (parseError) {
    console.error('[API: authorize] Erro ao fazer parse do JSON ou dados ausentes:', parseError);
    return NextResponse.json({ message: 'JSON inválido ou malformado.' }, { status: 400 });
  }

  try {
    // 4. Chamada para Atualizar Status no Firebase
    console.log(`[API: authorize] Iniciando atualização da aposta ${body.betId} para o status: ${body.status}.`);
    await updateBetPaymentStatus(body.betId, body.status);
    console.log(`[API: authorize] Aposta ${body.betId} atualizada com sucesso para ${body.status}.`);
    
    // 5. Sucesso
    return NextResponse.json({ success: true, message: `Aposta ${body.betId} ${body.status === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso.` });
  } catch (error) {
    // 6. Erro na Lógica de Negócio (Firebase ou outra)
    console.error(`[API: authorize] Erro ao autorizar aposta ${body.betId}:`, error);
    // Sempre retorna JSON em caso de erro na lógica
    return NextResponse.json({ message: 'Erro ao autorizar aposta. Verifique os logs do servidor para mais detalhes.' }, { status: 500 });
  } finally {
      console.log('--- [API: /api/admin/bets/authorize] Fim da requisição POST ---');
  }
}