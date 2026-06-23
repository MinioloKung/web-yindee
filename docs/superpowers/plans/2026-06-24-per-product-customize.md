# Per-Product Customize Experience — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ปรับหน้า Customize ให้แสดงตัวเลือก (สีวัสดุ, label, template) ต่างกันตามสินค้าที่ผู้ใช้เลือกจากหน้าแรก

**Architecture:** เพิ่ม `productType` field ใน `FrameConfig` เพื่อ track สินค้าที่เลือก → เพิ่ม `ProductConfig` object ใน `presets.ts` ที่บอกชุดสี, label, และ allowedTemplates ของแต่ละสินค้า → `ControlPanel` อ่าน productConfig แล้วแสดงผลตามนั้น → Layout Patterns ถูกแทนที่ด้วยชุดใหม่ 4 แบบ

**Tech Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS

## Global Constraints

- TypeScript strict mode — ห้าม `any`
- ไม่แก้ไข `FrameCanvas.tsx` และ `ExportModal.tsx`
- Layout ID ใหม่: `triple-col`, `double-v-gap`, `quad`, `single-center`
- Default `layoutId` เมื่อเปลี่ยน product = `'single-center'`
- ห้ามใช้ hardcode string ซ้ำ — ใช้ constant จาก `presets.ts` เสมอ
- ทุก commit ใช้ prefix `feat:` หรือ `refactor:`
- หลังแก้ไขทุก Task ต้อง run `npm run build` ให้ผ่านก่อน commit

---

## Task 1: เพิ่ม Types ใหม่ใน frame.ts

**Files:**
- Modify: `src/types/frame.ts`

**Interfaces:**
- Produces:
  - `ProductType = 'cute-fabric' | 'vintage-lace' | 'anniversary-card'`
  - `ProductConfig { id, name, matLabel, matColors, allowedTemplateIds, defaultTemplateId, defaultMatColorId }`
  - `FrameConfig.productType: ProductType`

- [ ] **Step 1: เพิ่ม ProductType และ ProductConfig**

เปิดไฟล์ `src/types/frame.ts` แล้วแทนที่เนื้อหาทั้งหมดด้วย:

```typescript
export interface ImageState {
  file: File | null;
  imageUrl: string; // Object URL
  x: number;       // Offset X
  y: number;       // Offset Y
  scale: number;   // Zoom factor (e.g. 1.0)
  rotation: number; // Rotation degrees (0-360)
}

export interface LayoutSlot {
  id: string;
  x: number;      // percentage of width (0-100)
  y: number;      // percentage of height (0-100)
  width: number;  // percentage of width (0-100)
  height: number; // percentage of height (0-100)
}

export interface LayoutPattern {
  id: string;
  name: string;
  slots: LayoutSlot[];
}

export interface FrameStyle {
  id: string;
  name: string;
  color: string;      // Fallback hex/hsl
  borderColor: string;
  innerBorderColor: string;
  woodTexture?: boolean;
}

export interface MatColor {
  id: string;
  name: string;
  color: string;      // css color representation
  textColor: string;  // color of text to render on top
}

export interface PresetTemplate {
  id: string;
  name: string;
  imageUrl: string;   // path to transparent overlay image
  slots: LayoutSlot[];
}

// NEW: Product type identifier
export type ProductType = 'cute-fabric' | 'vintage-lace' | 'anniversary-card';

// NEW: Per-product configuration
export interface ProductConfig {
  id: ProductType;
  name: string;
  matLabel: string;               // "สีผ้ารอง" or "สีกระดาษรอง"
  matColors: MatColor[];          // color set specific to this product
  allowedTemplateIds: string[];   // template IDs visible in template mode
  defaultTemplateId: string;      // pre-selected template when entering this product
  defaultMatColorId: string;      // pre-selected mat color when entering this product
}

export interface FrameConfig {
  productType: ProductType;       // NEW: which product was selected on home
  mode: 'custom' | 'template';
  orientation: 'portrait' | 'landscape';
  frameStyleId: string;
  matColorId: string;
  layoutId: string;
  templateId: string;
  images: { [slotId: string]: ImageState };
}
```

