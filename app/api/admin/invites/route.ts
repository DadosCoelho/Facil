'use server'

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getConfig } from '@/lib/config-store'

type InviteBody = {
	campaignId?: string
	campaignName?: string
	singleUse?: boolean
	expDays?: number
	participant?: { name?: string; email?: string }
}

function base64UrlEncode(input: Buffer | string) {
	const buf = Buffer.isBuffer(input) ? input : Buffer.from(input)
	return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function sign(payload: object, secret: string) {
	const header = { alg: 'HS256', typ: 'JWT' }
	const encodedHeader = base64UrlEncode(JSON.stringify(header))
	const encodedPayload = base64UrlEncode(JSON.stringify(payload))
	const data = `${encodedHeader}.${encodedPayload}`
	const signature = crypto.createHmac('sha256', secret).update(data).digest()
	return `${data}.${base64UrlEncode(signature)}`
}

export async function POST(request: Request) {
	const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
	if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
		return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
	}
	const token = authHeader.split(' ')[1]
	if (token !== 'dev-admin-token') {
		return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
	}

	let body: InviteBody
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ message: 'JSON inválido' }, { status: 400 })
	}

	const nowSeconds = Math.floor(Date.now() / 1000)
	const expSeconds = nowSeconds + Math.max(1, Math.floor((body.expDays ?? 1) * 86400))
	const inviteId = crypto.randomUUID()
	const cfg = getConfig()
	const payload = {
		inviteId,
		campaignId: body.campaignId || cfg.campaignId || 'DEFAULT_CAMPAIGN_ID',
		campaignName: body.campaignName || cfg.campaignName || 'Campanha',
		singleUse: body.singleUse ?? true,
		exp: expSeconds,
		participant: body.participant || undefined,
	}

	const secret = process.env.JWT_SECRET || 'dev-secret'
	const signedToken = sign(payload, secret)

	const link = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/invite/${signedToken}`

	return NextResponse.json({
		link,
		tokenPreview: signedToken.slice(0, 24) + '…',
		inviteId,
		expiresAt: new Date(expSeconds * 1000).toISOString(),
		campaignId: payload.campaignId,
		campaignName: payload.campaignName,
	})
}


