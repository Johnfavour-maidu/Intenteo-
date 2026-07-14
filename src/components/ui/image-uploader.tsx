"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Upload,
  X,
  Image as ImageIcon,
  Maximize2,
  RotateCcw,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface ImageUploaderProps {
  value?: string
  onChange: (value: string | undefined) => void
  label?: string
  description?: string
  maxSizeMB?: number
  acceptedTypes?: string[]
  aspectRatio?: "auto" | "square" | "landscape" | "portrait" | number
  maxHeight?: number
  showPreview?: boolean
  previewTitle?: string
  uploadTarget?: "hero" | "cover" | "supporting" | string
  disabled?: boolean
  className?: string
}

interface ImageUploaderState {
  status: "empty" | "uploading" | "uploaded" | "error"
  progress: number
  error?: string
}

const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const DEFAULT_MAX_SIZE_MB = 10

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getAspectRatioClass(ratio?: ImageUploaderProps["aspectRatio"]): string {
  if (!ratio || ratio === "auto") return ""
  if (typeof ratio === "number") return `aspect-[${ratio}]`
  const ratios: Record<string, string> = {
    square: "aspect-square",
    landscape: "aspect-video",
    portrait: "aspect-[3/4]",
  }
  return ratios[ratio] || ""
}

export function ImageUploader({
  value,
  onChange,
  label = "Upload Image",
  description,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  aspectRatio = "auto",
  maxHeight = 350,
  showPreview = true,
  previewTitle = "Preview",
  uploadTarget = "image",
  disabled = false,
  className,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<ImageUploaderState>({
    status: value ? "uploaded" : "empty",
    progress: 0,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)
  const uploadTimeoutRef = useRef<NodeJS.Timeout>()

  const resetState = useCallback(() => {
    setState({ status: "empty", progress: 0 })
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Only ${acceptedTypes.map(t => t.split("/")[1].toUpperCase()).join(", ")} images are supported.`
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `This image exceeds the ${maxSizeMB} MB limit.`
    }
    return null
  }, [acceptedTypes, maxSizeMB])

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file)
    if (error) {
      setState({ status: "error", progress: 0, error })
      uploadTimeoutRef.current = setTimeout(resetState, 5000)
      return
    }

    setState({ status: "uploading", progress: 0 })

    const reader = new FileReader()
    reader.onloadstart = () => {
      uploadTimeoutRef.current = setInterval(() => {
        setState(prev => ({ ...prev, progress: Math.min(prev.progress + 10, 90) }))
      }, 50)
    }
    reader.onload = (ev) => {
      clearInterval(uploadTimeoutRef.current)
      const dataUrl = ev.target?.result as string
      setState({ status: "uploaded", progress: 100 })
      onChange(dataUrl)
    }
    reader.onerror = () => {
      clearInterval(uploadTimeoutRef.current)
      setState({ status: "error", progress: 0, error: "Failed to read file." })
      uploadTimeoutRef.current = setTimeout(resetState, 3000)
    }
    reader.readAsDataURL(file)
  }, [validateFile, onChange, resetState])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [disabled, handleFile])

  const handleRemove = useCallback(() => {
    onChange(undefined)
    resetState()
  }, [onChange, resetState])

  const handleReplace = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const openFullPreview = useCallback(() => {
    if (value) setShowFullPreview(true)
  }, [value])

  const acceptedExtensions = acceptedTypes.map(t => `.${t.split("/")[1]}`).join(", ")

  const aspectClass = getAspectRatioClass(aspectRatio)
  const containerStyle = { maxHeight: maxHeight } as React.CSSProperties

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div
        className={cn(
          "relative rounded-xl border transition-all duration-200",
          "bg-muted/30 dark:bg-muted/50",
          isDragging && !disabled && "border-primary/50 bg-primary/5",
          !isDragging && "border-border hover:border-primary/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={containerStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (!disabled && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); fileInputRef.current?.click() }}}
        aria-label={label}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
          aria-label={`Upload ${label.toLowerCase()}`}
        />

        {state.status === "uploading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-background/95 rounded-xl">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary animate-progress"
                style={{ "--progress-width": `${state.progress}%` }}
              />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Uploading... {state.progress}%
            </p>
          </div>
        )}

        {state.status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-destructive/10 rounded-xl p-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-medium text-destructive">{state.error}</p>
            <Button size="sm" variant="outline" onClick={resetState}>
              Try Again
            </Button>
          </div>
        )}

        {value && state.status !== "uploading" && state.status !== "error" && (
          <>
            <div
              className={cn(
                "w-full h-full",
                aspectRatio !== "auto" && aspectClass
              )}
              style={aspectRatio === "auto" ? { maxHeight: maxHeight } : undefined}
            >
              <img
                src={value}
                alt={previewTitle}
                className="w-full h-full object-contain"
                onClick={openFullPreview}
                style={{ cursor: showPreview ? "zoom-in" : "default" }}
              />
            </div>

            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2 pointer-events-none group-hover:pointer-events-auto">
              {showPreview && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={openFullPreview}
                  className="gap-1.5"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleReplace}
                className="gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Change</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Remove</span>
              </Button>
            </div>

            <div className="absolute bottom-2 right-2 flex gap-1 pointer-events-none">
              <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-black/60 text-white backdrop-blur-sm">
                {aspectRatio === "auto" ? "Original" : aspectRatio === "square" ? "1:1" : aspectRatio === "landscape" ? "16:9" : aspectRatio === "portrait" ? "3:4" : ""}
              </span>
            </div>
          </>
        )}

        {!value && (
          <button
            type="button"
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={cn(
              "w-full flex flex-col items-center justify-center gap-3 p-6",
              "transition-colors duration-200",
              "hover:bg-primary/5 hover:border-primary/30",
              disabled && "cursor-not-allowed opacity-70",
              aspectRatio !== "auto" && aspectClass
            )}
            style={aspectRatio === "auto" ? { minHeight: 200 } : undefined}
            disabled={disabled}
          >
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center",
              "bg-primary/10 text-primary",
              isDragging && "scale-110"
            )}>
              <Upload className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Upload {uploadTarget === "hero" ? "Hero Image" : uploadTarget === "cover" ? "Cover Image" : uploadTarget === "supporting" ? "Supporting Image" : "Image"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Drag & drop or click to browse
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                {acceptedExtensions.toUpperCase()} · Max {maxSizeMB} MB
              </p>
            </div>
          </button>
        )}

        {state.status === "uploaded" && value && (
          <div className="absolute top-2 left-2 z-10">
            <CheckCircle className="h-5 w-5 text-primary bg-background/80 rounded-full p-0.5" />
          </div>
        )}
      </div>

      {showFullPreview && value && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 animate-fadeIn"
          onClick={() => setShowFullPreview(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${previewTitle} (press Escape to close)`}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] animate-scaleIn">
            <button
              onClick={() => setShowFullPreview(false)}
              className="absolute -top-12 right-0 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={value}
              alt={previewTitle}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleReplace() }}>
                <RotateCcw className="h-3.5 w-3.5" />
                Change
              </Button>
              <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); handleRemove() }}>
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}