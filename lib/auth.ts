// lib/auth.ts
import { NextResponse } from 'next/server';

export function ensureAdmin(request: Request): boolean {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  // Por enquanto, ainda usando um token hardcoded para dev.
  // Em uma aplicação real, isso envolveria verificação JWT contra um segredo.
  return token === 'dev-admin-token';
}

export function unauthorizedResponse() {
  return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
}