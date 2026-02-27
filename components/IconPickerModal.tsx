
import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import { Sparkles, Image as ImageIcon, Check, Upload, X, Crop, ZoomIn, ZoomOut } from 'lucide-react';
import { SYSTEM_ICONS, getIcon } from '../constants';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { icon: string; iconType: 'icon' | 'image'; iconBgColor?: string }) => void;
  initialValue?: { icon: string; iconType: 'icon' | 'image'; iconBgColor?: string };
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onConfirm, initialValue }) => {
  const [activeTab, setActiveTab] = useState<'system' | 'image'>(initialValue?.iconType === 'image' ? 'image' : 'system');
  const [selectedIcon, setSelectedIcon] = useState(initialValue?.icon || SYSTEM_ICONS[0].name);
  const [selectedBg, setSelectedBg] = useState(initialValue?.iconBgColor || SYSTEM_ICONS[0].bgColor);
  const [uploadedImage, setUploadedImage] = useState(initialValue?.iconType === 'image' ? initialValue.icon : '');
  
  // Cropping state
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
        setZoom(1); // Reset zoom on new file
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleConfirm = () => {
    if (activeTab === 'system') {
      onConfirm({ icon: selectedIcon, iconType: 'icon', iconBgColor: selectedBg });
    } else if (uploadedImage) {
      onConfirm({ icon: uploadedImage, iconType: 'image' });
    }
    onClose();
  };

  const applyCrop = () => {
    if (!imgRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const naturalWidth = imgRef.current.naturalWidth;
    const naturalHeight = imgRef.current.naturalHeight;
    const displayedWidth = imgRef.current.width;
    const displayedHeight = imgRef.current.height;

    const scaleX = naturalWidth / displayedWidth;
    const scaleY = naturalHeight / displayedHeight;

    // The cropArea.size is relative to the displayed image *before* the zoom transform
    // But since our UI implementation moves the selection box relative to the image,
    // we need to account for how much of the "natural" image is actually inside that aperture.
    
    // Adjust coordinates for zoom: when zoomed in, the visible window covers less source pixels
    const sourceSize = (cropArea.size * scaleX) / zoom;
    
    // We also need to find the center of the current selection and project it back
    // However, for simplicity with the current drag-box implementation, we'll use the box coordinates
    // and divide by zoom because the box effectively "shrinks" its coverage on the source image.
    const sourceX = (cropArea.x * scaleX) + (cropArea.size * scaleX * (1 - 1/zoom) / 2);
    const sourceY = (cropArea.y * scaleY) + (cropArea.size * scaleY * (1 - 1/zoom) / 2);

    ctx.drawImage(
      imgRef.current,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, outputSize, outputSize
    );

    setUploadedImage(canvas.toDataURL('image/png'));
    setIsCropping(false);
    setTempImage(null);
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setTempImage(null);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImgSize({ width, height });
    
    const naturalWidth = e.currentTarget.naturalWidth;
    const naturalHeight = e.currentTarget.naturalHeight;
    const aspectRatio = naturalWidth / naturalHeight;

    // Requirement: If aspect ratio is 1:1, fill the frame
    if (Math.abs(aspectRatio - 1) < 0.01) {
      setCropArea({
        x: 0,
        y: 0,
        size: Math.min(width, height)
      });
    } else {
      const size = Math.min(width, height) * 0.8;
      setCropArea({
        x: (width - size) / 2,
        y: (height - size) / 2,
        size: size
      });
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropArea.x, y: e.clientY - cropArea.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    newX = Math.max(0, Math.min(newX, imgSize.width - cropArea.size));
    newY = Math.max(0, Math.min(newY, imgSize.height - cropArea.size));

    setCropArea({ ...cropArea, x: newX, y: newY });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isCropping ? "裁剪图片" : "选择图标"} 
      maxWidth="max-w-md"
      footer={
        isCropping ? (
          <>
            <button onClick={cancelCrop} className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-200 transition-colors">取消</button>
            <button 
              onClick={applyCrop}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              确定
            </button>
          </>
        ) : (
          <>
            <button onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium border border-gray-200 transition-colors">取消</button>
            <button 
              onClick={handleConfirm}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
            >
              确认
            </button>
          </>
        )
      }
    >
      <div className="space-y-6">
        {!isCropping && (
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button 
              onClick={() => setActiveTab('system')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Sparkles className="w-4 h-4" />
              系统图标
            </button>
            <button 
              onClick={() => setActiveTab('image')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'image' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ImageIcon className="w-4 h-4" />
              图片
            </button>
          </div>
        )}

        {isCropping && tempImage ? (
          <div className="space-y-6">
            <p className="text-xs text-gray-500 text-center">拖动选择框以调整裁剪位置，使用滑块缩放内容</p>
            <div 
              className="relative w-full aspect-square bg-[#fff] rounded-xl overflow-hidden flex items-center justify-center cursor-move select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img 
                ref={imgRef}
                src={tempImage} 
                alt="Crop preview" 
                className="max-w-full max-h-full transition-transform duration-75"
                style={{ transform: `scale(${zoom})` }}
                onLoad={handleImageLoad}
              />
              
              <div className="absolute inset-0 pointer-events-none">
                <svg width="100%" height="100%" className="fill-white/60">
                  <defs>
                    <mask id="hole">
                      <rect width="100%" height="100%" fill="white" />
                      <rect 
                        x={cropArea.x + (imgRef.current?.offsetLeft || 0)} 
                        y={cropArea.y + (imgRef.current?.offsetTop || 0)} 
                        width={cropArea.size} 
                        height={cropArea.size} 
                        fill="white" 
                      />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" mask="url(#hole)" />
                </svg>
              </div>

              <div 
                className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)] cursor-grab active:cursor-grabbing bg-transparent"
                style={{ 
                  left: cropArea.x + (imgRef.current?.offsetLeft || 0), 
                  top: cropArea.y + (imgRef.current?.offsetTop || 0), 
                  width: cropArea.size, 
                  height: cropArea.size 
                }}
                onMouseDown={handleMouseDown}
              />
            </div>

            <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-xl">
              <ZoomOut className="w-4 h-4 text-gray-400" />
              <input 
                type="range" 
                min="1" 
                max="3" 
                step="0.01" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-grow h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <ZoomIn className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ) : activeTab === 'system' ? (
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">系统图标</label>
            <div className="grid grid-cols-8 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {SYSTEM_ICONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedIcon(item.name);
                    setSelectedBg(item.bgColor);
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center relative transition-transform hover:scale-110 active:scale-95 ${item.bgColor} ${selectedIcon === item.name && selectedBg === item.bgColor ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                >
                  {getIcon(item.name, "w-5 h-5 text-white")}
                  {selectedIcon === item.name && selectedBg === item.bgColor && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      <Check className="w-2 h-2 text-blue-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">选择图片</label>
            <div className="flex flex-col items-center gap-4">
              {uploadedImage ? (
                <div className="relative group">
                  <img src={uploadedImage} alt="Uploaded" className="w-24 h-24 rounded-xl object-cover border-2 border-blue-100" />
                  <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl gap-2">
                    <button 
                      onClick={() => setUploadedImage('')}
                      className="bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors"
                      title="删除"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setTempImage(uploadedImage);
                        setIsCropping(true);
                        setZoom(1);
                      }}
                      className="bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full transition-colors"
                      title="重剪"
                    >
                      <Crop className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-500"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-[10px] font-medium">上传图片</span>
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
              <p className="text-xs text-gray-400 text-center">支持 JPG, PNG 格式，建议比例 1:1</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default IconPickerModal;
