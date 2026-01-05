"use client";

import { useState, useRef } from "react";
import { Image as ImageIcon, Video as VideoIcon, X, Loader2, Upload } from "lucide-react";
import { CldImageWrapper } from "./CldImageWrapper";

interface FileUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
  type: "image" | "video";
  maxSizeMB?: number;
}

export function FileUpload({
  value,
  onChange,
  label,
  type,
  maxSizeMB,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSize = maxSizeMB
    ? maxSizeMB * 1024 * 1024
    : type === "video"
    ? 100 * 1024 * 1024 // 100 MB por defecto (Cloudinary free tier)
    : 10 * 1024 * 1024; // 10 MB por defecto (Cloudinary free tier)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    // Validar tamaño
    if (file.size > maxSize) {
      setError(`El archivo excede el límite de ${maxSizeMB || (type === "video" ? 50 : 5)}MB`);
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al subir el archivo");
      }

      onChange(data.url);
      
      // Notificar actualización de almacenamiento
      window.dispatchEvent(new CustomEvent("storageUpdated"));
    } catch (err: any) {
      setError(err.message);
      console.error("Error uploading:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {error && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-error/10 rounded-xl border border-red-200 dark:border-error/20 text-red-700 dark:text-error text-sm">
          {error}
        </div>
      )}

      {value ? (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700">
            {type === "image" ? (
              <CldImageWrapper
                src={value}
                alt="Preview"
                fill
                className="object-contain"
              />
            ) : (
              <video
                src={value}
                controls
                className="w-full h-full object-contain"
              />
            )}
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-sm rounded-lg hover:bg-red-50 dark:hover:bg-error/20 transition-colors text-red-600 dark:text-error border border-red-200 dark:border-error/30 shadow-lg"
              title="Eliminar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-charcoal-700 rounded-xl p-8 bg-gray-50 dark:bg-charcoal-800/50 hover:border-corporate-500 dark:hover:border-corporate-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={type === "image" ? "image/*" : "video/*"}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-3 p-6 hover:bg-gray-100 dark:hover:bg-charcoal-800 transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-corporate-500" />
                <span className="text-sm text-gray-700 dark:text-slate-300">Subiendo...</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-lg bg-gradient-corporate flex items-center justify-center">
                  {type === "image" ? (
                    <ImageIcon className="w-6 h-6 text-white" />
                  ) : (
                    <VideoIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1">
                    {label || `Subir ${type === "image" ? "Imagen" : "Video"}`}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-500">
                    Máximo {maxSizeMB || (type === "video" ? 100 : 10)}MB
                  </span>
                </div>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

