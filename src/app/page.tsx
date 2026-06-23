'use client';

import React, { useState, useEffect, useRef } from 'react';
import FrameCanvas from '../components/FrameCanvas';
import ControlPanel from '../components/ControlPanel';
import ExportModal from '../components/ExportModal';
import { FrameConfig, ImageState } from '../types/frame';
import { FRAME_STYLES, MAT_COLORS, PRESET_TEMPLATES } from '../constants/presets';

export default function Home() {
  const [config, rawSetConfig] = useState<FrameConfig>({
    mode: 'custom',
    orientation: 'portrait',
    frameStyleId: 'black',
    matColorId: 'off-white',
    layoutId: 'single',
    templateId: PRESET_TEMPLATES[0]?.id || 'temp-polaroid',
    images: {}
  });

  // Custom setConfig wrapper to force portrait orientation in template mode
  const setConfig: React.Dispatch<React.SetStateAction<FrameConfig>> = (value) => {
    rawSetConfig(prev => {
      const resolved = typeof value === 'function' ? (value as (p: FrameConfig) => FrameConfig)(prev) : value;
      if (resolved.mode === 'template' && resolved.orientation !== 'portrait') {
        return {
          ...resolved,
          orientation: 'portrait'
        };
      }
      return resolved;
    });
  };

  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [exportImg, setExportImg] = useState<string>('');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [exportConfig, setExportConfig] = useState<FrameConfig | null>(null);

  const activeFrame = FRAME_STYLES.find(f => f.id === config.frameStyleId) || FRAME_STYLES[0];
  const activeMat = MAT_COLORS.find(m => m.id === config.matColorId) || MAT_COLORS[0];

  const handleUploadImage = (slotId: string, file: File) => {
    // Revoke previous object URL to prevent memory leaks
    const prevUrl = config.images[slotId]?.imageUrl;
    if (prevUrl) {
      URL.revokeObjectURL(prevUrl);
    }

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

  // Keep config in a ref to safely reference the latest state during unmount cleanup
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Clean up all Object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      const currentImages = configRef.current.images;
      Object.values(currentImages).forEach((img) => {
        if (img.imageUrl) {
          URL.revokeObjectURL(img.imageUrl);
        }
      });
    };
  }, []);

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
    // Set config for high-res export and allow React to mount the canvas
    setExportConfig(config);

    setTimeout(() => {
      // Find hidden high-res canvas
      const canvas = document.getElementById('high-res-canvas') as HTMLCanvasElement;
      if (!canvas) {
        setExportConfig(null);
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      
      // Auto-download image file
      const link = document.createElement('a');
      link.download = `yindee-frame-10x15-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setExportImg(dataUrl);
      setIsExportOpen(true);
      
      // Reset exportConfig to unmount hidden canvas and reclaim memory
      setExportConfig(null);
    }, 250);
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="border-b border-neutral-800 p-4 bg-neutral-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-white">Yindee Frame Customizer</h1>
          <span className="text-xs bg-neutral-800 px-3 py-1 rounded-full text-neutral-400">10x15 cm (4x6&quot;) Edition</span>
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
              แนวตั้ง (10x15 ซม.)
            </button>
            {config.mode !== 'template' && (
              <button
                onClick={() => setConfig(prev => ({ ...prev, orientation: 'landscape' }))}
                className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition ${config.orientation === 'landscape' ? 'bg-neutral-800 text-white border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                แนวนอน (15x10 ซม.)
              </button>
            )}
          </div>

          {/* Visible Canvas Preview */}
          <FrameCanvas
            config={config}
            activeSlotId={activeSlotId}
            setActiveSlotId={setActiveSlotId}
            highResExport={false}
            onImageStateChange={handleImageStateChange}
          />

          {/* Hidden Canvas for High-Resolution Export - mounted only during export */}
          {exportConfig && (
            <div style={{ display: 'none' }}>
              <FrameCanvas
                id="high-res-canvas"
                config={exportConfig}
                activeSlotId={null}
                setActiveSlotId={() => {}}
                highResExport={true}
              />
            </div>
          )}

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
