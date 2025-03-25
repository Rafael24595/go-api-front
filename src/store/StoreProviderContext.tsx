import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Context, fromContext, ItemContext, newItemContext } from "../interfaces/context/Context";
import { findContext } from "../services/api/ServiceStorage";
import { generateHash, mergeStatusCategoryKeyValueAsItem } from "../services/Utils";

interface StoreContextType {
  initialHash: string;
  actualHash: string;
  context: ItemContext;
  backup: ItemContext;
  getContext: () => Context;
  defineContext: (value: ItemContext) => void;
  updateContext: (value: ItemContext) => void;
}

interface Payload {
  initialHash: "",
  actualHash: "",
  backup: ItemContext;
  context: ItemContext;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProviderContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [context, setContextData] = useState<Payload>({
    initialHash: "",
    actualHash: "",
    backup: newItemContext("anonymous"),
    context: newItemContext("anonymous"),
    loading: true,
  });

  useEffect(() => {
    const loadContext = async () => {
      const context = await findContext("anonymous");
      const item = fromContext(context);
      setContextData(prevData => ({
        ...prevData,
        backup: item,
        context: item,
        loading: false
      }));
    };
    loadContext();
  }, []);

  useEffect(() => {
    if (context.loading) {
      return;
    }

    if (context.initialHash == "") {
      setHash("initialHash", context.backup);
      setHash("actualHash", context.backup);
    }

    if (context.context) {
      setHash("actualHash", context.context);
    }

  }, [context.context]);

  const setHash = async (key: string, context: ItemContext) => {
    const newHash = await generateHash(context);
    setContextData(prevData => ({
      ...prevData,
      [key]: newHash
    }));
    return newHash;
  }

  const getContext = (): Context => {
    return {
      _id: context.context._id,
      status: context.context.status,
      timestamp: context.context.timestamp,
      dictionary: mergeStatusCategoryKeyValueAsItem(context.context.dictionary),
      owner: context.context.owner,
      modified: context.context.modified
    }
  }

  const defineContext = (context: ItemContext) => {
    setContextData(prevData => ({
      ...prevData,
      initialHash: "",
      actualHash: "",
      context
    }));
  }

  const updateContext = (context: ItemContext) => {
    setContextData(prevData => ({
      ...prevData,
      context
    }));
  }

  return (
    <StoreContext.Provider value={{ ...context, getContext, defineContext, updateContext }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderClient");
  }
  return context;
};