---
name: AeroTactical Neural OS
colors:
  surface: '#101419'
  surface-dim: '#101419'
  surface-bright: '#36393f'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c21'
  surface-container: '#1c2025'
  surface-container-high: '#262a30'
  surface-container-highest: '#31353b'
  on-surface: '#e0e2ea'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e0e2ea'
  inverse-on-surface: '#2d3136'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#43edcd'
  on-secondary: '#00382e'
  secondary-container: '#00d0b2'
  on-secondary-container: '#005346'
  tertiary: '#fff3ea'
  on-tertiary: '#472a00'
  tertiary-container: '#ffd19c'
  on-tertiary-container: '#855300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#57fbdb'
  secondary-fixed-dim: '#2adec0'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005144'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#101419'
  on-background: '#e0e2ea'
  surface-variant: '#31353b'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.02em
  mono-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes a high-density, mission-critical operational cockpit designed for offline-native Small Language Models (SLMs) and real-time Computer Vision processing at the tactical edge. It bridges avionics telemetry displays, military HUD engineering, and cyberpunk laboratory computing.

The aesthetic is functional, razor-sharp, and devoid of cosmetic friction. It prioritizes ultra-high data fidelity, situational awareness under zero-connectivity environments, and instant hardware status perception (NPU/GPU/VRAM offload, quantization levels, thermal drift, token-per-second velocity).

Core tenets:
- **Zero Ambiguity:** Contrast, borders, and state changes are explicit, deterministic, and engineered for high-stress operation.
- **Instrument-Grade Density:** Information layout maximizes visible metrics without visual overload, utilizing technical subgrids and monospace alignment.
- **Telemetry-First Feedback:** Every neural inference run, tool call, and frame analysis visually surfaces its computational budget and offline hardware path.

## Colors

The palette is engineered specifically for deep-dark, low-fatigue operations, leveraging chromatic signal hierarchies against non-reflective matte obsidian and carbon chassis surfaces.

### Palette Architecture
- **Canvas Base (`#090D12`):** Primary viewport backdrop; eliminates backlight bleed and establishes maximum dynamic contrast.
- **Surface Elevation 1 (`#0E141B`):** Structural panels, terminal viewports, HUD card foundations.
- **Surface Elevation 2 (`#161F2A`):** Interactive inputs, elevated telemetry bays, metric pill backdrops.
- **Borders & Reticles (`#1E293B`, `#334155`):** Structural division wires with precise 1px definition.
- **Primary Signal (`#00F0FF`):** Tactical cyan. Dedicated to active model attention states, real-time bounding boxes, active telemetry traces, and primary system hooks.
- **Secondary Assist (`#00D2B4`):** Electric teal. Assigned to quantized neural execution states, local device inferences, and streaming token responses.
- **Alert / Warning (`#F59E0B`):** Amber. Denotes thermal throttling, VRAM ceiling saturation (>90%), model context overflows, or dropped telemetry frames.
- **System Valid (`#10B981`):** Operational emerald. Represents full offline-airgap validation, operational NPUs, and verified cryptographic weights.
- **Metadata Slate (`#64748B` to `#94A3B8`):** Subdued functional readouts, hardware specs, timestamps, and schema properties.

## Typography

The typographic strategy pairs the structural legibility of **Geist** for human-oriented communication and conversational assistant interfaces with the mathematical precision of **JetBrains Mono** for all operational parameters.

- **Tabular Lining Numbers:** Monospace figures are strictly enforced across telemetry gauges, TFLOPS counters, latency trackers, memory footprints, and JSON inspectors to eliminate horizontal layout jitter during rapid stream cycles.
- **Hierarchy Separation:** Section labels, model spec indicators, and parameter descriptors use `label-caps` (all-caps uppercase with wide tracking) to mimic cockpit avionics instrument dials.
- **Inference Streaming:** Conversational streaming output defaults to `body-md` for natural language text, while inline tool calls, context hashes, and AST evaluations render instantly in `mono-sm` within dedicated container blocks.

## Layout & Spacing

The layout is built upon an ultra-dense, 12-column adaptive grid system tuned for mission consoles and field tablet deployments. Whitespace is tightly controlled to maximize operational screen real estate while maintaining functional grouping.

- **Console Grid (Desktop/Workstation):** 12-column fluid grid, 0.75rem gutters, fixed left-rail telemetry stack (320px) displaying real-time NPU, thermal, and memory parameters; central split-pane for multimodal camera feeds with bounding overlays and conversational inference console; collapsible right-side JSON/AST inspection drawer.
- **Field Deployments (Tablet/Mobile):** Grid compacts to a 4-column framework. Secondary hardware metrics collapse into a sticky top status ribbon (`mono-sm`), prioritizing conversational telemetry and vision overlays.
- **Rhythm & Padding:** Component internal padding uses an 8px base grid, leaning heavily on `space-xs` (4px) and `space-sm` (8px) for badge, pill, and gauge metrics to enforce an avionics HUD visual density.

