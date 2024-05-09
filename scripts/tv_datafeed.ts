import { ExchangeSource } from "data/types/tradingview"
import {
	DatafeedConfiguration,
	OnReadyCallback,
	ResolutionString,
	SearchSymbolsCallback,
	ErrorCallback,
	ResolveCallback,
	LibrarySymbolInfo,
	PeriodParams,
	HistoryCallback,
	SubscribeBarsCallback,
	Bar
} from "public/static/charting_library/charting_library"
import { WindowWithProps } from "utils/window"

const BASE_BAR_COUNT = 400
const RESOLUTIONS = ["1S", "5S", "10S", "15S", "30S", "1", "2", "3", "4", "5", "6", "10", "12", "15", "20", "30", "45", "1H", "2H", "3H", "4H", "6H", "8H", "12H", "1D", "2D", "3D", "4D", "5D", "6D", "1W", "2W", "3W", "1M", "2M", "3M", "4M", "6M", "12M"] as ResolutionString[]
const RESOLUTIONS_MAP: { [resolution: string]: (string | number)[] } = {
	"1S": ["1S", BASE_BAR_COUNT],
	"5S": ["5S", BASE_BAR_COUNT],
	"10S": ["10S", BASE_BAR_COUNT],
	"15S": ["15S", BASE_BAR_COUNT],
	"30S": ["30S", BASE_BAR_COUNT],
	"1": ["1", BASE_BAR_COUNT],
	"2": ["1", BASE_BAR_COUNT * 2],
	"3": ["3", BASE_BAR_COUNT],
	"4": ["1", BASE_BAR_COUNT * 4],
	"5": ["1", BASE_BAR_COUNT * 5],
	"6": ["3", BASE_BAR_COUNT * 2],
	"10": ["1", BASE_BAR_COUNT * 10],
	"12": ["3", BASE_BAR_COUNT * 4],
	"15": ["15", BASE_BAR_COUNT],
	"20": ["1", BASE_BAR_COUNT * 20],
	"30": ["15", BASE_BAR_COUNT * 2],
	"45": ["15", BASE_BAR_COUNT * 3],
	"1H": ["1H", BASE_BAR_COUNT],
	"2H": ["2H", BASE_BAR_COUNT],
	"3H": ["3H", BASE_BAR_COUNT],
	"4H": ["4H", BASE_BAR_COUNT],
	"6H": ["3H", BASE_BAR_COUNT * 2],
	"8H": ["4H", BASE_BAR_COUNT * 2],
	"12H": ["4H", BASE_BAR_COUNT * 3],
	"1D": ["1D", BASE_BAR_COUNT],
	"2D": ["1D", BASE_BAR_COUNT * 2],
	"3D": ["1D", BASE_BAR_COUNT * 3],
	"4D": ["1D", BASE_BAR_COUNT * 4],
	"5D": ["1D", BASE_BAR_COUNT * 5],
	"6D": ["1D", BASE_BAR_COUNT * 6],
	"1W": ["1W", BASE_BAR_COUNT],
	"2W": ["1W", BASE_BAR_COUNT * 2],
	"3W": ["1W", BASE_BAR_COUNT * 3],
	"1M": ["1M", BASE_BAR_COUNT],
	"2M": ["1M", BASE_BAR_COUNT * 2],
	"3M": ["1M", BASE_BAR_COUNT * 3],
	"4M": ["1M", BASE_BAR_COUNT * 4],
	"6M": ["1M", BASE_BAR_COUNT * 6],
	"12M": ["1M", BASE_BAR_COUNT * 12]
}

export declare let window: WindowWithProps

let symbol: LibrarySymbolInfo | undefined = undefined
let bars: Bar[] | undefined = undefined

const fetchSources = () => {
	return fetch("/api/sources", {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	}).then(response => {
		return response.json()
	})
}

const fetchBars = (ticker: string, resolution: string, extended: string, type: "free" | "paid") => {
	const [res, num] = RESOLUTIONS_MAP[resolution]
	return fetch(`/api/bars?symbol=${ticker}&interval=${res}&bars=${num}&extended=${extended === "e" ? "1" : "0"}&type=${type}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	}).then(response => {
		return response.json()
	}).then(data => {
		bars = data.data
		const resolutions = data.symbol.resolutions[0] === res ? [resolution] : data.symbol.resolutions
		symbol = {
			name: data.symbol.pro_name,
			base_name: data.symbol.base_name,
			ticker: data.symbol.local_code,
			description: data.symbol.description,
			type: data.symbol.type,
			session: data.symbol.session,
			session_display: data.symbol.session_display,
			session_holidays: data.symbol.session_holidays,
			corrections: "",
			exchange: data.symbol.listed_exchange,
			listed_exchange: data.symbol.listed_exchange,
			timezone: data.symbol.timezone,
			format: "price",
			pricescale: data.symbol.pricescale,
			minmov: data.symbol.minmov,
			fractional: data.symbol.fractional,
			minmove2: data.symbol.minmove2,
			has_intraday: data.symbol.has_intraday,
			supported_resolutions: resolutions,
			has_empty_bars: false,
			visible_plots_set: data.symbol.visible_plots_set,
			data_status: data.symbol.update_mode,
			delay: data.symbol.delay,
			currency_code: data.symbol.currency_code,
			has_seconds: data.symbol.resolutions && (data.symbol.resolutions.length === 0 || data.symbol.resolutions.some((res: string) => res.endsWith("S"))),
		}
	})
}

const Datafeed = (type: "free" | "paid") => ({
	onReady: (callback: OnReadyCallback) => {
		const configurationData: DatafeedConfiguration = {
			supported_resolutions: RESOLUTIONS,
			exchanges: []
		}
		// fetchSources().then(data => {
		// 	configurationData.exchanges = data.map((exchange: ExchangeSource) => {
		// 		return {
		// 			name: exchange.name,
		// 			desc: exchange.desc,
		// 			value: exchange.value,
		// 		}
		// 	})
		// 	callback(configurationData)
		// })
		setTimeout(() => callback(configurationData), 0)
	},
	searchSymbols: (userInput: string, exchange: string, symbolType: string, onResult: SearchSymbolsCallback) => {
		onResult([])
	},
	resolveSymbol: (symbolName: string, onResolve: ResolveCallback, onError: ErrorCallback) => {
		const [ticker, resolution, extended] = symbolName.split("@", 3)
		if (symbol) {
			setTimeout(() => onResolve(symbol!), 0)
		} else {
			fetchBars(ticker, resolution, extended, type).then(() => {
				setTimeout(() => onResolve(symbol!), 0)
			}).catch((err) => {
				console.error(err)
				onError(err)
			})
		}
	},
	getBars: (symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, periodParams: PeriodParams, onResult: HistoryCallback, onError: ErrorCallback) => {
		if (!periodParams.firstDataRequest) {
			onResult([], { noData: true })
			return
		}
		if (bars) {
			window.loaded = true
			setTimeout(() => onResult(bars!, { noData: false }), 0)
		} else {
			if (symbolInfo.ticker) {
				fetchBars(symbolInfo.name, resolution, "e", type).then(() => {
					window.loaded = true;
					setTimeout(() => onResult(bars!, { noData: false }), 0)
				}).catch((err) => {
					window.loaded = true;
					onError(err)
					console.error(err)
				})
			} else {
				window.loaded = true;
				onResult([], { noData: true })
			}
		}
	},
	subscribeBars: (symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string, onResetCacheNeededCallback: () => void) => { },
	unsubscribeBars: (listenerGuid: string) => { },
})

export default Datafeed