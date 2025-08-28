// app/api/invites/validate/route.ts
'use server'

import { NextResponse } from 'next/server'
import { verifyInviteToken } from '@/lib/jwt'; // Importar o novo utilitário

export async function POST(request: Request) {
    let body: { token?: string }
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ message: 'JSON inválido' }, { status: 400 })
    }

    const token = body.token
    if (!token) return NextResponse.json({ message: 'Token ausente' }, { status: 400 })

    try {
        const payload = await verifyInviteToken(token); // Usar a função centralizada
        
        // Validação de expiração (manter)
        if (!payload?.exp || typeof payload.exp !== 'number') {
            return NextResponse.json({ message: 'Token sem expiração' }, { status: 400 })
        }
        const nowSeconds = Math.floor(Date.now() / 1000)
        if (payload.exp < nowSeconds) {
            return NextResponse.json({ message: 'Token expirado' }, { status: 401 })
        }
        
        return NextResponse.json({
            inviteId: payload.inviteId,
            campaignId: payload.campaignId,
            campaignName: payload.campaignName,
            singleUse: payload.singleUse,
            expiresAt: new Date(payload.exp * 1000).toISOString(),
            participant: payload.participant || null,
        })
    } catch (err) {
        return NextResponse.json({ message: (err as Error).message || 'Token inválido' }, { status: 401 })
    }
}