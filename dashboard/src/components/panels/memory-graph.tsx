'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  GraphCanvas,
  GraphCanvasRef,
  type Theme,
  type GraphNode as ReagraphNode,
  type GraphEdge as ReagraphEdge,
  type InternalGraphNode,
} from 'reagraph'
import { useMissionControl } from '@/store'

// --- Agent graph interfaces ---

interface AgentFileInfo {
  path: string
  chunks: number
  textSize: number
}

interface AgentGraphData {
  name: string
  dbSize: number
  totalChunks: number
  totalFiles: number
  files: AgentFileInfo[]
}

// --- Wiki-link graph interfaces ---

interface WikiLinkNode {
  path: string
  name: string
  outgoing: string[]
  incoming: string[]
  linkCount: number
  hasSchema: boolean
}

interface WikiLinkGraphData {
  nodes: WikiLinkNode[]
  totalFiles: number
  totalLinks: number
  orphans: string[]
}

// --- Obsidian-inspired palette ---

const AGENT_COLORS = [
  '#b4befe', '#cba6f7', '#f5c2e7', '#89b4fa', '#74c7ec',
  '#89dceb', '#94e2d5', '#a6e3a1', '#f9e2af', '#fab387',
  '#eba0ac', '#f38ba8', '#cdd6f4', '#bac2de', '#a6adc8',
  '#b4befe', '#cba6f7',
]

function getFileColor(filePath: string): string {
  if (filePath.startsWith('sessions/') || filePath.includes('/sessions/')) return '#89dceb'
  if (filePath.startsWith('memory/') || filePath.includes('/memory/')) return '#94e2d5'
  if (filePath.startsWith('knowledge') || filePath.includes('/knowledge')) return '#b4befe'
  if (filePath.endsWith('.md')) return '#f9e2af'
  if (filePath.endsWith('.json') || filePath.endsWith('.jsonl')) return '#cba6f7'
  return '#89b4fa'
}

