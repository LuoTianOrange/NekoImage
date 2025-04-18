import { defineStore } from 'pinia'
import { useDark, useToggle } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const isDark = useDark()
  const toggleDark = useToggle(isDark)

  function initTheme() {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) toggleDark(savedTheme === 'dark')
  }

  return { isDark, toggleDark, initTheme }
})
