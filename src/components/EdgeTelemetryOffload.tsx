import React, { useState, useEffect } from 'react';
import { ModelCheckpoint, TransformerLayer } from '../types/tactical';
import { INITIAL_LAYERS, INITIAL_MODELS } from '../data/mockData';

interface EdgeTelemetryOffloadProps {
  activeModel: ModelCheckpoint;
  onSelectModel: (model: ModelCheckpoint) => void;
}

export const EdgeTelemetryOffload: React.FC<EdgeTelemetryOffloadProps> = ({
  activeModel,
  onSelectModel,
}) => {
  const [layers, setLayers] = useState<TransformerLayer[]>(INITIAL_LAYERS);
  const [isPolling, setIsPolling] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchCompleted, setBenchCompleted] = useState(false);
  const [runSeconds, setRunSeconds] = useState(582); // 9m 42s
  const [socTemp, setSocTemp] = useState(52);
  const [powerWatts, setPowerWatts] = useState(38.4);
  const [computeLoad, setComputeLoad] = useState(78.4);
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);

  // Radio toggles
  const [radios, setRadios] = useState({
    wifi: true,
    ble: true,
    starlink: true,
  });

  // Timer run loop
  useEffect(() => {
    const timer = setInterval(() => {
      setRunSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
  };

  // Toggle a layer's offload device between NPU and AVX
  const handleToggleLayer = (index: number) => {
    setLayers(prev =>
      prev.map(l => {
        if (l.index === index) {
          const nextDev = l.device === 'NPU' ? 'AVX' : 'NPU';
          return {
            ...l,
            device: nextDev,
            status: nextDev === 'NPU' ? 'PINNED' : 'OVERFLOW',
          };
        }
        return l;
      })
    );
  };

  // Poll hardware
  const handlePoll = () => {
    setIsPolling(true);
    setTimeout(() => {
      setIsPolling(false);
      setSocTemp(50 + Math.floor(Math.random() * 5));
      setPowerWatts(Number((37.0 + Math.random() * 3.5).toFixed(1)));
      setComputeLoad(Number((75.0 + Math.random() * 6.0).toFixed(1)));
    }, 350);
  };

  // Run benchmark replay
  const handleRunBenchmark = () => {
    setIsBenchmarking(true);
    setBenchCompleted(false);
    setTimeout(() => {
      setIsBenchmarking(false);
      setBenchCompleted(true);
      setTimeout(() => setBenchCompleted(false), 3000);
    }, 1400);
  };

  const npuCount = layers.filter(l => l.device === 'NPU').length;
  const cpuCount = layers.filter(l => l.device === 'AVX').length;

  return (
    <div className="flex flex-col w-full">
      <div className="relative w-full p-space-md xl:p-space-lg flex flex-col gap-space-lg">
        {/* Top System Pulse & Breadcrumb State */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded shadow-sm relative overflow-hidden border border-surface-container-high">
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-secondary/5 blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-space-md min-w-0">
            <div className="w-10 h-10 rounded bg-surface-container-high flex items-center justify-center shrink-0 shadow-inner border border-primary-container/20">
              <span className="material-symbols-outlined text-primary-container text-xl">developer_board</span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-xs flex-wrap">
                <span className="font-label-caps text-label-caps text-secondary font-bold tracking-widest">
                  TACTICAL TELEMETRY
                </span>
                <span className="text-outline-variant font-mono-sm text-mono-sm">/</span>
                <span className="font-mono-sm text-mono-sm text-primary font-bold">NODE_JETSON_ORIN_AGX-64G</span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-secondary-fixed-dim font-mono-sm text-mono-sm font-semibold border border-surface-container-highest">
                  DEVICE #0
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                Offline Tensor Engine // Host AVX-512 + NPU Heterogeneous Offload Engine Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm shrink-0 flex-wrap">
            <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-space-xs rounded shadow-sm border border-surface-container-high">
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
              <span className="font-label-caps text-label-caps text-on-surface font-bold">
                SOC: {socTemp}°C NOMINAL
              </span>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-space-xs rounded shadow-sm border border-surface-container-high">
              <span className="material-symbols-outlined text-sm text-primary-container">bolt</span>
              <span className="font-mono-sm text-mono-sm text-primary-container font-bold">
                {powerWatts}W / 50W TDP
              </span>
            </div>
            <button
              onClick={handlePoll}
              disabled={isPolling}
              className="flex items-center gap-space-xs px-space-sm py-space-xs bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono-sm text-mono-sm rounded transition-colors shadow-sm border border-surface-container-highest"
            >
              <span className={`material-symbols-outlined text-sm text-secondary ${isPolling ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isPolling ? 'POLLING...' : 'POLL (250ms)'}</span>
            </button>
          </div>
        </div>

        {/* MODULE 1: Real-Time Hardware Resource Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {/* GPU / NPU Matrix */}
          <div className="relative bg-surface-container-low p-space-md rounded shadow-md flex flex-col justify-between overflow-hidden border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-bold">
                  COMPUTE LOAD
                </span>
                <span className="font-headline-lg text-headline-lg text-primary font-bold">{computeLoad}%</span>
              </div>
              <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary-container border border-primary-container/20">
                <span className="material-symbols-outlined text-lg">speed</span>
              </div>
            </div>
            <div className="my-space-md flex flex-col gap-space-xs">
              <div className="flex justify-between font-mono-sm text-mono-sm">
                <span className="text-on-surface-variant">Ampere 2048-core GPU @ 1.3GHz</span>
                <span className="text-secondary font-bold">275 TOPS</span>
              </div>
              {/* Segmented 10-Bar Meter */}
              <div className="grid grid-cols-10 gap-1 h-3 p-0.5 bg-surface-container-lowest rounded border border-surface-container-high">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm transition-all ${
                      i < Math.round(computeLoad / 10)
                        ? i < 7
                          ? 'bg-secondary-container'
                          : 'bg-secondary-fixed-dim'
                        : 'bg-surface-container-highest'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="pt-space-xs flex justify-between items-center font-mono-sm text-mono-sm text-outline border-t border-surface-container-high">
              <span>
                TENSOR PIPES: <strong className="text-on-surface">64 FP16</strong>
              </span>
              <span>
                INT8 QUANT: <strong className="text-secondary">ACTIVE</strong>
              </span>
            </div>
          </div>

          {/* VRAM Memory Allocation */}
          <div className="relative bg-surface-container-low p-space-md rounded shadow-md flex flex-col justify-between overflow-hidden border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-bold">
                  UNIFIED LPDDR5 VRAM
                </span>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">
                    {(activeModel.vramSizeGB + 3.28).toFixed(2)}
                  </span>
                  <span className="font-mono-md text-mono-md text-on-surface-variant">/ 8.00 GB</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-secondary border border-secondary/20">
                <span className="material-symbols-outlined text-lg">memory</span>
              </div>
            </div>
            <div className="my-space-md flex flex-col gap-space-xs">
              <div className="w-full h-3 bg-surface-container-lowest rounded flex overflow-hidden border border-surface-container-high">
                <div
                  className="h-full bg-primary-container"
                  style={{ width: `${(activeModel.vramSizeGB / 8) * 100}%` }}
                  title={`Weights: ${activeModel.vramSizeGB}GB`}
                ></div>
                <div className="h-full bg-secondary-fixed-dim" style={{ width: '22.5%' }} title="KV Cache: 1.8GB"></div>
                <div className="h-full bg-secondary" style={{ width: '10%' }} title="Vision: 0.8GB"></div>
                <div className="h-full bg-outline" style={{ width: '6.25%' }} title="System: 0.5GB"></div>
                <div className="h-full bg-surface-container-highest flex-1" title="Free Headroom"></div>
              </div>
              <div className="flex items-center justify-between font-mono-sm text-mono-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-container inline-block"></span>WT{' '}
                  {activeModel.vramSizeGB.toFixed(1)}G
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim inline-block"></span>KV 1.8G
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>VIS 0.8G
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-outline inline-block"></span>SYS 0.5G
                </span>
              </div>
            </div>
            <div className="pt-space-xs flex justify-between items-center font-mono-sm text-mono-sm text-outline border-t border-surface-container-high">
              <span>
                PEAK VRAM: <strong className="text-on-surface">5.41 GB</strong>
              </span>
              <span>
                HEADROOM:{' '}
                <strong className="text-secondary">
                  {(8.0 - (activeModel.vramSizeGB + 3.28)).toFixed(2)} GB FREE
                </strong>
              </span>
            </div>
          </div>

          {/* SoC Thermal & Power Envelope */}
          <div className="relative bg-surface-container-low p-space-md rounded shadow-md flex flex-col justify-between overflow-hidden border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-bold">
                  THERMAL & POWER DRAW
                </span>
                <div className="flex items-baseline gap-space-xs">
                  <span className="font-headline-lg text-headline-lg text-secondary-fixed-dim font-bold">
                    {socTemp}°C
                  </span>
                  <span className="font-mono-md text-mono-md text-on-surface-variant">@ {powerWatts}W</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-secondary-fixed-dim border border-secondary-fixed-dim/20">
                <span className="material-symbols-outlined text-lg">device_thermostat</span>
              </div>
            </div>
            <div className="my-space-md flex flex-col gap-space-xs">
              <div className="flex justify-between font-mono-sm text-mono-sm">
                <span className="text-on-surface-variant">Ruggedized Passive Heatsink</span>
                <span className="text-primary font-mono-sm font-semibold">MAX 50.0W</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="w-full bg-surface-container-lowest h-1.5 rounded overflow-hidden">
                  <div
                    className="bg-secondary-fixed-dim h-full transition-all"
                    style={{ width: `${(socTemp / 85) * 100}%` }}
                  ></div>
                </div>
                <div className="w-full bg-surface-container-lowest h-1.5 rounded overflow-hidden">
                  <div
                    className="bg-primary-container h-full transition-all"
                    style={{ width: `${(powerWatts / 50) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="pt-space-xs flex justify-between items-center font-mono-sm text-mono-sm text-outline border-t border-surface-container-high">
              <span>
                THROTTLE MARGIN: <strong className="text-secondary">+{85 - socTemp}°C</strong>
              </span>
              <span>
                FAN SPEED: <strong className="text-on-surface">PASSIVE 0 RPM</strong>
              </span>
            </div>
          </div>

          {/* Inference Latency Benchmark */}
          <div className="relative bg-surface-container-low p-space-md rounded shadow-md flex flex-col justify-between overflow-hidden border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider font-bold">
                    INFERENCE VELOCITY
                  </span>
                  <div className="flex items-baseline gap-space-xs">
                    <span className="font-headline-lg text-headline-lg text-primary-container font-bold">
                      {activeModel.tokensPerSec.toFixed(1)}
                    </span>
                    <span className="font-mono-md text-mono-md text-on-surface-variant">tok / s</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-primary-container border border-primary-container/20">
                  <span className="material-symbols-outlined text-lg">bolt</span>
                </div>
              </div>
            </div>
            <div className="my-space-md flex flex-col gap-space-xs">
              <div className="flex justify-between font-mono-sm text-mono-sm">
                <span className="text-on-surface-variant">TIME TO FIRST TOKEN (TTFT)</span>
                <span className="text-secondary font-bold">{activeModel.ttftMs} ms</span>
              </div>
              <div className="p-space-xs bg-surface-container-lowest rounded flex items-center justify-between font-mono-sm text-mono-sm border border-surface-container-high">
                <span className="text-outline">BATCH: 1</span>
                <span className="text-outline">CTX: 4096</span>
                <span className="text-primary-container font-bold">ACCEL: INT8-TC</span>
              </div>
            </div>
            <div className="pt-space-xs flex justify-between items-center font-mono-sm text-mono-sm text-outline border-t border-surface-container-high">
              <span>
                EVAL SPEED: <strong className="text-on-surface">59.5 tps</strong>
              </span>
              <span>
                KV HIT RATE: <strong className="text-secondary">99.4%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* MODULE 2: Layer Offload Visualizer & Quantization Profiler */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
          {/* Layer Offload Interactive Map (8 Cols) */}
          <div className="xl:col-span-8 bg-surface-container-low p-space-md xl:p-space-lg rounded shadow-md flex flex-col gap-space-md border border-surface-container-high">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2 h-2 rounded bg-primary-container"></span>
                  <span className="font-headline-md text-headline-md text-primary font-bold">
                    Heterogeneous Layer Offload Distribution
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  28-Layer Transformer: Click any layer to reassign between Orin NPU Tensor Cores and Host CPU AVX-512
                </span>
              </div>
              <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-sm py-space-xs rounded border border-surface-container-high">
                <span className="font-label-caps text-label-caps text-outline">PINNED:</span>
                <span className="font-mono-sm text-mono-sm text-secondary font-bold">{npuCount} NPU</span>
                <span className="font-mono-sm text-mono-sm text-outline-variant">|</span>
                <span className="font-mono-sm text-mono-sm text-primary-container font-bold">{cpuCount} CPU</span>
              </div>
            </div>

            {/* Layer Blocks Grid Visualization */}
            <div className="bg-surface-container-lowest p-space-md rounded flex flex-col gap-space-sm border border-surface-container-high">
              <div className="flex items-center justify-between font-mono-sm text-mono-sm text-outline">
                <span>INPUT EMBEDDINGS (VRAM PINNED)</span>
                <span>TOKEN VOCAB: 128,256</span>
              </div>
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5" id="layerContainer">
                {layers.map(layer => {
                  const isNpu = layer.device === 'NPU';
                  return (
                    <div
                      key={layer.index}
                      onClick={() => handleToggleLayer(layer.index)}
                      onMouseEnter={() => setHoveredLayer(layer.index)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      className={`group relative flex flex-col items-center justify-center p-2 rounded transition-all cursor-pointer shadow-sm border ${
                        isNpu
                          ? 'bg-surface-container-high hover:bg-primary-container hover:text-on-primary-container border-surface-container-highest'
                          : 'bg-surface-container-highest hover:bg-secondary hover:text-on-secondary border-tertiary-fixed-dim/30'
                      }`}
                      title={`Click to reassign Layer ${layer.index} to ${isNpu ? 'CPU AVX-512' : 'NPU Tensor Core'}`}
                    >
                      <span
                        className={`font-mono-sm text-mono-sm font-bold ${
                          isNpu ? 'text-secondary' : 'text-primary-fixed'
                        }`}
                      >
                        L{layer.index}
                      </span>
                      <span
                        className={`font-label-caps text-label-caps ${
                          isNpu ? 'text-outline group-hover:text-on-primary-container' : 'text-tertiary-fixed-dim'
                        }`}
                      >
                        {layer.device}
                      </span>
                      {hoveredLayer === layer.index && (
                        <div className="absolute -top-8 bg-surface-container-highest text-primary font-mono-sm text-mono-sm px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-30 border border-primary-container/40">
                          L{layer.index} // 74MB // {isNpu ? 'INT8 NPU' : 'CPU OFF'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between pt-space-xs font-mono-sm text-mono-sm text-outline border-t border-surface-container-high">
                <div className="flex items-center gap-space-md">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-surface-container-high border border-surface-container-highest"></span>
                    NPU Tensor Cores ({npuCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-surface-container-highest border border-tertiary-fixed-dim/30"></span>
                    CPU AVX-512 Fallback ({cpuCount})
                  </span>
                </div>
                <span className="text-secondary font-bold">PCIe Gen4 Direct DMA 16.0 GT/s</span>
              </div>
            </div>

            {/* Hardware Backend Switcher Ribbon */}
            <div className="flex items-center justify-between bg-surface-container-lowest p-space-sm rounded font-mono-sm text-mono-sm border border-surface-container-high">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="text-outline font-label-caps text-label-caps">RUNTIME BACKEND:</span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-bold">
                  LLAMA.CPP vB3821
                </span>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-secondary">
                  CUDA 12.6
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <span className="text-outline">FLASH ATTN v2:</span>
                <span className="text-secondary font-bold">ENABLED (FA2_INT8)</span>
              </div>
            </div>
          </div>

          {/* Quantization Tradeoffs Benchmark Matrix (4 Cols) */}
          <div className="xl:col-span-4 bg-surface-container-low p-space-md xl:p-space-lg rounded shadow-md flex flex-col justify-between gap-space-md border border-surface-container-high">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  Quantization Tradeoff
                </span>
                <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-surface-container-high text-primary-container font-bold border border-primary-container/30">
                  PROFILER
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Target SLM: Llama-3.2-3B // WikiText2 Perplexity
              </span>
            </div>

            {/* Quantization Comparison Rows */}
            <div className="flex flex-col gap-space-sm">
              {/* Q4_K_M */}
              <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col gap-space-xs relative overflow-hidden border border-secondary/40">
                <div className="flex items-center justify-between font-mono-sm text-mono-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="text-primary font-bold">Q4_K_M (ACTIVE)</span>
                  </div>
                  <span className="text-secondary font-bold">46.2 tps</span>
                </div>
                <div className="grid grid-cols-3 gap-space-xs font-mono-sm text-mono-sm pt-space-xs">
                  <div className="flex flex-col bg-surface-container-high p-1 rounded">
                    <span className="text-outline font-label-caps text-label-caps">PPL (PERPLEXITY)</span>
                    <span className="text-on-surface font-bold">6.12</span>
                  </div>
                  <div className="flex flex-col bg-surface-container-high p-1 rounded">
                    <span className="text-outline font-label-caps text-label-caps">VRAM SIZE</span>
                    <span className="text-on-surface font-bold">1.92 GB</span>
                  </div>
                  <div className="flex flex-col bg-surface-container-high p-1 rounded">
                    <span className="text-outline font-label-caps text-label-caps">LATENCY TTFT</span>
                    <span className="text-secondary font-bold">16.8 ms</span>
                  </div>
                </div>
              </div>

              {/* Q5_K_M */}
              <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col gap-space-xs border border-surface-container-high">
                <div className="flex items-center justify-between font-mono-sm text-mono-sm">
                  <span className="text-on-surface font-bold">Q5_K_M</span>
                  <span className="text-on-surface-variant">38.4 tps</span>
                </div>
                <div className="grid grid-cols-3 gap-space-xs font-mono-sm text-mono-sm pt-space-xs">
                  <div className="flex flex-col bg-surface-container-high p-1 rounded">
                    <span className="text-outline font-label-caps text-label-caps">PPL (PERPLEXITY)</span>
                    <span className="text-on-surface">5.88 (-0.24)</span>
                  </div>
                  <div className="flex flex-col bg-surface-container-high p-1 rounded">
                    <span className="text-outline font-label-caps text-label-caps">VRAM SIZE</span>
                    <span className="text-on-surface">2.31 GB</span>
                  </div>
                  <div className="flex flex-col bg-surface-container-high p-1 rounded">
                    <span className="text-outline font-label-caps text-label-caps">LATENCY TTFT</span>
                    <span className="text-on-surface">21.4 ms</span>
                  </div>
                </div>
              </div>

              {/* Q8_0 */}
              <div className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col gap-space-xs border border-surface-container-high">
                <div className="flex items-center justify-between font-mono-sm text-mono-sm">
                  <span className="text-on-surface font-bold">Q8_0 (STUDY)</span>
                  <span className="text-on-surface-variant">24.1 tps</span>
                </div>
                <div className="grid grid-cols-3 gap-space-xs font-mono-sm text-mono-sm pt-space-xs">
                  <div className="flex flex-col bg-surface-container-high p-1 rounded">
                    <span className="text-outline font-label-caps text-label-caps">PPL (PERPLEXITY)</span>
                    <span className="text-on-surface">5.71 (-0.41)</span>
                  </div>
                  <div className="flex flex-col bg-surface-container-high p-1 rounded">
                    <span className="text-outline font-label-caps text-label-caps">VRAM SIZE</span>
                    <span className="text-error font-bold">3.44 GB</span>
                  </div>
                  <div className="flex flex-col bg-surface-container-high p-1 rounded">
                    <span className="text-outline font-label-caps text-label-caps">LATENCY TTFT</span>
                    <span className="text-outline">35.9 ms</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert('AWQ tensor quantization profile recalculated for Llama-3.2-3B. SVD sensitivity matrix updated.');
              }}
              className="w-full py-space-xs bg-surface-container-high hover:bg-surface-bright text-primary font-label-caps text-label-caps uppercase rounded transition-colors flex items-center justify-center gap-space-xs border border-surface-container-highest"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              <span>RECALCULATE AWQ TENSOR MAP</span>
            </button>
          </div>
        </div>

        {/* MODULE 3 & 4 SPLIT: Continuous Run Monitor + Checkpoint Manager */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
          {/* MODULE 3: Airgap Isolation & Continuous Run Thermals (7 Cols) */}
          <div className="xl:col-span-7 bg-surface-container-low p-space-md xl:p-space-lg rounded shadow-md flex flex-col gap-space-md border border-surface-container-high">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  Airgap Isolation & Continuous Run Thermals
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  10-Minute Stress: Continuous 1080p YOLOv11 + phi-3.5 agentic reasoning
                </span>
              </div>
              <span className="font-mono-sm text-mono-sm px-space-xs py-0.5 rounded bg-surface-container-highest text-secondary font-bold border border-surface-container-highest">
                T_RUN: {formatTime(runSeconds)}
              </span>
            </div>

            {/* SVG Thermal Drift Graph */}
            <div className="bg-surface-container-lowest p-space-md rounded flex flex-col gap-space-xs border border-surface-container-high">
              <div className="flex justify-between items-center font-mono-sm text-mono-sm text-outline">
                <span>SoC DIE TEMPERATURE DRIFT (°C)</span>
                <span className="text-secondary font-bold">PEAK: 54.1°C / TJMAX: 85°C</span>
              </div>
              <div className="relative w-full h-36 flex items-end">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-15 pointer-events-none">
                  <div className="w-full h-px bg-outline"></div>
                  <div className="w-full h-px bg-outline"></div>
                  <div className="w-full h-px bg-outline"></div>
                  <div className="w-full h-px bg-outline"></div>
                </div>

                <svg className="w-full h-full text-secondary" fill="none" preserveAspectRatio="none" viewBox="0 0 600 120">
                  <defs>
                    <linearGradient id="thermalGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"></stop>
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,90 Q40,88 80,82 T160,70 T240,65 T320,62 T400,58 T480,55 T560,52 L600,51 L600,120 L0,120 Z"
                    fill="url(#thermalGrad)"
                  ></path>
                  <path
                    d="M0,90 Q40,88 80,82 T160,70 T240,65 T320,62 T400,58 T480,55 T560,52 L600,51"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  ></path>
                  {/* Throttle Limit Threshold Dashed Line */}
                  <line
                    opacity="0.6"
                    stroke="#EF4444"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                    x1="0"
                    x2="600"
                    y1="20"
                    y2="20"
                  ></line>
                  <text className="font-mono-sm text-mono-sm" fill="#EF4444" fontSize="9" x="10" y="16">
                    THROTTLE TRIPPOINT (75°C)
                  </text>
                  <circle className="animate-pulse" cx="600" cy="51" fill="#00F0FF" r="4"></circle>
                </svg>
              </div>

              <div className="flex justify-between font-mono-sm text-mono-sm text-outline pt-space-xs">
                <span>T-00:00 (IDLE 34°C)</span>
                <span>T-05:00 (HEAVY LOAD 48°C)</span>
                <span className="text-primary font-bold">NOW (STABLE {socTemp}°C)</span>
              </div>
            </div>

            {/* Airgap Signal Isolation Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
              <div
                onClick={() => setRadios(r => ({ ...r, wifi: !r.wifi }))}
                className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between gap-space-xs cursor-pointer border border-surface-container-high hover:border-secondary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase font-bold">
                    WI-FI 6E RADIO
                  </span>
                  <span className="material-symbols-outlined text-sm text-secondary">
                    {radios.wifi ? 'wifi_off' : 'wifi'}
                  </span>
                </div>
                <span className="font-mono-sm text-mono-sm text-secondary font-bold">
                  {radios.wifi ? 'PHYSICALLY CUT' : 'RADIO ARMED'}
                </span>
                <span className="font-mono-sm text-mono-sm text-on-surface-variant">
                  {radios.wifi ? 'GPIO PIN 12 ZEROED' : 'RF ACTIVE'}
                </span>
              </div>

              <div
                onClick={() => setRadios(r => ({ ...r, ble: !r.ble }))}
                className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between gap-space-xs cursor-pointer border border-surface-container-high hover:border-secondary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase font-bold">
                    BLUETOOTH BLE
                  </span>
                  <span className="material-symbols-outlined text-sm text-secondary">
                    {radios.ble ? 'bluetooth_disabled' : 'bluetooth'}
                  </span>
                </div>
                <span className="font-mono-sm text-mono-sm text-secondary font-bold">
                  {radios.ble ? 'ISOLATED / KILLED' : 'HCI CONNECTED'}
                </span>
                <span className="font-mono-sm text-mono-sm text-on-surface-variant">
                  {radios.ble ? 'HCI DRIVER DETACHED' : 'ADVERTISING'}
                </span>
              </div>

              <div
                onClick={() => setRadios(r => ({ ...r, starlink: !r.starlink }))}
                className="bg-surface-container-lowest p-space-sm rounded shadow-sm flex flex-col justify-between gap-space-xs cursor-pointer border border-surface-container-high hover:border-primary-container transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-outline uppercase font-bold">
                    STARLINK TACTICAL
                  </span>
                  <span className="material-symbols-outlined text-sm text-primary-container">satellite_alt</span>
                </div>
                <span className="font-mono-sm text-mono-sm text-primary-container font-bold">
                  {radios.starlink ? 'STANDBY COLD' : 'HOT CARRIER'}
                </span>
                <span className="font-mono-sm text-mono-sm text-on-surface-variant">
                  {radios.starlink ? 'PWR SLEEP // PASSIVE' : 'TRANSMITTING'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-surface-container-lowest px-space-md py-space-sm rounded border border-surface-container-high">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-sm">security</span>
                <span className="font-label-caps text-label-caps text-secondary font-bold">
                  ZERO RF SIGNATURE COMPLIANT
                </span>
              </div>
              <span className="font-mono-sm text-mono-sm text-outline">TEMPEST LEVEL B TESTED</span>
            </div>
          </div>

          {/* MODULE 4: Local GGUF/ONNX Checkpoint Manager & Warm Swapper (5 Cols) */}
          <div className="xl:col-span-5 bg-surface-container-low p-space-md xl:p-space-lg rounded shadow-md flex flex-col justify-between gap-space-md border border-surface-container-high">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  Offline NVMe Checkpoints
                </span>
                <span className="font-mono-sm text-mono-sm text-outline">NVMe0n1 / 480 GB FREE</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Instant in-RAM warm model swap engine
              </span>
            </div>

            {/* Models List */}
            <div className="flex flex-col gap-space-sm">
              {INITIAL_MODELS.map(model => {
                const isActive = model.id === activeModel.id;
                return (
                  <div
                    key={model.id}
                    className={`p-space-sm rounded shadow-sm flex flex-col gap-space-xs transition-colors border ${
                      isActive
                        ? 'bg-surface-container-lowest border-primary-container/40'
                        : 'bg-surface-container-lowest hover:bg-surface-container border-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-xs min-w-0">
                        <span
                          className={`material-symbols-outlined text-base ${
                            isActive ? 'text-primary-container' : 'text-outline'
                          }`}
                        >
                          {isActive ? 'check_circle' : 'radio_button_unchecked'}
                        </span>
                        <span
                          className={`font-mono-sm text-mono-sm truncate font-bold ${
                            isActive ? 'text-primary' : 'text-on-surface'
                          }`}
                        >
                          {model.filename}
                        </span>
                      </div>
                      <span className="font-mono-sm text-mono-sm text-secondary font-bold shrink-0">
                        {model.vramSizeGB.toFixed(2)} GB
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-mono-sm text-mono-sm pt-space-xs">
                      <span className="text-outline">
                        {model.provider === 'GEMMA_GEMINI_API'
                          ? 'GEMMA 4 // GEMINI API MULTIMODAL'
                          : model.type === 'SLM'
                          ? 'SLM // CHAT + TOOLS'
                          : 'VISION MASK // 640x640'}
                      </span>
                      {isActive ? (
                        <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-primary-container font-label-caps text-label-caps font-bold">
                          LOADED (RAM PINNED)
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectModel(model)}
                          className="px-space-xs py-0.5 rounded bg-primary-container hover:bg-secondary text-on-primary-container font-mono-sm text-mono-sm font-bold transition-colors"
                        >
                          WARM SWAP
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fast Benchmark Action Strip */}
            <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-space-sm border border-surface-container-high">
              <div className="flex items-center justify-between font-mono-sm text-mono-sm">
                <span className="text-outline">BENCHMARK REPLAY:</span>
                <span className="text-primary font-bold">512 PROMPT / 128 GEN</span>
              </div>
              <div className="flex gap-space-xs">
                <button
                  onClick={handleRunBenchmark}
                  disabled={isBenchmarking}
                  className="flex-1 py-space-xs bg-primary-container hover:bg-secondary text-on-primary-container font-label-caps text-label-caps uppercase rounded font-bold transition-all text-center flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                >
                  <span
                    className={`material-symbols-outlined text-sm ${
                      isBenchmarking ? 'animate-spin' : ''
                    }`}
                  >
                    {isBenchmarking ? 'rotate_right' : 'play_arrow'}
                  </span>
                  <span>
                    {isBenchmarking
                      ? 'EVALUATING 512/128...'
                      : benchCompleted
                      ? 'BENCHMARK VERIFIED'
                      : 'TRIGGER REPLAY BENCHMARK'}
                  </span>
                </button>
                <button
                  onClick={() => alert('KV cache ring buffer wiped and zeroed.')}
                  className="px-space-sm py-space-xs bg-surface-container-high hover:bg-surface-bright text-on-surface font-mono-sm text-mono-sm rounded transition-colors border border-surface-container-highest"
                  title="Flush KV Cache"
                >
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Footnote / Hardware Identification Ribbon */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-space-sm bg-surface-container-lowest rounded font-mono-sm text-mono-sm text-outline border border-surface-container-high">
          <div className="flex items-center gap-space-md flex-wrap">
            <span>
              BOARD: <strong className="text-on-surface">JETSON AGX ORIN 64GB DEVELOPER KIT</strong>
            </span>
            <span>
              CARRIER: <strong className="text-on-surface">RUGGED TACTICAL BOX</strong>
            </span>
          </div>
          <div className="flex items-center gap-space-md pt-space-xs sm:pt-0 flex-wrap">
            <span>DRIVER: 540.3.0</span>
            <span>CUDA: 12.6.68</span>
            <span className="text-secondary font-bold">SYS_HEALTH: OPTIMAL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
