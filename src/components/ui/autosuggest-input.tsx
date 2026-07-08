"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AutosuggestInputProps extends Omit<React.ComponentProps<"input">, "onSelect"> {
  suggestions: string[]
  onSuggestionSelect?: (value: string) => void
}

export function AutosuggestInput({ suggestions, onSuggestionSelect, value, onChange, className, ...props }: AutosuggestInputProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(String(value).toLowerCase())
  ).filter((s, i, a) => a.indexOf(s) === i)

  const showSuggestions = open && filtered.length > 0 && String(value).length > 0

  useEffect(() => {
    setActiveIndex(-1)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      const selected = filtered[activeIndex]
      if (onChange) {
        const event = { target: { value: selected } } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
      onSuggestionSelect?.(selected)
      setOpen(false)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }, [showSuggestions, filtered, activeIndex, onChange, onSuggestionSelect])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e)
    setOpen(true)
  }, [onChange])

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={cn(className)}
        {...props}
      />
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 max-h-48 overflow-y-auto rounded-xl border border-input bg-background shadow-lg">
          {filtered.map((suggestion, idx) => (
            <button
              key={suggestion}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm transition-colors",
                idx === activeIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                if (onChange) {
                  const event = { target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>
                  onChange(event)
                }
                onSuggestionSelect?.(suggestion)
                setOpen(false)
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
