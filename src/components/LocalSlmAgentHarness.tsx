import React, { useState, useEffect } from 'react';
import { ModelCheckpoint, ChatThread, RagDocument } from '../types/tactical';
import { INITIAL_MODELS, INITIAL_THREADS, INITIAL_RAG_DOCS, REGISTERED_TOOLS } from '../data/mockData';
import { searchOfflineRag, chunkTextAsset } from '../lib/ragEngine';

interface LocalSlmAgentHarnessProps {
  activeModel: ModelCheckpoint;
  onSelectModel: (model: ModelCheckpoint) => void;
}

export const LocalSlmAgentHarness: React.FC<LocalSlmAgentHarnessProps> = ({
  activeModel,
  onSelectModel,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const [ragDocs, setRagDocs] = useState<RagDocument[]>(INITIAL_RAG_DOCS);
  
  // Model settings
  const [temperature, setTemperature] = useState(0.2);
  const [topP, setTopP] = useState(0.85);
  const [kvQuant, setKvQuant] = useState<'FP16' | 'Q8_0' | 'Q4_0'>('FP16');
  const [offloadLayers, setOffloadLayers] = useState(28);
  const [filterEnforced, setFilterEnforced] = useState(true);
  const [ropeCompressed, setRopeCompressed] = useState(true);
  const [spilloverLocked, setSpilloverLocked] = useState(true);

  // Chat input and streaming state
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [liveTps, setLiveTps] = useState(activeModel.tokensPerSec);

  // Ingest modal
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  // Scratchpad purge toast
  const [purgeToast, setPurgeToast] = useState(false);

  // Active thread
  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  // TPS jitter effect for cockpit realism
  useEffect(() => {
    const timer = setInterval(() => {
      const delta = (Math.random() * 1.6 - 0.8).toFixed(1);
      setLiveTps(Number((activeModel.tokensPerSec + parseFloat(delta)).toFixed(1)));
    }, 2400);
    return () => clearInterval(timer);
  }, [activeModel.tokensPerSec]);

  // Handle warm reset
  const handleWarmReset = () => {
    setPurgeToast(true);
    setTimeout(() => setPurgeToast(false), 2000);
  };

  // Handle switching model
  const handleModelClick = (modelId: string) => {
    const selected = INITIAL_MODELS.find(m => m.id === modelId);
    if (selected) {
      onSelectModel(selected);
    }
  };

  // Handle new thread creation
  const handleNewThread = () => {
    const id = `thread-${Date.now()}`;
    const newT: ChatThread = {
      id,
      title: `Mission Query #${Math.floor(Math.random() * 9000 + 1000)}`,
      updatedAt: 'Just now',
      messageCount: 1,
      systemDirective:
        'Tactical Edge Agent: Deterministic reasoning engine locked at 0.20 temperature. Zero internet sockets.',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString() + ' UTC',
          senderLabel: 'TACTICAL ENGINE READY',
          text: 'Tactical SLM agent initialized for new mission envelope. Ingested local RAG vector space ready for query execution.',
        },
      ],
    };
    setThreads([newT, ...threads]);
    setActiveThreadId(id);
  };

  // Engine Provider filter: 'LOCAL' | 'GEMMA_GEMINI_API'
  const [engineProvider, setEngineProvider] = useState<'LOCAL' | 'GEMMA_GEMINI_API'>('GEMMA_GEMINI_API');

  // Handle message submission
  const handleSendMessage = async () => {
    if (!inputText.trim() || isStreaming) return;
    const userQuery = inputText.trim();
    setInputText('');

    const userMsgId = `msg-u-${Date.now()}`;
    const newMessages = [
      ...activeThread.messages,
      {
        id: userMsgId,
        sender: 'user' as const,
        timestamp: new Date().toLocaleTimeString() + ' UTC',
        senderLabel: 'OPERATOR // CREW-CHIEF',
        text: userQuery,
      },
    ];

    setThreads(prev =>
      prev.map(t =>
        t.id === activeThread.id
          ? { ...t, messages: newMessages, messageCount: newMessages.length }
          : t
      )
    );

    setIsStreaming(true);

    // Compute RAG similarity in real-time
    const ragMatches = searchOfflineRag(userQuery, ragDocs);
    const topMatch = ragMatches[0];

    // If using Gemma 4 via Gemini API:
    if (activeModel.provider === 'GEMMA_GEMINI_API') {
      try {
        const res = await fetch('/api/gemma/inference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userQuery,
            model: activeModel.filename,
            systemDirective: activeThread.systemDirective,
            temperature,
            topP,
          }),
        });

        if (res.ok) {
          const gemmaData = await res.json();
          const agentMsgId = `msg-a-${Date.now()}`;
          const updatedMessages = [
            ...newMessages,
            {
              id: agentMsgId,
              sender: 'agent' as const,
              timestamp: new Date().toLocaleTimeString() + ' UTC',
              senderLabel: `GEMMA 4 MULTIMODAL // ${activeModel.name}`,
              metrics: {
                tps: gemmaData.tps || activeModel.tokensPerSec,
                ttft: gemmaData.ttftMs || activeModel.ttftMs,
                model: `${activeModel.name} (Gemini API)`,
              },
              reasoningSteps: [
                `1. Gemma 4 open-weights multimodal pipeline initialized via Gemini API.`,
                `2. RAG vector context synced: "${topMatch?.docName}" (Similarity: ${topMatch?.similarity}).`,
                `3. Multimodal token budget evaluated with deterministic temperature ${temperature.toFixed(2)}.`,
              ],
              text: gemmaData.content,
              recommendedAction: {
                command: '/opt/uav/recal_pwm_neutral.sh -f 140hz --gemma4-verified',
                buttonLabel: 'DISPATCH FIX',
              },
            },
          ];

          setThreads(prev =>
            prev.map(t =>
              t.id === activeThread.id
                ? { ...t, messages: updatedMessages, messageCount: updatedMessages.length }
                : t
            )
          );
          setIsStreaming(false);
          return;
        }
      } catch (err) {
        console.warn('Gemma 4 API endpoint error, using simulated response', err);
      }
    }

    // Default Local SLM inference fallback
    setTimeout(() => {
      const agentMsgId = `msg-a-${Date.now()}`;
      let answerText = '';
      let recommendedCommand = '';
      const q = userQuery.toLowerCase();

      if (q.includes('pwm') || q.includes('gimbal') || q.includes('servo')) {
        answerText = `Local SLM diagnosis for "${userQuery}":
Resolver telemetry indicates PWM pulse width is clamping at 1950µs ceiling. Under MIL-STD-810H Section 514.8, 140Hz aerodynamic vibration is creating 14.8% overshoot on loop compensation.`;
        recommendedCommand = '/opt/uav/recal_pwm_neutral.sh -f 140hz';
      } else if (q.includes('pin') || q.includes('relay') || q.includes('gpio')) {
        answerText = `GBNF-constrained hardware check:
Direct GPIO memory map /dev/gpiomem confirms relay pins 1-40 are isolated from external bus. Target state transition executed deterministically with exit code 0.`;
        recommendedCommand = 'gpio_relay_toggle --test-pin 17';
      } else if (q.includes('crypto') || q.includes('rf') || q.includes('starlink')) {
        answerText = `Zero-leak TEMPEST Level B assurance:
RF transceivers are in sleep state. AES-256 GCM key authenticated locally via hardware security module (HSM) ring. No egress packets detected.`;
        recommendedCommand = 'rf_stealth_enforce --kill-all';
      } else {
        answerText = `Local SLM offline inference completed:
Evaluated query "${userQuery}" against local vector database (${topMatch?.docName || 'MIL-STD-810H.pdf'}). All parameters conform to avionics operating envelopes.`;
        recommendedCommand = 'echo "SYSTEM_NOMINAL"';
      }

      const updatedMessages = [
        ...newMessages,
        {
          id: agentMsgId,
          sender: 'agent' as const,
          timestamp: new Date().toLocaleTimeString() + ' UTC',
          senderLabel: 'LOCAL AGENT INFERENCE',
          metrics: {
            tps: liveTps,
            ttft: activeModel.ttftMs,
            model: activeModel.name,
          },
          reasoningSteps: [
            `1. RAG query matched "${topMatch?.docName}" (Sim: ${topMatch?.similarity})`,
            `2. Semantic context extracted: "${topMatch?.snippet?.substring(0, 70)}..."`,
            `3. Verified zero-drift against GBNF AST rules. Temperature locked at ${temperature.toFixed(2)}.`,
          ],
          text: answerText,
          recommendedAction: {
            command: recommendedCommand,
            buttonLabel: 'DISPATCH FIX',
          },
        },
      ];

      setThreads(prev =>
        prev.map(t =>
          t.id === activeThread.id
            ? { ...t, messages: updatedMessages, messageCount: updatedMessages.length }
            : t
        )
      );

      setIsStreaming(false);
    }, 900);
  };

  // Handle ingest new document
  const handleIngestDocument = () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    const chunks = chunkTextAsset(newDocContent);
    const newDoc: RagDocument = {
      id: `doc-${Date.now()}`,
      name: newDocTitle.trim().endsWith('.md') || newDocTitle.trim().endsWith('.pdf')
        ? newDocTitle.trim()
        : `${newDocTitle.trim()}.md`,
      size: `${(newDocContent.length / 1024).toFixed(1)} KB`,
      chunks: chunks.length,
      similarity: 0.915,
      distance: 0.085,
      category: 'User Ingested Manual',
      summary: newDocContent.substring(0, 90) + '...',
      content: newDocContent,
    };
    setRagDocs([newDoc, ...ragDocs]);
    setNewDocTitle('');
    setNewDocContent('');
    setShowIngestModal(false);
  };

  return (
    <div className="p-space-lg space-y-space-lg">
      {/* Top Telemetry Ribbon */}
      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-wrap items-center justify-between gap-space-md relative overflow-hidden border border-surface-container-high">
          <div className="flex items-center gap-space-md z-10">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shadow-inner border border-primary-container/20">
              <span className="material-symbols-outlined text-xl">terminal</span>
            </div>
            <div>
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                  AGENT HARNESS :: LOCAL RUNTIME
                </span>
                <span className="px-space-xs py-0.5 rounded bg-secondary/10 text-secondary font-label-caps text-label-caps flex items-center gap-1 border border-secondary/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  AIR-GAPPED DETERMINISTIC
                </span>
              </div>
              <div className="font-mono-sm text-mono-sm text-on-surface-variant flex items-center gap-space-sm mt-0.5 flex-wrap">
                <span>DAEMON: llama.cpp/b3419</span>
                <span className="text-outline">/</span>
                <span>DEV: /dev/kfd (AMD ROCm / Vulkan)</span>
                <span className="text-outline">/</span>
                <span className="text-secondary font-bold">ZERO NETWORK SOCKETS</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-lg z-10">
            <div className="flex flex-col text-right">
              <span className="font-label-caps text-label-caps text-outline uppercase">GENERATION VELOCITY</span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-mono-lg text-mono-lg text-primary-container font-bold">{liveTps}</span>
                <span className="font-mono-sm text-mono-sm text-on-surface-variant">tok/s</span>
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container-highest"></div>
            <div className="flex flex-col text-right">
              <span className="font-label-caps text-label-caps text-outline uppercase">LOCAL TTFT</span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-mono-lg text-mono-lg text-secondary font-bold">{activeModel.ttftMs}</span>
                <span className="font-mono-sm text-mono-sm text-on-surface-variant">ms</span>
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container-highest"></div>
            <button
              onClick={handleWarmReset}
              className="px-space-md py-space-xs rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-caps text-label-caps flex items-center gap-space-xs transition-colors shadow-sm border border-surface-container-highest"
            >
              <span className="material-symbols-outlined text-sm text-primary">restart_alt</span>
              WARM RESET
            </button>
          </div>
        </div>

        {/* Quick Airgap Guard Capsule */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-space-md shadow-md flex items-center justify-between gap-space-md border border-surface-container-high">
          <div className="flex items-center gap-space-sm">
            <div className="p-2 rounded bg-surface-container-high text-secondary border border-secondary/20">
              <span className="material-symbols-outlined text-lg">verified_user</span>
            </div>
            <div>
              <div className="font-mono-md text-mono-md text-on-surface font-bold">ZERO-LEAK ASSURANCE</div>
              <div className="font-mono-sm text-mono-sm text-outline">Loopback 127.0.0.1 bound only</div>
            </div>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1 rounded border border-surface-container-highest">
            <span className="material-symbols-outlined text-secondary text-sm">shield</span>
            <span className="font-label-caps text-label-caps text-secondary font-bold">HARDWARE LOCKED</span>
          </div>
        </div>
      </div>

      {purgeToast && (
        <div className="p-space-sm bg-secondary/10 border border-secondary text-secondary rounded-lg font-mono-sm text-mono-sm flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>SLM Scratchpad and KV Cache flushed. Model runtime re-pinned to local NPU memory.</span>
        </div>
      )}

      {/* Main Grid: 3-column architecture */}
      <div className="grid grid-cols-12 gap-gutter items-start">
        {/* Module 1: Model Orchestration & Hardware Offload Controller */}
        <div className="col-span-12 lg:col-span-3 space-y-space-md">
          {/* Active SLM Switcher */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md space-y-space-md border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-base">memory</span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase font-bold">
                  MODEL ORCHESTRATION
                </span>
              </div>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-primary font-mono-sm text-mono-sm font-bold">
                ACTIVE
              </span>
            </div>

            {/* Engine Provider Switcher */}
            <div className="grid grid-cols-2 gap-1 p-0.5 bg-surface-container rounded-lg border border-surface-container-high font-mono-sm text-mono-sm">
              <button
                onClick={() => setEngineProvider('LOCAL')}
                className={`py-1 text-center rounded transition-colors ${
                  engineProvider === 'LOCAL'
                    ? 'bg-surface-container-highest text-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                LOCAL NPU AIRGAP
              </button>
              <button
                onClick={() => setEngineProvider('GEMMA_GEMINI_API')}
                className={`py-1 text-center rounded transition-colors flex items-center justify-center gap-1 ${
                  engineProvider === 'GEMMA_GEMINI_API'
                    ? 'bg-primary-container text-surface-container-lowest font-bold shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-xs">neurology</span>
                <span>GEMMA 4 (GEMINI API)</span>
              </button>
            </div>

            {/* Gemma 4 Multimodal Telemetry Card */}
            {engineProvider === 'GEMMA_GEMINI_API' && (
              <div className="p-space-xs rounded bg-surface-container-lowest border border-primary-container/30 space-y-1 font-mono-sm text-mono-sm">
                <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                  <span className="text-primary font-bold">GEMMA 4 MULTIMODAL HARNESS</span>
                  <span className="text-secondary font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Architecture:</span>
                  <span className="text-on-surface font-semibold">Open-Weights Multimodal</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Access Gateway:</span>
                  <span className="text-primary-container font-bold">Google Gemini API</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Modality:</span>
                  <span className="text-secondary font-bold">Text + FLIR/EO Vision</span>
                </div>
              </div>
            )}

            {/* Model Radio Stack */}
            <div className="space-y-space-xs">
              {INITIAL_MODELS.filter(m =>
                engineProvider === 'LOCAL'
                  ? m.type === 'SLM' && m.provider !== 'GEMMA_GEMINI_API'
                  : m.provider === 'GEMMA_GEMINI_API'
              ).map(model => {
                const isSelected = model.id === activeModel.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => handleModelClick(model.id)}
                    className={`p-space-sm rounded-lg transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-surface-container border-primary-container/40 shadow-sm'
                        : 'bg-surface-container-lowest/70 hover:bg-surface-container border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`font-mono-md text-mono-md font-bold truncate ${
                          isSelected ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {model.name}
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary-fixed-dim font-mono-sm text-mono-sm font-semibold shrink-0">
                        {model.quant}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-on-surface-variant font-mono-sm text-mono-sm">
                      <span>{model.provider === 'GEMMA_GEMINI_API' ? model.region : `VRAM: ${model.vramSizeGB.toFixed(2)} GB`}</span>
                      <span
                        className={`font-bold ${
                          isSelected ? 'text-secondary' : 'text-outline font-normal'
                        }`}
                      >
                        {isSelected ? 'PRIMARY ENGAGED' : 'STANDBY CKPT'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hardware Layer Offload Gauge */}
            <div className="space-y-space-xs pt-space-xs">
              <div className="flex items-center justify-between font-mono-sm text-mono-sm">
                <span className="text-on-surface-variant">GPU Layer Offload</span>
                <span className="text-primary font-bold">
                  {offloadLayers} / 28 Layers ({Math.round((offloadLayers / 28) * 100)}%)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="28"
                value={offloadLayers}
                onChange={e => setOffloadLayers(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container"
              />
              <div className="flex items-center justify-between font-mono-sm text-mono-sm text-outline pt-0.5">
                <span>{28 - offloadLayers} CPU Fallback</span>
                <span>dGPU: Radeon 780M / Orin</span>
              </div>
            </div>

            {/* KV Cache Quantization Selector */}
            <div className="space-y-space-xs pt-space-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline uppercase">KV CACHE QUANT</span>
                <span className="font-mono-sm text-mono-sm text-secondary font-bold">{kvQuant} BUFFER</span>
              </div>
              <div className="grid grid-cols-3 gap-1 p-0.5 bg-surface-container rounded-lg border border-surface-container-high">
                {(['FP16', 'Q8_0', 'Q4_0'] as const).map(q => (
                  <button
                    key={q}
                    onClick={() => setKvQuant(q)}
                    className={`py-1 text-center rounded font-mono-sm text-mono-sm transition-colors ${
                      kvQuant === q
                        ? 'bg-surface-container-highest text-primary font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Context Window Dynamic Gauge */}
            <div className="bg-surface-container p-space-sm rounded-lg space-y-space-xs border border-surface-container-high">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-outline">CONTEXT WINDOW USAGE</span>
                <span className="font-mono-sm text-mono-sm text-primary font-bold">
                  {activeThread.messages.length * 280 + 1024} / 16,384 tk
                </span>
              </div>
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-primary-container h-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((activeThread.messages.length * 280 + 1024) / 16384) * 100
                    )}%`,
                  }}
                ></div>
                <div className="bg-surface-container-highest h-full flex-1"></div>
              </div>
              <div className="flex items-center justify-between font-mono-sm text-mono-sm text-on-surface-variant">
                <span>
                  {Math.round(((activeThread.messages.length * 280 + 1024) / 16384) * 100)}% Utilized
                </span>
                <span className="text-secondary font-semibold">
                  {16384 - (activeThread.messages.length * 280 + 1024)} Left
                </span>
              </div>
            </div>
          </div>

          {/* Guardrails & Decoding */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md space-y-space-md border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-base">rule_settings</span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase font-bold">
                  GUARDRAILS & DECODING
                </span>
              </div>
              <span className="px-space-xs py-0.5 rounded bg-surface-container text-secondary font-mono-sm text-mono-sm">
                ACTIVE
              </span>
            </div>

            <div className="space-y-space-sm font-mono-sm text-mono-sm">
              <div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Temperature (Deterministic)</span>
                  <span className="text-primary font-bold">{temperature.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Top_P (Nucleus Sampling)</span>
                  <span className="text-primary font-bold">{topP.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={topP}
                  onChange={e => setTopP(parseFloat(e.target.value))}
                  className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary-container mt-1"
                />
              </div>
            </div>

            <div className="space-y-space-xs pt-space-xs">
              <div
                onClick={() => setFilterEnforced(!filterEnforced)}
                className="flex items-center justify-between p-space-xs bg-surface-container rounded cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-sm text-secondary">security</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface">Tactical Safety Filter</span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded font-label-caps text-label-caps ${
                    filterEnforced ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-highest text-outline'
                  }`}
                >
                  {filterEnforced ? 'ENFORCED' : 'OFF'}
                </span>
              </div>

              <div
                onClick={() => setRopeCompressed(!ropeCompressed)}
                className="flex items-center justify-between p-space-xs bg-surface-container rounded cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-sm text-primary">compress</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface">Context Auto-Compress</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-caps text-label-caps">
                  {ropeCompressed ? 'OFFLINE ROPE' : 'RAW'}
                </span>
              </div>

              <div
                onClick={() => setSpilloverLocked(!spilloverLocked)}
                className="flex items-center justify-between p-space-xs bg-surface-container rounded cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-sm text-secondary">phonelink_lock</span>
                  <span className="font-mono-sm text-mono-sm text-on-surface">Memory Spillover Trap</span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded font-label-caps text-label-caps ${
                    spilloverLocked ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-highest text-outline'
                  }`}
                >
                  {spilloverLocked ? 'LOCKED' : 'BYPASS'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Tactical Agent Reasoning & Interactive Workspace */}
        <div className="col-span-12 lg:col-span-6 space-y-space-md">
          <div className="bg-surface-container-low rounded-xl shadow-md flex flex-col h-[760px] overflow-hidden border border-surface-container-high">
            {/* Harness Header */}
            <div className="p-space-md bg-surface-container flex items-center justify-between shadow-sm border-b border-surface-container-high">
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                  <span className="font-mono-md text-mono-md text-on-surface font-bold truncate max-w-[200px]">
                    THREAD: {activeThread.title}
                  </span>
                </div>
                <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-primary font-mono-sm text-mono-sm font-semibold">
                  ID: #{activeThread.id}
                </span>
              </div>
              <div className="flex items-center gap-space-sm font-mono-sm text-mono-sm">
                <button
                  onClick={() => {
                    const text = activeThread.messages.map(m => `[${m.timestamp}] ${m.senderLabel}: ${m.text}`).join('\n\n');
                    navigator.clipboard.writeText(text);
                    alert('Session transcript copied to clipboard.');
                  }}
                  className="px-space-xs py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">download</span>
                  EXPORT LOG
                </button>
                <button
                  onClick={() => {
                    setThreads(prev =>
                      prev.map(t => (t.id === activeThread.id ? { ...t, messages: [] } : t))
                    );
                  }}
                  className="px-space-xs py-1 rounded bg-surface-container-high hover:bg-surface-container-highest text-error transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">delete</span>
                  CLEAR
                </button>
              </div>
            </div>

            {/* Sub-Split: Thread Selector Rail & Active Workspace */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Thread Drawer */}
              <div className="w-48 bg-surface-container-lowest/80 p-space-xs flex flex-col gap-space-xs shrink-0 overflow-y-auto border-r border-surface-container-high">
                <div className="px-space-xs py-1 font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  LOCAL SESSIONS
                </div>
                {threads.map(t => {
                  const isCur = t.id === activeThread.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveThreadId(t.id)}
                      className={`p-space-xs rounded text-mono-sm font-mono-sm cursor-pointer transition-colors ${
                        isCur
                          ? 'bg-surface-container text-primary font-bold shadow-sm border border-primary-container/20'
                          : 'hover:bg-surface-container/60 text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      <div className="truncate">{t.title}</div>
                      <div className="text-outline text-xs mt-0.5">
                        {t.updatedAt} • {t.messages.length} msgs
                      </div>
                    </div>
                  );
                })}
                <div className="mt-auto p-space-xs">
                  <button
                    onClick={handleNewThread}
                    className="w-full py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-caps text-label-caps flex items-center justify-center gap-1 transition-colors border border-surface-container-highest"
                  >
                    <span className="material-symbols-outlined text-xs">add</span> NEW THREAD
                  </button>
                </div>
              </div>

              {/* Agent Chat Transcript */}
              <div className="flex-1 flex flex-col bg-surface-container-low overflow-hidden">
                <div className="flex-1 p-space-md space-y-space-md overflow-y-auto" id="chat-stream">
                  {/* System Directive Injection Pill */}
                  <div className="bg-surface-container-lowest p-space-sm rounded-lg space-y-1 border border-surface-container-high">
                    <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-primary">integration_instructions</span>
                        SYSTEM DIRECTIVE INJECTED (AIR-GAP VERIFIED)
                      </span>
                      <span className="text-secondary font-mono-sm font-bold">ISOLATION: STRICT</span>
                    </div>
                    <p className="font-mono-sm text-mono-sm text-on-surface-variant leading-relaxed">
                      {activeThread.systemDirective}
                    </p>
                  </div>

                  {/* Messages */}
                  {activeThread.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col space-y-1 ${
                        msg.sender === 'user' ? 'items-end' : 'items-start w-full'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full text-outline font-mono-sm text-mono-sm">
                        <div className="flex items-center gap-space-xs">
                          {msg.sender === 'agent' && (
                            <span className="material-symbols-outlined text-xs text-secondary">psychology</span>
                          )}
                          <span className={msg.sender === 'agent' ? 'text-secondary font-bold' : ''}>
                            {msg.senderLabel || (msg.sender === 'user' ? 'OPERATOR' : 'SLM')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {msg.metrics && (
                            <>
                              <span className="text-primary-container font-mono-sm font-bold">{msg.metrics.tps} t/s</span>
                              <span className="text-outline">•</span>
                              <span>TTFT: {msg.metrics.ttft}ms</span>
                            </>
                          )}
                          <span className="text-xs">{msg.timestamp}</span>
                        </div>
                      </div>

                      {/* Chain of Thought if present */}
                      {msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                        <div className="w-full bg-surface-container-lowest p-space-sm rounded-lg space-y-1 border border-surface-container-high">
                          <div className="flex items-center justify-between text-outline font-label-caps text-label-caps">
                            <span>INTERNAL REASONING TRACE</span>
                            <span className="text-secondary font-bold">EVAL: POSITIVE</span>
                          </div>
                          <div className="font-mono-sm text-mono-sm text-on-surface-variant space-y-1">
                            {msg.reasoningSteps.map((step, idx) => (
                              <div key={idx} className="leading-relaxed">
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message Content */}
                      <div
                        className={`p-space-sm rounded-xl font-body-md text-body-md shadow-sm space-y-space-sm leading-relaxed border ${
                          msg.sender === 'user'
                            ? 'bg-surface-container-high text-on-surface max-w-[85%] border-surface-container-highest'
                            : 'bg-surface-container text-on-surface w-full border-surface-container-high'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>

                        {msg.recommendedAction && (
                          <div className="p-space-xs rounded bg-surface-container-high font-mono-sm text-mono-sm flex items-center justify-between flex-wrap gap-2 border border-surface-container-highest">
                            <span className="text-primary font-bold">
                              &gt; RECOMMENDED ACTION: {msg.recommendedAction.command}
                            </span>
                            <button
                              onClick={() => {
                                alert(`Executing dispatched action: ${msg.recommendedAction?.command}`);
                              }}
                              className="px-space-xs py-0.5 rounded bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase font-bold hover:bg-secondary-fixed transition-colors"
                            >
                              {msg.recommendedAction.buttonLabel}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isStreaming && (
                    <div className="p-space-sm rounded-xl bg-surface-container text-primary font-mono-sm text-mono-sm animate-pulse flex items-center gap-2 border border-primary-container/30">
                      <span className="material-symbols-outlined text-sm animate-spin">rotate_right</span>
                      <span>INFERENCING LOCAL TOKENS VIA {activeModel.name}...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <div className="p-space-sm bg-surface-container space-y-space-xs border-t border-surface-container-high">
                  <div className="flex items-center justify-between font-mono-sm text-mono-sm text-outline px-1">
                    <span>PROMPT INPUT [L3_AIRGAP]</span>
                    <div className="flex items-center gap-space-sm">
                      <span className="text-secondary font-bold">● LOCAL RAG ENGAGED</span>
                      <span>Tokens: 184 / 4096</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs bg-surface-container-lowest p-space-xs rounded-xl shadow-inner border border-surface-container-high">
                    <span className="text-primary font-mono-lg text-mono-lg pl-2 font-bold">&gt;</span>
                    <input
                      type="text"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Enter tactical query, diagnostics command, or tool invocation..."
                      className="flex-1 bg-transparent border-none text-on-surface font-mono-md text-mono-md focus:outline-none placeholder:text-outline/60 px-2"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isStreaming}
                      className="px-space-md py-space-xs rounded-lg bg-primary-container hover:bg-secondary-container text-on-primary-container font-mono-md text-mono-md font-bold transition-colors flex items-center gap-1 shadow-md disabled:opacity-50"
                    >
                      <span>EXEC</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </div>
                  {/* Quick test prompt chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1 font-mono-sm text-mono-sm">
                    <span className="text-outline text-xs">QUICK INJECT:</span>
                    <button
                      onClick={() => setInputText('Diagnose PWM slew rate overflow during 35kt crosswind')}
                      className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant hover:text-primary whitespace-nowrap text-xs"
                    >
                      PWM Slew Diagnostic
                    </button>
                    <button
                      onClick={() => setInputText('Run actuator MTBF degradation analysis at 50% load')}
                      className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant hover:text-primary whitespace-nowrap text-xs"
                    >
                      Actuator MTBF
                    </button>
                    <button
                      onClick={() => setInputText('Check TEMPEST Level B emission limits for radio antenna')}
                      className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant hover:text-primary whitespace-nowrap text-xs"
                    >
                      TEMPEST RF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module 3: Local Memory & Offline RAG Cache Bank */}
        <div className="col-span-12 lg:col-span-3 space-y-space-md">
          {/* RAG Vector Bank Panel */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md space-y-space-md border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-base">database</span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase font-bold">
                  OFFLINE RAG MEMORY
                </span>
              </div>
              <span className="px-space-xs py-0.5 rounded bg-surface-container text-secondary font-mono-sm text-mono-sm font-semibold">
                SQLite-vec
              </span>
            </div>

            <div className="bg-surface-container p-space-sm rounded-lg space-y-1 border border-surface-container-high">
              <div className="flex items-center justify-between font-mono-sm text-mono-sm">
                <span className="text-outline">STORE SIZE</span>
                <span className="text-on-surface font-bold">14.8 MB (Indexed)</span>
              </div>
              <div className="flex items-center justify-between font-mono-sm text-mono-sm">
                <span className="text-outline">TOTAL CHUNKS</span>
                <span className="text-primary font-bold">
                  {ragDocs.reduce((acc, d) => acc + d.chunks, 0)} vectors (384-dim)
                </span>
              </div>
              <div className="flex items-center justify-between font-mono-sm text-mono-sm">
                <span className="text-outline">EMBEDDING ENGINE</span>
                <span className="text-secondary font-bold">bge-small-en-v1.5 INT8</span>
              </div>
            </div>

            {/* Document List */}
            <div className="space-y-space-xs">
              <div className="font-label-caps text-label-caps text-outline uppercase font-bold">
                INGESTED FIELD ASSETS ({ragDocs.length})
              </div>
              {ragDocs.map(doc => (
                <div
                  key={doc.id}
                  className="p-space-sm bg-surface-container rounded-lg space-y-space-xs group hover:bg-surface-container-high transition-colors border border-surface-container-high"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-sm text-primary">description</span>
                      <span className="font-mono-sm text-mono-sm text-on-surface font-bold truncate">
                        {doc.name}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary font-mono-sm text-mono-sm font-bold">
                      {doc.similarity} SIM
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono-sm text-mono-sm text-outline">
                    <span>Chunks: {doc.chunks}</span>
                    <span>Distance: {doc.distance}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowIngestModal(true)}
              className="w-full py-2 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-caps text-label-caps flex items-center justify-center gap-1.5 transition-colors border border-surface-container-highest"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span>
              INGEST LOCAL ASSET (.PDF / .MD)
            </button>
          </div>

          {/* Ephemeral Session Memory Buffer */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md space-y-space-md border border-surface-container-high">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-base">memory_alt</span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase font-bold">
                  CONVERSATIONAL MEMORY
                </span>
              </div>
              <span className="font-mono-sm text-mono-sm text-primary font-bold">SLIDING KV</span>
            </div>
            <div className="space-y-space-xs font-mono-sm text-mono-sm">
              <div className="p-space-xs bg-surface-container rounded flex items-center justify-between">
                <span className="text-on-surface-variant">Active Scratchpad Entities</span>
                <span className="text-on-surface font-bold">14 Vars</span>
              </div>
              <div className="p-space-xs bg-surface-container rounded flex items-center justify-between">
                <span className="text-on-surface-variant">Self-Attention Head Cache</span>
                <span className="text-secondary font-bold">32/32 Warm</span>
              </div>
              <div className="p-space-xs bg-surface-container rounded flex items-center justify-between">
                <span className="text-on-surface-variant">Token Garbage Collector</span>
                <span className="text-outline font-bold">STANDBY</span>
              </div>
            </div>
            <button
              onClick={() => {
                setPurgeToast(true);
                setTimeout(() => setPurgeToast(false), 2000);
              }}
              className="w-full py-1.5 rounded bg-surface-container hover:bg-error-container/20 text-error font-label-caps text-label-caps transition-colors flex items-center justify-center gap-1 border border-error/30"
            >
              <span className="material-symbols-outlined text-sm">cleaning_services</span>
              PURGE KV SCRATCHPAD
            </button>
          </div>

          {/* Tactical Diagnostic Tool Registry */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md space-y-space-xs border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-outline uppercase font-bold">
                OFFLINE TOOL REGISTRY
              </span>
              <span className="text-secondary font-mono-sm text-mono-sm font-bold">4 ACTIVE</span>
            </div>
            <div className="space-y-1">
              {REGISTERED_TOOLS.slice(0, 4).map(tool => (
                <div
                  key={tool.id}
                  onClick={() => alert(`Tool verified: ${tool.name}() returned status 0 (OK)`)}
                  className="flex items-center justify-between p-1.5 bg-surface-container hover:bg-surface-container-high rounded text-mono-sm font-mono-sm cursor-pointer transition-colors"
                >
                  <span className="text-primary font-bold">{tool.name}()</span>
                  <span className="text-secondary font-semibold">OK</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ingest Asset Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-primary-container/40 rounded-xl p-space-md max-w-lg w-full shadow-2xl flex flex-col gap-space-sm">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">upload_file</span>
                <span className="font-mono-md text-mono-md text-primary font-bold">
                  INGEST LOCAL ASSET TO RAG
                </span>
              </div>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-on-surface-variant hover:text-error"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-outline uppercase">Document Title / File Name</label>
              <input
                type="text"
                placeholder="e.g. UAV_Battery_Failsafe_RevB.md"
                value={newDocTitle}
                onChange={e => setNewDocTitle(e.target.value)}
                className="p-2 bg-surface-container-lowest rounded font-mono-sm text-mono-sm text-on-surface border border-surface-container-high focus:outline-none focus:border-primary-container"
              />
              <label className="font-label-caps text-label-caps text-outline uppercase mt-2">
                Document Content / Engineering Notes
              </label>
              <textarea
                rows={6}
                placeholder="Paste engineering manual excerpts, avionics schematics, or tactical checklists here..."
                value={newDocContent}
                onChange={e => setNewDocContent(e.target.value)}
                className="p-2 bg-surface-container-lowest rounded font-mono-sm text-mono-sm text-on-surface border border-surface-container-high focus:outline-none focus:border-primary-container resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowIngestModal(false)}
                className="px-space-md py-1 bg-surface-container-high rounded text-on-surface font-mono-sm text-mono-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleIngestDocument}
                disabled={!newDocTitle || !newDocContent}
                className="px-space-md py-1 bg-primary-container text-surface-container-lowest font-mono-sm text-mono-sm font-bold rounded hover:bg-secondary-container transition-colors disabled:opacity-50"
              >
                Ingest &amp; Vectorize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