## Elevation & Depth

This design system avoids soft, floating, diffused shadows in favor of **Tonal Layers**, **Micro-Borders**, and **Luminescent Cyberpunk Edge Accents**.

1. **Elevation Tiers:**
   - **Floor (Canvas):** `#090D12` (Airgapped system base).
   - **Tier 1 (Panels & Shells):** `#0E141B` with a continuous 1px outline of `#1E293B`.
   - **Tier 2 (Telemetry Blocks & Cards):** `#161F2A` with a 1px border of `#334155`.
   - **Tier 3 (Active Focus / Reticles):** Surface `#161F2A` paired with a 1px border of `#00F0FF` and an inner cyan line glow (`box-shadow: inset 0 0 12px rgba(0, 240, 255, 0.08), 0 0 8px rgba(0, 240, 255, 0.15)`).

2. **Optical Corner Reticles:**
   Higher-order HUD cards utilize corner-notch accents: 2px L-shaped structural markers in `#00F0FF` or `#64748B` at the cardinal extremities, providing tactical target framing without heavy visual mass.

3. **Occlusion & Modals:**
   System overlays use a high-tint dark backdrop (`rgba(9, 13, 18, 0.88)`) combined with a slight hardware-level blur (`backdrop-filter: blur(6px)`) to preserve awareness of live sensor streams underneath.

## Shapes

The design system employs near-sharp, industrial contours (`roundedness: 1`). Radii are strictly held to micro-chamfers (`0.25rem` / 4px) to retain an authentic rugged hardware aesthetic.

- **Standard Containers & Cards:** `0.25rem` corners. High-impact telemetry monitors optionally utilize clipped 45-degree diagonal corners (`clip-path`) on top-right edges.
- **Telemetry Indicators & Badges:** `0.125rem` to `0.25rem`. Continuous pill buttons and circular bubbles are forbidden except for status ping lights (which use standard 1:1 circular dots).
- **Interactive Buttons:** Crisp 4px borders with segmented corner ticks for primary actions.

## Components

### Buttons & Action Triggers
- **Primary Tactical Action:** Background `#00F0FF`, text `#090D12`, font `JetBrains Mono` weight 700, uppercase. Hover shifts to `#00D2B4` with active box-shadow cyan glow.
- **Secondary Execution Action:** Transparent background, 1px border `#334155`, text `#94A3B8`. Hover states elevate border to `#00F0FF` and text to `#FFFFFF`.
- **Destructive/Abort Trigger:** 1px border `#EF4444`, background `rgba(239, 68, 68, 0.08)`, text `#EF4444`.

### Telemetry Readouts & Hardware Offload Gauges
- **VRAM/NPU/TFLOPS Meters:** Horizontal segmented bar meters divided into 10 discrete blocks. Normal load displays `#00D2B4`; load exceeding 85% transitions dynamically to `#F59E0B`; critical saturation at 98% flashes `#EF4444`.
- **Inline Numeric Telemetry:** Metric value rendered in `mono-md` (e.g., `43.8 tok/s`), paired immediately above with a micro-label (`label-caps` in `#64748B`, e.g., `INFERENCE SPEED`).

### Badges & Operational State Pills
- **Offline Airgap Pill:** Fixed display in header. Border 1px `#10B981`, background `rgba(16, 185, 129, 0.1)`, text `#10B981`, prepended by a solid green pulse indicator dot (`8px`).
- **Quantization Badge:** Monospace tag (`Q4_K_M`, `FP8`, `AWQ`), background `#161F2A`, border 1px `#334155`, text `#94A3B8`.

### Input Fields & Terminal Prompts
- Input fields leverage `#0E141B` surfaces with a 1px border of `#334155`.
- Active focus swaps the border to `#00F0FF` with no native browser rings.
- Prompt inputs are anchored by an immutable tactical command signifier (`>` or `SLM_LOCAL::INSTRUCT#`) in `#00F0FF`.

### Tool Invocation & JSON AST Inspectors
- Structured as collapsed collapsible tree panels.
- JSON keys formatted in `#94A3B8`, string values in `#00D2B4`, booleans/numbers in `#F59E0B`, syntax brackets in `#64748B`.
- Integrated instant-copy trigger and schema validation indicator flags.

### Computer Vision Bounding Overlays
- Bounding reticles rendered with 1px stroke `#00F0FF`, with reinforced 2px corner brackets.
- Affixed detection tag rendered in `label-caps` over a solid `#090D12` pill displaying class label and confidence score (`HUMAN_DETECT // 0.984`).