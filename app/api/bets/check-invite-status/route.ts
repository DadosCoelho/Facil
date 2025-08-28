// facil/app/api/bets/check-invite-status/route.ts
'use server';

import { NextResponse } from 'next/server';
// REMOVA a importação antiga do Google Sheets
// import { getBetsByInviteId } from '@/lib/sheets';
// ADICIONE a importação da função do Firebase
import { getBetsFromFirebase } from '@/lib/firebase-db'; 
import { verifyInviteToken } from '@/lib/jwt'; // Importa o utilitário JWT

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
    }

    const { token } = body;
    if (!token) {
        return NextResponse.json({ message: 'Token de convite ausente' }, { status: 400 });
    }

    let decodedToken;
    try {
        decodedToken = await verifyInviteToken(token);
        // Não é necessário verificar expiração aqui, pois `invite/[token]` já fez isso
    } catch (e) {
        console.error("Falha na verificação do token em check-invite-status:", e);
        return NextResponse.json({ message: 'Token de convite inválido' }, { status: 401 });
    }

    const inviteId = decodedToken.inviteId;

    if (!inviteId) {
        return NextResponse.json({ message: 'InviteId não encontrado no token' }, { status: 400 });
    }

    try {
        // SUBSTITUA a chamada para a função do Firebase
        const bets = await getBetsFromFirebase(inviteId);
        // Retorna se existem apostas ou não
        return NextResponse.json({ hasBets: bets.length > 0 });
    } catch (e) {
        console.error("Erro ao verificar status do convite:", e);
        return NextResponse.json({ message: 'Erro interno ao verificar status do convite' }, { status: 500 });
    }
}