- [ ] **Step 2: ตรวจสอบว่า TypeScript ไม่มี error**

```powershell
npm run build
```

Expected: Build สำเร็จ (อาจมี error ที่ `page.tsx` หรือ `ControlPanel.tsx` เพราะ `productType` ยังไม่ได้เพิ่มใน initial state — ให้ดู error แล้วดำเนินการ Task 2 ต่อ)

- [ ] **Step 3: Commit**

```powershell
git add src/types/frame.ts
git commit -m "feat: add ProductType and ProductConfig types to frame.ts"
```

---

## Task 2: เพิ่ม Data ใหม่ใน presets.ts

**Files:**
- Modify: `src/constants/presets.ts`

**Interfaces:**
- Consumes: `MatColor`, `ProductConfig`, `ProductType` จาก `src/types/frame.ts`
- Produces:
  - `LAYOUT_PATTERNS` (ชุดใหม่ 4 แบบ: `triple-col`, `double-v-gap`, `quad`, `single-center`)
  - `FABRIC_COLORS_CUTE: MatColor[]`
  - `FABRIC_COLORS_VINTAGE: MatColor[]`
  - `PRODUCT_CONFIGS: ProductConfig[]`
  - `getProductConfig(productType: ProductType): ProductConfig`

- [ ] **Step 1: แทนที่ทั้งไฟล์ `src/constants/presets.ts`**

