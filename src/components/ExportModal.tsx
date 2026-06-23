'use client';

import React from 'react';
import { X, Send, Clipboard } from 'lucide-react';
import { FrameConfig } from '../types/frame';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  config: FrameConfig;
  frameName: string;
  matName: string;
}

export default function ExportModal({ isOpen, onClose, imageSrc, config, frameName, matName }: ExportModalProps) {
  if (!isOpen) return null;

  const orderText = `สวัสดีครับ สนใจสั่งซื้อกรอบรูปขนาด 10x15 ซม. (4x6 นิ้ว) ครับ
- รูปแบบ: ${config.mode === 'custom' ? 'ออกแบบเอง (Custom)' : 'ดีไซน์สำเร็จรูป (Template)'}
- สีกรอบรูป: ${frameName}
- สีกระดาษรอง: ${config.mode === 'custom' ? matName : 'ตามรูปแบบดีไซน์'}
(ได้อัปโหลดไฟล์ดีไซน์ที่แนบมานี้ด้วยครับ)`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(orderText);
      alert('คัดลอกข้อความสรุปดีไซน์เรียบร้อยแล้ว!');
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = orderText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('คัดลอกข้อความสรุปดีไซน์เรียบร้อยแล้ว!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h3 className="font-bold text-lg text-white">สรุปการออกแบบและสั่งซื้อ</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="aspect-[2/3] max-w-[200px] mx-auto rounded-lg overflow-hidden border border-neutral-800 shadow-xl bg-neutral-950">
            <img src={imageSrc} className="w-full h-full object-contain" alt="Final Design" />
          </div>

          <div className="bg-neutral-950/50 p-4 rounded-xl border border-neutral-800 text-xs space-y-2 text-neutral-300 font-mono">
            <p className="font-bold text-neutral-200">ข้อความสำหรับส่งร้านค้า:</p>
            <pre className="whitespace-pre-wrap">{orderText}</pre>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 py-3 px-4 rounded-xl text-sm font-medium transition text-white"
            >
              <Clipboard size={16} /> คัดลอกรายละเอียด
            </button>
            <a
              href="https://line.me/R/ti/p/@yindeeframe" /* Prefilled store LINE URL */
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-3 px-4 rounded-xl text-sm font-medium transition text-white"
            >
              <Send size={16} /> ส่งคำสั่งซื้อใน LINE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
