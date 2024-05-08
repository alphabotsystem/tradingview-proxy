import { Bar } from "public/static/charting_library/charting_library"

export const extract_symbol = (rawData: string, chartSession: string) => {
	const resolvedSymbol = JSON.parse(rawData.split(`"symbol_resolved","p":["${chartSession}","sds_sym_1",`)[1]?.split('],"t"')[0] ?? "{}")
	const updateMode = rawData.split(`{"m":"series_completed","p":["${chartSession}","sds_1","`)[1]?.split('",')[0]
	if (updateMode) {
		const delay = updateMode === "streaming" ? 0 : updateMode === "endofday" ? -1 : updateMode === "pulsed" ? -2 : updateMode.startsWith("delayed_streaming_") ? parseInt(updateMode.split("delayed_streaming_")[1]) : undefined
		resolvedSymbol.delay = updateMode.startsWith("delayed_streaming_") ? parseInt(updateMode.split("delayed_streaming_")[1]) : delay
		resolvedSymbol.update_mode = updateMode.startsWith("delayed_streaming_") ? "delayed_streaming" : updateMode
	}
	return resolvedSymbol
}

export const extract_bars = (rawData: string) => {
	if (!rawData.includes('"s":[')) return []
	const data = rawData
		.split('"s":[')
		.slice(1)
		.map(e => JSON.parse("[" + e.split('],')[0] + "]") as { i: number, v: number[] }[])
		.reduce((a, b) => a.concat(b), [])
		.map(e => ({
			time: e.v[0] * 1000,
			open: e.v[1],
			high: e.v[2],
			low: e.v[3],
			close: e.v[4],
			volume: e.v[5],
		} as Bar))
	return data
}