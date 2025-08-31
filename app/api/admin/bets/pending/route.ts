// Facil/app/api/admin/bets/pending/route.ts
'use server';

import { NextResponse } from 'next/server';
import { ensureAdmin, unauthorizedResponse } from '@/lib/auth';
import { getBetsByPaymentStatus } from '@/lib/firebase-db';

export async function GET(request: Request) {
  if (!ensureAdmin(request)) {
    return unauthorizedResponse();
  }

  try {
    const pendingBets = await getBetsByPaymentStatus('pending');
    return NextResponse.json(pendingBets);
  } catch (error) {
    console.error('Erro ao buscar apostas pendentes:', error);
    return NextResponse.json({ message: 'Erro ao carregar apostas pendentes.' }, { status: 500 });
  }
}