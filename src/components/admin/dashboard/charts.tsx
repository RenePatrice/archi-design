'use client'

import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { useEffect, useRef, useState } from 'react'

/**
 * Graphiques du tableau de bord (Apache ECharts, licence Apache 2.0 : libre pour un usage commercial).
 * Seuls les modules utilisés sont chargés. Les couleurs suivent le thème clair / sombre du back-office.
 */
echarts.use([BarChart, PieChart, GridComponent, LegendComponent, TooltipComponent, SVGRenderer])

/** Palette catégorielle vérifiée (lisible par les daltoniens), dans un ordre fixe */
const SERIES = {
  light: ['#eb6834', '#2a78d6', '#1baf7a', '#eda100', '#e87ba4', '#6250d6'],
  dark: ['#d95926', '#3987e5', '#199e70', '#c98500', '#d55181', '#9085e9'],
}
const CHROME = {
  light: { ink: '#0b0b0b', muted: '#898781', grid: '#e1e0d9', axis: '#c3c2b7', surface: '#ffffff' },
  dark: { ink: '#f0efec', muted: '#898781', grid: '#2c2c2a', axis: '#383835', surface: '#1f1f1e' },
}

type Mode = keyof typeof CHROME

/** Thème du back-office : Payload pose data-theme="dark" | "light" sur <html> */
function useMode(): Mode {
  const [mode, setMode] = useState<Mode>('light')
  useEffect(() => {
    const read = () => setMode(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return mode
}

function useChart(build: (mode: Mode) => echarts.EChartsCoreOption, deps: unknown[]) {
  const ref = useRef<HTMLDivElement>(null)
  const mode = useMode()
  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current, undefined, { renderer: 'svg' })
    chart.setOption(build(mode))
    const ro = new ResizeObserver(() => chart.resize())
    ro.observe(ref.current)
    return () => {
      ro.disconnect()
      chart.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ...deps])
  return ref
}

const tooltip = (mode: Mode) => ({
  backgroundColor: CHROME[mode].surface,
  borderColor: CHROME[mode].grid,
  textStyle: { color: CHROME[mode].ink, fontFamily: 'inherit' },
  extraCssText: 'box-shadow:0 8px 24px rgba(0,0,0,.12);border-radius:8px;',
})

export function MonthlyChart({ labels, values, seriesName }: { labels: string[]; values: number[]; seriesName: string }) {
  const ref = useChart(
    (mode) => {
      const c = CHROME[mode]
      return {
        grid: { left: 8, right: 8, top: 24, bottom: 8, containLabel: true },
        tooltip: { ...tooltip(mode), trigger: 'axis', axisPointer: { type: 'shadow', shadowStyle: { color: c.grid, opacity: 0.4 } } },
        xAxis: {
          type: 'category',
          data: labels,
          axisLine: { lineStyle: { color: c.axis } },
          axisTick: { show: false },
          axisLabel: { color: c.muted },
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          splitLine: { lineStyle: { color: c.grid } },
          axisLabel: { color: c.muted },
        },
        series: [
          {
            name: seriesName,
            type: 'bar',
            data: values,
            barMaxWidth: 28,
            itemStyle: { color: SERIES[mode][0], borderRadius: [4, 4, 0, 0] },
            emphasis: { itemStyle: { color: SERIES[mode][0], opacity: 0.85 } },
            // Seule la dernière valeur (le mois en cours) est étiquetée
            label: {
              show: true,
              position: 'top',
              color: c.ink,
              fontWeight: 600,
              formatter: (p: { dataIndex: number; value: number }) => (p.dataIndex === values.length - 1 ? String(p.value) : ''),
            },
          },
        ],
      }
    },
    [labels.join(), values.join()],
  )
  return <div ref={ref} className="ad-chart ad-chart--tall" role="img" aria-label={seriesName} />
}

export function ServicesChart({ data, unit }: { data: { name: string; value: number }[]; unit: string }) {
  const total = data.reduce((n, d) => n + d.value, 0)
  const ref = useChart(
    (mode) => {
      const c = CHROME[mode]
      return {
        color: SERIES[mode],
        tooltip: { ...tooltip(mode), trigger: 'item', formatter: '{b} : {c} ({d} %)' },
        legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { color: c.muted } },
        series: [
          {
            type: 'pie',
            radius: ['52%', '74%'],
            center: ['50%', '42%'],
            padAngle: 1,
            itemStyle: { borderColor: c.surface, borderWidth: 2, borderRadius: 4 },
            label: {
              show: true,
              position: 'center',
              formatter: () => `{v|${total}}\n{l|${unit}}`,
              rich: {
                v: { fontSize: 26, fontWeight: 700, color: c.ink, lineHeight: 32 },
                l: { fontSize: 12, color: c.muted },
              },
            },
            labelLine: { show: false },
            data,
          },
        ],
      }
    },
    [JSON.stringify(data)],
  )
  if (!total) return <p className="ad-empty">—</p>
  return <div ref={ref} className="ad-chart ad-chart--tall" role="img" aria-label={data.map((d) => `${d.name} ${d.value}`).join(', ')} />
}

export function StatusChart({ data }: { data: { name: string; value: number }[] }) {
  const ref = useChart(
    (mode) => {
      const c = CHROME[mode]
      return {
        grid: { left: 8, right: 32, top: 0, bottom: 0, containLabel: true },
        tooltip: { ...tooltip(mode), trigger: 'item' },
        xAxis: { type: 'value', show: false },
        yAxis: {
          type: 'category',
          inverse: true,
          data: data.map((d) => d.name),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: c.muted },
        },
        series: [
          {
            type: 'bar',
            data: data.map((d) => d.value),
            barWidth: 12,
            showBackground: true,
            backgroundStyle: { color: c.grid, borderRadius: 4 },
            itemStyle: { color: SERIES[mode][1], borderRadius: 4 },
            label: { show: true, position: 'right', color: c.ink, fontWeight: 600 },
          },
        ],
      }
    },
    [JSON.stringify(data)],
  )
  return <div ref={ref} className="ad-chart" role="img" aria-label={data.map((d) => `${d.name} ${d.value}`).join(', ')} />
}
