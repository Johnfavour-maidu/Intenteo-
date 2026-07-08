"use client"

import React, { useRef, useState, useEffect } from "react"
import { Calendar } from "lucide-react"
import { formatDateDDMMYYYY, parseDDMMYYYY } from "@/lib/date-utils"

interface DateInputProps {
  value: string
  onChange: (v: string) => void
  className?: string
  min?: string
  label?: string
}

export function DateInput({ value, onChange, className = "", min, label }: DateInputProps) {
  const nativeRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(() => formatDateDDMMYYYY(value))

  useEffect(() => {
    setText(formatDateDDMMYYYY(value))
  }, [value])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setText(raw)
    const parsed = parseDDMMYYYY(raw)
    if (parsed) onChange(parsed)
  }

  const handleBlur = () => {
    const parsed = parseDDMMYYYY(text)
    if (!parsed) setText(formatDateDDMMYYYY(value))
  }

  const handleNativeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const iso = e.target.value
    if (iso) {
      onChange(iso)
      setText(formatDateDDMMYYYY(iso))
    }
  }

  return (
    <div className="relative">
      {label && <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>}
      <div className="relative">
        <input
          type="text"
          placeholder="dd/mm/yyyy"
          value={text}
          onChange={handleTextChange}
          onBlur={handleBlur}
          className={`w-full h-9 rounded-md border border-input bg-background pl-3 pr-9 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
        />
        <button
          type="button"
          onClick={() => nativeRef.current?.showPicker?.() ?? nativeRef.current?.focus()}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted/50 transition-colors text-muted-foreground cursor-pointer"
        >
          <Calendar className="h-4 w-4" />
        </button>
        <input
          ref={nativeRef}
          type="date"
          value={value}
          onChange={handleNativeChange}
          min={min}
          className="absolute inset-0 opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      </div>
    </div>
  )
}