function getWikiNodeColor(path: string): string {
  if (path.startsWith('knowledge/') || path.includes('/knowledge/')) return '#b4befe' // lavender
  if (/\d{4}-\d{2}-\d{2}/.test(path)) return '#f9e2af'                                // yellow (daily)
  if (path.toLowerCase().includes('memory') || path.toLowerCase() === 'memory.md') return '#cba6f7' // mauve (hub)
  return '#94e2d5'                                                                       // teal
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// --- Obsidian graph theme ---

const obsidianTheme: Theme = {
  canvas: { background: '#11111b', fog: '#11111b' },
  node: {
    fill: '#6c7086',
    activeFill: '#cba6f7',
    opacity: 1,
    selectedOpacity: 1,
    inactiveOpacity: 0.1,
    label: { color: '#cdd6f4', stroke: '#11111b', activeColor: '#f5f5f7' },
  },
  ring: { fill: '#6c7086', activeFill: '#cba6f7' },
  edge: {
    fill: '#45475a',
    activeFill: '#cba6f7',
    opacity: 0.2,
    selectedOpacity: 0.6,
    inactiveOpacity: 0.03,
    label: { color: '#6c7086', activeColor: '#cdd6f4' },
  },
  arrow: { fill: '#45475a', activeFill: '#cba6f7' },
  lasso: {
    background: 'rgba(203, 166, 247, 0.08)',
    border: 'rgba(203, 166, 247, 0.25)',
  },
}

// --- Props ---

interface MemoryGraphProps {
  onFileSelect?: (path: string) => void
}

// --- Component ---

export function MemoryGraph({ onFileSelect }: MemoryGraphProps) {
  const t = useTranslations('memoryGraph')
  const { memoryGraphAgents, setMemoryGraphAgents, dashboardMode } = useMissionControl()
  const isLocal = dashboardMode === 'local'

  const agents = memoryGraphAgents || []

  // Mode: 'wikilinks' in local mode, 'agent' in gateway mode
  const [mode, setMode] = useState<'agent' | 'wikilinks'>(isLocal ? 'wikilinks' : 'agent')

  // Agent graph state
  const [selectedAgent, setSelectedAgent] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<AgentFileInfo | null>(null)

  // Wiki-link state
  const [wikiGraph, setWikiGraph] = useState<WikiLinkGraphData | null>(null)
  const [isLoadingWiki, setIsLoadingWiki] = useState(false)
  const [wikiError, setWikiError] = useState<string | null>(null)
  const [selectedWikiNode, setSelectedWikiNode] = useState<WikiLinkNode | null>(null)

  // Shared state
  const [searchQuery, setSearchQuery] = useState('')
  const [actives, setActives] = useState<string[]>([])
  const [hoveredNode, setHoveredNode] = useState<{ label: string; sub?: string } | null>(null)

  const graphRef = useRef<GraphCanvasRef | null>(null)

  // --- Data fetching ---

  const fetchAgentData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/memory/graph?agent=all')
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setMemoryGraphAgents(data.agents || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }, [setMemoryGraphAgents])

  const fetchWikiLinks = useCallback(async () => {
    setIsLoadingWiki(true)
    setWikiError(null)
    try {
      const res = await fetch('/api/memory/links')
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setWikiGraph(data)
    } catch (err: unknown) {
      setWikiError(err instanceof Error ? err.message : 'Failed to load wiki links')
    } finally {
      setIsLoadingWiki(false)
    }
  }, [])

  useEffect(() => {
    if (mode === 'agent' && memoryGraphAgents === null) fetchAgentData()
  }, [mode, fetchAgentData, memoryGraphAgents])

  useEffect(() => {
    if (mode === 'wikilinks' && wikiGraph === null) fetchWikiLinks()
  }, [mode, fetchWikiLinks, wikiGraph])

  // --- Agent graph stats ---

  const stats = useMemo(() => {
    const totalAgents = agents.length
    const totalFiles = agents.reduce((s, a) => s + a.totalFiles, 0)
    const totalChunks = agents.reduce((s, a) => s + a.totalChunks, 0)
    const totalSize = agents.reduce((s, a) => s + a.dbSize, 0)
    return { totalAgents, totalFiles, totalChunks, totalSize }
  }, [agents])

  // --- Agent graph nodes/edges ---

  const { graphNodes: agentNodes, graphEdges: agentEdges } = useMemo(() => {
    if (!agents.length) return { graphNodes: [], graphEdges: [] }
    const nodes: ReagraphNode[] = []
    const edges: ReagraphEdge[] = []

    if (selectedAgent === 'all') {
      agents.forEach((agent, i) => {
        const color = AGENT_COLORS[i % AGENT_COLORS.length]
        const hubSize = Math.max(5, Math.min(15, 4 + Math.sqrt(agent.totalChunks) * 0.8))
        nodes.push({ id: `hub-${agent.name}`, label: agent.name, fill: color, size: hubSize })
        const files = agent.files.slice(0, 25)
        files.forEach((file, fi) => {
          const fileSize = Math.max(1.5, Math.min(5, 1 + Math.sqrt(file.chunks) * 0.6))
          const nodeId = `file-${agent.name}-${fi}`
          nodes.push({ id: nodeId, label: '', fill: getFileColor(file.path), size: fileSize, data: { filePath: file.path, chunks: file.chunks, textSize: file.textSize, agentName: agent.name } })
          edges.push({ id: `edge-hub-${agent.name}-${nodeId}`, source: `hub-${agent.name}`, target: nodeId, fill: color })
        })
      })
    } else {
      const agent = agents.find((a) => a.name === selectedAgent)
      if (!agent) return { graphNodes: [], graphEdges: [] }
      const agentIdx = agents.indexOf(agent)
      const color = AGENT_COLORS[agentIdx % AGENT_COLORS.length]
      const hubSize = Math.max(6, Math.min(18, 5 + Math.sqrt(agent.totalChunks) * 0.8))
      nodes.push({ id: `hub-${agent.name}`, label: agent.name, fill: color, size: hubSize })

      let files = agent.files
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        files = files.filter((f) => f.path.toLowerCase().includes(q))
      }
      const displayFiles = files.slice(0, 120)
      displayFiles.forEach((file, fi) => {
        const fileSize = Math.max(2, Math.min(8, 2 + Math.sqrt(file.chunks) * 0.8))
        const nodeId = `file-${agent.name}-${fi}`
        nodes.push({ id: nodeId, label: file.path.split('/').pop() || file.path, fill: getFileColor(file.path), size: fileSize, data: { filePath: file.path, chunks: file.chunks, textSize: file.textSize, agentName: agent.name } })
        edges.push({ id: `edge-hub-${agent.name}-${nodeId}`, source: `hub-${agent.name}`, target: nodeId, fill: color })
      })

      const dirMap = new Map<string, string[]>()
      displayFiles.forEach((file, fi) => {
        const dir = file.path.split('/').slice(0, -1).join('/')
        if (!dir) return
        const nodeId = `file-${agent.name}-${fi}`
        if (!dirMap.has(dir)) dirMap.set(dir, [])
        dirMap.get(dir)!.push(nodeId)
      })
      for (const ids of dirMap.values()) {
        for (let i = 0; i < ids.length - 1 && i < 5; i++) {
          edges.push({ id: `edge-dir-${ids[i]}-${ids[i + 1]}`, source: ids[i], target: ids[i + 1] })
        }
      }
    }
    return { graphNodes: nodes, graphEdges: edges }
  }, [agents, selectedAgent, searchQuery])

  // --- Wiki-link graph nodes/edges ---

  const { graphNodes: wikiNodes, graphEdges: wikiEdges } = useMemo(() => {
    if (!wikiGraph?.nodes.length) return { graphNodes: [], graphEdges: [] }
    const nodes: ReagraphNode[] = []
    const edges: ReagraphEdge[] = []
    const edgeSet = new Set<string>()

    // Build a lookup map: name → path
    const nameToPath = new Map<string, string>()
    wikiGraph.nodes.forEach((n) => {
      nameToPath.set(n.name, n.path)
      // also map basename without extension
      const base = n.name.replace(/\.md$/, '')
      nameToPath.set(base, n.path)
    })

    let filteredNodes = wikiGraph.nodes
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filteredNodes = wikiGraph.nodes.filter((n) => n.name.toLowerCase().includes(q) || n.path.toLowerCase().includes(q))
    }

    filteredNodes.forEach((node) => {
      const size = Math.max(2.5, Math.min(10, 2 + node.linkCount * 0.6))
      const label = node.name.replace(/\.md$/, '')
      nodes.push({ id: node.path, label, fill: getWikiNodeColor(node.path), size })
    })

    const nodeIds = new Set(filteredNodes.map((n) => n.path))
    filteredNodes.forEach((node) => {
      node.outgoing.forEach((target) => {
        const targetPath = nameToPath.get(target) || nameToPath.get(target.replace(/\.md$/, ''))
        if (targetPath && nodeIds.has(targetPath)) {
          const edgeId = `${node.path}->${targetPath}`
          if (!edgeSet.has(edgeId)) {
            edgeSet.add(edgeId)
            edges.push({ id: edgeId, source: node.path, target: targetPath, fill: '#45475a' })
          }
        }
      })
    })

    return { graphNodes: nodes, graphEdges: edges }
  }, [wikiGraph, searchQuery])

  // Select which graph data to render
  const graphNodes = mode === 'wikilinks' ? wikiNodes : agentNodes
  const graphEdges = mode === 'wikilinks' ? wikiEdges : agentEdges

  // --- Auto-fit ---

  useEffect(() => {
    if (!graphNodes.length) return
    const t1 = setTimeout(() => graphRef.current?.fitNodesInView(undefined, { animated: false }), 800)
    const t2 = setTimeout(() => graphRef.current?.fitNodesInView(undefined, { animated: false }), 2500)
    const t3 = setTimeout(() => graphRef.current?.fitNodesInView(undefined, { animated: false }), 5000)
    const t4 = setTimeout(() => graphRef.current?.fitNodesInView(undefined, { animated: false }), 8000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [graphNodes.length, selectedAgent, mode])

  // --- Agent navigation helpers ---

  const goBack = useCallback(() => {
    setSelectedAgent('all')
    setSelectedFile(null)
    setSearchQuery('')
    setActives([])
    setHoveredNode(null)
  }, [])

  const drillInto = useCallback((agentName: string) => {
    setSelectedAgent(agentName)
    setSelectedFile(null)
    setSearchQuery('')
    setActives([])
    setHoveredNode(null)
  }, [])

  // --- Interaction handlers ---

  const handleNodeClick = useCallback((node: InternalGraphNode) => {
    if (mode === 'wikilinks') {
      const wikiNode = wikiGraph?.nodes.find((n) => n.path === node.id)
      if (wikiNode) setSelectedWikiNode(wikiNode)
      if (onFileSelect) onFileSelect(node.id)
      return
    }
    const id = node.id
    if (id.startsWith('hub-') && selectedAgent === 'all') {
      drillInto(id.replace('hub-', ''))
    } else if (id.startsWith('hub-') && selectedAgent !== 'all') {
      goBack()
    } else if (id.startsWith('file-') && node.data) {
      const { filePath, chunks, textSize } = node.data as { filePath: string; chunks: number; textSize: number }
      setSelectedFile({ path: filePath, chunks, textSize })
    }
  }, [mode, wikiGraph, selectedAgent, drillInto, goBack, onFileSelect])

  const handleNodeHover = useCallback((node: InternalGraphNode) => {
    setActives([node.id])
    if (mode === 'wikilinks') {
      const wikiNode = wikiGraph?.nodes.find((n) => n.path === node.id)
      if (wikiNode) {
        setHoveredNode({ label: wikiNode.name.replace(/\.md$/, ''), sub: `${wikiNode.outgoing.length} out · ${wikiNode.incoming.length} in · ${wikiNode.linkCount} links` })
      }
      return
    }
    if (node.data) {
      const d = node.data as { filePath: string; chunks: number; textSize: number; agentName: string }
      setHoveredNode({ label: d.filePath, sub: `${d.chunks} chunks / ${formatBytes(d.textSize)}` })
    } else if (node.id.startsWith('hub-')) {
      const name = node.id.replace('hub-', '')
      const agent = agents.find(a => a.name === name)
      if (agent) {
        setHoveredNode({ label: agent.name, sub: `${agent.totalChunks} chunks / ${agent.totalFiles} files / ${formatBytes(agent.dbSize)}` })
      }
    }
  }, [mode, wikiGraph, agents])

  const handleNodeUnhover = useCallback(() => {
    setActives([])
    setHoveredNode(null)
  }, [])

  const handleCanvasClick = useCallback(() => {
    setActives([])
    setSelectedFile(null)
    setSelectedWikiNode(null)
    setHoveredNode(null)
  }, [])

  // --- Mode switch ---
  const switchMode = (newMode: 'agent' | 'wikilinks') => {
    setMode(newMode)
    setActives([])
    setSelectedFile(null)
    setSelectedWikiNode(null)
    setHoveredNode(null)
    setSearchQuery('')
  }

  // --- Loading states ---

  const currentLoading = mode === 'wikilinks' ? isLoadingWiki : isLoading
  const currentError = mode === 'wikilinks' ? wikiError : error
  const currentRetry = mode === 'wikilinks' ? fetchWikiLinks : fetchAgentData

  if (currentLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: '#11111b' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#cba6f7]/30 border-t-[#cba6f7] animate-spin" />
          <span className="text-[#6c7086] text-sm font-mono">{t('loading')}</span>
        </div>
      </div>
    )
  }

  if (currentError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3" style={{ background: '#11111b' }}>
        <span className="text-[#f38ba8] text-sm">{currentError}</span>
        <button onClick={currentRetry} className="px-3 py-1.5 text-xs rounded-md bg-[#1e1e2e] border border-[#45475a] text-[#cdd6f4] hover:border-[#cba6f7]/50 transition-colors">
          {t('retry')}
        </button>
      </div>
    )
  }

  if (!graphNodes.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2" style={{ background: '#11111b' }}>
        {mode === 'wikilinks' ? (
          <>
            <span className="text-[#6c7086] text-sm font-mono">No wiki-links found</span>
            <span className="text-[#45475a] text-xs">Add [[wiki-links]] to your memory files</span>
          </>
        ) : (
          <>
            <span className="text-[#6c7086] text-sm">{t('noMemoryDatabases')}</span>
            <span className="text-[#45475a] text-xs">{t('noMemoryDatabasesHint')}</span>
          </>
        )}
      </div>
    )
  }

  const activeAgent = selectedAgent !== 'all' ? agents.find(a => a.name === selectedAgent) : null

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: '#11111b' }}>
      {/* Full-bleed graph canvas */}
      <GraphCanvas
        ref={graphRef}
        nodes={graphNodes}
        edges={graphEdges}
        theme={obsidianTheme}
        layoutType="forceDirected2d"
        layoutOverrides={{
          linkDistance: mode === 'wikilinks' ? 120 : (selectedAgent === 'all' ? 80 : 100),
          nodeStrength: mode === 'wikilinks' ? -120 : (selectedAgent === 'all' ? -60 : -80),
        }}
        labelType="auto"
        edgeArrowPosition="none"
        animated={true}
        draggable={true}
        defaultNodeSize={4}
        minNodeSize={1.5}
        maxNodeSize={15}
        cameraMode="pan"
        actives={actives}
        onNodeClick={handleNodeClick}
        onNodePointerOver={handleNodeHover}
        onNodePointerOut={handleNodeUnhover}
        onCanvasClick={handleCanvasClick}
      />

      {/* Mode toggle + breadcrumb (top-left) */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
        {/* Mode tabs */}
        <div className="flex items-center rounded-md overflow-hidden border border-[#45475a]/40 backdrop-blur-xl">
          <button
            onClick={() => switchMode('wikilinks')}
            className={`px-2.5 py-1 text-[11px] font-mono transition-all ${
              mode === 'wikilinks'
                ? 'bg-[#cba6f7]/20 text-[#cba6f7]'
                : 'bg-[#1e1e2e]/80 text-[#6c7086] hover:text-[#cdd6f4]'
            }`}
          >
            wiki
          </button>
          {!isLocal && (
            <button
              onClick={() => switchMode('agent')}
              className={`px-2.5 py-1 text-[11px] font-mono transition-all border-l border-[#45475a]/40 ${
                mode === 'agent'
                  ? 'bg-[#cba6f7]/20 text-[#cba6f7]'
                  : 'bg-[#1e1e2e]/80 text-[#6c7086] hover:text-[#cdd6f4]'
              }`}
            >
              agent
            </button>
          )}
        </div>

        {/* Agent breadcrumb (agent mode only) */}
        {mode === 'agent' && (
          <>
            <button
              onClick={goBack}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md backdrop-blur-xl transition-all ${
                selectedAgent === 'all'
                  ? 'bg-[#cba6f7]/15 text-[#cba6f7] border border-[#cba6f7]/25'
                  : 'bg-[#1e1e2e]/80 text-[#6c7086] border border-[#45475a]/50 hover:text-[#cdd6f4] hover:border-[#cba6f7]/30'
              }`}
            >
              {t('allAgents')}
            </button>
            {activeAgent && (
              <>
                <span className="text-[#45475a] text-[10px]">/</span>
                <span className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-[#cba6f7]/15 text-[#cba6f7] border border-[#cba6f7]/25">
                  {activeAgent.name}
                </span>
              </>
            )}
          </>
        )}
      </div>

      {/* Stats / search (top-right) */}
      <div className="absolute top-3 right-3 flex items-center gap-3 z-10">
        {(mode === 'wikilinks' || (mode === 'agent' && selectedAgent !== 'all')) && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={mode === 'wikilinks' ? 'filter nodes…' : t('filterFiles')}
            className="px-2.5 py-1 text-[11px] font-mono rounded-md bg-[#1e1e2e]/80 backdrop-blur-xl border border-[#45475a]/50 text-[#cdd6f4] placeholder-[#45475a] focus:outline-none focus:border-[#cba6f7]/40 w-36 transition-colors"
          />
        )}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#1e1e2e]/80 backdrop-blur-xl border border-[#45475a]/30">
          {mode === 'wikilinks' ? (
            <>
              <StatChip label="files" value={wikiGraph?.totalFiles ?? 0} />
              <Sep />
              <StatChip label="links" value={wikiGraph?.totalLinks ?? 0} />
              <Sep />
              <StatChip label="orphans" value={wikiGraph?.orphans.length ?? 0} />
            </>
          ) : (
            <>
              <StatChip label={t('statAgents')} value={stats.totalAgents} />
              <Sep />
              <StatChip label={t('statFiles')} value={stats.totalFiles} />
              <Sep />
              <StatChip label={t('statChunks')} value={stats.totalChunks} />
              <Sep />
              <StatChip label={t('statSize')} value={formatBytes(stats.totalSize)} />
            </>
          )}
        </div>
      </div>

      {/* Hover tooltip (bottom-center) */}
      {hoveredNode && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="px-3 py-2 rounded-lg bg-[#1e1e2e]/90 backdrop-blur-xl border border-[#45475a]/40 shadow-2xl shadow-black/40 max-w-md">
            <div className="text-[11px] font-mono text-[#cdd6f4] truncate">{hoveredNode.label}</div>
            {hoveredNode.sub && (
              <div className="text-[10px] font-mono text-[#6c7086] mt-0.5">{hoveredNode.sub}</div>
            )}
          </div>
        </div>
      )}

      {/* Selected wiki node detail (bottom-left) */}
      {mode === 'wikilinks' && selectedWikiNode && (
        <div className="absolute bottom-3 left-3 z-10 max-w-xs">
          <div className="px-4 py-3 rounded-lg bg-[#1e1e2e]/90 backdrop-blur-xl border border-[#45475a]/40 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h3 className="text-[11px] font-mono text-[#cdd6f4] truncate">
                {selectedWikiNode.name.replace(/\.md$/, '')}
              </h3>
              <button onClick={() => setSelectedWikiNode(null)} className="text-[#6c7086] hover:text-[#cdd6f4] text-xs transition-colors shrink-0">x</button>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#6c7086]">
              <span><span className="text-[#b4befe]">{selectedWikiNode.outgoing.length}</span> out</span>
              <span><span className="text-[#89dceb]">{selectedWikiNode.incoming.length}</span> in</span>
              {selectedWikiNode.hasSchema && <span className="text-[#a6e3a1]">schema ✓</span>}
            </div>
            {onFileSelect && (
              <button
                onClick={() => onFileSelect(selectedWikiNode.path)}
                className="mt-2 w-full text-[10px] font-mono text-[#cba6f7] hover:text-[#cdd6f4] transition-colors text-left"
              >
                open file →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected agent file detail (bottom-left) */}
      {mode === 'agent' && selectedFile && (
        <div className="absolute bottom-3 left-3 z-10 max-w-sm">
          <div className="px-4 py-3 rounded-lg bg-[#1e1e2e]/90 backdrop-blur-xl border border-[#45475a]/40 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4 mb-2">
              <h3 className="text-[11px] font-mono text-[#cdd6f4] truncate">{selectedFile.path}</h3>
              <button onClick={() => setSelectedFile(null)} className="text-[#6c7086] hover:text-[#cdd6f4] text-xs transition-colors shrink-0">x</button>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono text-[#6c7086]">
              <span><span className="text-[#cba6f7]">{selectedFile.chunks}</span> {t('chunks')}</span>
              <span><span className="text-[#89b4fa]">{formatBytes(selectedFile.textSize)}</span> {t('text')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Color legend (bottom-right) */}
      <div className="absolute bottom-3 right-3 z-10">
        <div className="px-3 py-2 rounded-lg bg-[#1e1e2e]/80 backdrop-blur-xl border border-[#45475a]/30">
          {mode === 'wikilinks' ? (
            <div className="flex items-center gap-3 text-[9px] font-mono text-[#585b70]">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#b4befe]" />knowledge</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#f9e2af]" />daily</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7]" />hub</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#94e2d5]" />other</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-[9px] font-mono text-[#585b70]">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#89dceb]" />{t('legendSessions')}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#94e2d5]" />{t('legendMemory')}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#b4befe]" />{t('legendKnowledge')}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#f9e2af]" />.md</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#cba6f7]" />.json</span>
            </div>
          )}
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[9px] font-mono text-[#313244] pointer-events-none select-none">
        {mode === 'wikilinks' ? 'click node to open file · drag to explore · scroll to zoom' : t('keyboardHint')}
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: number | string }) {
  const display = typeof value === 'number' ? value.toLocaleString() : value
  return (
    <span className="text-[10px] font-mono">
      <span className="text-[#cdd6f4]">{display}</span>
      <span className="text-[#585b70] ml-1">{label}</span>
    </span>
  )
}

function Sep() {
  return <span className="text-[#313244]">|</span>
}
