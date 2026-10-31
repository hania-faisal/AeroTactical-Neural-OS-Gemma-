import React from 'react';
import { TabType, ModelCheckpoint } from '../types/tactical';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeModel: ModelCheckpoint;
  airgapLocked: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeModel,
  airgapLocked,
}) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between py-margin shadow-[0_1px_8px_rgba(0,0,0,0.5)] border-r border-surface-container-high">
      <div className="flex flex-col gap-space-lg">
        {/* Rail Top Branding */}
        <div className="px-space-md flex items-center justify-between">
          <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase">
            TACTICAL TOOLRAIL
          </span>
          <span className="px-space-xs py-0.5 rounded bg-surface-container-high text-secondary font-mono-sm text-mono-sm">
            NODE::L3
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-space-xs px-space-sm">
          <button
            onClick={() => onSelectTab('visual-diagnostics-hud')}
            className={`flex items-center gap-space-sm px-space-md py-space-sm rounded font-mono-md text-mono-md text-left transition-colors ${
              currentTab === 'visual-diagnostics-hud'
                ? 'bg-surface-container-highest text-primary border-l-2 border-primary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">videocam</span>
            <span>Mission Feeds</span>
          </button>

          <button
            onClick={() => onSelectTab('local-slm-agent-harness')}
            className={`flex items-center gap-space-sm px-space-md py-space-sm rounded font-mono-md text-mono-md text-left transition-colors ${
              currentTab === 'local-slm-agent-harness'
                ? 'bg-surface-container-highest text-primary border-l-2 border-primary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">memory</span>
            <span>Local Checkpoints</span>
          </button>

          <button
            onClick={() => onSelectTab('structured-json-tools')}
            className={`flex items-center gap-space-sm px-space-md py-space-sm rounded font-mono-md text-mono-md text-left transition-colors ${
              currentTab === 'structured-json-tools'
                ? 'bg-surface-container-highest text-primary border-l-2 border-primary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">data_object</span>
            <span>Schema Inspector</span>
          </button>

          <button
            onClick={() => onSelectTab('edge-telemetry-offload')}
            className={`flex items-center gap-space-sm px-space-md py-space-sm rounded font-mono-md text-mono-md text-left transition-colors ${
              currentTab === 'edge-telemetry-offload'
                ? 'bg-surface-container-highest text-primary border-l-2 border-primary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">terminal</span>
            <span>System Log Stream</span>
          </button>
        </nav>
      </div>

      {/* Rail Bottom Status */}
      <div className="px-space-md flex flex-col gap-space-sm">
        <div className="p-space-sm rounded bg-surface-container-lowest flex flex-col gap-space-xs border border-surface-container-high">
          <div className="flex justify-between items-center">
            <span className="font-label-caps text-label-caps text-outline">MODEL INSTANCE</span>
            <span className="font-mono-sm text-mono-sm text-secondary font-bold">READY</span>
          </div>
          <div className="font-mono-sm text-mono-sm text-on-surface truncate font-semibold">
            {activeModel.name}
          </div>
          <div className="font-mono-sm text-mono-sm text-on-surface-variant truncate">
            CKPT: {activeModel.filename}
          </div>
        </div>

        <div className="flex items-center justify-between text-outline font-label-caps text-label-caps px-space-xs">
          <span>{airgapLocked ? 'AIRGAP LOCK ENGAGED' : 'AIRGAP ISOLATION PAUSED'}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              airgapLocked ? 'bg-secondary animate-pulse' : 'bg-error'
            }`}
          ></span>
        </div>
      </div>
    </aside>
  );
};
