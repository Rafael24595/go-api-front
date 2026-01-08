import { Dispatch, SetStateAction, useRef,  } from "react";
import { Dict } from "../../types/Dict";
import { ITheme, ThemeLight, Themes, ThemesDefault, themeToCSS } from "./Themes";
import { UserData } from "../../interfaces/system/UserData";
import { Optional } from "../../types/Optional";
import { useStoreSession } from "../system/StoreProviderSession";
import { useStoreStatus } from "../StoreProviderStatus";
import { makeCacheKey } from "./Helper";

interface StoreControllerThemeType {
  setTheme: Dispatch<SetStateAction<string>>
}

export const useThemeController = ({ setTheme }: StoreControllerThemeType) => {
  const { fetchWebData } = useStoreSession();
  const { find } = useStoreStatus();

  const customRef = useRef<Dict<ITheme>>({});
  const waitingRef = useRef(false);

  const applyTheme = (theme: string) => {
    const themeDefault = ThemesDefault[theme];
    if (themeDefault) {
      setTheme(themeDefault.code);
      return true;
    }

    const themeLazy = Themes[theme] || customRef.current[theme];
    if (themeLazy) {
      injectTheme(themeLazy);
      setTheme(themeLazy.code);
      return true;
    }

    return false;
  }

  const findSyncThemeCode = async (userData: UserData): Promise<Optional<string>> => {
    if (waitingRef.current) {
      return findCacheThemeCode(userData);
    }

    const webData = await fetchWebData();
    if (userData.username != webData.owner) {
      return;
    }

    return webData.data.theme || findCacheThemeCode(userData);
  }

  const findCacheThemeCode = (userData: UserData) => {
    const key = makeCacheKey(userData);
    return find(key, { def: ThemeLight.code });
  }

  const injectTheme = (theme: ITheme) => {
    const existingStyle = document.querySelector(`style[data-theme-name="${theme.code}"]`);
    const cssContent = themeToCSS(theme);

    document.documentElement.setAttribute("data-theme", theme.code);

    if (existingStyle) {
      existingStyle.textContent = cssContent;
      return;
    }

    const style = document.createElement('style');
    style.setAttribute('data-theme-name', theme.code);
    style.textContent = cssContent;
    document.head.appendChild(style);
  }

  return {
    customRef,
    waitingRef,

    findSyncThemeCode, applyTheme
  }
}
