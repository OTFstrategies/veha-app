import { create } from 'zustand'

interface NotificationState {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  toggle: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
