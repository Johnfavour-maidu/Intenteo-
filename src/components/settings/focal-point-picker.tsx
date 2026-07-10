"use client"

import React, { useRef, useState, useCallback } from "react"
import { X, Move } from "lucide-react"

interface FocalPointPickerProps {
  src: string
  focalPoint: { x: number; y: number }
  onFocalPointChange: (point: { x: number; y: number }) => void
  onRemove: () => void
  onClose: () => void
  onSave: (focalPoint: { x: number; y: number }) => void
}

export function FocalPointPicker({
  src,
  focalPoint,
  onFocalPointChange,
  onRemove,
  onClose,
  onSave,
}: FocalPointPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const updateFocalPoint = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      onFocalPointChange({ x, y })
    },
    [onFocalPointChange]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true)
      updateFocalPoint(e.clientX, e.clientY)
    },
    [updateFocalPoint]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      updateFocalPoint(e.clientX, e.clientY)
    },
    [isDragging, updateFocalPoint]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true)
      const touch = e.touches[0]
      updateFocalPoint(touch.clientX, touch.clientY)
    },
    [updateFocalPoint]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      const touch = e.touches[0]
      updateFocalPoint(touch.clientX, touch.clientY)
    },
    [isDragging, updateFocalPoint]
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md mx-4 bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base">Choose Profile Photo</h3>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Click or drag on the image to choose which part should be the focal point of your profile photo.
        </p>

        <div
          ref={containerRef}
          className="relative w-full aspect-square rounded-xl overflow-hidden cursor-crosshair border-2 border-border"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <img
            src={src}
            alt="Profile photo preview"
            className="w-full h-full object-cover pointer-events-none select-none"
            style={{
              objectPosition: `${focalPoint.x * 100}% ${focalPoint.y * 100}%`,
            }}
            draggable={false}
          />

          {/* Focal point indicator */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${focalPoint.x * 100}%`,
              top: `${focalPoint.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="h-8 w-8 rounded-full border-2 border-white bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Move className="h-4 w-4 text-white" />
            </div>
            <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-white/50 animate-ping" />
          </div>

          {/* Circular preview mask */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle 40px at ${focalPoint.x * 100}% ${focalPoint.y * 100}%, transparent 100%, rgba(0,0,0,0.4) 100%)`,
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground text-center">
          This point will be centered in your circular profile photo
        </p>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onRemove}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-colors"
          >
            Remove Photo
          </button>
          <button
            onClick={() => onSave(focalPoint)}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-[#1E0E6B] to-[#2d1a8a] text-white hover:from-[#1E0E6B]/90 hover:to-[#2d1a8a]/90 shadow-md transition-all"
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  )
}
