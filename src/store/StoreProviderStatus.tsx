import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Dict } from "../types/Dict";

interface StoreOptions<T> {
    stringifier?: (value: T) => string
}

interface FindOptions<T> {
    def?: T;
    range?: T[];
    parser?: (value: string) => T;
}

interface FindOptionsDefault<T> {
    def: T;
    range?: T[];
    parser?: (value: string) => T;
}

interface FindAllOptions<T> {
    prefix?: boolean;
    sufix?: boolean;
    parser?: (value: string) => T | null;
}

interface StoreProviderStatusType {
    store: <T>(key: string, value: T, options?: StoreOptions<T>) => T;
    find: <T>(key: string, options?: FindOptions<T>) => T | string;
    findOrDefault: <T>(key: string, options: FindOptionsDefault<T>) => T;
    findAll: <T>(key: string, options: FindAllOptions<T>) => T[];
}

interface Payload {
  status: Dict<string>
}

const STORAGE_KEY = "STORAGE_KEY";

const StoreStatus = createContext<StoreProviderStatusType | undefined>(undefined);

export const StoreProviderStatus: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<Payload>({
        status: findStatus()
    });

    useEffect(() => {
        storageStatus(data.status);
    }, [data.status]);
    
    const find = <T,>(key: string, options?: FindOptions<T>): T | string => {
        const value = data.status[key];
        if(value == undefined && options?.def != undefined) {
            return options.def;
        }

        const parsed = tryParse(value, value, options?.parser);

        for (const element of options?.range || []) {
            if(parsed == element) {
                return parsed;
            }
        }

        return parsed;
    }

    const findOrDefault = <T,>(key: string, options: FindOptionsDefault<T>): T => {
        const value = data.status[key];
        if(!value == undefined) {
            return options.def;
        }

        const parsed = tryParse(value, options.def, options.parser);

        for (const element of options?.range || []) {
            if(parsed == element) {
                return parsed;
            }
        }

        return parsed;
    }

    const findAll = <T,>(key: string, options?: FindAllOptions<T>): T[] => {
        const result = [];
        for (const [k, v] of Object.entries(data.status)) {
            let coindidence = null
            if(options?.prefix && k.startsWith(key)) {
                coindidence = v;
            }

            if(options?.sufix && k.endsWith(key)) {
                coindidence = v;
            }

            if(k == key) {
                coindidence = v;
            }

            if(coindidence != null && options?.parser) {
                const parsed = options.parser(v);
                if(parsed != null) {
                    result.push(parsed)
                }
            }
        }
        return result;
    }

    const store = <T,>(key: string, value: T, options?: StoreOptions<T>): T => {
        const valueString = options && options.stringifier 
            ? options.stringifier(value) 
            : `${value}`;
        setData((prevData) => ({
            ...prevData,
            status: {
                ...prevData.status,
                [key]: valueString
            }
        }));
        return value;
    }
  
    const tryParse = <T,K>(value: string, def: K, parser?: (value: string) => T) => {
        try {
            return parser ? parser(value) : def;
        } catch (error) {
            return def;
        }
    }

    return (
        <StoreStatus.Provider value={{ find, findOrDefault, findAll, store }}>
          {children}
        </StoreStatus.Provider>
      );
};

export const useStoreStatus = (): StoreProviderStatusType => {
  const context = useContext(StoreStatus);
  if (!context) {
    throw new Error("useStoreStatus must be used within a StoreProviderStatus");
  }
  return context;
};

const findStatus = (): Dict<string> => {
    try {
        const storage = localStorage.getItem(STORAGE_KEY);
        if(!storage) {
            return {};
        }
        return JSON.parse(storage);
    } catch (error) {
        return storageStatus({});
    }
}

const storageStatus = (status: Dict<string>): Dict<string> => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    return status;
}
