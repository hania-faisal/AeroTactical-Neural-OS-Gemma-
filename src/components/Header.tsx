import React from 'react';
import { TabType, ModelCheckpoint } from '../types/tactical';

interface HeaderProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeModel: ModelCheckpoint;
  airgapLocked: boolean;
  onToggleAirgapLock: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  activeModel,
  airgapLocked,
  onToggleAirgapLock,
}) => {
  return (
    <header className="fixed top-0 left-64 right-0 z-40 bg-surface-container-low/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-b border-surface-container-high">
      <div className="h-20 w-full px-space-lg flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md min-w-max">
          <div className="w-8 h-8 rounded bg-primary-container/10 border border-primary-container/40 flex items-center justify-center text-primary-container shadow-inner">
            <span className="material-symbols-outlined text-xl">satellite_alt</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-sm">
              <span className="font-headline-md text-headline-md tracking-tight uppercase text-primary font-bold">
                TACTICAL EDGE-SLM
              </span>
              <span
                className={`px-space-xs py-0.5 rounded font-label-caps text-label-caps border transition-all ${
                  airgapLocked
                    ? 'bg-surface-container-high text-secondary border-outline-variant'
                    : 'bg-error-container/30 text-error border-error animate-pulse'
                }`}
              >
                {airgapLocked ? 'AIR-GAPPED // v0.9.4-QUANT' : 'RF LOCK DOWN DEGRADED'}
              </span>
            </div>
            <span className="font-mono-sm text-mono-sm text-on-surface-variant">
              AEROTACTICAL OS // AUTONOMOUS RUNTIME
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden xl:flex items-center gap-space-xs">
          <button
            onClick={() => onSelectTab('visual-diagnostics-hud')}
            className={`px-space-md py-space-sm font-mono-md text-mono-md transition-colors rounded ${
              currentTab === 'visual-diagnostics-hud'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Visual Diagnostics & HUD
          </button>
          <button
            onClick={() => onSelectTab('local-slm-agent-harness')}
            className={`px-space-md py-space-sm font-mono-md text-mono-md transition-colors rounded ${
              currentTab === 'local-slm-agent-harness'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Local SLM Agent Harness
          </button>
          <button
            onClick={() => onSelectTab('structured-json-tools')}
            className={`px-space-md py-space-sm font-mono-md text-mono-md transition-colors rounded ${
              currentTab === 'structured-json-tools'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Structured JSON Tools
          </button>
          <button
            onClick={() => onSelectTab('edge-telemetry-offload')}
            className={`px-space-md py-space-sm font-mono-md text-mono-md transition-colors rounded ${
              currentTab === 'edge-telemetry-offload'
                ? 'bg-surface-container-high text-primary font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            Edge Telemetry & Offload
          </button>
        </nav>

        {/* Right Telemetry Capsule & Profile */}
        <div className="flex items-center gap-space-md">
          <div className="hidden 2xl:flex items-center gap-space-sm bg-surface-container-lowest px-space-md py-space-xs rounded font-mono-sm text-mono-sm border border-surface-container-high">
            <div className="flex flex-col">
              <span className="text-outline font-label-caps text-label-caps">AIR-GAP</span>
              <span className={`${airgapLocked ? 'text-secondary' : 'text-error'} font-bold`}>
                {airgapLocked ? '100% SECURE' : 'UNSECURED'}
              </span>
            </div>
            <div className="h-6 w-px bg-outline-variant"></div>
            <div className="flex flex-col">
              <span className="text-outline font-label-caps text-label-caps">INFERENCE ENGINE</span>
              <span className="text-primary truncate max-w-[150px] font-semibold">
                {activeModel.provider === 'GEMMA_GEMINI_API'
                  ? 'GEMMA 4 (GEMINI API)'
                  : 'LOCAL GBNF: ON-DEVICE'}
              </span>
            </div>
            <div className="h-6 w-px bg-outline-variant"></div>
            <div className="flex flex-col">
              <span className="text-outline font-label-caps text-label-caps">
                {activeModel.provider === 'GEMMA_GEMINI_API' ? 'OPEN MODEL' : 'VRAM OFF'}
              </span>
              <span className="text-on-surface font-semibold truncate max-w-[130px]">
                {activeModel.provider === 'GEMMA_GEMINI_API'
                  ? 'GEMMA 4 MULTIMODAL'
                  : `${activeModel.vramSizeGB.toFixed(2)}/8 GB`}
              </span>
            </div>
            <div className="h-6 w-px bg-outline-variant"></div>
            <div className="flex flex-col">
              <span className="text-outline font-label-caps text-label-caps">
                {activeModel.provider === 'GEMMA_GEMINI_API' ? 'MODALITY' : 'NPU ACCEL'}
              </span>
              <span className="text-secondary-fixed-dim font-bold">
                {activeModel.provider === 'GEMMA_GEMINI_API' ? 'VISION + TEXT' : 'INT8 ACTIVE'}
              </span>
            </div>
            <div className="h-6 w-px bg-outline-variant"></div>
            <div className="flex flex-col">
              <span className="text-outline font-label-caps text-label-caps">LATENCY / TTFT</span>
              <span className="text-primary-container font-bold">
                {activeModel.tokensPerSec.toFixed(1)}tps / {activeModel.ttftMs.toFixed(1)}ms
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              onClick={onToggleAirgapLock}
              className={`p-space-xs rounded transition-colors flex items-center justify-center ${
                airgapLocked
                  ? 'bg-error-container text-on-error hover:bg-error hover:text-on-error'
                  : 'bg-secondary text-surface-container-lowest hover:bg-secondary-container'
              }`}
              title={airgapLocked ? 'Emergency Air-Gap Override (Click to Release)' : 'Engage Airgap Isolation'}
            >
              <span className="material-symbols-outlined text-lg">
                {airgapLocked ? 'lock' : 'lock_open'}
              </span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-primary-container bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-base">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
