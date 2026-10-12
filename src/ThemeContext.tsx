import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeDef, getThemeById } from './themes';
import { getEquippedTheme } from './storage';

const ThemeContext = createContext<{ themeDef: ThemeDef; reloadTheme: () => void }>({
  themeDef: getThemeById('aero'),
  reloadTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeDef, setThemeDef] = useState<ThemeDef>(getThemeById('aero'));

  const reloadTheme = async () => {
    const id = await getEquippedTheme();
    setThemeDef(getThemeById(id));
  };

  useEffect(() => {
    reloadTheme();
  }, []);

  return <ThemeContext.Provider value={{ themeDef, reloadTheme }}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
