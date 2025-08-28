'use server'

import { NextResponse } from 'next/server'
import { getConfig } from '@/lib/config-store'

export async function GET(request: Request) {
	const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
	const expectedToken = 'dev-admin-token'

	if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
		return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
	}

	const token = authHeader.split(' ')[1]
	if (token !== expectedToken) {
		return NextResponse.json({ message: 'Token inválido' }, { status: 401 })
	}

	// Mock data for dashboard, using current config status
	const cfg = getConfig()
	const data = {
		totalBets: 128,
		totalShares: 945,
		totalParticipants: 312,
		recentBets: 17,
		campaignStatus: cfg.status,
		lastUpdate: new Date().toISOString(),
	}

	return NextResponse.json(data)
}


