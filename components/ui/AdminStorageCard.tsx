"use client";

import { useEffect, useState } from "react";
import { HardDrive, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "./card";

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

export function AdminStorageCard() {
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
      setLoading(true);
      const res = await fetch("/api/storage/admin");
      if (res.ok) {
        const data = await res.json();
        setStorage(data);
      }
    } catch (error) {
      console.error("Error fetching admin storage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !storage) {
    return (
      <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-charcoal-800 rounded w-1/3 mb-3" />
          <div className="h-8 bg-gray-200 dark:bg-charcoal-800 rounded w-1/2 mb-2" />
          <div className="h-2 bg-gray-200 dark:bg-charcoal-800 rounded w-full" />
        </div>
      </Card>
    );
  }

  const percentage = parseFloat(storage.percentage);
  const isWarning = percentage > 80;
  const isDanger = percentage > 95;

  return (
    <Card variant="glassPremium" padding="md" className="border-gray-200 dark:border-charcoal-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">Almacenamiento Total</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
              {storage.used.formatted}
            </p>
          </div>
        </div>
        <span className="text-xs text-gray-500 dark:text-slate-500">
          {storage.used.formatted} / {storage.limit.formatted}
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-charcoal-800 rounded-full h-2 mb-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full ${
            isDanger
              ? "bg-gradient-to-r from-red-500 to-red-600"
              : isWarning
              ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
              : "bg-gradient-to-r from-purple-500 to-purple-600"
          }`}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-slate-500">
          {storage.available.formatted} disponibles
        </span>
        {isWarning && (
          <div className="flex items-center gap-1 text-xs text-yellow-500">
            <AlertCircle className="w-3 h-3" />
            <span>{percentage.toFixed(0)}% usado</span>
          </div>
        )}
      </div>
    </Card>
  );
}