```typescript
import { LayoutPattern, FrameStyle, MatColor, PresetTemplate, ProductConfig, ProductType } from '../types/frame';

export const FRAME_STYLES: FrameStyle[] = [
  { id: 'white', name: 'ขาวมินิมอล', color: '#f5f5f5', borderColor: '#ffffff', innerBorderColor: '#e5e5e5' },
  { id: 'black', name: 'ดำโมเดิร์น', color: '#171717', borderColor: '#171717', innerBorderColor: '#404040' },
  { id: 'oak', name: 'ไม้โอ๊คน้ำตาลเข้ม', color: '#5c4033', borderColor: '#3d2b1f', innerBorderColor: '#8b5a2b', woodTexture: true }
];

// ---- Mat Colors: Paper (Anniversary Card) ----
export const MAT_COLORS: MatColor[] = [
  { id: 'off-white',  name: 'ขาวออฟไวท์',        color: '#faf9f6', textColor: '#171717' },
  { id: 'warm-gray',  name: 'เทาอุ่น',            color: '#d4d4d4', textColor: '#171717' },
  { id: 'charcoal',   name: 'เทาเข้ม',            color: '#262626', textColor: '#faf9f6' },
  { id: 'midnight',   name: 'น้ำเงินคราม',         color: '#1e293b', textColor: '#faf9f6' },
  { id: 'sage',       name: 'เขียวใบไม้พาสเทล',   color: '#a3b19b', textColor: '#171717' }
];

// ---- Fabric Colors: Cute Fabric (Pastel) ----
export const FABRIC_COLORS_CUTE: MatColor[] = [
  { id: 'fabric-cream',     name: 'ขาวนม',      color: '#FFF8F0', textColor: '#171717' },
  { id: 'fabric-pink',      name: 'ชมพูอ่อน',   color: '#FADADD', textColor: '#171717' },
  { id: 'fabric-blue',      name: 'ฟ้าอ่อน',    color: '#D6EAF8', textColor: '#171717' },
  { id: 'fabric-yellow',    name: 'เหลืองอ่อน', color: '#FFF9C4', textColor: '#171717' },
  { id: 'fabric-lavender',  name: 'ม่วงอ่อน',   color: '#E8DAEF', textColor: '#171717' }
];

// ---- Fabric Colors: Vintage Lace (Vintage/Warm) ----
export const FABRIC_COLORS_VINTAGE: MatColor[] = [
  { id: 'vintage-cream',     name: 'ครีม',        color: '#F5F0E8', textColor: '#171717' },
  { id: 'vintage-sand',      name: 'น้ำตาลทราย', color: '#C8A97E', textColor: '#171717' },
  { id: 'vintage-beige',     name: 'เบจ',         color: '#E8DCC8', textColor: '#171717' },
  { id: 'vintage-warm-gray', name: 'เทาอุ่น',    color: '#B8B0A8', textColor: '#171717' },
  { id: 'vintage-moss',      name: 'เขียวมอส',   color: '#8B9E7A', textColor: '#171717' }
];

// ---- Layout Patterns (NEW: 4 layouts replacing old set) ----
export const LAYOUT_PATTERNS: LayoutPattern[] = [
  {
    id: 'triple-col',
    name: '3 รูปแนวตั้ง',
    slots: [
      { id: 'slot-1', x: 5,  y: 8, width: 27, height: 84 },
      { id: 'slot-2', x: 36, y: 8, width: 27, height: 84 },
      { id: 'slot-3', x: 67, y: 8, width: 27, height: 84 }
    ]
  },
  {
    id: 'double-v-gap',
    name: '2 รูปบน-ล่าง',
    slots: [
      { id: 'slot-1', x: 10, y: 5,  width: 80, height: 43 },
      { id: 'slot-2', x: 10, y: 52, width: 80, height: 43 }
    ]
  },
  {
    id: 'quad',
    name: '4 รูป (2×2)',
    slots: [
      { id: 'slot-1', x: 5,  y: 5,  width: 43, height: 43 },
      { id: 'slot-2', x: 52, y: 5,  width: 43, height: 43 },
      { id: 'slot-3', x: 5,  y: 52, width: 43, height: 43 },
      { id: 'slot-4', x: 52, y: 52, width: 43, height: 43 }
    ]
  },
  {
    id: 'single-center',
    name: '1 รูปตรงกลาง',
    slots: [
      { id: 'slot-1', x: 12, y: 12, width: 76, height: 76 }
    ]
  }
];

// ---- Preset Templates ----
export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'temp-cardred',
    name: 'Anniversary Red',
    imageUrl: '/templates/CardRed.png',
    slots: [
      { id: 'slot-1', x: 13.25, y: 16.3,  width: 17.5,   height: 17.2  },
      { id: 'slot-2', x: 41.3,  y: 16.4,  width: 17.3,   height: 17    },
      { id: 'slot-3', x: 69.25, y: 16.38, width: 17.416, height: 17.16 },
      { id: 'slot-4', x: 13.41, y: 41.3,  width: 17.3,   height: 17.05 },
      { id: 'slot-5', x: 69.25, y: 41.3,  width: 17.1,   height: 17.05 },
      { id: 'slot-6', x: 13.3,  y: 66.4,  width: 17.3,   height: 17.1  },
      { id: 'slot-7', x: 41.3,  y: 66.4,  width: 17.3,   height: 17.1  },
      { id: 'slot-8', x: 69.3,  y: 66.4,  width: 17.3,   height: 17.1  }
    ]
  },
  {
    id: 'temp-cardegg',
    name: 'Anniversary Egg',
    imageUrl: '/templates/CardEgg.png',
    slots: [
      { id: 'slot-1', x: 13.25, y: 16.3,  width: 17.5,   height: 17.2  },
      { id: 'slot-2', x: 41.3,  y: 16.4,  width: 17.3,   height: 17    },
      { id: 'slot-3', x: 69.25, y: 16.38, width: 17.416, height: 17.16 },
      { id: 'slot-4', x: 13.41, y: 41.3,  width: 17.3,   height: 17.05 },
      { id: 'slot-5', x: 69.25, y: 41.3,  width: 17.1,   height: 17.05 },
      { id: 'slot-6', x: 13.3,  y: 66.4,  width: 17.3,   height: 17.1  },
      { id: 'slot-7', x: 41.3,  y: 66.4,  width: 17.3,   height: 17.1  },
      { id: 'slot-8', x: 69.3,  y: 66.4,  width: 17.3,   height: 17.1  }
    ]
  },
  {
    id: 'temp-polaroid',
    name: 'โพลารอยด์วินเทจ',
    imageUrl: '/templates/polaroid.svg',
    slots: [
      { id: 'slot-1', x: 12, y: 12, width: 76, height: 60 }
    ]
  },
  {
    id: 'temp-love',
    name: 'สื่อรักหัวใจคู่',
    imageUrl: '/templates/love-double.svg',
    slots: [
      { id: 'slot-1', x: 10, y: 20, width: 38, height: 55 },
      { id: 'slot-2', x: 52, y: 20, width: 38, height: 55 }
    ]
  },
  {
    id: 'temp-cutefabric',
    name: 'ดีไซน์ Cute หวานละมุน พื้นหลังผ้า',
    imageUrl: '/templates/cute-fabric.svg',
    slots: [
      { id: 'slot-1', x: 10, y: 10, width: 80, height: 75 }
    ]
  },
  {
    id: 'temp-lacevintage',
    name: 'ลายลูกไม้วินเทจ พื้นหลังผ้ากระสอบ',
    imageUrl: '/templates/lace-vintage.svg',
    slots: [
      { id: 'slot-1', x: 12, y: 12, width: 76, height: 70 }
    ]
  }
];

// ---- Product Configs ----
export const PRODUCT_CONFIGS: ProductConfig[] = [
  {
    id: 'cute-fabric',
    name: 'ดีไซน์ Cute หวานละมุน พื้นหลังผ้า',
    matLabel: 'สีผ้ารอง',
    matColors: FABRIC_COLORS_CUTE,
    allowedTemplateIds: ['temp-cutefabric'],
    defaultTemplateId: 'temp-cutefabric',
    defaultMatColorId: 'fabric-cream'
  },
  {
    id: 'vintage-lace',
    name: 'ลายลูกไม้วินเทจ พื้นหลังผ้ากระสอบ',
    matLabel: 'สีผ้ารอง',
    matColors: FABRIC_COLORS_VINTAGE,
    allowedTemplateIds: ['temp-lacevintage'],
    defaultTemplateId: 'temp-lacevintage',
    defaultMatColorId: 'vintage-cream'
  },
  {
    id: 'anniversary-card',
    name: 'กรอบรูปการ์ดครบรอบ',
    matLabel: 'สีกระดาษรอง',
    matColors: MAT_COLORS,
    allowedTemplateIds: ['temp-cardred', 'temp-cardegg'],
    defaultTemplateId: 'temp-cardred',
    defaultMatColorId: 'off-white'
  }
];

// ---- Helper ----
export function getProductConfig(productType: ProductType): ProductConfig {
  return PRODUCT_CONFIGS.find(p => p.id === productType) ?? PRODUCT_CONFIGS[2];
}
```

