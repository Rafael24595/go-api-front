import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Context, fromContext, ItemContext, newContext, newItemContext, toContext } from "../interfaces/context/Context";
import { findContext, findUserContext } from "../services/api/ServiceStorage";
import { generateHash } from "../services/Utils";
import { Dict } from "../types/Dict";
import { CacheContext } from "../interfaces/CacheContext";

interface StoreProviderContextType {
  initialHash: string;
  actualHash: string;
  backup: ItemContext;
  context: ItemContext;
  getContext: () => Context;
  defineContext: (value: Context, parent?: string) => void;
  defineItemContext: (value: ItemContext, parent?: string) => void;
  updateContext: (value: ItemContext) => void;
  fetchContext: (id?: string, parent?: string) => Promise<void>;
}

interface Payload {
  cache: Dict<CacheContext>
  initialHash: string,
  actualHash: string,
  parent: string,
  backup: ItemContext;
  context: ItemContext;
  loading: boolean;
}

const StoreContext = createContext<StoreProviderContextType | undefined>(undefined);

export const StoreProviderContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    cache: {},
    initialHash: "",
    actualHash: "",
    parent: "",
    backup: newItemContext("anonymous"),
    context: newItemContext("anonymous"),
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

    const newCache = { ...data.cache };
    if(actualHash != initialHash) {
      newCache[context._id] = {
        parent: data.parent,
        backup: data.backup,
        context: context
      };
    } else {
      delete newCache[context._id];
    }

    setData(prevData => ({
      ...prevData,
      initialHash,
      actualHash,
      cache: newCache,
    }));
  }

  const calculateHash = async (context: ItemContext) => {
    return await generateHash(toContext(context));
  }

  const getContext = (): Context => {
    return toContext(data.context);
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
      backup: backup,
      context: context,
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
    const cached = data.cache[id || "anonymous"];
    if(cached != undefined) {
      defineContextData(cached.backup, cached.context, cached.parent);
      return;
    }
    
    const request = id == undefined 
      ? findUserContext()
      : findContext(id);

    const context = await request.catch(
      () => newContext("anonymous"));
      
    defineContext(context, parent);
  };

  return (
    <StoreContext.Provider value={{ ...data, getContext, defineContext, defineItemContext, updateContext, fetchContext }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = (): StoreProviderContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderClient");
  }
  return context;
};
