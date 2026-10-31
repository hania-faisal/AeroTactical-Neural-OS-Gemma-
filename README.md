# AeroTactical Neural OS (Gemma 4 Multimodal Edition)

[![Gemma 4 Open-Weights](https://img.shields.io/badge/Model-Gemma--4--Multimodal-blue?style=for-the-badge&logo=google)](https://ai.google.dev/gemma)
[![Gemini API](https://img.shields.io/badge/Powered%20By-Gemini%20API-4285F4?style=for-the-badge&logo=google-cloud)](https://ai.google.dev/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache--2.0-green.svg?style=for-the-badge)](LICENSE)

An avionics tactical edge model harness and autonomous neural operating system powered by **Google's Gemma 4 Multimodal Open-Weights Model** accessed through the **Gemini API**. Designed for air-gapped field deployments, real-time UAV FLIR/optical reconnaissance, deterministic GBNF grammar-constrained decoding, and local vector RAG.

---

## 🌟 Hackathon Challenge Alignment: Gemma 4 Multimodal

Built for the **Gemma 4 Open-Weights Challenge**, this project leverages the Gemini API to demonstrate the full potential of lightweight open models:

1. **Multimodal Experience (Vision + Text)**:
   - Live ingestion and analysis of UAV optical and FLIR thermal camera feeds (`/api/gemma/multimodal-vision`).
   - Identifies radiometric hotspots (+60.5°C deltas), micro-stress fractures, and hydraulic seal leaks using Gemma 4's 576 vision-token embedding pipeline.
   - Cross-references optical anomalies with MIL-STD-810H aerospace specifications.

2. **Focused AI Tool**:
   - High-density tactical cockpit built specifically for avionics engineers, crew chiefs, and autonomous field reconnaissance.
   - Combines hardware telemetry, heterogeneous offload distribution (NPU Tensor Cores vs. CPU AVX-512), and zero-hallucination GBNF grammar compilation.

3. **Rapid Prototyping with Gemini API**:
   - Employs the modern `@google/genai` TypeScript SDK on an Express + Vite full-stack architecture.
   - Zero-leak server-side proxying keeps API credentials secure while streaming real-time open-weight inference to the client.

---

## 🚀 Key Modules & Capabilities

### 1. Visual Diagnostics & Tactical HUD (`Mission Feeds`)
- **Multi-Spectrum Sensor Modes**: White-Hot FLIR (`FLIR-W`), Black-Hot FLIR (`FLIR-B`), and Electro-Optical RGB (`EO-RGB`).
- **Interactive Bounding Reticles**: Clickable targets (`BAY_POD::01`, `HYDRAULIC ACTUATOR FAULT`, `EMITTER_NODE`) that dynamically feed optical data into the Gemma 4 reasoner.
- **6-Frame Anomaly Timeline Filmstrip**: Jump between historical telemetry snapshots (Thermal Spike, Stress Fracture, Component Match, Heat Exchanger, RF Transmitter, Sys Baseline).
- **Gemma 4 Multimodal Scan**: One-click deep visual diagnosis that returns radiometric observations, failure probability, and emergency flight protocols.
- **Airgap Encrypted Report Exporter**: Download cryptographic JSON telemetry archives.

### 2. Local SLM & Gemma 4 Agent Harness (`Local Checkpoints`)
- **Engine Switcher**: Seamlessly toggle between **Local On-Device SLMs** (`Gemma-2-2B-Edge`, `Llama-3.2-3B`) and **Gemma 4 Multimodal via Gemini API** (`Gemma-4-Multimodal-9B`, `Gemma-4-Instruct-27B`).
- **Chain-of-Thought (CoT) Tracing**: Inspect step-by-step reasoning logic and trigger executable remediation scripts (`DISPATCH FIX`).
- **Offline RAG Vector Bank (SQLite-vec style)**: Semantic similarity search across ingested field manuals (`MIL-STD-810H.pdf`, `Propulsion_Diag_RevC.md`, `Radio_Crypto_CheatSheet.txt`).
- **Live Asset Ingestor**: Upload or paste custom technical manuals with automatic 384-dimensional chunking and indexing.
- **Guardrails & Decoding Controls**: Real-time sliders for Temperature, Top_P, Tactical Safety Filter, and RoPE Context Compression.

### 3. Structured JSON Tools & GBNF Grammar Compiler (`Schema Inspector`)
- **Formal GBNF Compilation**: Compiles standard JSON Schema Draft-07 objects into formal `llama.cpp` GGML BNF grammar definitions (`root ::= ...`) for 100% mathematical zero-drift determinism.
- **AST Inspector**: Real-time syntax validation, grammar file size calculation, and AST branch analysis.
- **100x Synthetic Fuzzing Benchmark**: Stresses schemas against adversarial prompt injections, verifying strict conformance.
- **Hardware IPC Broker**: Live Unix socket dispatch logs (`/tmp/tactical_slm_broker.sock`) and memory-mapped I/O (`/dev/gpiomem`).

### 4. Edge Telemetry & Heterogeneous Offload (`System Log Stream`)
- **Jetson Orin AGX Hardware Matrix**: Live compute load, unified LPDDR5 VRAM stacked allocation, thermal envelopes, and TTFT latency.
- **Interactive 28-Layer Offload Visualizer**: Clickable transformer layer blocks (`L0`–`L27`) to dynamically reallocate between NPU Tensor Cores and Host CPU AVX-512 fallback.
- **Quantization Tradeoff Profiler**: Comparative perplexity, memory footprint, and latency matrices across `Q4_K_M`, `Q5_K_M`, and `Q8_0`.
- **Airgap Signal Isolation**: Real-time SVG thermal drift graph paired with physical RF cut switches for Wi-Fi 6E, Bluetooth BLE, and Starlink Tactical.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion
- **Backend / API**: Node.js, Express, tsx
- **AI & Model Layer**:
  - **Gemma 4 Multimodal (9B & 27B)** via Google `@google/genai` SDK
  - **Gemma 2 (2B)** on-device edge GBNF checkpoint
  - **YOLOv11 Nano Segmentation** for edge computer vision
- **Vector & Parser Engine**: Local Cosine Similarity Vector RAG, GBNF AST Compiler

---

## 📋 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or pnpm
- Google Gemini API Key (get one free at [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/aerotactical-neural-os-gemma.git
   cd aerotactical-neural-os-gemma
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key to `.env`:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📁 Repository Structure

```
├── .env.example              # Template for environment variables
├── index.html                # App shell entry point
├── metadata.json             # Applet capabilities & metadata
├── package.json              # Project dependencies & scripts
├── server.ts                 # Express backend with @google/genai Gemma 4 routes
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite & Tailwind CSS v4 build configuration
└── src/
    ├── App.tsx               # Root component & tab orchestration
    ├── main.tsx              # React DOM mounting
    ├── index.css             # Tailwind v4 theme tokens & HUD styles
    ├── components/
    │   ├── Header.tsx                # Tactical status ribbon & kill switch
    │   ├── Sidebar.tsx               # Tactical toolrail navigation
    │   ├── VisualDiagnosticsHud.tsx  # Multimodal FLIR/EO feed & Gemma 4 vision
    │   ├── LocalSlmAgentHarness.tsx  # Chat transcript, RAG memory & model switcher
    │   ├── StructuredJsonTools.tsx   # GBNF grammar compiler & AST inspector
    │   └── EdgeTelemetryOffload.tsx  # Hardware matrix & 28-layer offload map
    ├── data/
    │   └── mockData.ts       # Aerospace engineering datasets & model registry
    ├── lib/
    │   ├── gbnfCompiler.ts   # Formal GBNF grammar compiler & fuzzing engine
    │   └── ragEngine.ts      # In-memory vector similarity & chunking engine
    └── types/
        └── tactical.ts       # TypeScript domain models & telemetry interfaces
```

---

## 🔒 Security & Airgap Compliance

- **Zero Client Key Exposure**: All Gemma 4 and Gemini API calls are executed strictly server-side through `/api/gemma/*`.
- **Deterministic Token Masking**: GBNF grammar rules constrain output to strictly validated JSON schemas, preventing prompt injection attacks.
- **RF Signature Protection**: One-click physical RF cutoff simulation for Wi-Fi 6E, Bluetooth BLE, and satellite carrier loops.

---

## 📄 License

This project is licensed under the Apache-2.0 License.
