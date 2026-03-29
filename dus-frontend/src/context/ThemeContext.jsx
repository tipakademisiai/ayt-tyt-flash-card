import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('dus-theme') !== 'light'
  })

  useEffect(() => {
    localStorage.setItem('dus-theme', dark ? 'dark' : 'light')
    document.body.classList.toggle('dark', dark)
    document.body.classList.toggle('light', !dark)
  }, [dark])

  const toggleTheme = () => setDark(d => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
