import { LayoutPattern, FrameStyle, MatColor, PresetTemplate, ProductConfig, ProductType } from '../types/frame';

export const FRAME_STYLES: FrameStyle[] = [
  { id: 'white', name: 'ขาวมินิมอล', color: '#f5f5f5', borderColor: '#ffffff', innerBorderColor: '#e5e5e5' },
  { id: 'black', name: 'ดำโมเดิร์น', color: '#171717', borderColor: '#171717', innerBorderColor: '#404040' },
  { id: 'oak', name: 'ไม้โอ๊คน้ำตาลเข้ม', color: '#5c4033', borderColor: '#3d2b1f', innerBorderColor: '#8b5a2b', woodTexture: true }
];

// ---- Mat Colors: Paper (Anniversary Card) ----
export const MAT_COLORS: MatColor[] = [
  { id: 'off-white',  name: 'ขาวออฟไวท์',       color: '#faf9f6', textColor: '#171717' },
  { id: 'warm-gray',  name: 'เทาอุ่น',           color: '#d4d4d4', textColor: '#171717' },
  { id: 'charcoal',   name: 'เทาเข้ม',           color: '#262626', textColor: '#faf9f6' },
  { id: 'midnight',   name: 'น้ำเงินคราม',        color: '#1e293b', textColor: '#faf9f6' },
  { id: 'sage',       name: 'เขียวใบไม้พาสเทล',  color: '#a3b19b', textColor: '#171717' }
];

// ---- Fabric Colors: Cute Fabric (Pastel) ----
export const FABRIC_COLORS_CUTE: MatColor[] = [
  { id: 'fabric-cream',    name: 'ขาวนม',      color: '#FFF8F0', textColor: '#171717' },
  { id: 'fabric-pink',     name: 'ชมพูอ่อน',   color: '#FADADD', textColor: '#171717' },
  { id: 'fabric-blue',     name: 'ฟ้าอ่อน',    color: '#D6EAF8', textColor: '#171717' },
  { id: 'fabric-yellow',   name: 'เหลืองอ่อน', color: '#FFF9C4', textColor: '#171717' },
  { id: 'fabric-lavender', name: 'ม่วงอ่อน',   color: '#E8DAEF', textColor: '#171717' }
];

// ---- Fabric Colors: Vintage Lace (Vintage/Warm) ----
export const FABRIC_COLORS_VINTAGE: MatColor[] = [
  { id: 'vintage-cream',     name: 'ครีม',        color: '#F5F0E8', textColor: '#171717' },
  { id: 'vintage-sand',      name: 'น้ำตาลทราย', color: '#C8A97E', textColor: '#171717' },
  { id: 'vintage-beige',     name: 'เบจ',         color: '#E8DCC8', textColor: '#171717' },
  { id: 'vintage-warm-gray', name: 'เทาอุ่น',    color: '#B8B0A8', textColor: '#171717' },
  { id: 'vintage-moss',      name: 'เขียวมอส',   color: '#8B9E7A', textColor: '#171717' }
];

// ---- Layout Patterns (4 new layouts replacing old set) ----
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
