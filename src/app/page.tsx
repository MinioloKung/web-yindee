'use client';

import React, { useState } from 'react';
import FrameCanvas from '../components/FrameCanvas';
import ControlPanel from '../components/ControlPanel';
import ExportModal from '../components/ExportModal';
import { FrameConfig, ImageState } from '../types/frame';
import { FRAME_STYLES, MAT_COLORS } from '../constants/presets';

export default function Home() {
  const [config, setConfig] = useState<FrameConfig>({
    mode: 'custom',
    orientation: 'portrait',
    frameStyleId: 'black',
    matColorId: 'off-white',
    layoutId: 'single',
    templateId: 'temp-polaroid',
    images: {}
  });

  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [exportImg, setExportImg] = useState<string>('');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const activeFrame = FRAME_STYLES.find(f => f.id === config.frameStyleId) || FRAME_STYLES[0];
  const activeMat = MAT_COLORS.find(m => m.id === config.matColorId) || MAT_COLORS[0];

  const handleUploadImage = (slotId: string, file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setConfig(prev => ({
      ...prev,
      images: {
        ...prev.images,
        [slotId]: {
          file,
          imageUrl,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0
        }
      }
    }));
  };

  const handleImageStateChange = (slotId: string, updates: Partial<ImageState>) => {
    setConfig(prev => {
      const currentImg = prev.images[slotId];
      if (!currentImg) return prev;
      return {
        ...prev,
        images: {
          ...prev.images,
          [slotId]: {
            ...currentImg,
            ...updates
          }
        }
      };
    });
  };

  const triggerExport = () => {
    // Find hidden high-res canvas
    const canvas = document.getElementById('high-res-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    // Auto-download image file
    const link = document.createElement('a');
    link.download = `yindee-frame-4x6-${Date.now()}.jpg`;
    link.href = dataUrl;
    link.click();

    setExportImg(dataUrl);
    setIsExportOpen(true);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="border-b border-neutral-800 p-4 bg-neutral-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-white">Yindee Frame Customizer</h1>
          <span className="text-xs bg-neutral-800 px-3 py-1 rounded-full text-neutral-400">4x6&quot; Edition</span>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Canvas Preview Area */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4 bg-neutral-900/50 rounded-2xl border border-neutral-800 p-8">
          <div className="flex gap-2">
            <button
              onClick={() => setConfig(prev => ({ ...prev, orientation: 'portrait' }))}
              className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition ${config.orientation === 'portrait' ? 'bg-neutral-800 text-white border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              แนวตั้ง (4x6&quot;)
            </button>
            <button
              onClick={() => setConfig(prev => ({ ...prev, orientation: 'landscape' }))}
              className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition ${config.orientation === 'landscape' ? 'bg-neutral-800 text-white border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              แนวนอน (6x4&quot;)
            </button>
          </div>

          {/* Visible Canvas Preview */}
          <FrameCanvas
            config={config}
            activeSlotId={activeSlotId}
            setActiveSlotId={setActiveSlotId}
            highResExport={false}
            onImageStateChange={handleImageStateChange}
          />

          {/* Hidden Canvas for High-Resolution Export */}
          <div style={{ display: 'none' }}>
            <FrameCanvas
              id="high-res-canvas"
              config={config}
              activeSlotId={null}
              setActiveSlotId={() => {}}
              highResExport={true}
            />
          </div>

          <button
            onClick={triggerExport}
            className="mt-4 w-full max-w-[400px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            สรุปแบบและดาวน์โหลดรูปเพื่อสั่งซื้อ
          </button>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-5 bg-neutral-900/50 rounded-2xl border border-neutral-800 p-6">
          <ControlPanel
            config={config}
            setConfig={setConfig}
            activeSlotId={activeSlotId}
            onUploadImage={handleUploadImage}
          />
        </div>
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        imageSrc={exportImg}
        config={config}
        frameName={activeFrame.name}
        matName={activeMat.name}
      />
    </main>
  );
}
