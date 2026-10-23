import fs from 'fs';

function createElement(opts) {
  return {
    id: opts.id || Math.random().toString(36).substring(2, 9),
    type: opts.type || 'rectangle',
    x: opts.x || 0,
    y: opts.y || 0,
    width: opts.width || 100,
    height: opts.height || 50,
    angle: 0,
    strokeColor: opts.strokeColor || '#1e1e1e',
    backgroundColor: opts.backgroundColor || 'transparent',
    fillStyle: opts.fillStyle || 'hachure',
    strokeWidth: opts.strokeWidth || 1,
    strokeStyle: opts.strokeStyle || 'solid',
    roughness: opts.roughness || 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: opts.roundness || { type: 3 },
    seed: Math.floor(Math.random() * 100000),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    text: opts.text || '',
    fontSize: opts.fontSize || 16,
    fontFamily: 1, // Virgil handwriting font in Excalidraw
    textAlign: opts.textAlign || 'left',
    verticalAlign: opts.verticalAlign || 'top',
    baseline: 14
  };
}

// 1. Normal State Excalidraw Document
const normalElements = [
  // Title
  createElement({ type: 'text', x: 40, y: 30, text: 'Orders Explorer — UI Wireframe (13" Ops Screen)', fontSize: 24, strokeColor: '#0f172a' }),
  createElement({ type: 'text', x: 40, y: 65, text: 'Target: Operations team • Dense scanning • Keyboard-first navigation', fontSize: 14, strokeColor: '#64748b' }),
  
  // Post-it note
  createElement({ type: 'rectangle', x: 880, y: 20, width: 260, height: 70, strokeColor: '#ca8a04', backgroundColor: '#fef08a', fillStyle: 'solid', roughness: 2 }),
  createElement({ type: 'text', x: 890, y: 30, text: 'Design Goals for 13" Screen:\n• Row height 34px (fit ~20 rows)\n• Pinned ID column for horiz-scroll', fontSize: 13, strokeColor: '#854d0e' }),

  // Header Nav Bar
  createElement({ type: 'rectangle', x: 40, y: 110, width: 1100, height: 44, strokeColor: '#1e293b', strokeWidth: 2, roughness: 1 }),
  createElement({ type: 'text', x: 55, y: 122, text: '◈ Merkle Science | Orders Explorer', fontSize: 16, strokeColor: '#0284c7' }),
  createElement({ type: 'rectangle', x: 380, y: 118, width: 380, height: 28, strokeColor: '#94a3b8', backgroundColor: '#f1f5f9', fillStyle: 'solid', roughness: 1 }),
  createElement({ type: 'text', x: 395, y: 124, text: '⌨ [↑↓←→ Move]  [Space Select]  [Enter Details]', fontSize: 13, strokeColor: '#475569' }),
  createElement({ type: 'rectangle', x: 960, y: 116, width: 160, height: 32, strokeColor: '#0284c7', backgroundColor: '#e0f2fe', fillStyle: 'solid', strokeWidth: 2 }),
  createElement({ type: 'text', x: 975, y: 123, text: '📥 Export CSV (20)', fontSize: 14, strokeColor: '#0369a1' }),

  // Filter Builder Container
  createElement({ type: 'rectangle', x: 40, y: 170, width: 1100, height: 115, strokeColor: '#1e293b', strokeWidth: 2 }),
  createElement({ type: 'text', x: 55, y: 180, text: 'FILTER BUILDER (Groups combine with AND · Inside group with OR)', fontSize: 14, strokeColor: '#334155' }),
  
  // Group 1 (OR)
  createElement({ type: 'rectangle', x: 55, y: 205, width: 520, height: 68, strokeColor: '#64748b', strokeStyle: 'dashed', roughness: 1.5 }),
  createElement({ type: 'text', x: 65, y: 212, text: 'Group 1 (OR): status is_one_of [shipped, delivered]  OR  priority = 1', fontSize: 13, strokeColor: '#1e293b' }),
  createElement({ type: 'rectangle', x: 65, y: 242, width: 120, height: 24, strokeColor: '#94a3b8', backgroundColor: '#f8fafc', fillStyle: 'solid' }),
  createElement({ type: 'text', x: 72, y: 247, text: '+ Condition (OR)', fontSize: 12, strokeColor: '#64748b' }),

  // AND connector
  createElement({ type: 'text', x: 590, y: 230, text: 'AND', fontSize: 14, strokeColor: '#0284c7' }),

  // Group 2
  createElement({ type: 'rectangle', x: 640, y: 205, width: 360, height: 68, strokeColor: '#64748b', strokeStyle: 'dashed', roughness: 1.5 }),
  createElement({ type: 'text', x: 650, y: 212, text: 'Group 2: amount > ₹5,000', fontSize: 13, strokeColor: '#1e293b' }),
  createElement({ type: 'rectangle', x: 650, y: 242, width: 120, height: 24, strokeColor: '#94a3b8', backgroundColor: '#f8fafc', fillStyle: 'solid' }),
  createElement({ type: 'text', x: 657, y: 247, text: '+ Condition (OR)', fontSize: 12, strokeColor: '#64748b' }),

  createElement({ type: 'rectangle', x: 1020, y: 218, width: 105, height: 36, strokeColor: '#16a34a', backgroundColor: '#f0fdf4', fillStyle: 'solid' }),
  createElement({ type: 'text', x: 1030, y: 228, text: '+ Add Group', fontSize: 13, strokeColor: '#15803d' }),

  // Active Chips Bar
  createElement({ type: 'rectangle', x: 40, y: 300, width: 1100, height: 38, strokeColor: '#94a3b8', roughness: 1 }),
  createElement({ type: 'text', x: 55, y: 312, text: 'ACTIVE CHIPS:  [status: shipped, delivered ×]  [amount > 5000 ×]  Clear all', fontSize: 13, strokeColor: '#0284c7' }),
  createElement({ type: 'text', x: 800, y: 312, text: '1,284 of 50,000 orders  |  [✓ 20 selected]', fontSize: 13, strokeColor: '#1e40af' }),

  // Grid
  createElement({ type: 'rectangle', x: 40, y: 350, width: 750, height: 380, strokeColor: '#1e293b', strokeWidth: 2 }),
  createElement({ type: 'rectangle', x: 40, y: 350, width: 750, height: 34, strokeColor: '#cbd5e1', backgroundColor: '#f1f5f9', fillStyle: 'solid' }),
  createElement({ type: 'text', x: 50, y: 360, text: '[✓]  📌 Order ID ▲ | Customer | Status ▼ | Amount (₹) ▲ | Created Date | Region', fontSize: 13, strokeColor: '#0f172a' }),
  
  // Rows
  createElement({ type: 'rectangle', x: 40, y: 384, width: 750, height: 32, strokeColor: '#bfdbfe', backgroundColor: '#eff6ff', fillStyle: 'solid' }),
  createElement({ type: 'text', x: 50, y: 392, text: '[✓]  ORD-000142   Rohan Sharma    shipped     ₹8,499.00    14 Mar 2025    NORTH', fontSize: 12, strokeColor: '#1e293b' }),
  
  createElement({ type: 'rectangle', x: 40, y: 416, width: 750, height: 32, strokeColor: '#f1f5f9' }),
  createElement({ type: 'text', x: 50, y: 424, text: '[ ]  ORD-000145   Priya Patel     delivered   ₹12,450.00   14 Mar 2025    WEST', fontSize: 12, strokeColor: '#334155' }),
  
  createElement({ type: 'rectangle', x: 40, y: 448, width: 750, height: 32, strokeColor: '#f1f5f9' }),
  createElement({ type: 'text', x: 50, y: 456, text: '[ ]  ORD-000150   Amit Verma      shipped     ₹6,200.00    14 Mar 2025    EAST', fontSize: 12, strokeColor: '#334155' }),

  createElement({ type: 'text', x: 200, y: 550, text: '⚡ Virtualized Row Window (Only ~22 rows rendered in DOM out of 50,000!)', fontSize: 14, strokeColor: '#94a3b8' }),

  // Order Details Drawer
  createElement({ type: 'rectangle', x: 810, y: 350, width: 330, height: 380, strokeColor: '#1e293b', strokeWidth: 2 }),
  createElement({ type: 'text', x: 825, y: 362, text: 'ORDER DETAILS: ORD-000142  [Esc]', fontSize: 14, strokeColor: '#0284c7' }),
  createElement({ type: 'text', x: 825, y: 400, text: 'Customer: Rohan Sharma (rohan@example.com)\nAmount: ₹8,499.00 (converted from paise v1)\nTimeline: 14 Mar 2025 09:30 UTC\nNotes: plain-text only, sanitized XSS-safe', fontSize: 12, strokeColor: '#334155' })
];

