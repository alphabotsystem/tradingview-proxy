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
} from "public/static/charting_library/charting_library"
import { WindowWithProps } from "utils/window"

const RESOLUTIONS = ["1D", "2D", "3D", "4D", "5D", "6D", "1W", "2W", "3W", "1M"] as ResolutionString[]

export declare let window: WindowWithProps

const fetchBars = (source: string) => {
	return fetch(`/api/fgi?source=${source}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json"
		}
	}).then(response => {
		return response.json()
	})
}

const Datafeed = () => ({
	onReady: (callback: OnReadyCallback) => {
		const configurationData: DatafeedConfiguration = {
			supported_resolutions: RESOLUTIONS,
			exchanges: []
		}
		setTimeout(() => callback(configurationData), 0)
	},
	searchSymbols: (userInput: string, exchange: string, symbolType: string, onResult: SearchSymbolsCallback) => {
		onResult([])
	},
	resolveSymbol: (symbolName: string, onResolve: ResolveCallback, onError: ErrorCallback) => {
		const source = symbolName.startsWith("AM") ? "Alternative.me" : "CNN Business"
		const market = symbolName.startsWith("AM") ? "Crypto market " : "Stock market "
		setTimeout(() => onResolve({
			name: "FGI",
			full_name: market + "Fear & Greed Index",
			base_name: ["FGI"],
			ticker: "FGI",
			description: market + "Fear & Greed Index",
			type: "index",
			session: "24x7",
			corrections: "",
			exchange: source,
			listed_exchange: source,
			timezone: "Etc/UTC",
			format: "price",
			pricescale: 0.1,
			minmov: 1,
			has_intraday: false,
			supported_resolutions: RESOLUTIONS,
			has_empty_bars: false,
			visible_plots_set: "c",
			// data_status?: "streaming" | "endofday" | "pulsed" | "delayed_streaming";
			data_status: "endofday",
		}), 0)
	},
	getBars: (symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, periodParams: PeriodParams, onResult: HistoryCallback, onError: ErrorCallback) => {
		if (!periodParams.firstDataRequest) {
			onResult([], { noData: true })
			return
		}
		fetchBars(symbolInfo.exchange).then((bars) => {
			window.loaded = true;
			setTimeout(() => onResult(bars.data, { noData: false }), 0)
		}).catch((err) => {
			window.loaded = true;
			onError(err)
			console.error(err)
		})
	},
	subscribeBars: (symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string, onResetCacheNeededCallback: () => void) => { },
	unsubscribeBars: (listenerGuid: string) => { },
})

export default Datafeed