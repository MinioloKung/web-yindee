# Per-Product Customize Experience — Design Spec

**Date:** 2026-06-24  
**Status:** Approved  
**Scope:** ปรับหน้า Customize ให้แสดงตัวเลือกต่างกันตามสินค้าที่ผู้ใช้เลือกจากหน้าแรก

---

## 1. Overview

ปัจจุบันทุกสินค้าเข้ามาใน Customize page แล้วเห็นตัวเลือกเหมือนกันหมด  
เป้าหมายคือให้แต่ละสินค้ามี **ตัวเลือกวัสดุ, ชุดสี, และ template เฉพาะตัว** โดยไม่เปลี่ยน flow  
(กดการ์ดหน้าแรก → เข้า Customize ทันที ไม่มีหน้าคั่น)

---

## 2. Product Types

มี 3 สินค้า แต่ละชิ้นมี config ต่างกัน:

### 2.1 Cute Fabric (`cute-fabric`)
- **วัสดุรอง:** ผ้า → label ว่า "สีผ้ารอง"
- **ชุดสีผ้า (พาสเทล):**
  | ID | ชื่อ | Hex |
  |----|------|-----|
  | `fabric-cream` | ขาวนม | `#FFF8F0` |
  | `fabric-pink` | ชมพูอ่อน | `#FADADD` |
  | `fabric-blue` | ฟ้าอ่อน | `#D6EAF8` |
  | `fabric-yellow` | เหลืองอ่อน | `#FFF9C4` |
  | `fabric-lavender` | ม่วงอ่อน | `#E8DAEF` |
- **Template ที่เห็นได้:** `temp-cutefabric` เท่านั้น
- **Default templateId:** `temp-cutefabric`

### 2.2 Vintage Lace (`vintage-lace`)
- **วัสดุรอง:** ผ้า → label ว่า "สีผ้ารอง"
- **ชุดสีผ้า (วินเทจ):**
  | ID | ชื่อ | Hex |
  |----|------|-----|
  | `vintage-cream` | ครีม | `#F5F0E8` |
  | `vintage-sand` | น้ำตาลทราย | `#C8A97E` |
  | `vintage-beige` | เบจ | `#E8DCC8` |
  | `vintage-warm-gray` | เทาอุ่น | `#B8B0A8` |
  | `vintage-moss` | เขียวมอส | `#8B9E7A` |
- **Template ที่เห็นได้:** `temp-lacevintage` เท่านั้น
- **Default templateId:** `temp-lacevintage`

### 2.3 Anniversary Card (`anniversary-card`)
- **วัสดุรอง:** กระดาษ → label ว่า "สีกระดาษรอง" (เหมือนเดิม)
- **ชุดสีกระดาษ:** ชุดเดิม (off-white / warm-gray / charcoal / midnight / sage)
- **Template ที่เห็นได้:** `temp-cardred` + `temp-cardegg`
- **Default templateId:** `temp-cardred`

---

## 3. Layout Patterns ใหม่ 4 แบบ (ใช้กับทุกสินค้า)

แทนที่ 4 layout เดิม (`single`, `double-h`, `double-v`, `triple`) ด้วยชุดใหม่:

| ID | ชื่อ | Slots | รายละเอียด |
|----|------|-------|-----------|
| `triple-col` | 3 รูปแนวตั้ง | 3 | เรียงซ้าย-กลาง-ขวา แนวตั้ง (portrait) ในกรอบเดียว |
| `double-v-gap` | 2 รูปบน-ล่าง | 2 | สองรูปแนวตั้ง เว้นระยะกลาง |
| `quad` | 4 รูป (2×2) | 4 | Grid 2 คอลัมน์ 2 แถว เท่ากันทุก slot |
| `single-center` | 1 รูปตรงกลาง | 1 | 1 slot กึ่งกลาง มีขอบขาวรอบ |

### Slot coordinates (% ของ canvas):

