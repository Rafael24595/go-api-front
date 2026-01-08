import { UserData } from "../../interfaces/system/UserData"

export const STORAGE_THEME_KEY = "StoreProviderThemeCache";

export const makeCacheKey = (userData: UserData) => {
  return `${STORAGE_THEME_KEY}-${userData.username}`
}