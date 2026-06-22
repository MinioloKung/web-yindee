'use client';

import React from 'react';
import { FrameConfig, ImageState } from '../types/frame';
import { FRAME_STYLES, MAT_COLORS, LAYOUT_PATTERNS, PRESET_TEMPLATES } from '../constants/presets';
import { Upload, RotateCw, ZoomIn, Grid, Palette, Sliders } from 'lucide-react';

interface ControlPanelProps {
  config: FrameConfig;
  setConfig: React.Dispatch<React.SetStateAction<FrameConfig>>;
  activeSlotId: string | null;
  onUploadImage: (slotId: string, file: File) => void;
}

export default function ControlPanel({ config, setConfig, activeSlotId, onUploadImage }: ControlPanelProps) {
  const handleFrameChange = (id: string) => setConfig(prev => ({ ...prev, frameStyleId: id }));
  const handleMatChange = (id: string) => setConfig(prev => ({ ...prev, matColorId: id }));
  const handleLayoutChange = (id: string) => setConfig(prev => ({ ...prev, layoutId: id }));

  const handleSliderChange = (param: 'scale' | 'rotation', val: number) => {
    if (!activeSlotId) return;
    setConfig(prev => ({
      ...prev,
      images: {
        ...prev.images,
        [activeSlotId]: {
          ...prev.images[activeSlotId],
          [param]: val
        }
      }
    }));
  };

  const activeImageState = activeSlotId ? config.images[activeSlotId] : null;
  const scale = activeImageState?.scale ?? 1.0;
  const rotation = activeImageState?.rotation ?? 0;

  return (
    <div className="space-y-6">
      {/* Toggle Mode */}
      <div className="flex bg-neutral-800 p-1 rounded-xl">
        <button
          onClick={() => setConfig(prev => ({ ...prev, mode: 'custom' }))}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${config.mode === 'custom' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
        >
          ออกแบบเอง
        </button>
        <button
          onClick={() => setConfig(prev => ({ ...prev, mode: 'template' }))}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${config.mode === 'template' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
        >
          เทมเพลตสำเร็จรูป
        </button>
      </div>

      {config.mode === 'custom' ? (
        <>
          {/* Custom Mode Tools */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-3">
              <Grid size={14} /> แพทเทิร์นการจัดวาง
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LAYOUT_PATTERNS.map(layout => (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutChange(layout.id)}
                  className={`p-3 text-xs rounded-xl border text-center transition ${config.layoutId === layout.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'}`}
                >
                  {layout.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-3">
              สีกรอบนอก
            </label>
            <div className="flex gap-2">
              {FRAME_STYLES.map(frame => (
                <button
                  key={frame.id}
                  onClick={() => handleFrameChange(frame.id)}
                  className={`flex-1 py-2 px-3 text-xs rounded-xl border text-center transition ${config.frameStyleId === frame.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'}`}
                >
                  {frame.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-3">
              <Palette size={14} /> สีกระดาษรองการ์ด
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MAT_COLORS.map(mat => (
                <button
                  key={mat.id}
                  onClick={() => handleMatChange(mat.id)}
                  style={{ backgroundColor: mat.color }}
                  className={`w-full aspect-square rounded-full border-2 transition ${config.matColorId === mat.id ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-105'}`}
                  title={mat.name}
                />
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Template Mode Tools */
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2 mb-3">
            เลือกดีไซน์เทมเพลต
          </label>
          <div className="grid grid-cols-1 gap-3">
            {PRESET_TEMPLATES.map(temp => (
              <button
                key={temp.id}
                onClick={() => setConfig(prev => ({ ...prev, templateId: temp.id }))}
                className={`p-4 rounded-xl border text-left flex items-center gap-3 transition ${config.templateId === temp.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'}`}
              >
                <div className="w-12 h-16 bg-neutral-800 rounded border border-neutral-700 flex items-center justify-center">
                  🖼️
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{temp.name}</h4>
                  <p className="text-xs text-neutral-500">4x6 นิ้ว</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upload & Alignment Area */}
      {activeSlotId && (
        <div className="border-t border-neutral-800 pt-6 space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Sliders size={14} /> เครื่องมือปรับรูปภาพ
          </label>

          {/* Custom File Upload */}
          <div className="flex gap-4">
            <label className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-2">
              <Upload size={16} /> อัปโหลดรูปภาพใหม่
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadImage(activeSlotId, file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          {activeImageState && activeImageState.imageUrl && (
            <div className="space-y-4 pt-2">
              {/* Scale zoom slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1"><ZoomIn size={12} /> ขนาดภาพ (ซูม)</span>
                  <span>{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={scale}
                  onChange={(e) => handleSliderChange('scale', parseFloat(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Rotation degrees slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1"><RotateCw size={12} /> มุมหมุนภาพ</span>
                  <span>{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={rotation}
                  onChange={(e) => handleSliderChange('rotation', parseInt(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
