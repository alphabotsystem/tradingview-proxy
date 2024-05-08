import WebSocket from "ws"

export const generate_session = () => {
	const chars = "abcdefghijklmnopqrstuvwxyz"
	let result = "qs_"
	for (let i = 12; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
	return result
}

export const generate_chart_session = () => {
	const chars = "abcdefghijklmnopqrstuvwxyz"
	let result = "cs_"
	for (let i = 12; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
	return result
}

export const generate_symbol_object = (symbol: string, extended: boolean) => {
	return `={"symbol":"${symbol}","adjustment":"splits","session":"${extended ? "extended" : "regular"}"}`
}

const prepend_header = (st: string) => {
	return "~m~" + st.length.toString() + "~m~" + st
}

const construct_message = (func: string, paramList: any[]) => {
	return JSON.stringify({ m: func, p: paramList })
}

const create_message = (func: string, paramList: any[]) => {
	return prepend_header(construct_message(func, paramList))
}

export const send_message = (ws: WebSocket, func: string, args: any[]) => {
	return new Promise((resolve, reject) => {
		ws.send(create_message(func, args), (err) => {
			if (err) reject(err)
			else resolve(null)
		})
	})
}

export const get_ws = async () => {
	// Connect to websocket
	const ws = new WebSocket("wss://prodata.tradingview.com/socket.io/websocket", {
		headers: {
			Origin: "https://www.tradingview.com",
			"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
		},
	})

	const status = await new Promise(resolve => {
		ws.on("open", () => resolve(null))
		ws.on("error", (err) => resolve(err))
		setTimeout(() => resolve("timeout"), 5000)
	})

	return { ws, status }
}