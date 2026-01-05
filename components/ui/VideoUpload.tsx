"use client";

import { FileUpload } from "./FileUpload";

interface VideoUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  label?: string;
}

export function VideoUpload({
  value,
  onChange,
  label = "Subir Video",
}: VideoUploadProps) {

  return (
    <FileUpload
      value={value}
      onChange={onChange}
      label={label}
      type="video"
      maxSizeMB={100}
    />
  );
}

