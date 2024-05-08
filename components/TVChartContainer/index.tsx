import { ComponentType, useEffect, useState, createRef, RefObject } from "react"
import styles from "./index.module.css"
import {
	widget,
	ChartingLibraryWidgetOptions,
	IChartingLibraryWidget,
	AvailableSaveloadVersions,
	ThemeName,
	IBasicDataFeed,
	StudyOverrideValueType,
	ChartingLibraryFeatureset,
} from "public/static/charting_library"

export interface ChartContainerProps {
	className?: string
	symbol?: ChartingLibraryWidgetOptions['symbol']
	theme?: ChartingLibraryWidgetOptions['theme']
	chartType?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12
	studiesQuery?: string
	volumeDisabled?: boolean
	isLogScale?: boolean
	studiesOverrides?: ChartingLibraryWidgetOptions['studies_overrides']
	datafeed: IBasicDataFeed
	overrides?: ChartingLibraryWidgetOptions['overrides']
	onReady?: (chart: IChartingLibraryWidget) => void
}

export const TVChartContainer: ComponentType<ChartContainerProps> = ({
	symbol = "AAPL",
	theme = "dark" as ThemeName,
	chartType = 1,
	studiesQuery = "",
	volumeDisabled = false,
	isLogScale = false,
	studiesOverrides = {},
	datafeed,
	overrides = {},
	onReady = () => { },
}) => {
	const ref: RefObject<HTMLDivElement> = createRef()
	const [tvWidget, setTvWidget] = useState<IChartingLibraryWidget | null>(null)

	useEffect(() => {
		if (!ref.current) {
			return
		}

		const enabledFeatures: ChartingLibraryFeatureset[] = ["seconds_resolution", "use_last_visible_bar_value_in_legend", "display_data_mode" as ChartingLibraryFeatureset]
		const disabledFeatures: ChartingLibraryFeatureset[] = ["save_chart_properties_to_local_storage", "left_toolbar", "control_bar", "timeframes_toolbar", "use_localstorage_for_settings", "header_widget", "chart_scroll", "chart_zoom", "insert_indicator_dialog_shortcut", "symbol_search_hot_key", "show_interval_dialog_on_key_press", "edit_buttons_in_legend", "context_menus", "scales_context_menu", "legend_context_menu", "main_series_scale_menu", "property_pages", "go_to_date", "popup_hints", "save_shortcut"]
		if (volumeDisabled) disabledFeatures.push("create_volume_indicator_by_default")

		const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: symbol,
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: datafeed,
			interval: symbol.split("@")[1] as ChartingLibraryWidgetOptions['interval'],
			container: ref.current,
			library_path: "/static/charting_library/",
			locale: "en",
			enabled_features: enabledFeatures,
			disabled_features: disabledFeatures,
			charts_storage_api_version: "1.1" as AvailableSaveloadVersions,
			autosize: true,
			studies_overrides: studiesOverrides,
			theme: theme,
			overrides: {
				"mainSeriesProperties.style": chartType || 1,
				"mainSeriesProperties.priceAxisProperties.log": isLogScale,
				// "scalesProperties.showPriceScaleCrosshairLabel": false,
				// "scalesProperties.showTimeScaleCrosshairLabel": false,
				...overrides
			}
		}

		const tvWidget = new widget(widgetOptions)

		let studies: { name: string, overrides: { [key: string]: StudyOverrideValueType } }[] = []
		if (studiesQuery !== "") {
			studies = studiesQuery.split(",").map(s => s.split("@")).map(s => {
				let overrides: { [key: string]: StudyOverrideValueType } = {}
				if (s[1]) {
					const values = s[1].split(";")
					for (const iterator of values) {
						const [key, type, value] = iterator.split(":", 3)
						overrides[key] = type === "f" ? parseFloat(value) : type === "b" ? value === "true" : value
					}
				}
				return { name: s[0], overrides: overrides }
			})
		}

		tvWidget.onChartReady(() => {
			studies.forEach(study => {
				tvWidget.activeChart().createStudy(study.name, false, false, {}, study.overrides)
			})

			if (symbol.startsWith("AM:FGI@") || symbol.startsWith("CNN:FGI@")) {
				const lineStyle = { linecolor: "#787B86", textcolor: "#787B86", fontsize: 9, linestyle: 2, showLabel: true }

				tvWidget.activeChart().createShape({ time: Date.now(), price: 100 }, { shape: "horizontal_line", overrides: { ...lineStyle, showPrice: false } })
				tvWidget.activeChart().createShape({ time: Date.now(), price: 0 }, { shape: "horizontal_line", overrides: { ...lineStyle, showPrice: false } })

				tvWidget.activeChart().createShape({ time: Date.now(), price: 75 }, { shape: "horizontal_line", text: "Extreme greed", overrides: { ...lineStyle, vertLabelsAlign: "bottom" } })
				tvWidget.activeChart().createShape({ time: Date.now(), price: 75 }, { shape: "horizontal_line", text: "Greed", overrides: { ...lineStyle, vertLabelsAlign: "top", showPrice: false } })
				tvWidget.activeChart().createShape({ time: Date.now(), price: 55 }, { shape: "horizontal_line", text: "Greed", overrides: { ...lineStyle, vertLabelsAlign: "bottom" } })
				tvWidget.activeChart().createShape({ time: Date.now(), price: 55 }, { shape: "horizontal_line", text: "Neutral", overrides: { ...lineStyle, vertLabelsAlign: "top", showPrice: false } })
				tvWidget.activeChart().createShape({ time: Date.now(), price: 45 }, { shape: "horizontal_line", text: "Neutral", overrides: { ...lineStyle, vertLabelsAlign: "bottom" } })
				tvWidget.activeChart().createShape({ time: Date.now(), price: 45 }, { shape: "horizontal_line", text: "Fear", overrides: { ...lineStyle, vertLabelsAlign: "top", showPrice: false } })
				tvWidget.activeChart().createShape({ time: Date.now(), price: 25 }, { shape: "horizontal_line", text: "Fear", overrides: { ...lineStyle, vertLabelsAlign: "bottom" } })
				tvWidget.activeChart().createShape({ time: Date.now(), price: 25 }, { shape: "horizontal_line", text: "Extreme fear", overrides: { ...lineStyle, vertLabelsAlign: "top", showPrice: false } })
			}

			onReady(tvWidget)
		})

		setTvWidget(tvWidget)
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return <div ref={ref} className={styles.TVChartContainer} />
}