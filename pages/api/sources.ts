import { Firestore } from "@google-cloud/firestore"
import { ExchangeSource } from "data/types/tradingview"
import { NextApiRequest, NextApiResponse } from "next"

const firestore = new Firestore({
	projectId: "nlc-bot-36685",
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const config = await firestore.collection("tradingview").doc("sources").get().then(doc => doc.data() as ExchangeSource[])
	res.status(200).json([])
}
