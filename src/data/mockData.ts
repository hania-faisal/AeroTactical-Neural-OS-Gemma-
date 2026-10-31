import { ModelCheckpoint, TransformerLayer, ChatThread, RagDocument, ToolDefinition, AnomalyFrame } from '../types/tactical';

export const INITIAL_MODELS: ModelCheckpoint[] = [
  {
    id: 'gemma-4-multimodal-9b',
    name: 'Gemma-4-Multimodal-9B (Gemini API)',
    filename: 'gemma-4-multimodal-9b@gemini-api',
    quant: 'BF16-FP8 (Gemini API)',
    vramSizeGB: 0.0,
    tokensPerSec: 84.6,
    ttftMs: 14.2,
    perplexity: 4.88,
    architecture: 'Gemma 4 (9B Multimodal Vision + Language, Gemini API)',
    isLoaded: true,
    type: 'SLM',
    provider: 'GEMMA_GEMINI_API',
    region: 'Gemini API Open Weights',
  },
  {
    id: 'gemma-4-instruct-27b',
    name: 'Gemma-4-Instruct-27B (Gemini API)',
    filename: 'gemma-4-instruct-27b@gemini-api',
    quant: 'FP16 (Gemini API)',
    vramSizeGB: 0.0,
    tokensPerSec: 62.0,
    ttftMs: 22.8,
    perplexity: 4.12,
    architecture: 'Gemma 4 (27B Heavy Diagnostic Reasoner, Gemini API)',
    isLoaded: false,
    type: 'SLM',
    provider: 'GEMMA_GEMINI_API',
    region: 'Gemini API Open Weights',
  },
  {
    id: 'gemma-2-2b-edge',
    name: 'Gemma-2-2B-Edge (Local GBNF)',
    filename: 'gemma-2-2b-it.Q4_K_M.gguf',
    quant: 'Q4_K_M',
    vramSizeGB: 1.48,
    tokensPerSec: 98.4,
    ttftMs: 9.8,
    perplexity: 6.45,
    architecture: 'Gemma 2 (2B Parameters, On-Device GBNF)',
    isLoaded: false,
    type: 'SLM',
    provider: 'LOCAL',
    region: 'Local Edge NPU',
  },
  {
    id: 'llama-3.2-3b',
    name: 'Llama-3.2-3B-Instruct',
    filename: 'Llama-3.2-3B-Instruct.Q4_K_M.gguf',
    quant: 'Q4_K_M',
    vramSizeGB: 1.92,
    tokensPerSec: 46.2,
    ttftMs: 16.8,
    perplexity: 6.12,
    architecture: 'Llama-3 (28 Layers, 16 Heads, GQA)',
    isLoaded: false,
    type: 'SLM',
    provider: 'LOCAL',
  },
  {
    id: 'phi-3.5-mini',
    name: 'Phi-3.5-mini-3.8B',
    filename: 'Phi-3.5-mini-instruct.Q4_K_S.gguf',
    quant: 'Q5_K_S',
    vramSizeGB: 2.18,
    tokensPerSec: 38.4,
    ttftMs: 21.4,
    perplexity: 5.88,
    architecture: 'Phi-3 (32 Layers, 3072 Dim)',
    isLoaded: false,
    type: 'SLM',
  },
  {
    id: 'qwen-2.5-coder',
    name: 'Qwen2.5-Coder-3B',
    filename: 'Qwen2.5-Coder-3B-Instruct.Q4_0.gguf',
    quant: 'Q4_0',
    vramSizeGB: 1.95,
    tokensPerSec: 44.1,
    ttftMs: 18.0,
    perplexity: 6.05,
    architecture: 'Qwen2.5 (36 Layers, RoPE 32k)',
    isLoaded: false,
    type: 'SLM',
  },
  {
    id: 'yolo-v11n',
    name: 'YOLOv11n-seg.onnx',
    filename: 'YOLOv11n-seg.onnx',
    quant: 'INT8-RKNN',
    vramSizeGB: 0.08,
    tokensPerSec: 62.0,
    ttftMs: 8.4,
    perplexity: 0.0,
    architecture: 'YOLOv11 Nano Segmentation (640x640)',
    isLoaded: true,
    type: 'VISION',
    provider: 'LOCAL',
  },
];

