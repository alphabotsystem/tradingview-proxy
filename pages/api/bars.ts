import { NextApiRequest, NextApiResponse } from "next"
import { extract_bars, extract_symbol } from "utils/tv/data"
import { authenticate, get_listener, subscribe, update_subscription } from "utils/tv/messaging"
import { generate_chart_session, generate_session, generate_symbol_object, get_ws } from "utils/tv/ws"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { symbol, interval, bars, extended, type } = req.query
	if (typeof symbol !== "string" || typeof interval !== "string" || typeof bars !== "string" || typeof extended !== "string" || typeof type !== "string" || !symbol || !interval || !parseInt(bars) || !extended) {
		res.status(400).json({ message: "Invalid request" })
		return
	}

	const chartSession = generate_chart_session()
	const quoteSession1 = generate_session()
	const quoteSession2 = generate_session()
	const fullTicker = generate_symbol_object(symbol, extended === "1")

	const { ws, status } = await get_ws()
	if (status !== null) {
		console.error("Failed to connect to TradingView websocket")
		console.error(status)
		res.status(500).json({ message: "Failed to connect to TradingView", reason: status })
		return
	}

	let receiver = get_listener(ws)
	if (type === "paid") await authenticate(ws)
	await subscribe(ws, symbol, fullTicker, interval, bars, chartSession, quoteSession1, quoteSession2)

	let rawData, data
	try {
		rawData = await receiver
	} catch (err) {
		if (err === "no_such_symbol") {
			res.status(404).json({ message: "Symbol not found" })
		} else {
			res.status(500).json({ message: "Failed to get data from TradingView", reason: err })
		}
		return
	}

	const resolvedSymbol = extract_symbol(rawData, chartSession)
	data = extract_bars(rawData)

	if (data.length === 0) {
		if (!!resolvedSymbol?.resolutions?.length) {
			receiver = get_listener(ws)
			await update_subscription(ws, chartSession, quoteSession1, fullTicker, resolvedSymbol.resolutions[0])

			try {
				rawData = await receiver
			} catch (err) {
				if (err === "no_such_symbol") {
					res.status(404).json({ message: "Symbol not found" })
				} else {
					res.status(500).json({ message: "Failed to get data from TradingView", reason: err })
				}
				return
			}
		} else if (!resolvedSymbol.has_intraday) {
			resolvedSymbol.resolutions = ["1D"]

			receiver = get_listener(ws)
			await update_subscription(ws, chartSession, quoteSession1, fullTicker, "1D")

			try {
				rawData = await receiver
			} catch (err) {
				if (err === "no_such_symbol") {
					res.status(404).json({ message: "Symbol not found" })
				} else {
					res.status(500).json({ message: "Failed to get data from TradingView", reason: err })
				}
				return
			}
		}
	} else if (!resolvedSymbol.resolutions) {
		resolvedSymbol.resolutions = [interval]
	}

	ws.close()

	extract_symbol(rawData, chartSession)
	data = extract_bars(rawData)

	res.status(200).json({ symbol: resolvedSymbol, data: data })
}
