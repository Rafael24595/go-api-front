import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Dict } from "../types/Dict";
import { Optional } from "../types/Optional";

interface StoreOptions<T> {
    stringifier?: (value: T) => string
}

export interface FindOptions<T> {
    def: T;
    range?: T[];
    strict?: boolean;
    parser?: (value: string) => T;
}

interface FindAllOptions<T> {
    prefix?: boolean;
    sufix?: boolean;
    parser?: (value: string) => T | null;
}

interface RemoveOptions<T> {
    parser?: (value: string) => T;
}

interface StoreProviderStatusType {
    find: <T>(key: string, options: FindOptions<T>) => T;
    findAll: <T>(key: string, options: FindAllOptions<T>) => T[];
    store: <T>(key: string, value: T, options?: StoreOptions<T>) => T;
    remove: <T>(key: string, options?: RemoveOptions<T>) => Optional<T>;
    clean: () => void;
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

    const statusRef = useRef(data.status);

    useEffect(() => {
        storageStatus(data.status);
        statusRef.current = data.status;
    }, [data.status]);

    const find = <T,>(key: string, options: FindOptions<T>): T => {
        const value = statusRef.current[key];
        if (value == undefined && options?.def != undefined) {
            return options.def;
        }

        const parsed = tryParse(value, options.def, options?.parser);

        for (const element of options?.range || []) {
            if (parsed == element) {
                return parsed;
            }
        }

        if (options?.strict && options?.def != undefined) {
            return options.def;
        }

        return parsed;
    }

    const findAll = <T,>(key: string, options?: FindAllOptions<T>): T[] => {
        const result = [];
        for (const [k, v] of Object.entries(statusRef.current)) {
            let coindidence = null
            if (options?.prefix && k.startsWith(key)) {
                coindidence = v;
            }

            if (options?.sufix && k.endsWith(key)) {
                coindidence = v;
            }

            if (k == key) {
                coindidence = v;
            }

            if (coindidence != null && options?.parser) {
                const parsed = options.parser(v);
                if (parsed != null) {
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

    const remove = <T,>(key: string, options?: RemoveOptions<T>): Optional<T> => {
        const value = statusRef.current[key];
        if (value == undefined) {
            return value
        }

        setData((prevData) => {
            const newStatus = { ...prevData.status };
            delete newStatus[key];
            return {
                ...prevData,
                status: newStatus
            }
        });

        const parsed = tryParse(value, value, options?.parser);
        if (typeof parsed == "string") {
            return null;
        }

        return parsed;
    }

    const clean = (): void => {
        setData((prevData) => {
            return {
                ...prevData,
                status: {}
            }
        });
    }

    const tryParse = <T, K>(value: string, def: T, parser?: (value: string) => K) => {
        if (!parser) {
            return typeof def === typeof value
                ? value as T
                : def;
        }

        try {
            return parser(value);
        } catch (error) {
            return def;
        }
    }

    return (
        <StoreStatus.Provider value={{ find, findAll, store, remove, clean }}>
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
        if (!storage) {
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