- [ ] **Step 2: Build เพื่อตรวจ type errors**

```powershell
npm run build
```

Expected: อาจยังมี error จาก `page.tsx` (productType ใน initial state) — ไม่เป็นไร ดำเนิน Task 3

- [ ] **Step 3: Commit**

```powershell
git add src/constants/presets.ts
git commit -m "feat: add fabric colors, product configs, new 4 layout patterns"
```

---

## Task 3: อัปเดต page.tsx

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes:
  - `ProductType` จาก `src/types/frame.ts`
  - `getProductConfig`, `PRESET_TEMPLATES`, `LAYOUT_PATTERNS` จาก `src/constants/presets.ts`
- Produces: `FrameConfig` ที่มี `productType` ถูกต้อง, ส่ง `productConfig` ลง `ControlPanel`

- [ ] **Step 1: เพิ่ม productType ใน initial state และแก้ import**

เปิด `src/app/page.tsx` แก้ไข:

**บรรทัด 8** — เพิ่ม `getProductConfig` ใน import:
```typescript
import { FRAME_STYLES, MAT_COLORS, PRESET_TEMPLATES, getProductConfig } from '../constants/presets';
```

**บรรทัด 12–20** — เพิ่ม `productType` ใน initial state:
```typescript
const [config, rawSetConfig] = useState<FrameConfig>({
  productType: 'anniversary-card',
  mode: 'custom',
  orientation: 'portrait',
  frameStyleId: 'black',
  matColorId: 'off-white',
  layoutId: 'single-center',
  templateId: PRESET_TEMPLATES[0]?.id || 'temp-cardred',
  images: {}
});
```

