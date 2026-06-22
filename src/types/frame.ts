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

export interface FrameConfig {
  mode: 'custom' | 'template';
  orientation: 'portrait' | 'landscape';
  frameStyleId: string;
  matColorId: string;
  layoutId: string;
  templateId: string;
  images: { [slotId: string]: ImageState };
}
