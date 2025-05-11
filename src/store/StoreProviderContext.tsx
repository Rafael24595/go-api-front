import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Context, fromContext, ItemContext, newContext, newItemContext, toContext } from "../interfaces/context/Context";
import { findContext, findUserContext } from "../services/api/ServiceStorage";
import { generateHash } from "../services/Utils";
import { CacheContext } from "../interfaces/CacheContext";
import { useStoreCache } from "./StoreProviderCache";
import { Optional } from "../types/Optional";
import { useStoreSession } from "./StoreProviderSession";

const CACHE_KEY = "StoreProviderContextCache";

interface StoreProviderContextType {
  initialHash: string;
  actualHash: string;
  backup: ItemContext;
  context: ItemContext;
  getContext: () => Context;
  discardContext: () => void;
  defineContext: (context: Context, parent?: string) => void;
  defineItemContext: (context: ItemContext, parent?: string) => void;
  updateContext: (context: ItemContext) => void;
  fetchContext: (id?: string, parent?: string) => Promise<void>;
  isParentCached: (parent: string) => boolean;
  cacheComments: () => string[];
  cacheLenght: () => number;
}
interface Payload {
  initialHash: string,
  actualHash: string,
  parent: string,
  backup: ItemContext;
  context: ItemContext;
  loading: boolean;
}

const StoreContext = createContext<StoreProviderContextType | undefined>(undefined);

export const StoreProviderContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData } = useStoreSession();
  const { gather, search, exists, insert, remove, length } = useStoreCache();

  const [data, setData] = useState<Payload>({
    initialHash: "",
    actualHash: "",
    parent: "",
    backup: newItemContext(userData.username),
    context: newItemContext(userData.username),
    loading: true,
  });

  useEffect(() => {
    fetchContext();
  }, []);

  useEffect(() => {
    updateStatus(data.context);
  }, [data.context]);

  const updateStatus = async (context: ItemContext) => {
    if (data.loading) {
      return;
    }

    let initialHash = data.initialHash;
    if (data.initialHash == "") {
      initialHash = await calculateHash(data.backup);
    }

    const actualHash = await calculateHash(data.context);

    if(actualHash != initialHash) {
      insert(CACHE_KEY, context._id, {
        parent: data.parent,
        backup: data.backup,
        context: context
      });
    } else {
      remove(CACHE_KEY, context._id);
    }

    setData(prevData => ({
      ...prevData,
      initialHash,
      actualHash,
    }));
  }

  const calculateHash = async (context: ItemContext) => {
    return await generateHash(toContext(context));
  }

  const getContext = (): Context => {
    return toContext(data.context);
  }

  const discardContext = () => {
    defineContextData(data.backup, data.backup, data.parent);
  }

  const defineItemContext = (context: ItemContext, parent?: string) => {
    defineContextData(context, context, parent);
  }

  const defineContext = (context: Context, parent?: string) => {
    const item = fromContext(context);
    defineContextData(item, item, parent);
  }

  const defineContextData = (backup: ItemContext, context: ItemContext, parent?: string) => {
    setData(prevData => ({
      ...prevData,
      initialHash: "",
      actualHash: "",
      parent: parent || "",
      backup: { ...backup },
      context: { ...context },
      loading: false
    }));
  }

  const updateContext = (context: ItemContext) => {
    setData(prevData => ({
      ...prevData,
      context
    }));
  }

  const fetchContext = async (id?: string, parent?: string) => {
    const cached: Optional<CacheContext> = search(CACHE_KEY, id || userData.username);
    if(cached != undefined) {
      defineContextData(cached.backup, cached.context, cached.parent);
      return;
    }
    
    const request = id == undefined 
      ? findUserContext()
      : findContext(id);

    const context = await request.catch(
      () => newContext(userData.username));
      
    defineContext(context, parent);
  };

  const isParentCached = (parent: string) => {
    return exists(CACHE_KEY, (_: string, i: CacheContext) => i.parent == parent);
  }

  const cacheComments = () => {
    const contexts: CacheContext[] = gather(CACHE_KEY);
    return contexts.map(cacheComment);
  }

  const cacheComment = (cached: CacheContext) => {
    let collected = "global";
    if(cached.parent != undefined && cached.parent != "") {
      collected = "collected";
    }

    return `Unsafe ${collected} context.`;
  }

  const cacheLenght = () => {
    return length(CACHE_KEY);
  }

  return (
    <StoreContext.Provider value={{ ...data, 
      getContext, discardContext, defineContext, 
      defineItemContext, updateContext, fetchContext, 
      isParentCached, cacheComments, cacheLenght }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = (): StoreProviderContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderContext");
  }
  return context;
};
