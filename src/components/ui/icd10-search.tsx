'use client'

import { useState, useRef, useEffect } from 'react'
import { icd10Codes } from '@/data/icd10'
import { cn } from '@/lib/utils'

interface Icd10SearchProps {
  value: string
  onChange: (code: string, name?: string) => void
  disabled?: boolean
  placeholder?: string
}

export function Icd10Search({ value, onChange, disabled, placeholder }: Icd10SearchProps) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedCode = value ? icd10Codes.find(c => c.code === value) : null
  const selectedName = selectedCode ? `${selectedCode.nameId} / ${selectedCode.nameEn}` : ''

  const filtered = query.length >= 1
    ? icd10Codes.filter(c =>
        c.code.toLowerCase().includes(query.toLowerCase()) ||
        c.nameId.toLowerCase().includes(query.toLowerCase()) ||
        c.nameEn.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 15)
    : value
      ? icd10Codes.filter(c => c.code !== value).slice(0, 15)
      : icd10Codes.slice(0, 15)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      const selected = filtered[selectedIndex]
      onChange(selected.code)
      setQuery('')
      setShowDropdown(false)
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const displayValue = query || (value && selectedName ? `${value} - ${selectedName}` : value || '')

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value)
          setShowDropdown(true)
          setSelectedIndex(-1)
          if (!e.target.value) {
            onChange('')
          }
        }}
        onFocus={() => {
          setShowDropdown(true)
        }}
        disabled={disabled}
        placeholder={placeholder || "Type ICD-10 code or diagnosis name..."}
        className="flex h-10 w-full min-w-0 rounded-xl bg-[#F0EDE8] px-3.5 py-2 text-sm font-medium text-[#1D1D1D] placeholder:text-[#9CA3AF] transition-all duration-200 outline-none font-mono shadow-[inset_3px_3px_6px_rgba(0,0,0,0.06),inset_-3px_-3px_6px_rgba(255,255,255,0.8)] focus:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.08),inset_-3px_-3px_6px_rgba(255,255,255,0.85),0_0_0_2px_rgba(230,57,70,0.25)]"
      />
      {showDropdown && filtered.length > 0 && (
        <div
          style={{
            position: 'absolute',
            zIndex: 9999,
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #d1d5db',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 4px 10px -3px rgba(0,0,0,0.1)',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {value && (
            <div
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#6b7280',
                borderBottom: '1px solid #f3f4f6',
                backgroundColor: '#f9fafb',
              }}
              onMouseDown={() => {
                onChange('')
                setQuery('')
                setShowDropdown(false)
              }}
            >
              ✕ Hapus pilihan
            </div>
          )}
          {filtered.map((code, index) => (
            <div
              key={code.code}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                backgroundColor: code.code === value ? '#eff6ff' : index === selectedIndex ? '#f3f4f6' : '#ffffff',
                borderBottom: index < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}
              onMouseDown={() => {
                onChange(code.code)
                setQuery('')
                setShowDropdown(false)
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#111827' }}>{code.code}</span>
              <span style={{ marginLeft: '8px', color: '#374151' }}>{code.nameId}</span>
              <span style={{ marginLeft: '4px', fontSize: '12px', color: '#6b7280' }}>/ {code.nameEn}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
