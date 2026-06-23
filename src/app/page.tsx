'use client';

import React, { useState, useEffect, useRef } from 'react';
import FrameCanvas from '../components/FrameCanvas';
import ControlPanel from '../components/ControlPanel';
import ExportModal from '../components/ExportModal';
import { FrameConfig, ImageState } from '../types/frame';
import { FRAME_STYLES, MAT_COLORS, PRESET_TEMPLATES, getProductConfig } from '../constants/presets';

export default function Home() {
  const [view, setView] = useState<'home' | 'customize'>('home');
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

  const productConfig = getProductConfig(config.productType);
  const activeFrame = FRAME_STYLES.find(f => f.id === config.frameStyleId) || FRAME_STYLES[0];
  const activeMat = productConfig.matColors.find(m => m.id === config.matColorId) || productConfig.matColors[0];

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
    <main className="min-h-screen bg-background text-[#2D2219] flex flex-col font-sans">
      <header className="border-b border-stone-200 p-4 bg-white/80 backdrop-blur sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {view === 'customize' && (
              <button
                onClick={() => setView('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 text-[#2D2219]/80 hover:bg-stone-200 transition cursor-pointer"
              >
                ← กลับหน้าหลัก
              </button>
            )}
            <h1 className="text-xl font-bold tracking-tight text-[#2D2219]">Yindee Frame</h1>
          </div>
          <span className="text-xs bg-stone-100 px-3 py-1 rounded-full text-[#2D2219]/70 font-medium">10x15 cm (4x6&quot;) Edition</span>
        </div>
      </header>

      {view === 'home' ? (
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-12 flex flex-col gap-12">
          {/* Landing Banner */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-100/30 border border-orange-100/50 rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#2D2219] mb-4 tracking-tight">
              บันทึกความทรงจำแสนอบอุ่นในกรอบรูปสุดพิเศษ
            </h2>
            <p className="text-[#2D2219]/80 text-sm md:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
              ออกแบบกรอบรูป Yindee Frame ขนาด 10x15 ซม. (4x6 นิ้ว) ของคุณเองได้ง่ายๆ
              เลือกสรรสไตล์และลวดลายสำเร็จรูปสุดพรีเมียม หรือเลือกจัดวางรูปภาพด้วยตัวคุณเองอย่างอิสระ
            </p>
            <button
              onClick={() => {
                setConfig(prev => ({
                  ...prev,
                  productType: 'anniversary-card',
                  mode: 'custom',
                  layoutId: 'single-center'
                }));
                setView('customize');
              }}
              className="bg-[#5C4033] hover:bg-[#3D2B1F] text-white font-semibold py-3 px-8 rounded-xl transition shadow-md hover:shadow-lg transform cursor-pointer text-sm"
            >
              เริ่มต้นออกแบบกรอบรูป
            </button>
          </div>

          {/* Catalog Grid */}
          <div className="flex flex-col gap-8">
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-bold text-[#2D2219] mb-2">เลือกสไตล์เริ่มต้นสำหรับกรอบรูป</h3>
              <p className="text-[#2D2219]/60 text-xs md:text-sm">เลือกสรรดีไซน์สำเร็จรูปที่คุณชอบเพื่อปรับแต่งภาพถ่ายของคุณต่อ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
              {/* Cute Fabric Card */}
              <div
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
                className="group bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
              >
                <div className="aspect-[2/3] w-full bg-stone-50 relative flex items-center justify-center border-b border-stone-100 p-4 overflow-hidden">
                  <img
                    src="/templates/cute-fabric.svg"
                    alt="Cute Fabric Design"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Cute Fabric
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-bold text-base text-[#2D2219] mb-2 group-hover:text-[#5C4033] transition-colors">
                    ดีไซน์ Cute หวานละมุน พื้นหลังผ้า
                  </h4>
                  <p className="text-xs text-[#2D2219]/70 mb-6 flex-1 leading-relaxed">
                    ลวดลายน่ารักสดใสสไตล์แฮนด์เมด บนพื้นหลังสัมผัสผ้าธรรมชาติ เหมาะสำหรับภาพความทรงจำที่แสนหวานอบอุ่น
                  </p>
                  <button className="w-full bg-[#5C4033] hover:bg-[#3D2B1F] text-white font-medium py-2.5 rounded-xl text-xs transition cursor-pointer">
                    เลือกดีไซน์นี้
                  </button>
                </div>
              </div>

              {/* Vintage Lace Card */}
              <div
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
                className="group bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
              >
                <div className="aspect-[2/3] w-full bg-stone-50 relative flex items-center justify-center border-b border-stone-100 p-4 overflow-hidden">
                  <img
                    src="/templates/lace-vintage.svg"
                    alt="Vintage Lace Design"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Vintage Lace
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-bold text-base text-[#2D2219] mb-2 group-hover:text-[#5C4033] transition-colors">
                    ลายลูกไม้วินเทจ พื้นหลังผ้ากระสอบ
                  </h4>
                  <p className="text-xs text-[#2D2219]/70 mb-6 flex-1 leading-relaxed">
                    ความคลาสสิกของลายลูกไม้ขาวละมุนตา ด้วยสีพื้นหลังกระสอบ สร้างสรรค์ภาพถ่ายในสไตล์เรโทรและวินเทจได้อย่างสวยงาม
                  </p>
                  <button className="w-full bg-[#5C4033] hover:bg-[#3D2B1F] text-white font-medium py-2.5 rounded-xl text-xs transition cursor-pointer">
                    เลือกดีไซน์นี้
                  </button>
                </div>
              </div>

              {/* Anniversary Playing Cards / Custom Card */}
              <div
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
                className="group bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer"
              >
                <div className="aspect-[2/3] w-full bg-stone-50 relative flex items-center justify-center border-b border-stone-100 p-4 overflow-hidden">
                  <img
                    src="/templates/CardRed.png"
                    alt="Anniversary Playing Cards / Custom Design"
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 bg-[#5C4033]/10 text-[#5C4033] text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Anniversary / Custom
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h4 className="font-bold text-base text-[#2D2219] mb-2 group-hover:text-[#5C4033] transition-colors">
                    กรอบรูปการ์ดครบรอบ / ออกแบบเอง
                  </h4>
                  <p className="text-xs text-[#2D2219]/70 mb-6 flex-1 leading-relaxed">
                    ดีไซน์กรอบรูปสไตล์การ์ดวันครบรอบสุดเก๋ หรือเลือกจัดวางภาพถ่ายของคุณเองได้อย่างอิสระแบบไม่มีข้อจำกัด
                  </p>
                  <button className="w-full bg-[#5C4033] hover:bg-[#3D2B1F] text-white font-medium py-2.5 rounded-xl text-xs transition cursor-pointer">
                    เลือกสไตล์นี้ / ออกแบบเอง
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Canvas Preview Area */}
          <div className="lg:col-span-7 flex flex-col items-center gap-6 bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setConfig(prev => ({ ...prev, orientation: 'portrait' }))}
                className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition cursor-pointer ${config.orientation === 'portrait' ? 'bg-[#5C4033] text-white shadow-sm' : 'text-[#2D2219]/70 hover:text-[#2D2219] hover:bg-stone-100'}`}
              >
                แนวตั้ง (10x15 ซม.)
              </button>
              {config.mode !== 'template' && (
                <button
                  onClick={() => setConfig(prev => ({ ...prev, orientation: 'landscape' }))}
                  className={`py-1.5 px-4 text-xs font-semibold rounded-lg transition cursor-pointer ${config.orientation === 'landscape' ? 'bg-[#5C4033] text-white shadow-sm' : 'text-[#2D2219]/70 hover:text-[#2D2219] hover:bg-stone-100'}`}
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
              className="mt-4 w-full max-w-[400px] bg-[#5C4033] hover:bg-[#3D2B1F] text-white font-semibold py-3 px-6 rounded-xl transition shadow-md cursor-pointer"
            >
              สรุปแบบและดาวน์โหลดรูปเพื่อสั่งซื้อ
            </button>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <ControlPanel
              config={config}
              setConfig={setConfig}
              activeSlotId={activeSlotId}
              onUploadImage={handleUploadImage}
              productConfig={productConfig}
            />
          </div>
        </div>
      )}

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
