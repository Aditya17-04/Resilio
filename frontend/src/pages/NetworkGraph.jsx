import { useEffect, useRef, useState } from 'react'
import { networkApi, suppliersApi } from '../api'
import { RiskBadge, RiskBar } from '../components/RiskBadge'
import * as d3 from 'd3'

const TIER_COLORS = { 1: '#3B82F6', 2: '#8B5CF6', 3: '#F59E0B' }
const RISK_COLOR = (score) =>
  score >= 75 ? '#EF4444' : score >= 55 ? '#F97316' : score >= 35 ? '#F59E0B' : '#10B981'

export default function NetworkGraph() {
  const svgRef = useRef(null)
  const [graphData, setGraphData] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [spof, setSpof] = useState([])
  const [showSPOF, setShowSPOF] = useState(false)

  useEffect(() => {
    Promise.all([networkApi.getGraph(), networkApi.getSpof()])
      .then(([g, s]) => {
        setGraphData(g.data)
        setSpof(s.data)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!graphData || !svgRef.current) return

    const container = svgRef.current.parentElement
    const W = container.clientWidth
    const H = container.clientHeight || 580

    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', W)
      .attr('height', H)

    const g = svg.append('g')

    // Zoom
    const zoom = d3.zoom()
      .scaleExtent([0.15, 3])
      .on('zoom', (event) => g.attr('transform', event.transform))
    svg.call(zoom)

    // Prepare
    const nodes = graphData.nodes.map(n => ({ ...n }))
    const links = graphData.edges.map(e => ({
      source: e.source, target: e.target,
      volume_percent: e.volume_percent,
      criticality: e.criticality,
    }))

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        const srcTier = nodes.find(n => n.id === d.source?.id)?.tier || 2
        return 70 + (3 - srcTier) * 30
      }).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(12))
      .force('x', d3.forceX(W / 2).strength(0.03))
      .force('y', d3.forceY(d => {
        const tier = d.tier || 2
        return H * (0.2 + (tier - 1) * 0.25)
      }).strength(0.15))

    // Arrow markers
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 18)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(100,116,139,0.5)')

    // Links
    const link = g.append('g').selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', d => d.criticality === 'high' ? 'rgba(239,68,68,0.3)' : 'rgba(100,116,139,0.2)')
      .attr('stroke-width', d => d.criticality === 'high' ? 1.5 : 0.8)
      .attr('marker-end', 'url(#arrowhead)')

    // Nodes
    const node = g.append('g').selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y })
        .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
      )
      .on('click', (event, d) => { event.stopPropagation(); setSelected(d) })

    const r = d => d.tier === 1 ? 9 : d.tier === 2 ? 7 : 5

    // Outer glow ring for high risk
    node.filter(d => (d.geographic_risk + d.financial_risk) / 2 > 60)
      .append('circle')
      .attr('r', d => r(d) + 4)
      .attr('fill', 'none')
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3)

    node.append('circle')
      .attr('r', r)
      .attr('fill', d => RISK_COLOR((d.geographic_risk + d.financial_risk) / 2))
      .attr('stroke', d => TIER_COLORS[d.tier] || '#64748B')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.9)

    // Tier label dot
    node.append('circle')
      .attr('r', 2.5)
      .attr('fill', d => TIER_COLORS[d.tier] || '#64748B')
      .attr('opacity', 0.8)

    node.append('title').text(d => `${d.name}\nTier ${d.tier} | ${d.country_name}\nRisk: ${Math.round((d.geographic_risk + d.financial_risk) / 2)}`)

    svg.on('click', () => setSelected(null))

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => simulation.stop()
  }, [graphData])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Graph */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold gradient-text">Supply Network Graph</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {graphData ? `${graphData.nodes.length} suppliers · ${graphData.edges.length} dependencies` : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              {Object.entries(TIER_COLORS).map(([t, c]) => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: c, background: 'transparent' }}></div>
                  <span>Tier {t}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowSPOF(!showSPOF)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${showSPOF ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              ⚡ {spof.length} SPOFs
            </button>
          </div>
        </div>

        <div className="glass-card flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-slate-500">Building supply network...</p>
              </div>
            </div>
          )}
          <svg ref={svgRef} className="w-full h-full" />
          {/* Controls hint */}
          <div className="absolute bottom-3 left-3 text-xs text-slate-600">
            Scroll to zoom · Drag nodes · Click to inspect
          </div>
          {/* Risk color legend */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-slate-500">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div><span>Low</span>
            <div className="w-3 h-3 rounded-full bg-amber-500"></div><span>Med</span>
            <div className="w-3 h-3 rounded-full bg-orange-500"></div><span>High</span>
            <div className="w-3 h-3 rounded-full bg-red-500"></div><span>Critical</span>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-80 border-l border-slate-700/40 flex flex-col overflow-hidden"
        style={{ background: '#080C18' }}>

        {/* SPOF List or Selected Supplier */}
        {showSPOF && !selected ? (
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm font-semibold text-red-400 mb-3">⚡ Single Points of Failure</p>
            <p className="text-xs text-slate-500 mb-4">Nodes whose removal cascades failure</p>
            <div className="space-y-2">
              {spof.map((s, i) => (
                <div key={i} className="glass-card p-3">
                  <p className="text-xs font-semibold text-slate-200 truncate">{s.supplier_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.country_code} · Tier {s.tier}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Centrality: <span className="text-amber-400 font-mono">{s.centrality_score}</span></span>
                    <span className="text-red-400">{s.dependents_count} downstream</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : selected ? (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-slate-100">{selected.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selected.country_name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-600 hover:text-slate-400 text-lg">×</button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Tier', value: `Tier ${selected.tier}` },
                  { label: 'Industry', value: selected.industry },
                  { label: 'Component', value: selected.component },
                  { label: 'Country', value: selected.country_code },
                ].map((item, i) => (
                  <div key={i} className="bg-navy-800/60 rounded-lg p-2.5">
                    <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                    <p className="text-xs font-semibold text-slate-200 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card p-3">
                <p className="text-xs text-slate-500 mb-2">Risk Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Geographic</span>
                    <span className="font-mono text-slate-200">{selected.geographic_risk}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Financial</span>
                    <span className="font-mono text-slate-200">{selected.financial_risk}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Centrality</span>
                    <span className="font-mono text-slate-200">{selected.centrality}</span>
                  </div>
                </div>
              </div>

              <div className="glass-card p-3">
                <p className="text-xs text-slate-500 mb-1.5">Overall Risk Score</p>
                <RiskBar score={Math.round((selected.geographic_risk + selected.financial_risk) / 2)} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-3xl mb-3">🕸️</p>
              <p className="text-sm text-slate-400 font-medium">Click any node</p>
              <p className="text-xs text-slate-600 mt-1">to inspect supplier details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