const normalDoc = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  elements: normalElements,
  appState: { viewBackgroundColor: '#ffffff', gridSize: null },
  files: {}
};

fs.writeFileSync('design/01-normal-state.excalidraw', JSON.stringify(normalDoc, null, 2));

// 2. Empty State Excalidraw Document
const emptyElements = [
  createElement({ type: 'text', x: 40, y: 30, text: 'Orders Explorer — Empty State (Zero Matches)', fontSize: 24, strokeColor: '#0f172a' }),
  createElement({ type: 'text', x: 40, y: 65, text: 'When active filter matches 0 rows: clear feedback + reset action', fontSize: 14, strokeColor: '#64748b' }),

  createElement({ type: 'rectangle', x: 40, y: 110, width: 1100, height: 44, strokeColor: '#1e293b', strokeWidth: 2 }),
  createElement({ type: 'text', x: 55, y: 122, text: '◈ Merkle Science | Orders Explorer', fontSize: 16, strokeColor: '#0284c7' }),
  createElement({ type: 'text', x: 975, y: 123, text: '📥 Export CSV (0)', fontSize: 14, strokeColor: '#94a3b8' }),

  createElement({ type: 'rectangle', x: 40, y: 170, width: 1100, height: 95, strokeColor: '#1e293b', strokeWidth: 2 }),
  createElement({ type: 'text', x: 55, y: 180, text: 'FILTER BUILDER: Group 1: amount > ₹99,999,999', fontSize: 14, strokeColor: '#e11d48' }),

  createElement({ type: 'rectangle', x: 40, y: 280, width: 1100, height: 38, strokeColor: '#94a3b8' }),
  createElement({ type: 'text', x: 55, y: 292, text: 'ACTIVE CHIPS:  [amount > ₹99,999,999 ×]   Clear all ↺', fontSize: 13, strokeColor: '#e11d48' }),
  createElement({ type: 'text', x: 900, y: 292, text: '0 of 50,000 orders (0 selected)', fontSize: 13, strokeColor: '#e11d48' }),

  // Empty state canvas
  createElement({ type: 'rectangle', x: 40, y: 335, width: 1100, height: 395, strokeColor: '#1e293b', strokeWidth: 2 }),
  createElement({ type: 'text', x: 420, y: 440, text: '🔍 No orders match your filter criteria', fontSize: 20, strokeColor: '#0f172a' }),
  createElement({ type: 'text', x: 380, y: 480, text: 'We searched across all 50,000 orders, but none matched the current conditions.', fontSize: 14, strokeColor: '#64748b' }),
  
  // CTA
  createElement({ type: 'rectangle', x: 470, y: 520, width: 220, height: 44, strokeColor: '#0284c7', backgroundColor: '#e0f2fe', fillStyle: 'solid', strokeWidth: 2 }),
  createElement({ type: 'text', x: 510, y: 533, text: '↺ Reset All Filters', fontSize: 16, strokeColor: '#0369a1' })
];

const emptyDoc = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  elements: emptyElements,
  appState: { viewBackgroundColor: '#ffffff', gridSize: null },
  files: {}
};

fs.writeFileSync('design/02-empty-state.excalidraw', JSON.stringify(emptyDoc, null, 2));

console.log('Successfully created Excalidraw files in design/ directory!');
