import { createContext, ReactNode, useContext, useState } from "react";
import { Dict } from "../types/Dict";
import { Optional } from "../types/Optional";

interface StoreProviderCacheType {
    search: <T>(category: string, key: string) => Optional<T>;
    locate: <T>(category: string, predicate: (key: string, item: T) => boolean) => Optional<T>;
    exists: <T>(category: string, predicate: (key: string, item: T) => boolean) => boolean;
    insert: <T>(category: string, key: string, value: T) => Optional<T>;
    remove: <T>(category: string, key: string) => Optional<T>;
}

interface Payload {
  cache: Dict<Dict<any>>
}

const StoreCache = createContext<StoreProviderCacheType | undefined>(undefined);

export const StoreProviderCache: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<Payload>({
        cache: {}
    });
    
    const search = <T,>(category: string, key: string): Optional<T> => {
      if(data.cache[category] == undefined) {
        return undefined
      }
      return data.cache[category][key]
    }

    const locate = <T,>(category: string, predicate: (key: string, item: T) => boolean): Optional<T> => {
      if(data.cache[category] == undefined) {
        return undefined
      }
      return Object.entries(data.cache[category])
        .find(([k, v]) => predicate(k, v))?.[1];
    }

    const exists = <T,>(category: string, predicate: (key: string, item: T) => boolean): boolean => {
      return locate(category, predicate) != undefined
    }

    const insert = <T,>(category: string, key: string, value: T): T => {
        setData((prevData) => {
            const newCache = { ...prevData.cache };
            if(newCache[category] == undefined) {
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

    const remove = <T,>(category: string, key: string): Optional<T> => {
      let item: T | undefined = undefined
      if(data.cache[category] != undefined && data.cache[category][key] != undefined) {
        item = data.cache[category][key];
        delete data.cache[category][key];
      }

      if(data.cache[category] != undefined && Object.keys(data.cache[category]).length == 0) {
        delete data.cache[category];
      }

      return item;
    }

    return (
        <StoreCache.Provider value={{ search, locate, exists, insert, remove }}>
          {children}
        </StoreCache.Provider>
      );
};

export const useStoreCache = (): StoreProviderCacheType => {
  const context = useContext(StoreCache);
  if (!context) {
    throw new Error("useStoreStatus must be used within a StoreProviderStatus");
  }
  return context;
};
