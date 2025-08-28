'use server'

import { NextResponse } from 'next/server'
import { getConfig, updateConfig, type AppConfig, type CampaignStatus } from '@/lib/config-store'

function ensureAdmin(request: Request) {
	const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
	if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) return false
	const token = authHeader.split(' ')[1]
	return token === 'dev-admin-token'
}

export async function GET() {
	return NextResponse.json(getConfig())
}

export async function POST(request: Request) {
	if (!ensureAdmin(request)) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
	let body: Partial<AppConfig>
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ message: 'JSON inválido' }, { status: 400 })
	}

	if (body.status && !['active','paused','ended'].includes(body.status as CampaignStatus)) {
		return NextResponse.json({ message: 'Status inválido' }, { status: 400 })
	}

	const updated = updateConfig({
		campaignId: body.campaignId,
		campaignName: body.campaignName,
		status: body.status as CampaignStatus | undefined,
		pricePerShare: typeof body.pricePerShare === 'number' ? body.pricePerShare : undefined,
		numbersPerBet: typeof body.numbersPerBet === 'number' ? Math.min(20, Math.max(15, body.numbersPerBet)) : undefined,
		pixKey: body.pixKey,
		pixInstructions: body.pixInstructions,
	})
	return NextResponse.json(updated)
}