- [ ] **Step 2: แก้ Card แต่ละใบในหน้าแรกให้ set productType, templateId, matColorId ให้ถูกต้อง**

หา block `{/* Cute Fabric Card */}` (ประมาณบรรทัด 183–216) แล้วแก้ `onClick`:
```typescript
onClick={() => {
  const pc = getProductConfig('cute-fabric');
  setConfig(prev => ({
    ...prev,
    productType: 'cute-fabric',
    mode: 'template',
    templateId: pc.defaultTemplateId,
    matColorId: pc.defaultMatColorId,
    layoutId: 'single-center',
    images: {}
  }));
  setView('customize');
}}
```

หา block `{/* Vintage Lace Card */}` (ประมาณบรรทัด 218–251) แล้วแก้ `onClick`:
```typescript
onClick={() => {
  const pc = getProductConfig('vintage-lace');
  setConfig(prev => ({
    ...prev,
    productType: 'vintage-lace',
    mode: 'template',
    templateId: pc.defaultTemplateId,
    matColorId: pc.defaultMatColorId,
    layoutId: 'single-center',
    images: {}
  }));
  setView('customize');
}}
```

หา block `{/* Anniversary Playing Cards / Custom Card */}` (ประมาณบรรทัด 253–286) แล้วแก้ `onClick`:
```typescript
onClick={() => {
  const pc = getProductConfig('anniversary-card');
  setConfig(prev => ({
    ...prev,
    productType: 'anniversary-card',
    mode: 'template',
    templateId: pc.defaultTemplateId,
    matColorId: pc.defaultMatColorId,
    layoutId: 'single-center',
    images: {}
  }));
  setView('customize');
}}
```

- [ ] **Step 3: ส่ง productConfig ลง ControlPanel**

หาบรรทัดที่ render `<ControlPanel` (ประมาณบรรทัด 343–348) แล้วแก้เป็น:
```tsx
const productConfig = getProductConfig(config.productType);

// ... (ใน JSX):
<ControlPanel
  config={config}
  setConfig={setConfig}
  activeSlotId={activeSlotId}
  onUploadImage={handleUploadImage}
  productConfig={productConfig}
/>
```

> หมายเหตุ: ประกาศ `productConfig` ก่อน return statement (ประมาณบรรทัด 130)

- [ ] **Step 4: Build ตรวจสอบ**

```powershell
npm run build
```

Expected: อาจยัง error ที่ `ControlPanel.tsx` prop `productConfig` — ดำเนิน Task 4

- [ ] **Step 5: Commit**

```powershell
git add src/app/page.tsx
git commit -m "feat: wire productType into FrameConfig state and card onClick handlers"
```

---

## Task 4: อัปเดต ControlPanel.tsx

**Files:**
- Modify: `src/components/ControlPanel.tsx`

**Interfaces:**
- Consumes:
  - `productConfig: ProductConfig` — prop ใหม่จาก page.tsx
  - `LAYOUT_PATTERNS`, `FRAME_STYLES`, `PRESET_TEMPLATES` จาก `src/constants/presets.ts`
- Produces: UI ที่แสดง matLabel, matColors, และ allowedTemplates ตาม productConfig

- [ ] **Step 1: เพิ่ม productConfig ใน props และ imports**

เปิด `src/components/ControlPanel.tsx`:

**เพิ่ม import** (บรรทัด 5):
```typescript
import { FRAME_STYLES, LAYOUT_PATTERNS, PRESET_TEMPLATES } from '../constants/presets';
import { FrameConfig, ImageState, ProductConfig } from '../types/frame';
```

**เพิ่ม productConfig ใน interface** (บรรทัด 8–13):
```typescript
interface ControlPanelProps {
  config: FrameConfig;
  setConfig: React.Dispatch<React.SetStateAction<FrameConfig>>;
  activeSlotId: string | null;
  onUploadImage: (slotId: string, file: File) => void;
  productConfig: ProductConfig;  // NEW
}
```

**แก้ function signature** (บรรทัด 15):
```typescript
export default function ControlPanel({ config, setConfig, activeSlotId, onUploadImage, productConfig }: ControlPanelProps) {
```