```
triple-col:
  slot-1: { x: 5,  y: 8, width: 27, height: 84 }
  slot-2: { x: 36, y: 8, width: 27, height: 84 }
  slot-3: { x: 67, y: 8, width: 27, height: 84 }

double-v-gap:
  slot-1: { x: 10, y: 5,  width: 80, height: 43 }
  slot-2: { x: 10, y: 52, width: 80, height: 43 }

quad:
  slot-1: { x: 5,  y: 5,  width: 43, height: 43 }
  slot-2: { x: 52, y: 5,  width: 43, height: 43 }
  slot-3: { x: 5,  y: 52, width: 43, height: 43 }
  slot-4: { x: 52, y: 52, width: 43, height: 43 }

single-center:
  slot-1: { x: 12, y: 12, width: 76, height: 76 }
```

---

## 4. Data Model Changes

### 4.1 เพิ่มใน `src/types/frame.ts`

```typescript
// Product type identifier
export type ProductType = 'cute-fabric' | 'vintage-lace' | 'anniversary-card';

// Per-product configuration
export interface ProductConfig {
  id: ProductType;
  name: string;
  matLabel: string;                  // e.g. "สีผ้ารอง" หรือ "สีกระดาษรอง"
  matColors: MatColor[];             // ชุดสีเฉพาะสินค้า
  allowedTemplateIds: string[];      // template ที่เห็นได้
  defaultTemplateId: string;
  defaultMatColorId: string;
}

// เพิ่มใน FrameConfig
export interface FrameConfig {
  productType: ProductType;          // <<< เพิ่มใหม่
  mode: 'custom' | 'template';
  orientation: 'portrait' | 'landscape';
  frameStyleId: string;
  matColorId: string;
  layoutId: string;
  templateId: string;
  images: { [slotId: string]: ImageState };
}
```

### 4.2 เพิ่มใน `src/constants/presets.ts`

- `FABRIC_COLORS_CUTE`: MatColor[] — ชุดพาสเทล
- `FABRIC_COLORS_VINTAGE`: MatColor[] — ชุดวินเทจ
- `PRODUCT_CONFIGS`: ProductConfig[] — config ทั้ง 3 สินค้า
- `LAYOUT_PATTERNS` — แทนที่ด้วย 4 layout ใหม่
- Helper function `getProductConfig(productType)` → ProductConfig

---

## 5. Component Changes

### 5.1 `src/app/page.tsx`

- Initial state เพิ่ม `productType: 'anniversary-card'` (default)
- Card แต่ละใบในหน้าแรก เมื่อกดจะ set `productType` + `templateId` + `matColorId` ตาม ProductConfig
- ปรับ initial `matColorId` ให้ reset ตาม `defaultMatColorId` ของสินค้านั้น

### 5.2 `src/components/ControlPanel.tsx`

- รับ `productConfig: ProductConfig` เพิ่มเติม (derive จาก `config.productType`)
- Custom Mode:
  - Label "สีกระดาษรอง" → ใช้ `productConfig.matLabel` แทน
  - Mat color swatches → ใช้ `productConfig.matColors` แทน `MAT_COLORS`
- Template Mode:
  - กรอง `PRESET_TEMPLATES` ให้เหลือเฉพาะ `productConfig.allowedTemplateIds`

---

## 6. Backward Compatibility

- `FrameConfig.productType` จะมี default = `'anniversary-card'` ทำให้ state เดิมที่ไม่มี field นี้ยังทำงานได้ปกติ
- Layout IDs เปลี่ยน → รีเซ็ต `layoutId` เป็น `'single-center'` เมื่อ productType เปลี่ยน

---

## 7. Files to Change

| ไฟล์ | การเปลี่ยนแปลง |
|------|--------------|
| `src/types/frame.ts` | เพิ่ม `ProductType`, `ProductConfig`, `productType` ใน FrameConfig |
| `src/constants/presets.ts` | เพิ่ม fabric colors, product configs, layout ใหม่ 4 แบบ, helper |
| `src/app/page.tsx` | เพิ่ม productType ใน state, ส่ง productConfig ให้ ControlPanel |
| `src/components/ControlPanel.tsx` | ใช้ productConfig ปรับ label, สี, template list |

---

## 8. Out of Scope

- ไม่เปลี่ยน flow หน้าแรก (ยังกดแล้วเข้า Customize ทันที)
- ไม่เพิ่มหน้า Detail page
- ไม่เปลี่ยน FrameCanvas (canvas render logic ไม่ต้องแก้)
- ไม่เปลี่ยน ExportModal
