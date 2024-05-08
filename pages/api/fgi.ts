import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const { source } = req.query
	if (source === "Alternative.me") {
		await fetch("https://api.alternative.me/fng/?limit=2000", {
			method: "GET",
			headers: {
				"Content-Type": "application/json"
			}
		}).then(response => {
			return response.json()
		}).then(data => {
			res.status(200).json({
				data: data.data.map((e: { timestamp: string, value: string }) => {
					return {
						time: parseInt(e.timestamp) * 1000,
						close: parseInt(e.value),
					}
				}).reverse()
			})
		})
	} else {
		await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
			method: "GET",
			headers: {
				"Accept": "application/json",
				"Origin": "https://edition.cnn.com",
				"Accept-Encoding": "gzip, deflate, br",
				"Host": "production.dataviz.cnn.io",
				"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
				"Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
				"Referer": "https://edition.cnn.com/"
			}
		}).then(response => {
			return response.json()
		}).then(data => {
			res.status(200).json({
				data: data.fear_and_greed_historical.data.map((e: { x: string, y: string }) => {
					return {
						time: parseInt(e.x),
						close: parseFloat(e.y),
					}
				})
			})
		})
	}
}
