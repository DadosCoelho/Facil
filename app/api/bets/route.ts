// Facil/app/api/bets/route.ts
'use server';

import { NextResponse } from 'next/server';
import { addBetToFirebase } from '@/lib/firebase-db';
import { verifyInviteToken } from '@/lib/jwt'; 

export async function POST(request: Request) {
    let requestBody;
    try {
        requestBody = await request.json();
    } catch (e) {
        console.error("Erro ao fazer parse do corpo da requisição como JSON:", e);
        return NextResponse.json({ message: 'Corpo da requisição inválido.' }, { status: 400 });
    }

    const { token, bets } = requestBody;

    if (!token) {
        return NextResponse.json({ message: 'Token de convite ausente.' }, { status: 401 });
    }

    let decodedToken;
    try {
        decodedToken = await verifyInviteToken(token); 
        if (!decodedToken || decodedToken.exp < Math.floor(Date.now() / 1000)) {
            return NextResponse.json({ message: 'Token de convite inválido ou expirado.' }, { status: 401 });
        }
    } catch (e) {
        console.error("Falha na verificação do token:", e);
        return NextResponse.json({ message: 'Token de convite inválido.' }, { status: 401 });
    }

    if (!Array.isArray(bets) || bets.length === 0) {
        return NextResponse.json({ message: 'Nenhuma aposta fornecida.' }, { status: 400 });
    }

    const transactionId = `trans_${Date.now()}`; 

    const response = NextResponse.json({ 
        transactionId, 
        status: 'processing', 
        message: 'Sua aposta está sendo processada e será confirmada em breve. Aguarde para ser redirecionado.',
        redirectDelay: 2000
    });

    (async () => {
        try {
            for (const bet of bets) {
                const betDataToSave = {
                    id: bet.id || transactionId, 
                    numbers: bet.numbers,
                    shares: bet.shares,
                    createdAt: new Date().toISOString(),
                    status: 'active', 
                    campaignId: decodedToken.campaignId || 'DEFAULT_CAMPAIGN_ID',
                    inviteId: decodedToken.inviteId || 'UNKNOWN_INVITE',
                    participantSessionId: decodedToken.inviteId,
                    // =========================================================
                    // NOVO: Adiciona o nome do participante à aposta salva
                    // =========================================================
                    participantName: decodedToken.participant?.name || 'Participante Anônimo',
                    // =========================================================
                };

                await addBetToFirebase(betDataToSave);
            }
            console.log(`[BACKGROUND] Processo de salvamento da transação ${transactionId} no Firebase concluído.`);
        } catch (bgError) {
            console.error(`[BACKGROUND ERROR] Erro inesperado no processo em segundo plano da transação ${transactionId}:`, bgError);
        }
    })();

    return response; 
}