export const INITIAL_LAYERS: TransformerLayer[] = Array.from({ length: 28 }, (_, i) => ({
  index: i,
  device: i < 25 ? 'NPU' : 'AVX',
  sizeMB: 74,
  status: i < 25 ? 'PINNED' : 'OVERFLOW',
}));

export const INITIAL_RAG_DOCS: RagDocument[] = [
  {
    id: 'doc-1',
    name: 'MIL-STD-810H.pdf',
    size: '14.2 MB',
    chunks: 840,
    similarity: 0.962,
    distance: 0.038,
    category: 'Vibration & Environmental',
    summary: 'Department of Defense Test Method Standard: Environmental Engineering Considerations and Laboratory Tests.',
    content: `MIL-STD-810H Section 514.8 (Category 24 - Aerodynamic Buffet):
1. Harmonic resonance between 135Hz and 145Hz induces high-order micro-voltage jitter across unshielded feedback lines.
2. Servomotors operating under transverse aerodynamic loads exceeding 30 knots must enforce a slew rate buffer of minimum 250µs to prevent resolver saturation.
3. Potentiometer drift exceeding 1.8% per 10°C delta indicates fluid vapor ingress or bearing raceway pitting.`,
  },
  {
    id: 'doc-2',
    name: 'Propulsion_Diag_RevC.md',
    size: '3.8 MB',
    chunks: 520,
    similarity: 0.941,
    distance: 0.059,
    category: 'Avionics Actuators',
    summary: 'UAV Tactical Gimbal and Servo Deflection Limits, PWM Slew Windows, and Mechanical Lock Disengagements.',
    content: `Propulsion Diagnostics Revision C:
- Error Code ERR_PWM_SLEW_OVERFLOW occurs when PID counter-deflection demands exceed the calibrated 1050µs-1950µs PWM window.
- The 12ms watchdog timer triggers emergency lock pins if continuous loop feedback exceeds 3 consecutive clock ticks.
- Remediation: Execute neutral recalibration with vibration filter damping (/opt/uav/recal_pwm_neutral.sh -f 140hz).`,
  },
  {
    id: 'doc-3',
    name: 'Radio_Crypto_CheatSheet.txt',
    size: '1.2 MB',
    chunks: 482,
    similarity: 0.718,
    distance: 0.282,
    category: 'Tactical RF & Crypto',
    summary: 'Frequency-hopping algorithms, TEMPEST Level B emission limits, and AES-256 GCM mission payload key rotation.',
    content: `Tactical RF & Crypto Standards:
- All external RF peripherals (Wi-Fi 6E, Bluetooth HCI, satellite uplink) must be physically or memory-mapped to low power zero-state during Level-3 airgap locks.
- Broadcast packets on loopback interface 127.0.0.1 must strictly be audited against zero-socket egress policies.`,
  },
];

