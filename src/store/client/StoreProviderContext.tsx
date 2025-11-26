import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Context, fromContext, ItemContext, newContext, newItemContext, toContext } from "../../interfaces/client/context/Context";
import { findContext, findUserContext, insertContext } from "../../services/api/ServiceStorage";
import { generateHash } from "../../services/Utils";
import { CacheContext } from "../../interfaces/client/Cache";
import { useStoreCache } from "../StoreProviderCache";
import { Optional } from "../../types/Optional";
import { useStoreSession } from "../system/StoreProviderSession";

const TRIGGER_KEY = "StoreProviderContextTrigger";
const CACHE_KEY = "StoreProviderContextCache";

interface StoreProviderContextType {
  initialHash: string;
  actualHash: string;
  backup: ItemContext;
  context: ItemContext;
  getContext: () => Context;
  discardContext: (context?: string) => void;
  defineContext: (context: Context, parent?: string) => void;
  defineItemContext: (context: ItemContext, parent?: string) => void;
  updateContext: (context: ItemContext) => void;
  fetchContext: (id?: string, parent?: string) => Promise<void>;
  releaseContext: () => Promise<Context>;
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
  const { userData, pushTrigger } = useStoreSession();
  const { gather, search, exists, insert, excise, remove, length } = useStoreCache();

  const [data, setData] = useState<Payload>({
    initialHash: "",
    actualHash: "",
    parent: "",
    backup: newItemContext(userData.username),
    context: newItemContext(userData.username),
    loading: true,
  });

  useEffect(() => {
    pushTrigger(TRIGGER_KEY, cleanCache);
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

  const cleanCache = () => {
    excise(CACHE_KEY);
  }

  const discardContext = (context?: string) => {
    if(!context || context == data.backup._id) {
      return defineContextData(data.backup, data.backup, data.parent);
    }

    remove(CACHE_KEY, context);

    setData(prevData => {
      return { ...prevData };
    });
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
    let cached: Optional<CacheContext> = search(CACHE_KEY, id || userData.username);
    if(cached != undefined) {
      return defineContextData(cached.backup, cached.context, cached.parent);
    }
    
    const request = id == undefined 
      ? findUserContext()
      : findContext(id);

    const context = await request.catch(() => 
      newContext(userData.username));
  
    if (data.loading) {
      cached = search(CACHE_KEY, context._id);
      if(cached != undefined) {
        return defineContextData(cached.backup, cached.context, cached.parent);
      }
    }
      
    defineContext(context, parent);
  };

  const releaseContext = async () => {
      const context = toContext(data.context)
      const response = await insertContext(context);

      const fixContext = { ...context };

      fixContext._id = response;
      
      defineContext(fixContext);

      return fixContext;
  }

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

    return `Unsaved ${collected} context.`;
  }

  const cacheLenght = () => {
    return length(CACHE_KEY);
  }

  return (
    <StoreContext.Provider value={{ ...data, 
      getContext, discardContext, defineContext, 
      defineItemContext, updateContext, fetchContext, 
      releaseContext, isParentCached, cacheComments, 
      cacheLenght }}>
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
