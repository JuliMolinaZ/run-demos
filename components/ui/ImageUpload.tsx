"use client";

import { FileUpload } from "./FileUpload";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Subir Imagen",
  accept,
}: ImageUploadProps) {

  return (
    <FileUpload
      value={value}
      onChange={onChange}
      label={label}
      type="image"
      maxSizeMB={10}
    />
  );
}