export const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'thread-1',
    title: 'UAV-7 Gimbal Drift',
    updatedAt: '3 mins ago',
    messageCount: 14,
    systemDirective:
      'You are Tactical-SLM v0.9.4 operating inside local offline avionics. Provide high-precision fault isolation using ingested MIL-STD-810H and UAV mechanical schematics. Deterministic temperature locked at 0.20. Zero external calls permitted.',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        timestamp: '14:02:18 UTC',
        senderLabel: 'OPERATOR // CREW-CHIEF',
        text: 'Gimbal pitch motor servo reports telemetry loop error code ERR_PWM_SLEW_OVERFLOW during 35-knot crosswind test. Confirm if potentiometer or PWM pulse width calibration is out of bounds under MIL-STD vibration specs.',
      },
      {
        id: 'msg-2',
        sender: 'agent',
        timestamp: '14:02:19 UTC',
        senderLabel: 'LOCAL AGENT INFERENCE',
        metrics: {
          tps: 42.8,
          ttft: 18.2,
          model: 'Llama-3.2-3B-Instruct',
        },
        reasoningSteps: [
          'RAG query matched "Propulsion_Diag_RevC.md" (Sim: 0.941)',
          'PWM slew limits at 35kt wind load exceed stock 1250µs envelope by 14.8%.',
          'Resolver feedback saturation detected; mechanical locking pin disengagement unlikely.',
        ],
        text: `Telemetry error ERR_PWM_SLEW_OVERFLOW is triggered when the digital loop attempts pitch counter-deflection outside the 1050µs–1950µs PWM window. Under MIL-STD-810H Section 514.8 (Category 24 aerodynamic buffet):

• The potentiometric angle resolver suffers phase lag exceeding the 12ms watchdog limit.
• Vibration harmonic at 140Hz is inducing micro-current spikes into the telemetry bus.`,
        recommendedAction: {
          command: '/opt/uav/recal_pwm_neutral.sh -f 140hz',
          buttonLabel: 'DISPATCH FIX',
        },
      },
    ],
  },
  {
    id: 'thread-2',
    title: 'Encrypted Payload Dec',
    updatedAt: '18 mins ago',
    messageCount: 8,
    systemDirective:
      'Tactical Crypto Engine: Authenticate MIL-STD payload signatures using local airgap keys only. Zero network sockets.',
    messages: [
      {
        id: 'msg-201',
        sender: 'user',
        timestamp: '13:44:02 UTC',
        senderLabel: 'OPERATOR // INTEL-LEAD',
        text: 'Verify SHA-256 digest on incoming telemetry frame #88192 from payload container.',
      },
      {
        id: 'msg-202',
        sender: 'agent',
        timestamp: '13:44:03 UTC',
        senderLabel: 'LOCAL AGENT INFERENCE',
        metrics: { tps: 45.1, ttft: 16.2, model: 'Llama-3.2-3B-Instruct' },
        reasoningSteps: [
          'Calculated cryptographic digest against stored tactical key ring.',
          'Zero discrepancies found in payload parity bytes.',
        ],
        text: 'Checksum validation SUCCESS. Digest: 0x91EFB3A8201C4. Telemetry frame is cryptographically intact and originates from authorized ground gimbal.',
      },
    ],
  },
  {
    id: 'thread-3',
    title: 'Field Repair: AN/PRC',
    updatedAt: '1.2 hrs ago',
    messageCount: 29,
    systemDirective:
      'Field Repair Specialist: Provide rapid troubleshooting diagrams and wire continuity specifications for radio antennas.',
    messages: [
      {
        id: 'msg-301',
        sender: 'user',
        timestamp: '12:50:11 UTC',
        senderLabel: 'FIELD-TECH // E4',
        text: 'Radio antenna SWR reading 3.4:1 on 240MHz. Suspect damaged coaxial sleeve.',
      },
      {
        id: 'msg-302',
        sender: 'agent',
        timestamp: '12:50:12 UTC',
        senderLabel: 'LOCAL AGENT INFERENCE',
        metrics: { tps: 43.4, ttft: 17.0, model: 'Llama-3.2-3B-Instruct' },
        reasoningSteps: [
          'High SWR indicates impedance mismatch (>150 Ohms vs nominal 50 Ohms).',
          'Inspect BNC bulkhead crimp for water intrusion or braid fracture.',
        ],
        text: 'High SWR 3.4:1 indicates braid fracture or water condensation inside the BNC connector. Isolate RF amp before transmitting to prevent PA transistor burn-out.',
      },
    ],
  },
  {
    id: 'thread-4',
    title: 'Thermal Calibration',
    updatedAt: 'Yesterday',
    messageCount: 5,
    systemDirective: 'FLIR Thermal Engine: Sensor zeroing and non-uniformity correction (NUC) algorithms.',
    messages: [
      {
        id: 'msg-401',
        sender: 'user',
        timestamp: 'Yesterday 18:20 UTC',
        senderLabel: 'FLIGHT OPERATOR',
        text: 'Execute NUC shutter calibration on long-wave infrared microbolometer array.',
      },
      {
        id: 'msg-402',
        sender: 'agent',
        timestamp: 'Yesterday 18:20 UTC',
        senderLabel: 'LOCAL AGENT INFERENCE',
        metrics: { tps: 44.0, ttft: 15.8, model: 'Llama-3.2-3B-Instruct' },
        text: 'NUC shutter cycle completed in 840ms. Dead pixel replacement table updated (12 pixels interpolated). Thermal baseline fixed at 24.0°C.',
      },
    ],
  },
];

