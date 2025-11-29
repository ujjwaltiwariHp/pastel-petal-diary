import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploaderProps {
  bucket: string;
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
  existingImages?: string[];
}

export const ImageUploader = ({
  bucket,
  onUploadComplete,
  maxFiles = 5,
  existingImages = [],
}: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(existingImages);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length + previews.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      setUploading(true);
      const uploadedUrls: string[] = [];

      try {
        for (const file of acceptedFiles) {
          // Validate file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} is too large. Max size is 5MB`);
            continue;
          }

          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = fileName;

          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from(bucket).getPublicUrl(filePath);

          uploadedUrls.push(publicUrl);
        }

        const allUrls = [...previews, ...uploadedUrls];
        setPreviews(allUrls);
        onUploadComplete(allUrls);
        toast.success("Images uploaded successfully!");
      } catch (error) {
        console.error("Error uploading images:", error);
        toast.error("Failed to upload images");
      } finally {
        setUploading(false);
      }
    },
    [bucket, previews, maxFiles, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    },
    maxFiles,
    disabled: uploading,
  });

  const removeImage = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onUploadComplete(newPreviews);
  };

  return (
    <div className="space-y-4">
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {previews.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-foreground">Drop the images here...</p>
          ) : (
            <div>
              <p className="text-foreground mb-2">
                Drag & drop images here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Max {maxFiles} images, 5MB each (JPG, PNG, GIF, WebP)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
