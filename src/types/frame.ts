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
  color: string;
  borderColor: string;
  innerBorderColor: string;
  woodTexture?: boolean;
}

export interface MatColor {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

export interface PresetTemplate {
  id: string;
  name: string;
  imageUrl: string;
  slots: LayoutSlot[];
}

export type ProductType = 'cute-fabric' | 'vintage-lace' | 'anniversary-card';

export interface ProductConfig {
  id: ProductType;
  name: string;
  matLabel: string;
  matColors: MatColor[];
  allowedTemplateIds: string[];
  defaultTemplateId: string;
  defaultMatColorId: string;
}

export interface FrameConfig {
  productType: ProductType;
  mode: 'custom' | 'template';
  orientation: 'portrait' | 'landscape';
  frameStyleId: string;
  matColorId: string;
  layoutId: string;
  templateId: string;
  images: { [slotId: string]: ImageState };
}
