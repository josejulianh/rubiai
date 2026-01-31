import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, X, File, Image, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const fileTypeIcons: Record<string, typeof File> = {
  image: Image,
  text: FileText,
  default: File,
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("text/") || mimeType.includes("pdf") || mimeType.includes("document")) return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ onFileSelect, selectedFiles, onRemoveFile, maxFiles = 5, maxSizeMB = 10 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      if (selectedFiles.length + validFiles.length >= maxFiles) {
        toast({ 
          title: "Too many files", 
          description: `Maximum ${maxFiles} files allowed`,
          variant: "destructive"
        });
        break;
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast({ 
          title: "File too large", 
          description: `${file.name} exceeds ${maxSizeMB}MB limit`,
          variant: "destructive"
        });
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      {/* File list */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {selectedFiles.map((file, index) => {
              const Icon = getFileIcon(file.type);
              return (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="max-w-[120px] truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="text-muted-foreground hover:text-destructive"
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
          ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
        `}
        onClick={() => fileInputRef.current?.click()}
        data-testid="file-upload-area"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          data-testid="input-file-upload"
        />
        
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Upload className="w-6 h-6" />
          <p className="text-sm">
            {isDragging ? "Drop files here..." : "Click or drag files to upload"}
          </p>
          <p className="text-xs">
            Max {maxFiles} files, {maxSizeMB}MB each
          </p>
        </div>
      </div>
    </div>
  );
}

export function AttachButton({ onClick, hasFiles }: { onClick: () => void; hasFiles: boolean }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={`shrink-0 ${hasFiles ? "text-primary" : ""}`}
      data-testid="button-attach-file"
    >
      <Paperclip className="w-5 h-5" />
      {hasFiles && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
      )}
    </Button>
  );
}
