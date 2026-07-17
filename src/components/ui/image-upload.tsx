"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { X, ChevronUp, ChevronDown, ZoomIn, Trash2, Check, Upload, AlertCircle, Maximize2 } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange?: (value: string) => void
  placeholderText?: string
  acceptedFormats?: string
  maxSizeMB?: number
  className?: string
  aspectRatio?: "auto" | "1:1" | "16:9" | "4:3"
  showInstructions?: boolean
  showPreviewInModal?: boolean
  buttonText?: string
  supportsPortrait?: boolean
  supportsLandscape?: boolean
  supportsSquare?: boolean
}

interface ImageUploadState {
  isDragOver: boolean
  isUploading: boolean
  isEditing: boolean
  error: string | null
  uploadProgress: number
  previewImage: string | null
}

function ImageUpload({
  value,
  onChange,
  placeholderText = "Upload Cover Image",
  acceptedFormats = "JPG, JPEG, PNG, WEBP",
  maxSizeMB = 10,
  className,
  aspectRatio = "auto",
  showInstructions = true,
  showPreviewInModal = true,
  buttonText = "Upload Cover Image",
  supportsPortrait = true,
  supportsLandscape = true,
  supportsSquare = true,
}: ImageUploadProps) {
  const [state, setState] = useState<ImageUploadState>({
    isDragOver: false,
    isUploading: false,
    isEditing: false,
    error: null,
    uploadProgress: 0,
    previewImage: null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewModalRef = useRef<HTMLDivElement>(null)
  const uploadContainerRef = useRef<HTMLDivElement>(null)

  const supportedOrientations = []
  if (supportsPortrait) supportedOrientations.push("Portrait")
  if (supportsLandscape) supportedOrientations.push("Landscape")
  if (supportsSquare) supportedOrientations.push("Square")
  const orientationText = supportedOrientations.join(", ")

  const validateFile = (file: File): boolean => {
    setState(prev => ({ ...prev, error: null, isUploading: true, uploadProgress: 10 }))

    if (!acceptedFormats.split(",").some(fmt => file.type.includes(fmt.toLowerCase()))) {
      setState(prev => ({
        ...prev,
        error: `Only ${acceptedFormats} files are supported.`,
        isUploading: false,
        uploadProgress: 0
      }))
      return false
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setState(prev => ({
        ...prev,
        error: `File exceeds ${maxSizeMB} MB limit.`,
        isUploading: false,
        uploadProgress: 0
      }))
      return false
    }

    setState(prev => ({ ...prev, uploadProgress: 60 }))
    return true
  }

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setState(prev => ({ ...prev, uploadProgress: 80 }))

      const reader = new FileReader()
      reader.onload = (ev) => {
        setState(prev => ({ ...prev, uploadProgress: 95 }))
        setTimeout(() => {
          resolve(ev.target?.result as string)
          setState(prev => ({ ...prev, isUploading: false, uploadProgress: 100 }))
        }, 200)
      }
      reader.onerror = () => {
        setState(prev => ({
          ...prev,
          error: "Failed to read image file.",
          isUploading: false,
          uploadProgress: 0
        }))
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return

    try {
      const dataUrl = await processImage(file)
      onChange?.(dataUrl)
      setState(prev => ({ ...prev, isUploading: false, uploadProgress: 100 }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to upload image.",
        isUploading: false,
        uploadProgress: 0
      }))
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragOver: false }))

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && !files[0].type.startsWith("image/")) {
      setState(prev => ({
        ...prev,
        error: "Please upload an image file."
      }))
      return
    }

    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragOver: true }))
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setState(prev => ({ ...prev, isDragOver: false }))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    onChange?.("")
    setState(prev => ({ ...prev, error: null }))
  }

  const openPreviewModal = () => {
    if (value && showPreviewInModal) {
      setState(prev => ({ ...prev, previewImage: value }))
    }
  }

  const closePreviewModal = () => {
    setState(prev => ({ ...prev, previewImage: null }))
  }

  useEffect(() => {
    const handleEscKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        closePreviewModal()
      }
    }

    if (state.previewImage) {
      document.addEventListener("keydown", handleEscKey)
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [state.previewImage])

  const getContainerClasses = () => {
    const base = "relative w-full rounded-xl border transition-all duration-200 overflow-hidden"

    if (state.isUploading) {
      return cn(base, "border-[#1E0E6B]/30 bg-[#1E0E6B]/5")
    }

    if (state.isDragOver) {
      return cn(base, "border-[#1E0E6B] bg-[#1E0E6B]/10")
    }

    return cn(
      base,
      "border-white/20 bg-white/50 dark:bg-white/5",
      "hover:border-[#1E0E6B]/40 hover:bg-white/80 dark:hover:bg-white/10",
      state.error && "border-red-300 bg-red-50/50 dark:bg-red-950/10"
    )
  }

  const getPlaceholderClasses = () => {
    const base = "flex flex-col items-center justify-center cursor-pointer"

    if (aspectRatio === "1:1") {
      return cn(base, "aspect-square")
    } else if (aspectRatio === "16:9") {
      return cn(base, "aspect-[16/9] min-h-[180px]")
    } else if (aspectRatio === "4:3") {
      return cn(base, "aspect-[4/3] min-h-[180px]")
    }
    return cn(base, "min-h-[200px] py-12")
  }

  const getPreviewClasses = () => {
    const base = "relative w-full h-full overflow-hidden"

    if (aspectRatio === "1:1") {
      return cn(base, "aspect-square")
    } else if (aspectRatio === "16:9") {
      return cn(base, "aspect-[16/9] max-h-[280px]")
    } else if (aspectRatio === "4:3") {
      return cn(base, "aspect-[4/3] max-h-[280px]")
    }
    return cn(base, "max-h-[350px]")
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {state.isUploading && (
        <div className="absolute inset-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl transition-all">
          <div className="text-center space-y-3">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-[#1E0E6B]/20" />
              <div className="absolute inset-0 rounded-full border-4 border-[#1E0E6B] border-t-transparent animate-spin" style={{ animationDuration: "1.5s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-[#1E0E6B]">{state.uploadProgress}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-[#1E0E6B]">Uploading...</p>
          </div>
        </div>
      )}

      <div
        ref={uploadContainerRef}
        className={getContainerClasses()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!value ? openFileDialog : undefined}
      >
        {value ? (
          <div className={getPreviewClasses()}>
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-contain p-2"
            />

            {state.isUploading ? null : (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    openFileDialog()
                  }}
                  className="bg-white text-black hover:bg-white/90 font-medium"
                >
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Replace
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage()
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Remove
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    openPreviewModal()
                  }}
                  className="bg-white/20 text-white hover:bg-white/30 font-medium"
                >
                  <Maximize2 className="h-3.5 w-3.5 mr-1.5" />
                  Preview
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className={getPlaceholderClasses()}>
            <div className="flex flex-col items-center justify-center gap-4 p-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[#1E0E6B]/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-[#1E0E6B]" />
                </div>
                {state.isDragOver && (
                  <div className="absolute -inset-2 rounded-xl border-2 border-dashed border-[#1E0E6B] animate-pulse" />
                )}
              </div>

              {showInstructions && (
                <div className="text-center space-y-2">
                  <p className="text-sm font-semibold text-[#1E0E6B]">{placeholderText}</p>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Supports {orientationText} images. Click to browse or drag and drop.
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {acceptedFormats} • Max {maxSizeMB} MB
                  </p>
                </div>
              )}

              <Button
                size="sm"
                variant="secondary"
                onClick={openFileDialog}
                className="bg-[#1E0E6B] text-white hover:bg-[#1E0E6B]/90 font-medium text-xs px-4 py-2"
              >
                {buttonText}
              </Button>
            </div>
          </div>
        )}
      </div>

      {state.error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{state.error}</p>
        </div>
      )}

      {state.previewImage && showPreviewInModal && (
        <div
          ref={previewModalRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closePreviewModal}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={closePreviewModal}
              className="absolute -top-12 right-0 h-10 w-10 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-border bg-white dark:bg-gray-900 sticky top-0 z-10">
                <h3 className="text-lg font-semibold">Image Preview</h3>
                <p className="text-sm text-muted-foreground">Original proportions - no cropping applied</p>
              </div>
              <div className="p-4 max-h-[70vh] overflow-auto">
                <div className="flex items-center justify-center min-h-[200px]">
                  <img
                    src={state.previewImage}
                    alt="Full-size preview"
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}

export { ImageUpload }