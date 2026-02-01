"use client"

import { useEffect, useCallback } from 'react'

type HotkeyCallback = (event: KeyboardEvent) => void

interface HotkeyConfig {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  callback: HotkeyCallback
}

/**
 * Hook for handling keyboard shortcuts
 * @param hotkeys Array of hotkey configurations
 */
export function useHotkeys(hotkeys: HotkeyConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger hotkeys when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const hotkey of hotkeys) {
        const keyMatch = event.key.toLowerCase() === hotkey.key.toLowerCase()
        const ctrlMatch = hotkey.ctrlKey ? event.ctrlKey || event.metaKey : true
        const shiftMatch = hotkey.shiftKey ? event.shiftKey : !event.shiftKey
        const altMatch = hotkey.altKey ? event.altKey : !event.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault()
          hotkey.callback(event)
          break
        }
      }
    },
    [hotkeys]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Simple single hotkey hook
 */
export function useHotkey(
  key: string,
  callback: HotkeyCallback,
  options?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
) {
  useHotkeys([
    {
      key,
      ctrlKey: options?.ctrl,
      shiftKey: options?.shift,
      altKey: options?.alt,
      callback,
    },
  ])
}
