import { ComponentType, FC } from "react"
import dynamic from "next/dynamic"
import { ChartContainerProps } from "components/TVChartContainer"
import Datafeed from "scripts/tv_datafeed"
import { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {
			ticker: context.query.ticker ?? "NASDAQ:AAPL@1H",
			studies: context.query.studies ?? "",
			hidevolume: context.query.hidevolume ?? "",
			log: context.query.log ?? "",
			chartType: parseInt(context.query.chartType as string) ?? 1,
			theme: context.query.theme ?? "dark",
			type: context.query.type as "free" | "paid" ?? "free"
		}
	}
}

const TVChartContainer: ComponentType<ChartContainerProps> = dynamic(() => import("components/TVChartContainer").then((mod) => mod.TVChartContainer), { ssr: false })

export interface ProPageProps {
	ticker: string
	studies: string
	hidevolume: string
	log: string
	chartType: ChartContainerProps["chartType"]
	theme: ChartContainerProps["theme"],
	type: "free" | "paid"
}

const ProPage: FC<ProPageProps> = ({
	ticker,
	studies,
	hidevolume,
	log,
	chartType,
	theme,
	type
}) => {
	return (
		<TVChartContainer
			symbol={ticker}
			chartType={chartType}
			theme={theme}
			volumeDisabled={!!hidevolume}
			isLogScale={!!log}
			studiesQuery={studies}
			datafeed={Datafeed(type)}
		/>
	)
}

export default ProPage
