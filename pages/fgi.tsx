import { ComponentType, FC } from "react"
import dynamic from "next/dynamic"
import { ChartContainerProps } from "components/TVChartContainer"
import Datafeed from "scripts/fgi_datafeed"
import { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = async (context) => {
	return {
		props: {
			ticker: context.query.ticker ?? "CNN:FGI@1D",
			studies: context.query.studies ?? "",
			log: context.query.log ?? "",
			theme: context.query.theme ?? "dark",
		}
	}
}

const TVChartContainer: ComponentType<ChartContainerProps> = dynamic(() => import("components/TVChartContainer").then((mod) => mod.TVChartContainer), { ssr: false })

export interface ProPageProps {
	ticker: string
	studies: string
	log: string
	theme: ChartContainerProps["theme"]
}

const FgiPage: FC<ProPageProps> = ({
	ticker,
	studies,
	log,
	theme,
}) => {
	return (
		<TVChartContainer
			symbol={ticker}
			chartType={3}
			theme={theme}
			studiesQuery={studies}
			isLogScale={!!log}
			datafeed={Datafeed()}
			overrides={{
				"mainSeriesProperties.areaStyle.color1": "rgba(138, 35, 135, 0.28)",
				"mainSeriesProperties.areaStyle.color2": "#E94057",
				"mainSeriesProperties.areaStyle.linecolor": "#8A2387",
			}}
		/>
	)
}

export default FgiPage
