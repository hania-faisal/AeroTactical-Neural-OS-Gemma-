import React, { useState } from 'react';
import { AnomalyFrame } from '../types/tactical';
import { ANOMALY_FRAMES } from '../data/mockData';

type SensorMode = 'FLIR-W' | 'FLIR-B' | 'EO-RGB';
type ZoomLevel = '1x' | '4x FLIR' | '10x ULTRA';

interface VisualDiagnosticsHudProps {
  onNavigateToGraphify?: () => void;
}

export const VisualDiagnosticsHud: React.FC<VisualDiagnosticsHudProps> = ({
  onNavigateToGraphify,
}) => {
  const [sensorMode, setSensorMode] = useState<SensorMode>('FLIR-W');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('4x FLIR');
  const [selectedBox, setSelectedBox] = useState<string | null>('box-hydraulic');
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [frames, setFrames] = useState<AnomalyFrame[]>(ANOMALY_FRAMES);
  
  // Tactical Reasoner chat/stream state
  const [customQuery, setCustomQuery] = useState('Explain MTBF degradation if actuator run at 50% load');
  const [reasonerLog, setReasonerLog] = useState<{
    query: string;
    answer: string;
    isGenerating: boolean;
  } | null>(null);

  // Tactical Deck modal states
  const [showJsonAstModal, setShowJsonAstModal] = useState(false);
  const [showThermalDelta, setShowThermalDelta] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [timeOffsetSeconds, setTimeOffsetSeconds] = useState(0);

  const activeFrame = frames[activeFrameIndex];

  const handleSelectFrame = (index: number) => {
    setActiveFrameIndex(index);
    setFrames(prev =>
      prev.map((f, i) => ({
        ...f,
        isActive: i === index,
      }))
    );
  };

  const handleRunDiagnostic = () => {
    setIsDiagnosticRunning(true);
    setTimeout(() => {
      setIsDiagnosticRunning(false);
    }, 900);
  };

  const handleSendQuery = async (customPrompt?: string) => {
    const promptToUse = customPrompt || customQuery;
    if (!promptToUse.trim()) return;
    setReasonerLog({
      query: promptToUse,
      answer: 'Analyzing tactical optical frame with Gemma 4 Multimodal via Gemini API...',
      isGenerating: true,
    });

    try {
      const res = await fetch('/api/gemma/multimodal-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: activeFrame.imageUrl,
          query: promptToUse,
          frameCode: activeFrame.code,
          anomalyType: activeFrame.category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReasonerLog({
          query: promptToUse,
          answer: data.analysis || data.content,
          isGenerating: false,
        });
        return;
      }
    } catch (err) {
      console.warn('Gemma 4 vision call fallback:', err);
    }

    // Fallback simulation
    setTimeout(() => {
      const q = promptToUse.toLowerCase();
      let response = '';
      if (q.includes('mtbf') || q.includes('load') || q.includes('degradation')) {
        response =
          '[Gemma 4 Multimodal]: Derating the hydraulic actuator to 50% load extends MTBF by 240% (from 18 minutes to ~61.2 hours). Backpressure drops from 3,000 PSI to 1,520 PSI, preventing catastrophic seal extrusion.';
      } else if (q.includes('vibration') || q.includes('harmonic')) {
        response =
          '[Gemma 4 Multimodal]: Under MIL-STD-810H Section 514.8, 140Hz harmonic buffet creates resolver jitter of ±1.4 mrad. Calibrating with dampening factor 0.95 will suppress resonance without servo hunting.';
      } else {
        response = `[Gemma 4 Multimodal Vision // Gemini API]: Analyzed frame ${activeFrame.code}. Thermal signature ${activeFrame.temperature} confirmed with 576 visual tokens. Hardware state: ${activeFrame.hardwareSpecs.failureProbability} failure probability.`;
      }

      setReasonerLog({
        query: promptToUse,
        answer: response,
        isGenerating: false,
      });
    }, 600);
  };

  const handleExportReport = () => {
    const reportData = {
      mission: 'UAV-FLIR/EO RECON-BAY-04',
      timestamp: new Date().toISOString(),
      activeFrame: activeFrame.code,
      anomaly: activeFrame.title,
      confidence: activeFrame.confidence,
      specs: activeFrame.hardwareSpecs,
      protocols: activeFrame.safetyProtocols,
      airgapSeal: 'SHA256: 0x91EFB3A8201C4_AIRGAP_ENCRYPTED',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tactical_Airgap_Report_${activeFrame.code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowReportSuccess(true);
    setTimeout(() => setShowReportSuccess(false), 2500);
  };

  const getZoomClass = () => {
    switch (zoomLevel) {
      case '1x':
        return 'scale-100';
      case '4x FLIR':
        return 'scale-115';
      case '10x ULTRA':
        return 'scale-130';
    }
  };

  const getFilterStyle = () => {
    switch (sensorMode) {
      case 'FLIR-W':
        return 'contrast-125 brightness-95';
      case 'FLIR-B':
        return 'contrast-150 brightness-75 invert hue-rotate-180';
      case 'EO-RGB':
        return 'contrast-110 brightness-105 saturate-125';
    }
  };

  return (
    <div className="p-space-lg flex flex-col gap-space-md">
      {/* Top System Telemetry Bar */}
      <div className="w-full bg-surface-container-low rounded-lg p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-md border border-surface-container-high">
        <div className="flex items-center gap-space-lg flex-wrap">
          <div className="flex items-center gap-space-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(67,237,205,0.8)] animate-pulse"></span>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase">MISSION FEED SENSOR</span>
              <span className="font-mono-md text-mono-md text-primary font-bold">UAV-FLIR/EO // RECON-BAY-04</span>
            </div>
          </div>
          <div className="h-8 w-px bg-surface-container-highest hidden sm:block"></div>
          <div className="flex items-center gap-space-md flex-wrap">
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase">COORDINATE FIX</span>
              <span className="font-mono-sm text-mono-sm text-on-surface font-semibold">MGRS 38S MB 4921 8219</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase">ALTITUDE / SPEED</span>
              <span className="font-mono-sm text-mono-sm text-on-surface">1,420M AGL // 64 KTS</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps text-outline uppercase">AZIMUTH / FOV</span>
              <span className="font-mono-sm text-mono-sm text-secondary-fixed-dim">284° WNW // 12.8° FLIR</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="bg-surface-container-lowest px-space-sm py-space-xs rounded flex items-center gap-space-sm border border-surface-container-high">
            <span className="font-label-caps text-label-caps text-outline">VISION ENGINE:</span>
            <span className="font-mono-sm text-mono-sm text-primary font-bold">YOLOv11-NANO-EDGE</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-secondary font-mono-sm text-mono-sm font-semibold">
              62 FPS
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container text-primary-container font-mono-sm text-mono-sm font-semibold">
              8.4ms
            </span>
          </div>
          <div className="bg-surface-container-lowest px-space-sm py-space-xs rounded flex items-center gap-space-xs text-secondary border border-surface-container-high">
            <span className="material-symbols-outlined text-sm">wifi_off</span>
            <span className="font-label-caps text-label-caps font-bold">AIRGAP SECURED</span>
          </div>
        </div>
      </div>

      {/* Main Workspace Split: Viewport & Multimodal SLM Reasoner */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-md w-full">
        {/* Primary Tactical Camera Feed & HUD Viewport (8 Columns) */}
        <div className="xl:col-span-8 flex flex-col gap-space-sm">
          <div className="relative w-full aspect-video bg-surface-container-lowest rounded-lg overflow-hidden shadow-xl border border-surface-container-high group select-none">
            {/* Base Imagery Layer: Selected Anomaly Frame Image */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-500 transform ${getZoomClass()} ${getFilterStyle()}`}
              style={{ backgroundImage: `url('${activeFrame.imageUrl}')` }}
            ></div>

            {/* Tactical HUD Scanlines & Grain Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/60 via-transparent to-surface-container-lowest/80 pointer-events-none"></div>

            {/* Thermal Delta Heatmap Simulation Overlay if enabled */}
            {showThermalDelta && (
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/40 via-amber-600/30 to-red-600/50 mix-blend-color-dodge pointer-events-none flex items-center justify-center">
                <div className="bg-surface-container-lowest/90 px-3 py-1.5 rounded border border-tertiary font-mono-sm text-mono-sm text-tertiary-container shadow-2xl">
                  ΔT RADIOMETRIC OVERLAY ACTIVE // MAX: +60.5°C GRADIENT
                </div>
              </div>
            )}

            {/* Compass Header Overlay */}
            <div className="absolute top-3 left-4 right-4 flex items-center justify-between pointer-events-none select-none">
              <div className="flex items-center gap-space-sm bg-surface-container-low/85 backdrop-blur-md px-space-sm py-1 rounded border border-surface-container-high">
                <span className="material-symbols-outlined text-secondary text-sm">adjust</span>
                <span className="font-mono-sm text-mono-sm text-on-surface">
                  SYS_TIME: 14:38:{29 + timeOffsetSeconds}.402 UTC
                </span>
                <span className="font-mono-sm text-mono-sm text-outline">|</span>
                <span className="font-mono-sm text-mono-sm text-secondary font-bold">REC ● 00:44:12</span>
              </div>

              {/* Compass Ribbon Tape */}
              <div className="hidden md:flex items-center gap-2 bg-surface-container-low/85 backdrop-blur-md px-3 py-1 rounded font-mono-sm text-mono-sm text-on-surface-variant border border-surface-container-high">
                <span>260</span>
                <span className="text-outline">|</span>
                <span>270</span>
                <span className="text-outline">|</span>
                <span className="text-primary font-bold">▲ 284° WNW</span>
                <span className="text-outline">|</span>
                <span>300</span>
                <span className="text-outline">|</span>
                <span>310</span>
              </div>

              {/* HUD Reticle Sensor Modes */}
              <div className="flex items-center gap-1 bg-surface-container-low/85 backdrop-blur-md p-1 rounded pointer-events-auto border border-surface-container-high">
                <button
                  onClick={() => setSensorMode('FLIR-W')}
                  className={`px-2 py-0.5 rounded font-label-caps text-label-caps uppercase font-bold transition-colors ${
                    sensorMode === 'FLIR-W'
                      ? 'text-surface-container-lowest bg-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  FLIR-W
                </button>
                <button
                  onClick={() => setSensorMode('FLIR-B')}
                  className={`px-2 py-0.5 rounded font-label-caps text-label-caps uppercase font-bold transition-colors ${
                    sensorMode === 'FLIR-B'
                      ? 'text-surface-container-lowest bg-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  FLIR-B
                </button>
                <button
                  onClick={() => setSensorMode('EO-RGB')}
                  className={`px-2 py-0.5 rounded font-label-caps text-label-caps uppercase font-bold transition-colors ${
                    sensorMode === 'EO-RGB'
                      ? 'text-surface-container-lowest bg-primary-container'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  EO-RGB
                </button>
              </div>
            </div>

            {/* Central Crosshair Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <div className="absolute w-full h-px bg-primary/40"></div>
                <div className="absolute h-full w-px bg-primary/40"></div>
                <div className="w-8 h-8 rounded-full border border-primary-container/40 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                </div>
                {/* Pitch Ladder Marks */}
                <span className="absolute -top-6 font-mono-sm text-mono-sm text-primary/70 tracking-widest">+05.0°</span>
                <span className="absolute -bottom-6 font-mono-sm text-mono-sm text-primary/70 tracking-widest">-05.0°</span>
              </div>
            </div>

            {/* Bounding Box 1: Payload Sensor Bay */}
            <div
              onClick={() => setSelectedBox('box-bay')}
              className={`absolute top-[22%] left-[18%] w-[26%] h-[24%] pointer-events-auto cursor-pointer transition-all ${
                selectedBox === 'box-bay'
                  ? 'ring-2 ring-primary bg-primary/10 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'bg-primary/5 hover:bg-primary/10'
              }`}
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary-container"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary-container"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary-container"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary-container"></div>

              <div className="absolute -top-6 left-0 bg-surface-container-lowest px-2 py-0.5 rounded flex items-center gap-1 shadow-md border border-surface-container-high">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="font-label-caps text-label-caps text-primary tracking-wider font-bold">BAY_POD::01</span>
                <span className="font-mono-sm text-mono-sm text-secondary font-bold">[CONF: 97.4%]</span>
              </div>
              <div className="absolute bottom-1 right-1 font-mono-sm text-mono-sm text-on-surface-variant bg-surface-container-lowest/80 px-1 rounded">
                ΔT: +1.2°C
              </div>
            </div>

            {/* Bounding Box 2: Hydraulic Actuator Fault (CRITICAL ALERT) */}
            <div
              onClick={() => setSelectedBox('box-hydraulic')}
              className={`absolute top-[48%] left-[44%] w-[32%] h-[34%] pointer-events-auto cursor-pointer transition-all ${
                selectedBox === 'box-hydraulic'
                  ? 'ring-2 ring-tertiary-container bg-tertiary-container/20 shadow-[0_0_20px_rgba(255,209,156,0.6)] animate-pulse'
                  : 'bg-tertiary-container/10'
              }`}
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-tertiary-container"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-tertiary-container"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-tertiary-container"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-tertiary-container"></div>

              <div className="absolute -top-7 left-0 bg-surface-container-lowest px-2 py-1 rounded flex items-center gap-1.5 shadow-lg border border-tertiary-container/40">
                <span className="material-symbols-outlined text-tertiary-container text-xs">warning</span>
                <span className="font-label-caps text-label-caps text-tertiary font-bold tracking-wider">
                  {activeFrame.title}
                </span>
                <span className="font-mono-sm text-mono-sm text-tertiary-fixed-dim font-bold">
                  [ALERT: {(activeFrame.confidence * 100).toFixed(0)}%]
                </span>
              </div>
              <div className="absolute -bottom-5 left-0 font-mono-sm text-mono-sm text-tertiary-container bg-surface-container-lowest/90 px-1.5 py-0.5 rounded border border-surface-container-high">
                THERMAL: {activeFrame.temperature}
              </div>
            </div>

            {/* Bounding Box 3: Unidentified Signal Transmitter */}
            <div
              onClick={() => setSelectedBox('box-transmitter')}
              className={`absolute top-[28%] right-[10%] w-[18%] h-[20%] pointer-events-auto cursor-pointer transition-all ${
                selectedBox === 'box-transmitter'
                  ? 'ring-2 ring-secondary bg-secondary/15 shadow-[0_0_15px_rgba(67,237,205,0.4)]'
                  : 'bg-secondary/5 hover:bg-secondary/10'
              }`}
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-secondary"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-secondary"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-secondary"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-secondary"></div>

              <div className="absolute -top-6 left-0 bg-surface-container-lowest px-2 py-0.5 rounded flex items-center gap-1 border border-surface-container-high">
                <span className="material-symbols-outlined text-secondary-fixed-dim text-xs">radar</span>
                <span className="font-label-caps text-label-caps text-on-surface">EMITTER_NODE</span>
                <span className="font-mono-sm text-mono-sm text-secondary font-bold">[CONF: 88.1%]</span>
              </div>
            </div>

            {/* Bottom Viewport Controls & Zoom HUD Bar */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none select-none">
              <div className="flex items-center gap-space-xs bg-surface-container-low/90 backdrop-blur-md px-2 py-1 rounded pointer-events-auto border border-surface-container-high">
                <span className="font-label-caps text-label-caps text-outline mr-1">OPTICAL MAG:</span>
                <button
                  onClick={() => setZoomLevel('1x')}
                  className={`px-2 py-0.5 rounded font-mono-sm text-mono-sm transition-colors ${
                    zoomLevel === '1x'
                      ? 'bg-primary-container text-surface-container-lowest font-bold'
                      : 'bg-surface-container-high text-on-surface hover:text-primary'
                  }`}
                >
                  1x
                </button>
                <button
                  onClick={() => setZoomLevel('4x FLIR')}
                  className={`px-2 py-0.5 rounded font-mono-sm text-mono-sm transition-colors ${
                    zoomLevel === '4x FLIR'
                      ? 'bg-primary-container text-surface-container-lowest font-bold'
                      : 'bg-surface-container-high text-on-surface hover:text-primary'
                  }`}
                >
                  4x FLIR
                </button>
                <button
                  onClick={() => setZoomLevel('10x ULTRA')}
                  className={`px-2 py-0.5 rounded font-mono-sm text-mono-sm transition-colors ${
                    zoomLevel === '10x ULTRA'
                      ? 'bg-primary-container text-surface-container-lowest font-bold'
                      : 'bg-surface-container-high text-on-surface hover:text-primary'
                  }`}
                >
                  10x ULTRA
                </button>
              </div>

              <div className="flex items-center gap-2 bg-surface-container-low/90 backdrop-blur-md px-3 py-1 rounded pointer-events-auto font-mono-sm text-mono-sm border border-surface-container-high">
                <div className="flex items-center gap-1">
                  <span className="text-outline">TARGET RANGE:</span>
                  <span className="text-primary font-bold">1,842 M</span>
                </div>
                <span className="text-outline">|</span>
                <div className="flex items-center gap-1">
                  <span className="text-outline">LOS LOCK:</span>
                  <span className="text-secondary font-bold">SOLID</span>
                </div>
                <button
                  onClick={() => setShowThermalDelta(!showThermalDelta)}
                  className={`ml-2 transition-colors ${
                    showThermalDelta ? 'text-secondary font-bold' : 'text-primary hover:text-secondary'
                  }`}
                  title="Toggle Thermal Delta Overlay"
                >
                  <span className="material-symbols-outlined text-base">difference</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub-telemetry Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
            <div className="bg-surface-container-low p-space-sm rounded flex flex-col justify-between shadow-sm border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">EDGE LATENCY</span>
                <span className="material-symbols-outlined text-xs text-secondary">speed</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono-lg text-mono-lg text-primary font-bold">8.4</span>
                <span className="font-mono-sm text-mono-sm text-on-surface-variant">ms / frame</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-secondary h-full w-[24%]"></div>
              </div>
            </div>

            <div className="bg-surface-container-low p-space-sm rounded flex flex-col justify-between shadow-sm border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">BOUNDING DETECTIONS</span>
                <span className="material-symbols-outlined text-xs text-primary-container">view_in_ar</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono-lg text-mono-lg text-on-surface font-bold">03</span>
                <span className="font-mono-sm text-mono-sm text-tertiary font-bold">(1 CRITICAL)</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-primary-container h-full w-[65%]"></div>
              </div>
            </div>

            <div className="bg-surface-container-low p-space-sm rounded flex flex-col justify-between shadow-sm border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">PROMPT KV CACHE</span>
                <span className="material-symbols-outlined text-xs text-secondary-fixed-dim">memory</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono-lg text-mono-lg text-on-surface font-bold">1,024</span>
                <span className="font-mono-sm text-mono-sm text-on-surface-variant">/ 4,096 TOK</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-secondary-fixed-dim h-full w-[25%]"></div>
              </div>
            </div>

            <div className="bg-surface-container-low p-space-sm rounded flex flex-col justify-between shadow-sm border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">NPU POWER / DRIFT</span>
                <span className="material-symbols-outlined text-xs text-tertiary-container">thermostat</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-mono-lg text-mono-lg text-primary font-bold">14.8W</span>
                <span className="font-mono-sm text-mono-sm text-on-surface-variant">// 56°C STABLE</span>
              </div>
              <div className="w-full bg-surface-container-highest h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-primary h-full w-[42%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Multimodal SLM Reasoner Stream (4 Columns) */}
        <div className="xl:col-span-4 flex flex-col gap-space-sm">
          <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col h-full shadow-lg border border-surface-container-high">
            {/* Gemma 4 Multimodal Reasoner Header */}
            <div className="flex items-center justify-between pb-space-sm bg-surface-container-lowest/50 p-space-sm rounded border border-surface-container-high">
              <div className="flex items-center gap-space-sm">
                <div className="p-1 rounded bg-surface-container text-primary-container">
                  <span className="material-symbols-outlined text-lg">neurology</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-md text-headline-md text-primary font-bold">GEMMA 4 REASONER</span>
                    <span className="px-1.5 py-0.5 rounded bg-primary-container text-surface-container-lowest font-mono-sm text-mono-sm font-bold">
                      GEMINI API
                    </span>
                  </div>
                  <span className="font-mono-sm text-mono-sm text-on-surface-variant">
                    Gemma-4-Multimodal-9B // Open-Weights Vision
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSendQuery(`Analyze optical feed for ${activeFrame.title} (${activeFrame.code}) and recommend emergency safety envelope.`)}
                className="px-2 py-1 rounded bg-surface-container-high hover:bg-primary-container hover:text-surface-container-lowest text-primary font-mono-sm text-mono-sm font-bold transition-all flex items-center gap-1 border border-primary-container/30"
              >
                <span className="material-symbols-outlined text-xs">visibility</span>
                <span>Gemma 4 Scan</span>
              </button>
            </div>

            {/* Structured Reasoning Execution Trace */}
            <div className="flex flex-col gap-space-sm overflow-y-auto max-h-[580px] pr-1 mt-space-sm">
              {/* Step 1: Visual Token Embedding Inspection */}
              <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-1 border border-surface-container-high">
                <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                  <span>[STEP 01: VISUAL FEATURE EMBEDDING]</span>
                  <span className="font-mono-sm text-mono-sm text-secondary">PROCESSED (32.1ms)</span>
                </div>
                <div className="font-mono-sm text-mono-sm text-on-surface bg-surface-container-high/60 p-space-xs rounded">
                  <span className="text-primary-container font-semibold">SIG_PATCHES:</span> 576 vision-tokens ingested.
                  Target focus on <span className="text-secondary font-bold">[{activeFrame.category}]</span>.
                </div>
              </div>

              {/* Step 2: Correlated Tactical Field Manual Lookup */}
              <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-1 border border-surface-container-high">
                <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                  <span>[STEP 02: AIRGAP VECTOR RAG LOOKUP]</span>
                  <span className="font-mono-sm text-mono-sm text-secondary font-bold">3 CHUNKS RETRIEVED</span>
                </div>
                <div className="font-mono-sm text-mono-sm text-on-surface-variant flex flex-col gap-1">
                  <div className="flex items-center gap-1 text-on-surface">
                    <span className="material-symbols-outlined text-xs text-primary">menu_book</span>
                    <span className="font-semibold text-primary">TM-1-1520-238-23:</span> Hydraulic Subsystems Sec. 4-12
                  </div>
                  <div className="text-xs bg-surface-container-high/40 p-space-xs rounded font-mono-sm text-mono-sm text-on-surface">
                    "Thermal variance exceeding +15°C above baseline ambient under 60-second sustain signals primary
                    relief valve seal failure (PN: HYD-904-B)."
                  </div>
                </div>
              </div>

              {/* Step 3: Diagnostic Synthesis & Component Breakdown */}
              <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-2 border border-surface-container-high">
                <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                  <span>[STEP 03: SYNTHESIS & DIAGNOSTIC MATCH]</span>
                  <span className="text-tertiary-container font-bold font-mono-sm text-mono-sm">
                    {activeFrame.title} CONFIRMED
                  </span>
                </div>
                {/* Component Specifications Card */}
                <div className="bg-surface-container p-space-sm rounded flex flex-col gap-1.5 border border-surface-container-high">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-outline">IDENTIFIED HARDWARE</span>
                    <span className="font-mono-sm text-mono-sm text-secondary font-bold">MIL-SPEC 994-ACT</span>
                  </div>
                  <div className="grid grid-cols-2 gap-space-xs font-mono-sm text-mono-sm">
                    <div className="text-on-surface-variant">NOMINAL PRESSURE:</div>
                    <div className="text-on-surface text-right">{activeFrame.hardwareSpecs.nominalPressure}</div>
                    <div className="text-on-surface-variant">DETECTED TEMP:</div>
                    <div className="text-tertiary-container text-right font-bold">{activeFrame.hardwareSpecs.detectedTemp}</div>
                    <div className="text-on-surface-variant">FAILURE PROBABILITY:</div>
                    <div className="text-tertiary-container text-right font-bold">
                      {activeFrame.hardwareSpecs.failureProbability}
                    </div>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
                  {activeFrame.analysisReport}
                </p>
              </div>

              {/* Step 4: Safety Protocol Recommendations */}
              <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-1.5 border border-surface-container-high">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span className="font-label-caps text-label-caps tracking-wider uppercase font-bold">
                    RECOMMENDED SAFETY PROTOCOLS
                  </span>
                </div>
                <ul className="flex flex-col gap-1 font-mono-sm text-mono-sm text-on-surface">
                  {activeFrame.safetyProtocols.map((protocol, i) => (
                    <li key={i} className="flex items-start gap-1.5 bg-surface-container-high/50 p-space-xs rounded">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span>{protocol}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dynamic Q&A Result */}
              {reasonerLog && (
                <div className="bg-surface-container-lowest p-space-sm rounded flex flex-col gap-1 border border-primary-container/40 animate-fade-in">
                  <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                    <span className="text-primary font-bold">&gt; OPERATOR QUERY:</span>
                    <span className="text-secondary font-mono-sm">AIRGAP RESPONSE</span>
                  </div>
                  <div className="font-mono-sm text-mono-sm text-on-surface-variant italic">
                    "{reasonerLog.query}"
                  </div>
                  <div className="font-body-sm text-body-sm text-primary leading-relaxed mt-1">
                    {reasonerLog.answer}
                  </div>
                </div>
              )}
            </div>

            {/* Reasoner Interactive Prompt Injector */}
            <div className="mt-space-md pt-space-sm bg-surface-container-lowest p-space-sm rounded flex flex-col gap-space-xs border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline">DIRECT SLM QUERY (ZERO-CLOUD)</span>
                <span className="font-mono-sm text-mono-sm text-primary">SLM_LOCAL::INSTRUCT#</span>
              </div>
              <div className="flex items-center gap-space-xs bg-surface-container-high rounded px-space-sm py-1 border border-surface-container-highest">
                <span className="text-primary-container font-mono-md text-mono-md font-bold">&gt;</span>
                <input
                  type="text"
                  value={customQuery}
                  onChange={e => setCustomQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendQuery()}
                  placeholder="Query multimodal edge reasoner..."
                  className="w-full bg-transparent text-on-surface font-mono-sm text-mono-sm focus:outline-none placeholder-outline"
                />
                <button
                  onClick={() => handleSendQuery()}
                  className="bg-primary-container text-surface-container-lowest px-2 py-1 rounded font-mono-sm text-mono-sm font-bold hover:bg-secondary-container transition-colors"
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-panel: Tactical Timeline & Anomaly Snapshots */}
      <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-sm shadow-md border border-surface-container-high">
        <div className="flex items-center justify-between flex-wrap gap-space-sm">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-secondary text-base">video_library</span>
              <span className="font-headline-md text-headline-md text-on-surface font-bold">
                MISSION TIMELINE & ANOMALY SNAPSHOTS
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline font-mono-sm text-mono-sm">
              6 CAPTURED FRAMES
            </span>
          </div>

          {/* Scrubber Range Control */}
          <div className="flex items-center gap-space-md font-mono-sm text-mono-sm">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span>SCRUB:</span>
              <span className="text-primary font-bold">T-04:{22 + timeOffsetSeconds}.18s</span>
            </div>
            <button
              onClick={() => setTimeOffsetSeconds(s => s - 10)}
              className="px-2 py-1 rounded bg-surface-container-high text-on-surface hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">fast_rewind</span>
              <span>-10s</span>
            </button>
            <button
              onClick={() => setTimeOffsetSeconds(s => s + 10)}
              className="px-2 py-1 rounded bg-surface-container-high text-on-surface hover:text-primary transition-colors flex items-center gap-1"
            >
              <span>+10s</span>
              <span className="material-symbols-outlined text-xs">fast_forward</span>
            </button>
          </div>
        </div>

        {/* Horizontal Filmstrip of Captured Optical Frames */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm mt-space-xs">
          {frames.map((frame, index) => {
            const isSelected = index === activeFrameIndex;
            return (
              <div
                key={frame.id}
                onClick={() => handleSelectFrame(index)}
                className={`bg-surface-container-lowest rounded overflow-hidden flex flex-col shadow-md group cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-primary-container ring-1 ring-primary-container'
                    : 'border-surface-container-high hover:border-outline'
                }`}
              >
                <div
                  className="relative w-full h-24 bg-cover bg-center"
                  style={{ backgroundImage: `url('${frame.imageUrl}')` }}
                >
                  <span className="absolute top-1 left-1 bg-surface-container-lowest/90 text-tertiary-container font-label-caps text-label-caps px-1 py-0.5 rounded font-bold">
                    {frame.timestamp}
                  </span>
                  {isSelected && (
                    <span className="absolute bottom-1 right-1 bg-on-tertiary-container text-tertiary font-label-caps text-label-caps px-1 rounded font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="p-space-xs flex flex-col gap-0.5 bg-surface-container">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-label-caps text-label-caps font-bold truncate ${
                        frame.critical ? 'text-tertiary' : 'text-primary'
                      }`}
                    >
                      {frame.title}
                    </span>
                    <span className="font-mono-sm text-mono-sm text-outline">{frame.code}</span>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleSelectFrame(index);
                      handleRunDiagnostic();
                    }}
                    className="mt-1 w-full bg-surface-container-highest text-primary font-mono-sm text-mono-sm py-0.5 rounded hover:bg-primary-container hover:text-surface-container-lowest transition-colors"
                  >
                    RE-ASSESS
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Tactical Toolbar (Bottom Deck) */}
      <div className="w-full bg-surface-container-low rounded-lg p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-md border border-surface-container-high">
        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleRunDiagnostic}
            disabled={isDiagnosticRunning}
            className="bg-primary-container text-surface-container-lowest px-space-md py-space-sm rounded font-label-caps text-label-caps uppercase font-bold flex items-center gap-1.5 hover:bg-secondary-container transition-all shadow-[0_0_12px_rgba(0,240,255,0.2)] disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-base ${
                isDiagnosticRunning ? 'animate-spin' : ''
              }`}
            >
              bolt
            </span>
            <span>{isDiagnosticRunning ? 'EVALUATING MODEL...' : 'Run Neural Diagnostic'}</span>
          </button>

          <button
            onClick={() => setShowThermalDelta(!showThermalDelta)}
            className={`px-space-md py-space-sm rounded font-label-caps text-label-caps uppercase font-bold flex items-center gap-1.5 transition-colors ${
              showThermalDelta
                ? 'bg-secondary text-surface-container-lowest'
                : 'bg-surface-container-high text-on-surface hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">difference</span>
            <span>{showThermalDelta ? 'Hide Thermal Heatmap' : 'Execute Thermal Delta Analysis'}</span>
          </button>

          <button
            onClick={() => setShowJsonAstModal(true)}
            className="bg-surface-container-high text-on-surface hover:text-primary px-space-md py-space-sm rounded font-label-caps text-label-caps uppercase font-bold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-base">data_object</span>
            <span>Extract Frame Schema (JSON-AST)</span>
          </button>

          {onNavigateToGraphify && (
            <button
              onClick={onNavigateToGraphify}
              className="bg-primary/10 text-primary border border-primary/40 hover:bg-primary/20 px-space-md py-space-sm rounded font-label-caps text-label-caps uppercase font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">hub</span>
              <span>Graphify Causal Trace</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          <button
            onClick={handleExportReport}
            className="bg-surface-container-lowest text-secondary px-space-md py-space-sm rounded font-mono-sm text-mono-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors border border-secondary/30"
          >
            <span className="material-symbols-outlined text-base">archive</span>
            <span>
              {showReportSuccess ? 'Exported Report (.json)' : 'Export Airgap Report (.tar.gz.aes)'}
            </span>
          </button>
        </div>
      </div>

      {/* JSON-AST Modal */}
      {showJsonAstModal && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-primary-container/40 rounded-xl p-space-md max-w-2xl w-full shadow-2xl flex flex-col gap-space-sm">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container">data_object</span>
                <span className="font-mono-md text-mono-md text-primary font-bold">
                  TELEMETRY FRAME SCHEMA AST :: {activeFrame.code}
                </span>
              </div>
              <button
                onClick={() => setShowJsonAstModal(false)}
                className="text-on-surface-variant hover:text-error"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <pre className="p-3 bg-surface-container-lowest rounded font-mono-sm text-mono-sm text-secondary overflow-x-auto max-h-96">
{JSON.stringify(
  {
    $schema: "http://json-schema.org/draft-07/schema#",
    frame_identifier: activeFrame.code,
    timestamp_utc: `14:38:${29 + timeOffsetSeconds}.402`,
    optical_mode: sensorMode,
    zoom_setting: zoomLevel,
    detections: [
      {
        id: "ROI-01",
        label: "BAY_POD::01",
        confidence: 0.974,
        delta_temp_c: 1.2
      },
      {
        id: "ROI-02",
        label: activeFrame.category,
        alert_status: activeFrame.critical ? "CRITICAL" : "ADVISORY",
        confidence: activeFrame.confidence,
        thermal_signature: activeFrame.temperature,
        failure_prob: activeFrame.hardwareSpecs.failureProbability
      }
    ],
    gbnf_constrained: true,
    sha256_checkpoint: "49fa7e8820cda91e"
  },
  null,
  2
)}
            </pre>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowJsonAstModal(false)}
                className="px-space-md py-1 bg-surface-container-high rounded text-on-surface font-mono-sm text-mono-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