- [ ] **Step 2: แก้ Mat Color section ให้ใช้ productConfig**

หา section `สีกระดาษรองการ์ด` (ประมาณบรรทัด 93–108) แล้วแทนที่ label และ color array:

```tsx
<div>
  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] flex items-center gap-2 mb-3">
    <Palette size={14} /> {productConfig.matLabel}
  </label>
  <div className="grid grid-cols-5 gap-2">
    {productConfig.matColors.map(mat => (
      <button
        key={mat.id}
        onClick={() => handleMatChange(mat.id)}
        style={{ backgroundColor: mat.color }}
        className={`w-full aspect-square rounded-full border-2 transition cursor-pointer ${config.matColorId === mat.id ? 'border-[#5C4033] scale-110' : 'border-transparent hover:scale-105'}`}
        title={mat.name}
      />
    ))}
  </div>
</div>
```

- [ ] **Step 3: แก้ Template Mode ให้กรอง template ตาม allowedTemplateIds**

หา section Template Mode (ประมาณบรรทัด 110–133) แล้วแทนที่ `PRESET_TEMPLATES.map(...)` ด้วย:

```tsx
{/* Template Mode Tools */}
<div>
  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] flex items-center gap-2 mb-3">
    เลือกดีไซน์เทมเพลต
  </label>
  <div className="grid grid-cols-1 gap-3">
    {PRESET_TEMPLATES
      .filter(temp => productConfig.allowedTemplateIds.includes(temp.id))
      .map(temp => (
        <button
          key={temp.id}
          onClick={() => setConfig(prev => ({ ...prev, templateId: temp.id }))}
          className={`p-4 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${config.templateId === temp.id ? 'border-[#5C4033] bg-[#5C4033]/10 text-[#5C4033] font-semibold' : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'}`}
        >
          <div className={`w-12 h-16 rounded border flex items-center justify-center transition overflow-hidden ${config.templateId === temp.id ? 'border-[#5C4033]/30' : 'border-stone-200'}`}>
            <img src={temp.imageUrl} alt={temp.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{temp.name}</h4>
            <p className={`text-xs transition ${config.templateId === temp.id ? 'text-[#5C4033]/70' : 'text-stone-500'}`}>10x15 ซม.</p>
          </div>
        </button>
      ))}
  </div>
</div>
```

- [ ] **Step 4: Build ตรวจสอบให้ผ่าน**

```powershell
npm run build
```

Expected: Build สำเร็จ ไม่มี TypeScript errors

- [ ] **Step 5: Commit**

```powershell
git add src/components/ControlPanel.tsx
git commit -m "feat: use productConfig for dynamic mat label, colors, and template list in ControlPanel"
```

---

## Task 5: ตรวจสอบ end-to-end และ push

**Files:** ไม่มีไฟล์ใหม่

- [ ] **Step 1: รัน dev server**

```powershell
npm run dev
```

- [ ] **Step 2: ตรวจสอบ flow ด้วยตนเอง (Manual QA)**

| ขั้นตอน | สิ่งที่ต้องเห็น |
|---------|--------------|
| กดการ์ด "Cute Fabric" | เข้า Customize, label "สีผ้ารอง", เห็นสีพาสเทล 5 สี, Template panel มีแค่ `temp-cutefabric` |
| กดการ์ด "Vintage Lace" | label "สีผ้ารอง", เห็นสีวินเทจ 5 สี, Template panel มีแค่ `temp-lacevintage` |
| กดการ์ด "Anniversary Card" | label "สีกระดาษรอง", เห็นสีกระดาษ 5 สี (เดิม), Template panel มี `temp-cardred` + `temp-cardegg` |
| สลับ Mode "ออกแบบเอง" | Layout มี 4 แบบใหม่: 3 รูปแนวตั้ง / 2 รูปบน-ล่าง / 4 รูป 2×2 / 1 รูปตรงกลาง |
| `npm run build` | ผ่าน ไม่มี error |

- [ ] **Step 3: Push ขึ้น GitHub**

```powershell
git push origin master
```

Expected: push สำเร็จ ไม่มี conflict
