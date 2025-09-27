import React, { useCallback, useState, useRef } from 'react';
import { UploadIcon } from './Icons';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  }, [onImageUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`w-full h-full p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300 ${isDragging ? 'border-indigo-400 bg-indigo-900/20' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <UploadIcon className="w-12 h-12 text-gray-500" />
        <p className="text-lg font-semibold text-gray-300">Kéo và thả ảnh vào đây</p>
        <p className="text-gray-400">hoặc</p>
        <p className="px-4 py-2 bg-gray-700 rounded-md font-medium text-white">Nhấp để chọn tệp</p>
        <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP, GIF</p>
      </div>
    </div>
  );
};

export default ImageUploader;