export const REGISTERED_TOOLS: ToolDefinition[] = [
  {
    id: 'gpio_relay_toggle',
    name: 'gpio_relay_toggle',
    label: 'gpio_relay_toggle',
    icon: 'settings_remote',
    typeBadge: 'HW DIRECT',
    badgeColor: 'bg-error-container text-on-error-container',
    description:
      'Toggles hardware relay coils via kernel memory map /dev/gpiomem. Actuates drone payload release and umbilical lock pins.',
    latencyMs: 2.1,
    argsSignature: '{ pin: int, state: enum }',
    defaultCommand: 'gpio_relay_toggle --test-pin 17 --dry-run',
    sampleArgs: {
      pin_number: 17,
      target_state: 'LOW',
      verification_pulse_ms: 250,
      override_failsafe: true,
    },
    jsonSchema: `{
  "$id": "tools/gpio_relay_toggle.json",
  "type": "object",
  "properties": {
    "pin_number": {
      "type": "integer",
      "minimum": 1,
      "maximum": 40
    },
    "target_state": {
      "type": "string",
      "enum": ["HIGH", "LOW", "PULSE"]
    },
    "verification_pulse_ms": {
      "type": "integer",
      "default": 100
    },
    "override_failsafe": {
      "type": "boolean"
    }
  },
  "required": ["pin_number", "target_state"],
  "additionalProperties": false
}`,
    executionLogs: [
      { timestamp: '09:41:22.102', step: 'INIT', detail: 'Received broker payload via UNIX_SOCK' },
      { timestamp: '09:41:22.103', step: 'AUTH', detail: "Capability 'CAP_SYS_RAWIO' validated for PID 14902" },
      { timestamp: '09:41:22.105', step: 'MMAP', detail: '/dev/gpiomem mapped at 0x7f9a882000 (offset: 0x200000)' },
      { timestamp: '09:41:22.107', step: 'EXEC', detail: 'GPIO_PIN_17 => PULL_DOWN (REGISTER: GPCLR0 bit 17 set)', highlight: true },
      { timestamp: '09:41:22.110', step: 'SENSE', detail: 'Optocoupler loopback confirmed LOW (Resistance > 10M-Ohm)' },
      { timestamp: '09:41:22.114', step: 'SUCCESS', detail: 'Drop solenoid depowered. Actuator detached. (Return payload emitted)', success: true },
    ],
  },
  {
    id: 'spectrum_analyzer_scan',
    name: 'spectrum_analyzer_scan',
    label: 'spectrum_analyzer_scan',
    icon: 'radar',
    typeBadge: 'SANDBOXED',
    badgeColor: 'bg-surface-container-highest text-secondary-fixed-dim',
    description:
      'Triggers local HackRF / RTL-SDR sweep between 2400MHz - 5850MHz. Emits peak spectral energy coordinates into JSON.',
    latencyMs: 48.0,
    argsSignature: '{ freq_min: int, freq_max: int, rbw: int }',
    defaultCommand: 'spectrum_analyzer_scan --start 2400 --stop 2500 --rbw 10',
    sampleArgs: {
      freq_start_mhz: 2400,
      freq_end_mhz: 2483,
      resolution_bandwidth_khz: 10,
      dwell_time_ms: 5,
    },
    jsonSchema: `{
  "$id": "tools/spectrum_analyzer_scan.json",
  "type": "object",
  "properties": {
    "freq_start_mhz": { "type": "integer", "minimum": 100, "maximum": 6000 },
    "freq_end_mhz": { "type": "integer", "minimum": 100, "maximum": 6000 },
    "resolution_bandwidth_khz": { "type": "integer", "enum": [10, 50, 100, 500] },
    "dwell_time_ms": { "type": "integer", "default": 10 }
  },
  "required": ["freq_start_mhz", "freq_end_mhz"]
}`,
    executionLogs: [
      { timestamp: '09:42:01.040', step: 'SDR_INIT', detail: 'Binding libhackrf device index #0 via USB DMA' },
      { timestamp: '09:42:01.065', step: 'PLL_LOCK', detail: 'Frequency synth locked to 2442.5 MHz (Center)' },
      { timestamp: '09:42:01.082', step: 'FFT_2048', detail: 'Sample buffer acquired: 2048 complex bins' },
      { timestamp: '09:42:01.088', step: 'PEAK_FIND', detail: 'Strong carrier detected at 2437.0 MHz (-38.2 dBm)', highlight: true },
      { timestamp: '09:42:01.092', step: 'SUCCESS', detail: 'Spectral heatmap generated. Emitter tagged in HUD.', success: true },
    ],
  },
  {
    id: 'flir_ptz_recalibrate',
    name: 'flir_ptz_recalibrate',
    label: 'flir_ptz_recalibrate',
    icon: 'videocam',
    typeBadge: 'ELEVATED',
    badgeColor: 'bg-surface-container-highest text-primary',
    description:
      'Zeroes optical and long-wave infrared gimbal servo encoders. Compensates for vibration gyro bias drift.',
    latencyMs: 114.0,
    argsSignature: '{ axes: array, zero_point: string }',
    defaultCommand: 'flir_ptz_recalibrate --all-axes --fast-nuc',
    sampleArgs: {
      axes: ['PAN', 'TILT'],
      trigger_nuc_shutter: true,
      damping_factor: 0.95,
    },
    jsonSchema: `{
  "$id": "tools/flir_ptz_recalibrate.json",
  "type": "object",
  "properties": {
    "axes": {
      "type": "array",
      "items": { "type": "string", "enum": ["PAN", "TILT", "ZOOM"] }
    },
    "trigger_nuc_shutter": { "type": "boolean" },
    "damping_factor": { "type": "number", "minimum": 0.5, "maximum": 1.0 }
  },
  "required": ["axes"]
}`,
    executionLogs: [
      { timestamp: '09:43:10.201', step: 'SERVO_POLL', detail: 'Current azimuth: 284.1°, elevation: -14.2°' },
      { timestamp: '09:43:10.245', step: 'OPTICAL_ZERO', detail: 'Optical center aligned with IMU boresight vector' },
      { timestamp: '09:43:10.290', step: 'NUC_SHUTTER', detail: 'Microbolometer shutter activated (400ms integration)', highlight: true },
      { timestamp: '09:43:10.315', step: 'SUCCESS', detail: 'Thermal calibration table updated. Zero bias <0.02 mrad.', success: true },
    ],
  },
  {
    id: 'canbus_telemetry_dump',
    name: 'canbus_telemetry_dump',
    label: 'canbus_telemetry_dump',
    icon: 'directions_car',
    typeBadge: 'HW DIRECT',
    badgeColor: 'bg-error-container text-on-error-container',
    description:
      'Direct socketCAN interface poll for vehicle drivetrain, battery voltage bus, and throttle servo health metrics.',
    latencyMs: 8.4,
    argsSignature: '{ interface: string, frame_count: int }',
    defaultCommand: 'candump can0 -n 25',
    sampleArgs: {
      can_interface: 'can0',
      baud_rate_kbps: 500,
      filter_id_hex: '0x18F',
    },
    jsonSchema: `{
  "$id": "tools/canbus_telemetry_dump.json",
  "type": "object",
  "properties": {
    "can_interface": { "type": "string", "default": "can0" },
    "baud_rate_kbps": { "type": "integer", "enum": [250, 500, 1000] },
    "filter_id_hex": { "type": "string" }
  },
  "required": ["can_interface"]
}`,
    executionLogs: [
      { timestamp: '09:44:00.100', step: 'SOCKET_CAN', detail: 'Bound to socket(PF_CAN, SOCK_RAW, CAN_RAW) on can0' },
      { timestamp: '09:44:00.104', step: 'RX_FRAME', detail: 'ID 0x18F [8] 28 4A 12 00 3C 00 E8 03' },
      { timestamp: '09:44:00.106', step: 'DECODE', detail: 'Main Bus: 48.2V, Current: 32.1A, RPM: 6,400', highlight: true },
      { timestamp: '09:44:00.108', step: 'SUCCESS', detail: 'Vehicle telemetry buffered into local ring cache', success: true },
    ],
  },
  {
    id: 'satellite_ephemeris_sync',
    name: 'satellite_ephemeris_sync',
    label: 'satellite_ephemeris_sync',
    icon: 'satellite_alt',
    typeBadge: 'SANDBOXED',
    badgeColor: 'bg-surface-container-highest text-secondary-fixed-dim',
    description:
      'Parses local NORAD 2-line element orbit set from cached flash storage for celestial pass prediction without internet.',
    latencyMs: 19.0,
    argsSignature: '{ constellation: string, lookahead_hrs: int }',
    defaultCommand: 'satellite_ephemeris_sync --constellation GPS --lookahead 4',
    sampleArgs: {
      constellation: 'GPS',
      observer_lat: 34.05,
      observer_lon: -118.25,
      lookahead_hours: 6,
    },
    jsonSchema: `{
  "$id": "tools/satellite_ephemeris_sync.json",
  "type": "object",
  "properties": {
    "constellation": { "type": "string", "enum": ["GPS", "IRIDIUM", "GLONASS", "SAR"] },
    "observer_lat": { "type": "number" },
    "observer_lon": { "type": "number" },
    "lookahead_hours": { "type": "integer", "minimum": 1, "maximum": 24 }
  },
  "required": ["constellation", "observer_lat", "observer_lon"]
}`,
    executionLogs: [
      { timestamp: '09:45:12.300', step: 'TLE_READ', detail: 'Read 32 cached orbits from /etc/ephemeris/norad_gps.tle' },
      { timestamp: '09:45:12.312', step: 'SGP4_PROP', detail: 'SGP4 propagation model run for time +00:00:00 -> +06:00:00' },
      { timestamp: '09:45:12.318', step: 'PASS_CALC', detail: 'Next pass: NAVSTAR 72 at Az 192°, El 64° in 22 min', highlight: true },
      { timestamp: '09:45:12.319', step: 'SUCCESS', detail: 'LOS azimuth window cached into tactical nav computer', success: true },
    ],
  },
];

