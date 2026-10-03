import React, { useRef, useState, useEffect } from 'react';
import { X, Check, RotateCcw, Paintbrush, Eraser } from 'lucide-react';

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrawing: (dataUrl: string) => void;
}

const BRUSH_COLORS = [
  '#000000',
  '#d93025',
  '#1a73e8',
  '#1e8e3e',
  '#f9ab00',
  '#9334e6',
  '#e37400',
  '#ffffff',
];

export const DrawingModal: React.FC<DrawingModalProps> = ({
  isOpen,
  onClose,
  onSaveDrawing,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 650;
    canvas.height = 420;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveDrawing(dataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#202124] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#282a2d]">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-700 dark:text-gray-200">
              Drawing Note
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Tool Selection */}
            <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setTool('pen')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                  tool === 'pen'
                    ? 'bg-white dark:bg-[#202124] shadow-xs text-amber-600 dark:text-amber-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>Pen</span>
              </button>
              <button
                type="button"
                onClick={() => setTool('eraser')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${
                  tool === 'eraser'
                    ? 'bg-white dark:bg-[#202124] shadow-xs text-amber-600 dark:text-amber-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Eraser</span>
              </button>
            </div>

            {/* Stroke Width */}
            <div className="flex items-center gap-1.5">
              {[2, 4, 8, 14].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setLineWidth(w)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    lineWidth === w
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span
                    className="rounded-full bg-gray-800 dark:bg-gray-200"
                    style={{ width: w, height: w }}
                  />
                </button>
              ))}
            </div>

            {/* Colors */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1">
                {BRUSH_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-5 h-5 rounded-full border ${
                      color === c
                        ? 'ring-2 ring-amber-500 ring-offset-1'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleClear}
              title="Clear canvas"
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas Area */}
        <div className="p-3 bg-gray-100 dark:bg-[#1a1a1c] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="bg-white rounded-lg shadow-inner cursor-crosshair max-w-full touch-none border border-gray-300"
            style={{ width: '100%', height: '360px', objectFit: 'contain' }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 bg-white dark:bg-[#202124] border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-1.5 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white font-medium flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Add Drawing</span>
          </button>
        </div>
      </div>
    </div>
  );
};
