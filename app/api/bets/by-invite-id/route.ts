// facil/app/api/bets/by-invite-id/route.ts
// Certifique-se de que o 'use server' está no topo do arquivo
'use server';

import { NextResponse } from 'next/server';
// Importa a nova função do Firebase
import { getBetsFromFirebase } from '@/lib/firebase-db'; 

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (e) {
        return NextResponse.json({ message: 'JSON inválido' }, { status: 400 });
    }

    const { inviteId } = body;
    if (!inviteId) {
        return NextResponse.json({ message: 'inviteId ausente na requisição' }, { status: 400 });
    }

    try {
        // Chama a nova função do Firebase para buscar apostas
        const bets = await getBetsFromFirebase(inviteId);
        
        // Retorna as apostas encontradas
        return NextResponse.json({ bets: bets });
    } catch (e) {
        console.error("Erro ao buscar apostas por inviteId no Firebase:", e);
        return NextResponse.json({ message: 'Erro interno ao buscar apostas no Firebase.' }, { status: 500 });
    }
}