export const ANOMALY_FRAMES: AnomalyFrame[] = [
  {
    id: 'frame-1',
    code: '#0842',
    timestamp: '14:38:29.4',
    title: 'THERMAL SPIKE',
    category: 'HYDRAULIC ACTUATOR FAULT',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBqORKpZ_uUy5RGGkWrxD-fCnnv7wWiP-7PtvdXL2ijkTZF-1yJxzbjvAa5hKfar8tUnqFXE8BcFq6u3KYZqyZZLGdo2Sl4XTLVClct48h053dhTe6sns2GDHjx3sNPNoNjCW0t7M14OcJLWxCKysC2-s0Abkh1pF7BjzkYlquEmyxHtb0c4v-Swr_q51r1pqxN9dsFm0cGtKKgVzugxGF7q1qxkXhtsSZW-5pNCAH7',
    altText:
      'Close up thermal camera infrared snapshot displaying an overheating high-pressure mechanical actuator joint with intense thermal hotspot blooming in luminous amber and sharp cyan outlines.',
    isActive: true,
    critical: true,
    confidence: 0.924,
    temperature: '84.6°C (OVERHEAT)',
    analysisReport:
      'Optical frame comparison correlates localized white FLIR bloom with high-pressure fluid micro-misting on actuator cylinder housing. Fluid loss trajectory risks auxiliary servo freeze at flight level FL120.',
    hardwareSpecs: {
      nominalPressure: '3,000 PSI',
      detectedTemp: '84.6°C (OVERHEAT)',
      failureProbability: '92.4% IN 18 MIN',
    },
    safetyProtocols: [
      'Isolate HYD Line 2 via secondary solenoid isolation toggle.',
      'Throttle engine RPM delta below 72% to alleviate backpressure.',
      'Route diversion waypoint to FOB DELTA (Vector 182° / 14 NM).',
    ],
  },
  {
    id: 'frame-2',
    code: '#0841',
    timestamp: '14:37:12.8',
    title: 'STRESS FRACTURE',
    category: 'CARBON COMPOSITE SPAR',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEw5npkMGcd7Dl1hYuvXc26kDoqOJRyZs878hKM84lxGXSsocUa7Zc1ruxR-PF7MP0VrJjWrk25n06sQW9iUazVOdoO0DGuWpuNl2I5EgKTSnsqkKIdu0vG3yINbl4Twbk_q8dBPDRgzaczhrGZH_awqMI1b5aO7MLZvGOgHt4l9Xvi5KzVshqfuCQF91LGvxwFIwJReVd6vurc-Xde0xY9WJ-emG0VxUo4ET2Q_WZ',
    altText: 'Tactical electro-optical high-resolution zoom snapshot of carbon-composite wing spar strut surface.',
    isActive: false,
    confidence: 0.887,
    temperature: '38.2°C (NOMINAL)',
    analysisReport:
      'High-frequency contrast filters isolated a 42mm micro-fissure along the port wing upper spar. Delamination rate estimated at 0.4mm/hr under +3.2G flight maneuvers.',
    hardwareSpecs: {
      nominalPressure: 'N/A (Structural)',
      detectedTemp: '38.2°C',
      failureProbability: '41.0% IN 2 HRS',
    },
    safetyProtocols: [
      'Cap flight envelope G-limit to +2.0G max.',
      'Disengage high-angle banking maneuvers.',
      'Log structural alert into blackbox flash memory.',
    ],
  },
  {
    id: 'frame-3',
    code: '#0840',
    timestamp: '14:35:44.2',
    title: 'COMPONENT MATCH',
    category: 'AVIONICS RELAY BAY',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVkQuwO47tD17rqSLAJkHkw5jSZCRry_rvREA1aGA6T4QFCKdHU9X9tuVP_K1_3wVrL4ZfNDddpk3Sz563NyK_V25NrN9rugcOOlzP-CcKBJmJkfr2Z0qauv1hcEmeDn6A96XDyfatNrhee9LRyj4pKwaUEOVQtIZFSlolbIDjxOjykSg-JkJKemiSh9JP-BERmiiNjpkgQ604S5bJA5r20wCf7VOJ41FbYpdkcc_G',
    altText: 'Tactical reconnaissance thermal EO camera frame displaying an avionics relay bay with standard wiring looms.',
    isActive: false,
    confidence: 0.974,
    temperature: '44.0°C (NORMAL)',
    analysisReport:
      'Automatic optical inspection (AOI) verified all 8 solid-state relay contactors seated and locked with secondary safety wire in place.',
    hardwareSpecs: {
      nominalPressure: 'Ambient',
      detectedTemp: '44.0°C',
      failureProbability: '< 1.0%',
    },
    safetyProtocols: [
      'Relay continuity optimal; no preventive action required.',
      'Maintain standard avionics cooling airflow.',
    ],
  },
  {
    id: 'frame-4',
    code: '#0839',
    timestamp: '14:34:02.0',
    title: 'HEAT EXCHANGER',
    category: 'TURBINE EXHAUST COWL',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBvfdLxTHhcWYWQqBsXghCg961XAJvNmL8DTVOJSOioYrRzSsv_cZZ9PBa-Pi2aPNFVzYske-3TPVJ0dLxvUDGHJF-5qJpPoXU-vVXq5GZHoMZMKsaNWsLBsMSg9EcEjY_zqdIuw9Hnh-9Q2BqBmbK8ECXnH4Xmkhe4q6uJq062XKcmCCMKjnkU9c3zxuEYLJ43jQ2xAgKvaenOSxaN2bW6eb6gWpoR4hKiKA0Nv1AR',
    altText: 'Thermal FLIR image of an unmanned aerial vehicle auxiliary turbine exhaust cowl.',
    isActive: false,
    confidence: 0.952,
    temperature: '612°C (PEAK CORE)',
    analysisReport:
      'Exhaust heat dispersal plumes conform to laminar dispersion contours. No flame boundary detachment or localized hot spots detected on surrounding shroud.',
    hardwareSpecs: {
      nominalPressure: '45 PSI (Exhaust)',
      detectedTemp: '612°C',
      failureProbability: '2.5%',
    },
    safetyProtocols: [
      'Exhaust diffuser thermals within nominal limits.',
      'Sustain turbine EGT below 680°C threshold.',
    ],
  },
  {
    id: 'frame-5',
    code: '#0838',
    timestamp: '14:31:18.7',
    title: 'RF TRANSMITTER',
    category: 'OMNIDIRECTIONAL POD',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCLADgkukoDxNTDBij3orRsdTAc8l_nbB0ZuGqJk18iZ3-cspp_bluS_lqHRU0toDva1g0pSNm7HU3nzkEHagSEKo77YANpuaPL8NpttMN2GE508-ADtsBQwANgWGx6M3mOkDD44jYKxdXKPFpgYFyW51Ewf1VenO_-R0cdHx_bwUtCklbt843feRvwcnK08pL9OC5axy136WEGJEBOf3Ut3UY7CMlbDtowKXwT9T4o',
    altText: 'High contrast electro-optical zoom view of an omnidirectional tactical antenna mast mounted on an external pod enclosure.',
    isActive: false,
    confidence: 0.881,
    temperature: '31.5°C',
    analysisReport:
      'Radio emission signature localized at 2.44GHz. RF power output estimated at 2.2W ERP. Physical radome undamaged.',
    hardwareSpecs: {
      nominalPressure: 'Ambient',
      detectedTemp: '31.5°C',
      failureProbability: '5.2%',
    },
    safetyProtocols: [
      'Maintain RF stealth mode; keep transmission power throttled to 2W.',
      'Engage periodic frequency hopping if tracked by adversary SIGINT.',
    ],
  },
  {
    id: 'frame-6',
    code: '#0837',
    timestamp: '14:28:00.1',
    title: 'SYS BASELINE',
    category: 'TAKEOFF HANGAR BAY',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQuFvpv6SyWhsLIk5DVmrRh9ISopHxvrtM_-zEGUuPCTYrjXsne2l850-J1CNnmDHlZZCgUnn85ZANhaJle9SDNIn2fu-cGFliC62ysiSZGwiJl4ybr_uM_hMuheBieuG1EmaW8kGPPJXHxeS5hv3fRp7sjcLCcF6-jssIhNBeR9Kj3NaSDj-G9pVfSRNgoEK5uuyxAy5HYREktpQlKRsVPglb0Pf6TpuTVvhFxGG1',
    altText: 'Standard ambient temperature baseline optical capture of drone takeoff hangar bay floor.',
    isActive: false,
    confidence: 0.999,
    temperature: '24.1°C (AMBIENT)',
    analysisReport:
      'Ground reference frame used for zero-offset sensor matrix calibration. Zero optical distortion across wide-angle lenses.',
    hardwareSpecs: {
      nominalPressure: '1 ATM',
      detectedTemp: '24.1°C',
      failureProbability: '0.0%',
    },
    safetyProtocols: [
      'Reference frame logged. All radiometric lookup tables referenced to this timestamp.',
    ],
  },
];
