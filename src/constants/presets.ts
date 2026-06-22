import { LayoutPattern, FrameStyle, MatColor, PresetTemplate } from '../types/frame';

export const FRAME_STYLES: FrameStyle[] = [
  { id: 'white', name: 'ขาวมินิมอล', color: '#f5f5f5', borderColor: '#ffffff', innerBorderColor: '#e5e5e5' },
  { id: 'black', name: 'ดำโมเดิร์น', color: '#171717', borderColor: '#171717', innerBorderColor: '#404040' },
  { id: 'oak', name: 'ไม้โอ๊คน้ำตาลเข้ม', color: '#5c4033', borderColor: '#3d2b1f', innerBorderColor: '#8b5a2b', woodTexture: true }
];

export const MAT_COLORS: MatColor[] = [
  { id: 'off-white', name: 'ขาวออฟไวท์', color: '#faf9f6', textColor: '#171717' },
  { id: 'warm-gray', name: 'เทาอุ่น', color: '#d4d4d4', textColor: '#171717' },
  { id: 'charcoal', name: 'เทาเข้ม', color: '#262626', textColor: '#faf9f6' },
  { id: 'midnight', name: 'น้ำเงินคราม', color: '#1e293b', textColor: '#faf9f6' },
  { id: 'sage', name: 'เขียวใบไม้พาสเทล', color: '#a3b19b', textColor: '#171717' }
];

export const LAYOUT_PATTERNS: LayoutPattern[] = [
  {
    id: 'single',
    name: '1 รูป (เต็มกรอบ)',
    slots: [
      { id: 'slot-1', x: 8, y: 8, width: 84, height: 84 }
    ]
  },
  {
    id: 'double-h',
    name: '2 รูป (ซ้าย-ขวา)',
    slots: [
      { id: 'slot-1', x: 8, y: 8, width: 40, height: 84 },
      { id: 'slot-2', x: 52, y: 8, width: 40, height: 84 }
    ]
  },
  {
    id: 'double-v',
    name: '2 รูป (บน-ล่าง)',
    slots: [
      { id: 'slot-1', x: 8, y: 8, width: 84, height: 40 },
      { id: 'slot-2', x: 8, y: 52, width: 84, height: 40 }
    ]
  },
  {
    id: 'triple',
    name: '3 รูป (คอลลาจ)',
    slots: [
      { id: 'slot-1', x: 8, y: 8, width: 84, height: 35 },
      { id: 'slot-2', x: 8, y: 47, width: 40, height: 45 },
      { id: 'slot-3', x: 52, y: 47, width: 40, height: 45 }
    ]
  }
];

export const PRESET_TEMPLATES: PresetTemplate[] = [
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
  }
];
