'use client';

import React, { useRef, useEffect, useState } from 'react';
import { FrameConfig, ImageState } from '../types/frame';
import { FRAME_STYLES, MAT_COLORS, LAYOUT_PATTERNS, PRESET_TEMPLATES } from '../constants/presets';

interface FrameCanvasProps {
  config: FrameConfig;
  activeSlotId: string | null;
  setActiveSlotId: (id: string | null) => void;
  highResExport?: boolean;
  onImageStateChange?: (slotId: string, updates: Partial<ImageState>) => void;
}

export default function FrameCanvas({
  config,
  activeSlotId,
  setActiveSlotId,
  highResExport = false,
  onImageStateChange,
}: FrameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  // Prevent default scrolling on touch devices when dragging
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchMoveRaw = (e: TouchEvent) => {
      if (isDragging) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    canvas.addEventListener('touchmove', handleTouchMoveRaw, { passive: false });
    return () => {
      canvas.removeEventListener('touchmove', handleTouchMoveRaw);
    };
  }, [isDragging]);

  // Get active presets
  const activeFrame = FRAME_STYLES.find((f) => f.id === config.frameStyleId) || FRAME_STYLES[0];
  const activeMat = MAT_COLORS.find((m) => m.id === config.matColorId) || MAT_COLORS[0];
  const activeLayout = LAYOUT_PATTERNS.find((l) => l.id === config.layoutId) || LAYOUT_PATTERNS[0];
  const activeTemplate = PRESET_TEMPLATES.find((t) => t.id === config.templateId) || PRESET_TEMPLATES[0];

  const slotsToDraw = config.mode === 'custom' ? activeLayout.slots : activeTemplate.slots;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isCurrent = true;

    const baseWidth = highResExport ? 2400 : 800;
    const baseHeight = highResExport ? 3600 : 1200;

    // Handle orientation
    const width = config.orientation === 'portrait' ? baseWidth : baseHeight;
    const height = config.orientation === 'portrait' ? baseHeight : baseWidth;

    const scaleFactor = width / 800;

    // Load slot images asynchronously with caching
    const slotImagePromises = slotsToDraw.map((slot) => {
      const imgState = config.images[slot.id];
      if (imgState && imgState.imageUrl) {
        const url = imgState.imageUrl;
        if (imageCacheRef.current[url]) {
          return Promise.resolve({ id: slot.id, img: imageCacheRef.current[url] });
        }
        return new Promise<{ id: string; img: HTMLImageElement } | null>((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCacheRef.current[url] = img;
            resolve({ id: slot.id, img });
          };
          img.onerror = () => {
            resolve(null);
          };
          img.src = url;
        });
      }
      return Promise.resolve(null);
    });

    // Load template overlay image asynchronously if in template mode with caching
    const templateImagePromise =
      config.mode === 'template' && activeTemplate && activeTemplate.imageUrl
        ? (() => {
            const url = activeTemplate.imageUrl;
            if (imageCacheRef.current[url]) {
              return Promise.resolve(imageCacheRef.current[url]);
            }
            return new Promise<HTMLImageElement | null>((resolve) => {
              const img = new Image();
              img.onload = () => {
                imageCacheRef.current[url] = img;
                resolve(img);
              };
              img.onerror = () => {
                resolve(null);
              };
              img.src = url;
            });
          })()
        : Promise.resolve(null);

    Promise.all([Promise.all(slotImagePromises), templateImagePromise]).then(
      ([loadedSlotImages, loadedTemplateImage]) => {
        if (!isCurrent) return;

        // Create mapping of loaded images
        const imgMap: { [slotId: string]: HTMLImageElement } = {};
        loadedSlotImages.forEach((item) => {
          if (item) {
            imgMap[item.id] = item.img;
          }
        });

        // Set dimensions
        canvas.width = width;
        canvas.height = height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // 1. Draw Outer Frame Border
        const borderWidth = width * 0.08;
        ctx.fillStyle = activeFrame.color;
        ctx.fillRect(0, 0, width, height);

        // Wood texture overlay simulator
        if (activeFrame.woodTexture) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
          for (let i = 0; i < height; i += 4 * scaleFactor) {
            ctx.fillRect(0, i, width, 2 * scaleFactor);
          }
        }

        // Frame Inner Border Bevel Shadow
        ctx.strokeStyle = activeFrame.innerBorderColor;
        ctx.lineWidth = width * 0.005;
        ctx.strokeRect(
          borderWidth / 2,
          borderWidth / 2,
          width - borderWidth,
          height - borderWidth
        );

        // 2. Draw Mat Board Background
        const matX = borderWidth;
        const matY = borderWidth;
        const matWidth = width - borderWidth * 2;
        const matHeight = height - borderWidth * 2;
        ctx.fillStyle = activeMat.color;
        ctx.fillRect(matX, matY, matWidth, matHeight);

        // 3. Draw Layout Slots
        slotsToDraw.forEach((slot) => {
          const slotX = matX + (slot.x / 100) * matWidth;
          const slotY = matY + (slot.y / 100) * matHeight;
          const slotW = (slot.width / 100) * matWidth;
          const slotH = (slot.height / 100) * matHeight;

          // Draw image if exists
          const img = imgMap[slot.id];
          const imgState = config.images[slot.id];

          if (img && imgState) {
            ctx.save();

            // Bevel Inner White Cut around photo
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 * scaleFactor;
            ctx.strokeRect(slotX, slotY, slotW, slotH);

            // Apply clipping path to crop image inside slot
            ctx.beginPath();
            ctx.rect(slotX, slotY, slotW, slotH);
            ctx.clip();

            ctx.translate(
              slotX + slotW / 2 + imgState.x * scaleFactor,
              slotY + slotH / 2 + imgState.y * scaleFactor
            );
            ctx.rotate((imgState.rotation * Math.PI) / 180);

            // Calculate scale retaining ratio (object-fit: cover)
            const baseScale = Math.max(slotW / img.width, slotH / img.height);
            const scaleWidth = img.width * baseScale * imgState.scale;
            const scaleHeight = img.height * baseScale * imgState.scale;

            ctx.drawImage(img, -scaleWidth / 2, -scaleHeight / 2, scaleWidth, scaleHeight);

            // Inner Bevel Shadow over the image
            ctx.restore();
            ctx.save();
            ctx.beginPath();
            ctx.rect(slotX, slotY, slotW, slotH);
            ctx.clip();
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 6 * scaleFactor;
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 4 * scaleFactor;
            ctx.strokeRect(slotX, slotY, slotW, slotH);
            ctx.restore();
          } else {
            // Placeholder grey slot
            ctx.fillStyle = '#e5e5e5';
            ctx.fillRect(slotX, slotY, slotW, slotH);

            // Bevel White Inner Cut
            ctx.strokeStyle = '#d4d4d4';
            ctx.lineWidth = 1 * scaleFactor;
            ctx.strokeRect(slotX, slotY, slotW, slotH);

            // Draw placeholder plus icon text
            ctx.fillStyle = '#737373';
            ctx.font = `${16 * scaleFactor}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('คลิกอัปโหลดรูปภาพ', slotX + slotW / 2, slotY + slotH / 2);
          }

          // Active Slot Highlight
          if (slot.id === activeSlotId) {
            ctx.save();
            ctx.strokeStyle = '#3b82f6'; // Premium primary blue highlight
            ctx.lineWidth = 3 * scaleFactor;
            ctx.setLineDash([8 * scaleFactor, 4 * scaleFactor]);
            ctx.strokeRect(slotX - 1, slotY - 1, slotW + 2, slotH + 2);
            ctx.restore();
          }
        });

        // 4. Draw Template Overlay (if active and exists)
        if (config.mode === 'template' && loadedTemplateImage) {
          ctx.drawImage(loadedTemplateImage, matX, matY, matWidth, matHeight);
        }
      }
    );

    return () => {
      isCurrent = false;
    };
  }, [
    config,
    activeSlotId,
    highResExport,
    activeFrame,
    activeMat,
    activeLayout,
    activeTemplate,
    slotsToDraw,
  ]);

  // Start drag handler
  const handleStartDrag = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

    if (clientX === undefined || clientY === undefined) return;

    // Scale display coords to internal canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    const baseWidth = highResExport ? 2400 : 800;
    const baseHeight = highResExport ? 3600 : 1200;
    const width = config.orientation === 'portrait' ? baseWidth : baseHeight;
    const height = config.orientation === 'portrait' ? baseHeight : baseWidth;

    const borderWidth = width * 0.08;
    const matX = borderWidth;
    const matY = borderWidth;
    const matWidth = width - borderWidth * 2;
    const matHeight = height - borderWidth * 2;

    let clickedSlotId: string | null = null;

    for (const slot of slotsToDraw) {
      const slotX = matX + (slot.x / 100) * matWidth;
      const slotY = matY + (slot.y / 100) * matHeight;
      const slotW = (slot.width / 100) * matWidth;
      const slotH = (slot.height / 100) * matHeight;

      if (
        canvasX >= slotX &&
        canvasX <= slotX + slotW &&
        canvasY >= slotY &&
        canvasY <= slotY + slotH
      ) {
        clickedSlotId = slot.id;
        break;
      }
    }

    setActiveSlotId(clickedSlotId);

    // If clicked slot has an uploaded image, begin tracking drag
    if (clickedSlotId && config.images[clickedSlotId]?.imageUrl) {
      setDragStart({ x: clientX, y: clientY });
      setIsDragging(true);
    }
  };

  // Drag handler
  const handleDrag = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDragging || !activeSlotId || !dragStart) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY;

    if (clientX === undefined || clientY === undefined) return;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;

    const rect = canvas.getBoundingClientRect();
    const scale = 800 / rect.width;
    const deltaCanvasX = deltaX * scale;
    const deltaCanvasY = deltaY * scale;

    const currentImage = config.images[activeSlotId];
    if (currentImage && onImageStateChange) {
      onImageStateChange(activeSlotId, {
        x: currentImage.x + deltaCanvasX,
        y: currentImage.y + deltaCanvasY,
      });
    }

    setDragStart({ x: clientX, y: clientY });
  };

  // End drag handler
  const handleEndDrag = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const aspectClass = config.orientation === 'portrait' ? 'aspect-[2/3]' : 'aspect-[3/2]';

  return (
    <div className={`relative w-full ${aspectClass} max-w-[400px] shadow-2xl rounded-lg overflow-hidden border border-neutral-800`}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleStartDrag}
        onMouseMove={handleDrag}
        onMouseUp={handleEndDrag}
        onMouseLeave={handleEndDrag}
        onTouchStart={handleStartDrag}
        onTouchMove={handleDrag}
        onTouchEnd={handleEndDrag}
        onTouchCancel={handleEndDrag}
        className="w-full h-full object-contain cursor-crosshair"
        style={{ touchAction: isDragging ? 'none' : 'auto' }}
      />
    </div>
  );
}
