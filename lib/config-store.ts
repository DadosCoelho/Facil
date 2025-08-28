export type CampaignStatus = 'active' | 'paused' | 'ended'

export type AppConfig = {
	campaignId: string
	campaignName?: string
	status: CampaignStatus
	updatedAt: string
	pricePerShare: number
	numbersPerBet: number
	pixKey?: string
	pixInstructions?: string
}

let appConfig: AppConfig = {
	campaignId: 'DEFAULT_CAMPAIGN_ID',
	campaignName: 'Campanha Padrão',
	status: 'active',
	updatedAt: new Date().toISOString(),
	pricePerShare: 3.5,
	numbersPerBet: 15,
	pixKey: '00020126360014BR.GOV.BCB.PIX0114+559999999999520400005303986540410.005802BR5925Organizador Facil Ltda6009Sao Paulo62070503***6304ABCD',
	pixInstructions: 'Envie o comprovante do PIX para confirmar sua participação.'
}

export function getConfig(): AppConfig {
	return appConfig
}

export function updateConfig(partial: Partial<AppConfig>): AppConfig {
	appConfig = {
		...appConfig,
		...partial,
		updatedAt: new Date().toISOString(),
	}
	return appConfig
}


