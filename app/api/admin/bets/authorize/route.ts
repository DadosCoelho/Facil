// Facil/app/api/admin/bets/authorize/route.ts
'use server';

import { NextResponse } from 'next/server';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth';
// Mude para a nova função de atualização por invite
import { updateBetsPaymentStatusByInvite, PaymentStatus } from '@/lib/firebase-db'; 

export async function POST(request: Request) {
  console.log('--- [API: /api/admin/bets/authorize] Início da requisição POST ---');
  
  // 1. Verificação de Autenticação Admin
  if (!ensureAdmin(request)) {
    console.warn('[API: authorize] Tentativa de acesso não autorizado.');
    return unauthorizedResponse();
  }
  console.log('[API: authorize] Admin autenticado com sucesso.');

  // NOVO: Corpo da requisição agora espera inviteId e status
  let body: { inviteId: string; status: PaymentStatus }; 
  try {
    // 2. Parse do Corpo da Requisição
    body = await request.json();
    console.log('[API: authorize] Corpo da requisição recebido:', body);

    // 3. Validação do Corpo da Requisição (agora para inviteId)
    if (!body.inviteId || !['approved', 'rejected'].includes(body.status)) { 
      console.warn('[API: authorize] Dados inválidos no corpo da requisição:', body);
      return NextResponse.json({ message: 'ID do convite ou status inválido.' }, { status: 400 });
    }
  } catch (parseError) {
    console.error('[API: authorize] Erro ao fazer parse do JSON ou dados ausentes:', parseError);
    return NextResponse.json({ message: 'JSON inválido ou malformado.' }, { status: 400 });
  }

  try {
    // 4. Chamada para Atualizar Status no Firebase (usando a NOVA FUNÇÃO para atualizar por inviteId)
    console.log(`[API: authorize] Iniciando atualização do convite ${body.inviteId} para o status: ${body.status}.`);
    await updateBetsPaymentStatusByInvite(body.inviteId, body.status); // Usa a nova função
    console.log(`[API: authorize] Convite ${body.inviteId} atualizado com sucesso para ${body.status}.`);
    
    // 5. Sucesso
    // Mensagem de sucesso adaptada para a operação em grupo
    return NextResponse.json({ success: true, message: `Todas as apostas do convite ${body.inviteId} foram ${body.status === 'approved' ? 'aprovadas' : 'rejeitadas'} com sucesso.` });
  } catch (error) {
    // 6. Erro na Lógica de Negócio (Firebase ou outra)
    console.error(`[API: authorize] Erro ao autorizar convite ${body.inviteId}:`, error);
    // Sempre retorna JSON em caso de erro na lógica
    return NextResponse.json({ message: 'Erro ao autorizar convite. Verifique os logs do servidor para mais detalhes.' }, { status: 500 });
  } finally {
      console.log('--- [API: /api/admin/bets/authorize] Fim da requisição POST ---');
  }
}