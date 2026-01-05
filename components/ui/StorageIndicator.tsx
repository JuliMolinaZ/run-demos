"use client";

import { useEffect, useState } from "react";
import { HardDrive, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface StorageData {
  used: {
    bytes: number;
    mb: number;
    formatted: string;
  };
  limit: {
    bytes: number;
    mb: number;
    formatted: string;
  };
  available: {
    bytes: number;
    mb: number;
    formatted: string;
  };
  percentage: string;
}

export function StorageIndicator() {
  const [storage, setStorage] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStorage();
    
    // Escuchar actualizaciones de almacenamiento
    const handleStorageUpdate = () => {
      fetchStorage();
    };
    
    window.addEventListener("storageUpdated", handleStorageUpdate);
    
    return () => {
      window.removeEventListener("storageUpdated", handleStorageUpdate);
    };
  }, []);

  const fetchStorage = async () => {
    try {
      const res = await fetch("/api/storage/usage");
      if (res.ok) {
        const data = await res.json();
        setStorage(data);
      }
    } catch (error) {
      console.error("Error fetching storage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !storage) {
    return null;
  }

  const percentage = parseFloat(storage.percentage);
  const isWarning = percentage > 80;
  const isDanger = percentage > 95;

  return (
    <div className="glass rounded-lg p-4 border border-blue-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-200">Almacenamiento</span>
        </div>
        <span className="text-xs text-blue-400">
          {storage.used.formatted} / {storage.limit.formatted}
        </span>
      </div>

      <div className="w-full bg-blue-900/30 rounded-full h-2 mb-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${
            isDanger
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : isWarning
              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
              : "bg-gradient-to-r from-blue-500 to-blue-600"
          }`}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-blue-300">
          {storage.available.formatted} disponibles
        </span>
        {isWarning && (
          <div className="flex items-center gap-1 text-xs text-yellow-400">
            <AlertCircle className="w-3 h-3" />
            <span>{percentage.toFixed(0)}% usado</span>
          </div>
        )}
      </div>
    </div>
  );
}

