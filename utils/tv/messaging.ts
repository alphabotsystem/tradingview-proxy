import WebSocket from "ws"
import { Firestore } from "@google-cloud/firestore"
import { TradingViewConfig } from "data/types/tradingview"
import { send_message } from "./ws"

const firestore = new Firestore({
	projectId: "nlc-bot-36685",
})

export const get_listener = (ws: WebSocket) => {
	const receiver: Promise<string> = new Promise((resolve, reject) => {
		let rawData = ""
		let timeout: NodeJS.Timeout

		const message_handler = (data: any) => {
			const message = data.toString()
			rawData += message + "\n"
			if (message.includes("series_completed")) {
				clearTimeout(timeout)
				resolve(rawData)
			} else if (message.includes("series_error")) {
				clearTimeout(timeout)
				resolve(rawData)
			} else if (message.includes("errmsg")) {
				const type = message.split("errmsg\":\"")[1].split("\"")[0]
				clearTimeout(timeout)
				reject(type)
			}
		}
		const handle_reject = (err: any) => reject(err)

		ws.on("message", message_handler)
		ws.on("error", handle_reject)

		timeout = setTimeout(() => {
			ws.off("message", message_handler)
			ws.off("error", handle_reject)
			reject("timeout")
		}, 10000)
	})
	return receiver
}

export const subscribe = async (ws: WebSocket, symbol: string, fullTicker: string, interval: string, bars: string, chartSession: string, quoteSession1: string, quoteSession2: string) => {
	await send_message(ws, "set_locale", ["en","US"])
	await send_message(ws, "chart_create_session", [chartSession, ""])
	await send_message(ws, "switch_timezone", [chartSession, "Etc/UTC"])
	await send_message(ws, "quote_create_session", [quoteSession1])

	await send_message(ws, "quote_add_symbols", [quoteSession1, fullTicker])
	await send_message(ws, "resolve_symbol", [chartSession, "sds_sym_1", fullTicker])
	await send_message(ws, "create_series", [chartSession, "sds_1", "s1", "sds_sym_1", interval, parseInt(bars), ""])

	await send_message(ws, "quote_create_session", [quoteSession2])

	// I don't know what "rchp" and "rtc" are
	await send_message(ws, "quote_set_fields", [quoteSession2, "base-currency-logoid", "ch", "chp", "currency-logoid", "currency_id", "base_currency_id", "current_session", "description", "local_description", "language", "exchange", "format", "fractional", "is_tradable", "listed_exchange", "logoid", "lp", "lp_time", "minmov", "minmove2", "original_name", "pricescale", "pro_name", "short_name", "type", "typespecs", "update_mode", "volume", "value_unit_id", "currency_code", "rchp", "rtc"])
	await send_message(ws, "quote_add_symbols", [quoteSession2, symbol])

	await send_message(ws, "quote_fast_symbols", [quoteSession1, fullTicker])
	await send_message(ws, "quote_fast_symbols", [quoteSession2, symbol])
}

export const update_subscription = async (ws: WebSocket, chartSession: string, quoteSession1: string, fullTicker: string, resolution: string) => {
	await send_message(ws, "quote_remove_symbols", [quoteSession1, fullTicker])
	await send_message(ws, "quote_add_symbols", [quoteSession1, fullTicker])
	await send_message(ws, "resolve_symbol", [chartSession, "sds_sym_2", fullTicker])
	await send_message(ws, "modify_series", [chartSession, "sds_1", "s2", "sds_sym_2", resolution, ""])
}

export const authenticate = async (ws: WebSocket) => {
	await firestore
		.collection("config")
		.doc("tradingview")
		.get()
		.then((doc) => doc.data() as TradingViewConfig)
		.then((config) => {
			return send_message(ws, "set_auth_token", [config.token])
		})
		.catch((err) => console.error(err))
}