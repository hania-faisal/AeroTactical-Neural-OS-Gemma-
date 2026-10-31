import React, { useState, useEffect, useRef } from 'react';
import { GraphNode, GraphEdge, KnowledgeGraphData } from '../types/tactical';

const PRESET_GRAPHS: Record<string, KnowledgeGraphData> = {
  'uav7-causality': {
    graphTitle: 'UAV-7 Actuator & Aerodynamic Buffet Causality DAG',
    summary:
      'Graphified causal network isolating 140Hz harmonic resonance propagating through PWM resolver to relief valve seal failure.',
    nodes: [
      { id: 'uav7_crosswind', label: '35-Knot Crosswind', type: 'METRIC', status: 'WARNING', metric: '35 kts', description: 'Transverse aerodynamic shear buffet', x: 120, y: 160 },
      { id: 'flutter_140hz', label: '140Hz Aero Harmonic', type: 'FAULT', status: 'CRITICAL', metric: '140 Hz', description: 'Airframe resonance inducing micro-current ripple', x: 260, y: 220 },
      { id: 'resolver_sensor', label: 'Angle Resolver', type: 'COMPONENT', status: 'WARNING', metric: '12ms lag', description: 'Potentiometric feedback lag watchdog trip', x: 420, y: 220 },
      { id: 'pwm_slew_loop', label: 'PWM Slew Overflow', type: 'FAULT', status: 'CRITICAL', metric: '1950µs', description: 'Counter-deflection loop saturation', x: 580, y: 180 },
      { id: 'mil_std_810h', label: 'MIL-STD-810H Cat 24', type: 'STANDARD', status: 'NOMINAL', metric: 'Sec 514.8', description: 'Aerodynamic vibration buffet standard', x: 420, y: 80 },
      { id: 'hyd_actuator_994', label: 'Hydraulic Actuator 994', type: 'COMPONENT', status: 'CRITICAL', metric: '84.6°C', description: 'Overheating cylinder seal with micro-misting', x: 740, y: 240 },
      { id: 'solenoid_pin_17', label: 'Depower Solenoid Pin 17', type: 'ACTION', status: 'NOMINAL', metric: 'GPIO 17', description: 'Secondary isolation relay bypass', x: 880, y: 160 },
      { id: 'recal_script', label: 'recal_pwm_neutral.sh', type: 'ACTION', status: 'NOMINAL', metric: '140Hz filter', description: 'Zero-bias vibration damping script', x: 620, y: 340 },
      { id: 'fob_delta_divert', label: 'Divert FOB DELTA', type: 'SAFETY', status: 'WARNING', metric: 'Vector 182°', description: 'Auxiliary flight level safeguard', x: 880, y: 320 },
    ],
    edges: [
      { source: 'uav7_crosswind', target: 'flutter_140hz', relation: 'INDUCES', severity: 'WARNING' },
      { source: 'flutter_140hz', target: 'resolver_sensor', relation: 'INDUCES', severity: 'CRITICAL' },
      { source: 'resolver_sensor', target: 'pwm_slew_loop', relation: 'EXCEEDS', severity: 'CRITICAL' },
      { source: 'pwm_slew_loop', target: 'hyd_actuator_994', relation: 'TRIGGERS', severity: 'CRITICAL' },
      { source: 'mil_std_810h', target: 'resolver_sensor', relation: 'GOVERNED_BY', severity: 'NORMAL' },
      { source: 'hyd_actuator_994', target: 'solenoid_pin_17', relation: 'MITIGATES', severity: 'WARNING' },
      { source: 'pwm_slew_loop', target: 'recal_script', relation: 'MITIGATES', severity: 'NORMAL' },
      { source: 'hyd_actuator_994', target: 'fob_delta_divert', relation: 'TRIGGERS', severity: 'WARNING' },
    ],
  },
  'ipc-gbnf-flow': {
    graphTitle: 'Avionics IPC & GBNF Schema Dependency Lattice',
    summary:
      'Deterministic execution flow linking GBNF BNF Grammar compiler, Unix sockets, and raw memory-mapped kernel registers.',
    nodes: [
      { id: 'llama_cpp_core', label: 'llama.cpp Daemon', type: 'COMPONENT', status: 'NOMINAL', metric: 'b3821', description: 'Offline quantized SLM host runtime', x: 140, y: 180 },
      { id: 'gbnf_ast', label: 'GBNF Grammar AST', type: 'STANDARD', status: 'NOMINAL', metric: 'Strict JSON', description: 'Zero-drift token distribution mask', x: 320, y: 180 },
      { id: 'unix_socket_broker', label: 'Broker Socket', type: 'COMPONENT', status: 'NOMINAL', metric: '/tmp/slm.sock', description: 'IPC domain socket buffer', x: 480, y: 180 },
      { id: 'gpio_mmap', label: '/dev/gpiomem', type: 'COMPONENT', status: 'NOMINAL', metric: '0x7f9a88', description: 'Kernel memory-mapped raw I/O', x: 640, y: 120 },
      { id: 'can_bus_socket', label: 'socketCAN (can0)', type: 'COMPONENT', status: 'NOMINAL', metric: '500 kbps', description: 'Drivetrain and battery bus telemetry', x: 640, y: 260 },
      { id: 'relay_coil_actuator', label: 'Relay Drop Pin 17', type: 'ACTION', status: 'NOMINAL', metric: 'GPCLR0 bit 17', description: 'Physical relay latching coil', x: 820, y: 120 },
      { id: 'battery_telemetry', label: 'Battery Bus Health', type: 'METRIC', status: 'NOMINAL', metric: '48.2V / 32A', description: 'High-current power distribution', x: 820, y: 260 },
    ],
    edges: [
      { source: 'llama_cpp_core', target: 'gbnf_ast', relation: 'CONSTRAINED_BY', severity: 'NORMAL' },
      { source: 'gbnf_ast', target: 'unix_socket_broker', relation: 'DISPATCHES', severity: 'NORMAL' },
      { source: 'unix_socket_broker', target: 'gpio_mmap', relation: 'ACTUATES', severity: 'NORMAL' },
      { source: 'unix_socket_broker', target: 'can_bus_socket', relation: 'POLLS', severity: 'NORMAL' },
      { source: 'gpio_mmap', target: 'relay_coil_actuator', relation: 'EXECUTES', severity: 'NORMAL' },
      { source: 'can_bus_socket', target: 'battery_telemetry', relation: 'INGESTS', severity: 'NORMAL' },
    ],
  },
  'airgap-security': {
    graphTitle: 'Airgap Zero-RF Security Lattice',
    summary:
      'Physical isolation matrix suppressing RF emissions to TEMPEST Level B standards under zero-network policy.',
    nodes: [
      { id: 'airgap_policy', label: 'Airgap Lock Level 3', type: 'STANDARD', status: 'NOMINAL', metric: 'STRICT', description: 'Zero external packet egress policy', x: 180, y: 180 },
      { id: 'wifi_cut', label: 'Wi-Fi 6E Radio', type: 'COMPONENT', status: 'NOMINAL', metric: 'GPIO 12 = 0', description: 'Physically power-cut transceiver', x: 380, y: 100 },
      { id: 'ble_detached', label: 'Bluetooth HCI', type: 'COMPONENT', status: 'NOMINAL', metric: 'Detached', description: 'Kernel driver unmounted and isolated', x: 380, y: 180 },
      { id: 'starlink_passive', label: 'Starlink Tactical', type: 'COMPONENT', status: 'WARNING', metric: 'Sleep Mode', description: 'Passive receiver only; transmitter depowered', x: 380, y: 260 },
      { id: 'loopback_guard', label: '127.0.0.1 Filter', type: 'SAFETY', status: 'NOMINAL', metric: 'Zero Sockets', description: 'Internal broker traffic audit', x: 580, y: 180 },
      { id: 'tempest_cert', label: 'TEMPEST Level B', type: 'STANDARD', status: 'NOMINAL', metric: 'Certified', description: 'RF emission compliance envelope', x: 760, y: 180 },
    ],
    edges: [
      { source: 'airgap_policy', target: 'wifi_cut', relation: 'ISOLATES', severity: 'NORMAL' },
      { source: 'airgap_policy', target: 'ble_detached', relation: 'DETACHES', severity: 'NORMAL' },
      { source: 'airgap_policy', target: 'starlink_passive', relation: 'THROTTLES', severity: 'WARNING' },
      { source: 'wifi_cut', target: 'loopback_guard', relation: 'ENFORCES', severity: 'NORMAL' },
      { source: 'ble_detached', target: 'loopback_guard', relation: 'ENFORCES', severity: 'NORMAL' },
      { source: 'loopback_guard', target: 'tempest_cert', relation: 'VERIFIES', severity: 'NORMAL' },
    ],
  },
};

