export type TabType =
  | 'visual-diagnostics-hud'
  | 'local-slm-agent-harness'
  | 'structured-json-tools'
  | 'knowledge-graphify'
  | 'edge-telemetry-offload';

export interface GraphNode {
  id: string;
  label: string;
  type: 'COMPONENT' | 'FAULT' | 'STANDARD' | 'METRIC' | 'ACTION' | 'SAFETY';
  status: 'CRITICAL' | 'WARNING' | 'NOMINAL';
  metric?: string;
  description?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: 'INDUCES' | 'EXCEEDS' | 'GOVERNED_BY' | 'TRIGGERS' | 'MITIGATES' | 'ACTUATES' | string;
  severity: 'CRITICAL' | 'WARNING' | 'NORMAL';
}

export interface KnowledgeGraphData {
  graphTitle: string;
  summary: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ModelCheckpoint {
  id: string;
  name: string;
  filename: string;
  quant: string;
  vramSizeGB: number;
  tokensPerSec: number;
  ttftMs: number;
  perplexity: number;
  architecture: string;
  isLoaded: boolean;
  type: 'SLM' | 'VISION' | 'EMBEDDING';
  provider?: 'LOCAL' | 'GEMMA_GEMINI_API';
  region?: string;
}

export interface GemmaEngineStatus {
  engine: string;
  accessVia: string;
  hasKey: boolean;
  status: 'ONLINE_READY' | 'STANDBY_SIMULATION';
}

export interface TransformerLayer {
  index: number;
  device: 'NPU' | 'AVX';
  sizeMB: number;
  status: 'PINNED' | 'OVERFLOW';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: string;
  senderLabel?: string;
  text: string;
  metrics?: {
    tps: number;
    ttft: number;
    model: string;
  };
  reasoningSteps?: string[];
  recommendedAction?: {
    command: string;
    buttonLabel: string;
    executed?: boolean;
  };
}

export interface ChatThread {
  id: string;
  title: string;
  updatedAt: string;
  messageCount: number;
  messages: ChatMessage[];
  systemDirective: string;
}

export interface RagDocument {
  id: string;
  name: string;
  size: string;
  chunks: number;
  similarity: number;
  distance: number;
  category: string;
  summary: string;
  content: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  label: string;
  icon: string;
  typeBadge: string;
  badgeColor: string;
  description: string;
  latencyMs: number;
  argsSignature: string;
  jsonSchema: string;
  sampleArgs: Record<string, unknown>;
  defaultCommand: string;
  executionLogs: Array<{
    timestamp: string;
    step: string;
    detail: string;
    highlight?: boolean;
    success?: boolean;
  }>;
}

export interface AnomalyFrame {
  id: string;
  code: string;
  timestamp: string;
  title: string;
  category: string;
  imageUrl: string;
  altText: string;
  isActive: boolean;
  temperature: string;
  critical?: boolean;
  confidence: number;
  analysisReport: string;
  hardwareSpecs: {
    nominalPressure: string;
    detectedTemp: string;
    failureProbability: string;
  };
  safetyProtocols: string[];
}
