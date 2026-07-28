import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image, X, Camera } from "lucide-react";

export default function UploadZone({ onImageSelect }) {
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleReset = () => { setPreview(null); setSelectedFile(null); };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card overflow-hidden">
            <div className="relative group">
              <img src={preview} alt="Preview" className="w-full h-64 sm:h-80 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <button onClick={handleReset} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-lg">
                  <X className="w-5 h-5 text-text-primary" />
                </button>
              </div>
            </div>
            <div className="p-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-text-secondary flex-1 min-w-0">
                <Image className="w-4 h-4 shrink-0" />
                <span className="truncate">{selectedFile?.name}</span>
                <span className="text-text-muted shrink-0">({(selectedFile?.size / 1024 / 1024).toFixed(1)} MB)</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={handleReset} className="btn-secondary flex-1 sm:flex-none !py-2 !px-4 text-sm">Change</button>
                <button onClick={() => onImageSelect(selectedFile)} className="btn-primary flex-1 sm:flex-none !py-2 !px-4 text-sm"><Camera className="w-4 h-4" />Analyze</button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="dropzone" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
            className={`border-2 border-dashed p-12 text-center rounded-2xl cursor-pointer transition-all duration-300 ${drag ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.02] shadow-lg" : "border-border bg-surface hover:bg-surface-hover hover:border-brand-400 hover:shadow-md"}`}
          >
            <input type="file" className="hidden" id="file-upload" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <motion.div animate={drag ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }} className="mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center shadow-lg"><UploadCloud className="w-10 h-10 text-white" /></div>
                  <motion.div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center shadow-md" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <span className="text-white text-xs font-bold">AI</span>
                  </motion.div>
                </div>
              </motion.div>
              <span className="text-lg font-semibold text-text-primary mb-1">{drag ? "Drop your image here" : "Upload a food image"}</span>
              <span className="text-sm text-text-muted mb-4">Drag & drop or click to browse</span>
              <span className="text-xs text-text-muted bg-surface-hover px-3 py-1.5 rounded-full">JPG, PNG, GIF, WebP — up to 10MB</span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