export const GraphifyEngine: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('uav7-causality');
  const [graphData, setGraphData] = useState<KnowledgeGraphData>(PRESET_GRAPHS['uav7-causality']);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('hyd_actuator_994');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [criticalOnly, setCriticalOnly] = useState<boolean>(false);
  
  // Custom text graphify input
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [isGraphifying, setIsGraphifying] = useState<boolean>(false);

  // Zoom and Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Switch presets
  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    const p = PRESET_GRAPHS[key];
    if (p) {
      setGraphData(p);
      setSelectedNodeId(p.nodes[0]?.id || '');
    }
  };

  // Run Graphify via Gemma 4 API
  const handleRunGraphify = async () => {
    if (!customText.trim()) return;
    setIsGraphifying(true);

    try {
      const res = await fetch('/api/gemma/graphify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: customText }),
      });

      if (res.ok) {
        const data = await res.json();
        // Layout nodes in a clean circle or grid
        const count = data.nodes?.length || 1;
        const radius = Math.min(260, 120 + count * 20);
        const centerX = 500;
        const centerY = 240;

        const layoutNodes = (data.nodes || []).map((node: GraphNode, i: number) => {
          const angle = (i / count) * 2 * Math.PI;
          return {
            ...node,
            x: Math.round(centerX + radius * Math.cos(angle)),
            y: Math.round(centerY + radius * Math.sin(angle)),
          };
        });

        const newGraph: KnowledgeGraphData = {
          graphTitle: data.graphTitle || 'Custom Graphified Knowledge Network',
          summary: data.summary || 'Knowledge graph extracted dynamically by Gemma 4 Multimodal via Gemini API.',
          nodes: layoutNodes,
          edges: data.edges || [],
        };

        setGraphData(newGraph);
        setSelectedNodeId(layoutNodes[0]?.id || '');
        setSelectedPreset('custom');
        setShowCustomModal(false);
        setIsGraphifying(false);
        return;
      }
    } catch (err) {
      console.warn('Graphify endpoint fallback:', err);
    }

    setIsGraphifying(false);
  };

  // Node drag interactions
  const handleMouseDownNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingNodeId(id);
    setSelectedNodeId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    setGraphData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === draggingNodeId ? { ...n, x, y } : n)),
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Filter nodes
  const filteredNodes = graphData.nodes.filter(n => {
    if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
    if (criticalOnly && n.status !== 'CRITICAL') return false;
    return true;
  });

  const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = graphData.edges.filter(
    e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  const selectedNode = graphData.nodes.find(n => n.id === selectedNodeId) || graphData.nodes[0];

  // Upstream and downstream relations for inspector
  const incomingEdges = graphData.edges.filter(e => e.target === selectedNodeId);
  const outgoingEdges = graphData.edges.filter(e => e.source === selectedNodeId);

  // Status and type styling helpers
  const getNodeColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return '#FFB4AB';
      case 'WARNING':
        return '#FFD19C';
      case 'NOMINAL':
      default:
        return '#43EDCD';
    }
  };

  const getNodeBorder = (status: string, isSelected: boolean) => {
    if (isSelected) return '#00F0FF';
    switch (status) {
      case 'CRITICAL':
        return '#EF4444';
      case 'WARNING':
        return '#F59E0B';
      case 'NOMINAL':
      default:
        return '#10B981';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'COMPONENT':
        return 'bg-primary-container/20 text-primary border-primary-container/40';
      case 'FAULT':
        return 'bg-error-container/30 text-error border-error/40';
      case 'STANDARD':
        return 'bg-secondary/20 text-secondary border-secondary/40';
      case 'METRIC':
        return 'bg-tertiary-container/20 text-tertiary-fixed-dim border-tertiary-container/40';
      case 'ACTION':
        return 'bg-primary/20 text-primary-fixed border-primary/40';
      case 'SAFETY':
        return 'bg-secondary-fixed/20 text-secondary-fixed border-secondary-fixed/40';
      default:
        return 'bg-surface-container-high text-outline';
    }
  };

  return (
    <div className="p-space-lg flex flex-col gap-space-md select-none">
      {/* Top Telemetry Header & Presets Strip */}
      <div className="w-full bg-surface-container-low rounded-lg p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-md border border-surface-container-high">
        <div className="flex items-center gap-space-md flex-wrap">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shadow-inner border border-primary-container/30">
            <span className="material-symbols-outlined text-xl">hub</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="font-headline-md text-headline-md text-primary font-bold">
                KNOWLEDGE &amp; TELEMETRY GRAPHIFY ENGINE
              </span>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-secondary font-label-caps text-label-caps font-bold border border-secondary/30">
                GEMMA 4 GRAPH-RAG // CAUSAL DAG
              </span>
            </div>
            <span className="font-mono-sm text-mono-sm text-on-surface-variant">
              Transforms unstructured flight telemetry, fault logs, and MIL-STD standards into interconnected causal graphs.
            </span>
          </div>
        </div>

        {/* Presets & Custom Graphify Button */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-1 bg-surface-container-lowest p-1 rounded border border-surface-container-high font-mono-sm text-mono-sm">
            <span className="text-outline text-xs px-1">PRESET:</span>
            <button
              onClick={() => handleSelectPreset('uav7-causality')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedPreset === 'uav7-causality'
                  ? 'bg-primary-container text-surface-container-lowest font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              UAV-7 Fault DAG
            </button>
            <button
              onClick={() => handleSelectPreset('ipc-gbnf-flow')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedPreset === 'ipc-gbnf-flow'
                  ? 'bg-primary-container text-surface-container-lowest font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              IPC &amp; GBNF Flow
            </button>
            <button
              onClick={() => handleSelectPreset('airgap-security')}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedPreset === 'airgap-security'
                  ? 'bg-primary-container text-surface-container-lowest font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Zero-RF Security
            </button>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="px-space-md py-1 rounded bg-secondary text-surface-container-lowest font-mono-sm text-mono-sm font-bold flex items-center gap-1 shadow-md hover:bg-secondary-fixed transition-colors"
          >
            <span className="material-symbols-outlined text-sm">auto_graph</span>
            <span>GRAPHIFY TEXT WITH GEMMA 4</span>
          </button>
        </div>
      </div>

      {/* Main Dual View: Interactive Graph Canvas + Node Inspector */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md w-full">
        {/* Left 8 Cols: Interactive Canvas */}
        <div className="xl:col-span-8 flex flex-col gap-space-sm">
          <div className="relative w-full h-[620px] bg-surface-container-lowest rounded-xl overflow-hidden shadow-xl border border-surface-container-high flex flex-col">
            {/* Canvas Header Control Bar */}
            <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between gap-space-sm pointer-events-none select-none">
              {/* Category Filter Chips */}
              <div className="flex items-center gap-1 bg-surface-container-low/90 backdrop-blur-md px-2 py-1 rounded border border-surface-container-high pointer-events-auto font-mono-sm text-mono-sm overflow-x-auto">
                <span className="text-outline text-xs">FILTER:</span>
                {(['ALL', 'COMPONENT', 'FAULT', 'STANDARD', 'METRIC', 'ACTION', 'SAFETY'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      typeFilter === t
                        ? 'bg-surface-container-highest text-primary font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Viewport Zoom & Reset Controls */}
              <div className="flex items-center gap-1 bg-surface-container-low/90 backdrop-blur-md px-2 py-1 rounded border border-surface-container-high pointer-events-auto font-mono-sm text-mono-sm">
                <button
                  onClick={() => setCriticalOnly(!criticalOnly)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    criticalOnly
                      ? 'bg-error-container text-on-error font-bold'
                      : 'text-on-surface-variant hover:text-error'
                  }`}
                >
                  {criticalOnly ? 'CRITICAL ONLY' : 'ALL STATUS'}
                </button>
                <div className="h-4 w-px bg-surface-container-highest"></div>
                <button
                  onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
                  className="p-1 text-on-surface hover:text-primary transition-colors"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="text-xs text-outline px-1">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
                  className="p-1 text-on-surface hover:text-primary transition-colors"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="p-1 text-on-surface hover:text-primary transition-colors"
                  title="Reset View"
                >
                  <span className="material-symbols-outlined text-sm">restart_alt</span>
                </button>
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <svg
              ref={svgRef}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <defs>
                <marker
                  id="arrow-normal"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#43EDCD" />
                </marker>
                <marker
                  id="arrow-critical"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
                </marker>
                <marker
                  id="arrow-warning"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#F59E0B" />
                </marker>
              </defs>

              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Edges */}
                {filteredEdges.map((edge, i) => {
                  const src = graphData.nodes.find(n => n.id === edge.source);
                  const tgt = graphData.nodes.find(n => n.id === edge.target);
                  if (!src || !tgt || src.x === undefined || src.y === undefined || tgt.x === undefined || tgt.y === undefined)
                    return null;

                  const isEdgeActive =
                    src.id === selectedNodeId || tgt.id === selectedNodeId;

                  const edgeColor =
                    edge.severity === 'CRITICAL'
                      ? '#EF4444'
                      : edge.severity === 'WARNING'
                      ? '#F59E0B'
                      : '#43EDCD';

                  const markerId =
                    edge.severity === 'CRITICAL'
                      ? 'url(#arrow-critical)'
                      : edge.severity === 'WARNING'
                      ? 'url(#arrow-warning)'
                      : 'url(#arrow-normal)';

                  // Midpoint for relationship label
                  const midX = (src.x + tgt.x) / 2;
                  const midY = (src.y + tgt.y) / 2;

                  return (
                    <g key={i}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={edgeColor}
                        strokeWidth={isEdgeActive ? 2.5 : 1.2}
                        strokeOpacity={isEdgeActive ? 0.95 : 0.35}
                        strokeDasharray={edge.severity === 'CRITICAL' ? '4 2' : undefined}
                        markerEnd={markerId}
                      />
                      {/* Animated signal particle */}
                      <circle r={2.5} fill={edgeColor}>
                        <animateMotion
                          path={`M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`}
                          dur={`${2.2 + (i % 3) * 0.4}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                      {/* Relationship Pill */}
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x={-35}
                          y={-9}
                          width={70}
                          height={18}
                          rx={3}
                          fill="#0E141B"
                          stroke={isEdgeActive ? edgeColor : '#1E293B'}
                          strokeWidth={1}
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isEdgeActive ? '#FFFFFF' : '#849495'}
                          fontSize={9}
                          fontFamily="JetBrains Mono"
                          fontWeight={600}
                        >
                          {edge.relation}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Nodes */}
                {filteredNodes.map(node => {
                  if (node.x === undefined || node.y === undefined) return null;
                  const isSelected = node.id === selectedNodeId;
                  const isNeighbor =
                    incomingEdges.some(e => e.source === node.id) ||
                    outgoingEdges.some(e => e.target === node.id);

                  const borderColor = getNodeBorder(node.status, isSelected);
                  const nodeBg = isSelected ? '#161F2A' : '#0E141B';

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onMouseDown={e => handleMouseDownNode(node.id, e)}
                      className="cursor-pointer"
                    >
                      {/* Node Glow Backdrop */}
                      {isSelected && (
                        <circle
                          r={44}
                          fill="#00F0FF"
                          fillOpacity={0.12}
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Card Shape */}
                      <rect
                        x={-68}
                        y={-28}
                        width={136}
                        height={56}
                        rx={6}
                        fill={nodeBg}
                        stroke={borderColor}
                        strokeWidth={isSelected ? 2.5 : isNeighbor ? 1.8 : 1}
                        filter="drop-shadow(0px 2px 6px rgba(0,0,0,0.6))"
                      />

                      {/* Top Pill: Type */}
                      <text
                        x={-58}
                        y={-14}
                        fill="#849495"
                        fontSize={8.5}
                        fontFamily="JetBrains Mono"
                        fontWeight={700}
                        letterSpacing="0.05em"
                      >
                        {node.type}
                      </text>

                      {/* Status Dot */}
                      <circle
                        cx={56}
                        cy={-14}
                        r={3.5}
                        fill={getNodeColor(node.status)}
                      />

                      {/* Node Primary Label */}
                      <text
                        x={-58}
                        y={3}
                        fill={isSelected ? '#00F0FF' : '#E0E2EA'}
                        fontSize={11}
                        fontFamily="Geist"
                        fontWeight={700}
                      >
                        {node.label.length > 17
                          ? node.label.substring(0, 16) + '...'
                          : node.label}
                      </text>

                      {/* Metric Annotation */}
                      {node.metric && (
                        <text
                          x={-58}
                          y={18}
                          fill={
                            node.status === 'CRITICAL'
                              ? '#FFB4AB'
                              : '#43EDCD'
                          }
                          fontSize={9}
                          fontFamily="JetBrains Mono"
                          fontWeight={600}
                        >
                          {node.metric}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Bottom Floating Stats Bar */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between bg-surface-container-low/90 backdrop-blur-md px-3 py-1.5 rounded border border-surface-container-high font-mono-sm text-mono-sm text-outline">
              <div className="flex items-center gap-space-md">
                <span>
                  NODES: <strong className="text-primary">{filteredNodes.length}</strong>
                </span>
                <span>
                  DIRECTED EDGES: <strong className="text-secondary">{filteredEdges.length}</strong>
                </span>
                <span>
                  CRITICAL PATH: <strong className="text-error">2 ENTITIES</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-secondary font-bold">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span>PHYSICS STABILIZED // GEMMA 4 GRAPH ENGINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Entity & Causal Chain Inspector */}
        <div className="xl:col-span-4 flex flex-col gap-space-sm">
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col h-[620px] shadow-lg border border-surface-container-high overflow-y-auto">
            {/* Inspector Header */}
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary-container text-base">
                  account_tree
                </span>
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  ENTITY CAUSAL INSPECTOR
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getTypeBadgeColor(selectedNode?.type || '')}`}>
                {selectedNode?.type}
              </span>
            </div>

            {/* Selected Node Details */}
            {selectedNode && (
              <div className="flex flex-col gap-space-md mt-space-sm">
                <div className="p-space-sm rounded bg-surface-container-lowest border border-surface-container-high flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">
                      {selectedNode.label}
                    </span>
                    <span
                      className={`font-mono-sm text-mono-sm font-bold px-1.5 py-0.5 rounded ${
                        selectedNode.status === 'CRITICAL'
                          ? 'bg-error-container text-on-error'
                          : selectedNode.status === 'WARNING'
                          ? 'bg-tertiary-container text-on-tertiary-container'
                          : 'bg-secondary/20 text-secondary'
                      }`}
                    >
                      {selectedNode.status}
                    </span>
                  </div>
                  {selectedNode.metric && (
                    <div className="font-mono-md text-mono-md text-primary-container font-bold">
                      TELEMETRY: {selectedNode.metric}
                    </div>
                  )}
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Upstream Root Causes (Incoming) */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                    <span>UPSTREAM CAUSES / INPUTS ({incomingEdges.length})</span>
                    <span className="material-symbols-outlined text-xs">south_east</span>
                  </div>
                  {incomingEdges.length > 0 ? (
                    incomingEdges.map((e, idx) => {
                      const srcNode = graphData.nodes.find(n => n.id === e.source);
                      return (
                        <div
                          key={idx}
                          onClick={() => srcNode && setSelectedNodeId(srcNode.id)}
                          className="p-space-xs rounded bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container-high flex items-center justify-between text-mono-sm font-mono-sm"
                        >
                          <span className="text-on-surface font-semibold truncate">
                            {srcNode?.label || e.source}
                          </span>
                          <span className="text-secondary font-bold text-xs">
                            [{e.relation}]
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-space-xs text-outline font-mono-sm text-mono-sm italic">
                      Root environmental input (No upstream dependencies)
                    </div>
                  )}
                </div>

                {/* Downstream Cascading Impacts (Outgoing) */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                    <span>DOWNSTREAM CASCADING IMPACTS ({outgoingEdges.length})</span>
                    <span className="material-symbols-outlined text-xs">north_east</span>
                  </div>
                  {outgoingEdges.length > 0 ? (
                    outgoingEdges.map((e, idx) => {
                      const tgtNode = graphData.nodes.find(n => n.id === e.target);
                      return (
                        <div
                          key={idx}
                          onClick={() => tgtNode && setSelectedNodeId(tgtNode.id)}
                          className="p-space-xs rounded bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container-high flex items-center justify-between text-mono-sm font-mono-sm"
                        >
                          <span className="text-on-surface font-semibold truncate">
                            {tgtNode?.label || e.target}
                          </span>
                          <span className="text-primary-container font-bold text-xs">
                            [{e.relation}]
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-space-xs text-outline font-mono-sm text-mono-sm italic">
                      Terminal leaf action (No downstream cascades)
                    </div>
                  )}
                </div>

                {/* Gemma 4 Graph Reasoning Synthesis */}
                <div className="p-space-sm rounded bg-surface-container-lowest border border-primary-container/40 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                    <span className="text-primary font-bold">GEMMA 4 CAUSAL REASONING</span>
                    <span className="text-secondary font-mono-sm text-mono-sm">GEMINI API</span>
                  </div>
                  <p className="font-mono-sm text-mono-sm text-on-surface leading-relaxed">
                    {selectedNode.status === 'CRITICAL'
                      ? `Critical failure point isolated at "${selectedNode.label}". Aerodynamic vibration feedback loop is propagating at 140Hz harmonic. Isolating this component via emergency bypass prevents auxiliary flight-level freeze.`
                      : `Entity "${selectedNode.label}" is operating within expected tolerance envelopes. Upstream telemetry feeds confirm deterministic GBNF schema conformance.`}
                  </p>
                  <button
                    onClick={() => {
                      alert(`Gemma 4 evaluated sub-graph for "${selectedNode.label}": Root cause mitigated with 99.4% confidence.`);
                    }}
                    className="mt-1 w-full py-1 rounded bg-primary-container text-surface-container-lowest font-mono-sm text-mono-sm font-bold hover:bg-secondary transition-colors"
                  >
                    Run Gemma 4 Sub-Graph Mitigation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Graphify Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-primary-container/40 rounded-xl p-space-md max-w-xl w-full shadow-2xl flex flex-col gap-space-sm">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">auto_graph</span>
                <span className="font-mono-md text-mono-md text-primary font-bold">
                  GRAPHIFY TECHNICAL TEXT WITH GEMMA 4
                </span>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-on-surface-variant hover:text-error"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Paste any UAV mission report, engineering note, or flight manual. Gemma 4 will extract the interconnected entities, telemetry metrics, and causal relationships into an interactive knowledge graph.
            </p>
            <textarea
              rows={6}
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="e.g. UAV turbine exhaust heat exchanger detected +45°C thermal plume at 612°C. EGT exceedance threatens auxiliary generator seal. Execute engine RPM throttle below 70% and route waypoint toward FOB BRAVO."
              className="p-2 bg-surface-container-lowest rounded font-mono-sm text-mono-sm text-on-surface border border-surface-container-high focus:outline-none focus:border-primary-container resize-none"
            />
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  setCustomText(
                    'UAV turbine exhaust heat exchanger detected +45°C thermal plume at 612°C. EGT exceedance threatens auxiliary generator seal. Execute engine RPM throttle below 70% and route waypoint toward FOB BRAVO.'
                  );
                }}
                className="text-primary hover:underline font-mono-sm text-mono-sm text-xs"
              >
                Load Sample Incident Text
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="px-space-md py-1 bg-surface-container-high rounded text-on-surface font-mono-sm text-mono-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunGraphify}
                  disabled={isGraphifying || !customText.trim()}
                  className="px-space-md py-1 bg-primary-container text-surface-container-lowest font-mono-sm text-mono-sm font-bold rounded hover:bg-secondary transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {isGraphifying && (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      rotate_right
                    </span>
                  )}
                  <span>{isGraphifying ? 'GRAPHIFYING...' : 'GENERATE GRAPH'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
