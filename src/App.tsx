import React, { useState } from 'react';
import { TabType, ModelCheckpoint } from './types/tactical';
import { INITIAL_MODELS } from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VisualDiagnosticsHud } from './components/VisualDiagnosticsHud';
import { LocalSlmAgentHarness } from './components/LocalSlmAgentHarness';
import { StructuredJsonTools } from './components/StructuredJsonTools';
import { EdgeTelemetryOffload } from './components/EdgeTelemetryOffload';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('visual-diagnostics-hud');
  const [activeModel, setActiveModel] = useState<ModelCheckpoint>(INITIAL_MODELS[0]);
  const [airgapLocked, setAirgapLocked] = useState<boolean>(true);
  const [lockAlert, setLockAlert] = useState<string | null>(null);

  const handleToggleAirgap = () => {
    const next = !airgapLocked;
    setAirgapLocked(next);
    if (!next) {
      setLockAlert('WARNING: AIRGAP ISOLATION LOCK DISENGAGED. LOOPBACK-ONLY ENFORCEMENT PAUSED.');
    } else {
      setLockAlert('AIRGAP LOCK ENGAGED: ZERO EXTERNAL EGRESS VERIFIED. HARNESS ISOLATED.');
    }
    setTimeout(() => setLockAlert(null), 3500);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Sidebar Toolrail */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeModel={activeModel}
        airgapLocked={airgapLocked}
      />

      {/* Main Content Area */}
      <div className="pl-64">
        {/* Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activeModel={activeModel}
          airgapLocked={airgapLocked}
          onToggleAirgapLock={handleToggleAirgap}
        />

        {/* Airgap Status Floating Toast */}
        {lockAlert && (
          <div
            className={`fixed top-24 right-8 z-50 px-4 py-2 rounded-lg font-mono-sm text-mono-sm shadow-xl flex items-center gap-2 border animate-fade-in ${
              airgapLocked
                ? 'bg-surface-container-high border-secondary text-secondary'
                : 'bg-error-container border-error text-on-error'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {airgapLocked ? 'shield' : 'warning'}
            </span>
            <span>{lockAlert}</span>
          </div>
        )}

        {/* Main Tab Views */}
        <main className="relative pt-20 w-full min-h-screen bg-surface">
          {currentTab === 'visual-diagnostics-hud' && <VisualDiagnosticsHud />}

          {currentTab === 'local-slm-agent-harness' && (
            <LocalSlmAgentHarness
              activeModel={activeModel}
              onSelectModel={setActiveModel}
            />
          )}

          {currentTab === 'structured-json-tools' && <StructuredJsonTools />}

          {currentTab === 'edge-telemetry-offload' && (
            <EdgeTelemetryOffload
              activeModel={activeModel}
              onSelectModel={setActiveModel}
            />
          )}
        </main>
      </div>
    </div>
  );
}
