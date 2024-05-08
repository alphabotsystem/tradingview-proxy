export interface TradingViewConfig {
	token: string
	timestamp: number
}

export interface ExchangeSource {
	country: string
	desc: string
	flag: string
	group: string
	name: string
	providerId: string
	value: string
	hideInSymbolSearch?: boolean
	searchTerms?: string[]
	priorityInGroup?: number
}

// interface TradingViewSearchResponse {
// 	symbol: string
// 	description: string
// 	type: string
// 	exchange: string
// 	currency_code: string
// 	provider_id: string
// 	country: string
// 	typespecs: string
// }