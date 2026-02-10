import { useState, useRef, useEffect } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { Badge } from '@/components/ui/badge'
import { Command, CommandList, CommandItem } from '@/components/ui/command'
import { X } from 'lucide-react'
import { useTagAutocomplete } from '../hooks/useTagAutocomplete'

export function stringToTags(str: string): string[] {
  if (!str.trim()) return []
  return str.split(',').map((s) => s.trim()).filter(Boolean)
}

export function tagsToString(tags: string[]): string {
  return tags.join(',')
}

export function TagAutocomplete(props: {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  tagType?: string
}) {
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: suggestions } = useTagAutocomplete(input, props.tagType)

  const filtered = (suggestions ?? []).filter(
    (s) => !props.value.includes(s.name),
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function addTag(name: string) {
    if (!props.value.includes(name)) {
      props.onChange([...props.value, name])
    }
    setInput('')
    setOpen(false)
    inputRef.current?.focus()
  }

  function removeTag(name: string) {
    props.onChange(props.value.filter((t) => t !== name))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && input === '' && props.value.length > 0) {
      removeTag(props.value[props.value.length - 1])
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <Command
      ref={containerRef}
      shouldFilter={false}
      className="overflow-visible bg-transparent"
    >
      <div
        className="flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1 min-h-8 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {props.value.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs gap-1 shrink-0">
            {tag}
            <button
              type="button"
              className="rounded-full outline-none hover:bg-muted-foreground/20"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
        <CommandPrimitive.Input
          ref={inputRef}
          value={input}
          onValueChange={(value) => {
            setInput(value)
            setOpen(true)
          }}
          onFocus={() => {
            if (input.length >= 1) setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={props.value.length === 0 ? (props.placeholder ?? 'Type to search tags...') : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="relative">
        {open && filtered.length > 0 && (
          <CommandList className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
            {filtered.map((s) => (
              <CommandItem
                key={s.id}
                value={s.name}
                onSelect={() => addTag(s.name)}
              >
                {s.name}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </div>
    </Command>
  )
}
