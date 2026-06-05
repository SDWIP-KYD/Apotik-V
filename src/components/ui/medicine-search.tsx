'use client'

import * as React from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchMedicines } from '@/server/actions/medicines'

interface MedicineSearchProps {
  value: string
  onChange: (medicineId: string) => void
  disabled?: boolean
  placeholder?: string
}

interface MedicineResult {
  id: string
  name: string
  category: string
  unit: string
  stockQty: number
  price: number
}

export function MedicineSearch({
  value,
  onChange,
  disabled,
  placeholder = 'Search medicine by name...',
}: MedicineSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const [results, setResults] = React.useState<MedicineResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const [selectedName, setSelectedName] = React.useState('')

  // Fetch medicine by ID when value changes (to show selected name)
  React.useEffect(() => {
    if (!value) {
      setSelectedName('')
      return
    }
    // If we already have it in results, use that
    const found = results.find((m) => m.id === value)
    if (found) {
      setSelectedName(found.name)
    }
  }, [value, results])

  const doSearch = React.useCallback(async (q: string) => {
    if (!q || q.length < 1) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await searchMedicines(q)
      if ('data' in res) {
        setResults(res.data ?? [])
      }
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doSearch(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, doSearch])

  // Scroll active item into view
  React.useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex]!.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  function selectMedicine(med: MedicineResult) {
    onChange(med.id)
    setSelectedName(med.name)
    setQuery('')
    setResults([])
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.blur()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setOpen(true)
        setActiveIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < results.length) {
          const med = results[activeIndex]
          if (med.stockQty > 0) {
            selectMedicine(med)
          }
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
        setQuery('')
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayText = query || selectedName

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={displayText}
          placeholder={selectedName || placeholder}
          disabled={disabled}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50'
          )}
          onFocus={() => {
            if (!disabled) setOpen(true)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelectedName('')
            setActiveIndex(-1)
            if (!open) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {open && loading && query && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md'
          )}
        >
          Searching...
        </div>
      )}

      {open && !loading && results.length > 0 && (
        <div
          ref={listRef}
          className={cn(
            'absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border bg-popover p-1 shadow-md'
          )}
          role="listbox"
        >
          {results.map((med, index) => {
            const isSelected = med.id === value
            const isDisabled = med.stockQty <= 0
            const isActive = index === activeIndex

            return (
              <div
                key={med.id}
                ref={(el) => { itemRefs.current[index] = el }}
                role="option"
                aria-selected={isSelected}
                aria-disabled={isDisabled}
                className={cn(
                  'relative flex flex-col rounded-sm px-2.5 py-2 text-sm cursor-pointer select-none outline-none',
                  isActive && 'bg-accent text-accent-foreground',
                  !isActive && !isDisabled && 'hover:bg-accent/50',
                  isDisabled && 'opacity-40 cursor-not-allowed',
                  isSelected && !isActive && 'bg-accent/30'
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  if (!isDisabled) selectMedicine(med)
                }}
                onMouseEnter={() => {
                  if (!isDisabled) setActiveIndex(index)
                }}
              >
                <span className="font-medium">{med.name}</span>
                <span className="text-xs text-muted-foreground">
                  {med.category} &middot; Stock: {med.stockQty} {med.unit} &middot; Rp {med.price.toLocaleString()}
                </span>
                {isDisabled && (
                  <span className="text-xs text-destructive">Out of stock</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      {open && query && !loading && results.length === 0 && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow-md'
          )}
        >
          No medicine found.
        </div>
      )}
    </div>
  )
}
