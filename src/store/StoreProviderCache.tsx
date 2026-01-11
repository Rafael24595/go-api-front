import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Dict } from "../types/Dict";
import { Optional } from "../types/Optional";
import { useStoreStatus } from "./StoreProviderStatus";
import { jsonParser } from "./Helper";

const CACHE_PROVIDER_KEY = "StoreProviderCacheTarget";

export interface StoreProviderCacheType {
  gather: <T>(category: string) => T[];
  search: <T>(category: string, key: string) => Optional<T>;
  locate: <T>(category: string, predicate: (key: string, item: T) => boolean) => Optional<T>;
  exists: <T>(category: string, predicate: (key: string, item: T) => boolean) => boolean;
  insert: <T>(category: string, key: string, value: T) => Optional<T>;
  excise: <T>(category: string) => T[];
  remove: <T>(category: string, key: string) => Optional<T>;
  length: (category: string) => number;
}

interface Payload {
  //TODO: Implement volatile cache.
  cache: Dict<Dict<any>>
}

const StoreCache = createContext<StoreProviderCacheType | undefined>(undefined);

export const StoreProviderCache: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { find, store } = useStoreStatus();

  const [data, setData] = useState<Payload>({
    cache: find(CACHE_PROVIDER_KEY, jsonParser())
  });

  const cacheRef = useRef(data.cache);

  useEffect(() => {
    store(CACHE_PROVIDER_KEY, JSON.stringify(data.cache));
    cacheRef.current = data.cache;
  }, [data.cache]);

  const gather = <T,>(category: string): T[] => {
    if (cacheRef.current[category] == undefined) {
      return []
    }
    return Object.values(cacheRef.current[category]);
  }

  const search = <T,>(category: string, key: string): Optional<T> => {
    if (cacheRef.current[category] == undefined) {
      return undefined
    }
    return cacheRef.current[category][key]
  }

  const locate = <T,>(category: string, predicate: (key: string, item: T) => boolean): Optional<T> => {
    if (cacheRef.current[category] == undefined) {
      return undefined
    }
    return Object.entries(cacheRef.current[category])
      .find(([k, v]) => predicate(k, v))?.[1];
  }

  const exists = <T,>(category: string, predicate: (key: string, item: T) => boolean): boolean => {
    return locate(category, predicate) != undefined
  }

  const insert = <T,>(category: string, key: string, value: T): T => {
    setData((prevData) => {
      const newCache = { ...prevData.cache };
      if (newCache[category] == undefined) {
        newCache[category] = {};
      }

      newCache[category][key] = value;

      return {
        ...prevData,
        cache: newCache
      }
    });
    return value;
  }

  const excise = <T,>(category: string): T[] => {
    let items = [];
    if (cacheRef.current[category] != undefined) {
      items = Object.values(cacheRef.current[category]);
    }

    setData((prevData) => {
      const newCache = { ...prevData.cache };

      delete newCache[category];

      return {
        ...prevData,
        cache: newCache
      };
    });

    return items;
  }

  const remove = <T,>(category: string, key: string): Optional<T> => {
    let item: T | undefined = undefined
    if (cacheRef.current[category] != undefined && cacheRef.current[category][key] != undefined) {
      item = cacheRef.current[category][key];
    }

    setData((prevData) => {
      const newCache = { ...prevData.cache };

      if (newCache[category] != undefined) {
        if (newCache[category][key] != undefined) {
          delete newCache[category][key];
        }
        if (Object.keys(newCache[category]).length == 0) {
          delete newCache[category];
        }
      }

      return {
        ...prevData,
        cache: newCache
      };
    });

    return item;
  }

  const length = (category: string): number => {
    if (cacheRef.current[category] == undefined) {
      return 0
    }
    return Object.keys(cacheRef.current[category]).length;
  }

  return (
    <StoreCache.Provider value={{ gather, search, locate, exists, insert, excise, remove, length }}>
      {children}
    </StoreCache.Provider>
  );
};

export const useStoreCache = (): StoreProviderCacheType => {
  const context = useContext(StoreCache);
  if (!context) {
    throw new Error("useStoreStatus must be used within a StoreProviderCache");
  }
  return context;
};
