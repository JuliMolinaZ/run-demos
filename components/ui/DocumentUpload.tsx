"use client";

import { useState, useRef } from "react";
import { FileText, X, Loader2, Download, Eye } from "lucide-react";

interface DocumentUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
  accept?: string; // e.g., ".pdf,.doc,.docx"
  maxSizeMB?: number;
}

export function DocumentUpload({
  value,
  onChange,
  label = "Subir Documento",
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
  maxSizeMB = 10,
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSize = maxSizeMB * 1024 * 1024;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    // Validar tamaño
    if (file.size > maxSize) {
      setError(`El archivo excede el límite de ${maxSizeMB}MB`);
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "document"); // Tipo genérico para documentos

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

  // Extraer nombre del archivo de la URL
  const getFileName = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || 'documento';
      return decodeURIComponent(fileName);
    } catch {
      return 'documento';
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
          <div className="relative w-full rounded-xl overflow-hidden bg-white dark:bg-charcoal-800 border border-gray-300 dark:border-charcoal-700 p-4">
            <div className="flex items-center gap-4">
              {/* Icono del documento */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-corporate flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>

              {/* Info del documento */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                  {getFileName(value)}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  Documento cargado
                </p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2">
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-100 dark:bg-charcoal-700 rounded-lg hover:bg-corporate-100 dark:hover:bg-corporate-900/30 transition-colors text-gray-700 dark:text-slate-300 hover:text-corporate-600 dark:hover:text-corporate-400"
                  title="Ver documento"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <a
                  href={value}
                  download
                  className="p-2 bg-gray-100 dark:bg-charcoal-700 rounded-lg hover:bg-corporate-100 dark:hover:bg-corporate-900/30 transition-colors text-gray-700 dark:text-slate-300 hover:text-corporate-600 dark:hover:text-corporate-400"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="p-2 bg-gray-100 dark:bg-charcoal-700 rounded-lg hover:bg-red-50 dark:hover:bg-error/20 transition-colors text-red-600 dark:text-error"
                  title="Eliminar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 dark:border-charcoal-700 rounded-xl p-8 bg-gray-50 dark:bg-charcoal-800/50 hover:border-corporate-500 dark:hover:border-corporate-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
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
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-300 block mb-1">
                    {label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-500">
                    Máximo {maxSizeMB}MB
                  </span>
                  <span className="text-xs text-gray-500 dark:text-slate-500 block mt-1">
                    Formatos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
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
