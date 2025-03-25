import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Context, fromContext, ItemContext, newItemContext, toContext } from "../interfaces/context/Context";
import { findContext } from "../services/api/ServiceStorage";
import { generateHash } from "../services/Utils";

interface StoreContextType {
  initialHash: string;
  actualHash: string;
  backup: ItemContext;
  context: ItemContext;
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
  const [data, setData] = useState<Payload>({
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
      setData(prevData => ({
        ...prevData,
        backup: item,
        context: item,
        loading: false
      }));
    };
    loadContext();
  }, []);

  useEffect(() => {
    if (data.loading) {
      return;
    }

    if (data.initialHash == "") {
      setHash("initialHash", data.backup);
      setHash("actualHash", data.backup);
    }

    if (data.context) {
      setHash("actualHash", data.context);
    }

  }, [data.context]);

  const setHash = async (key: string, context: ItemContext) => {
    const newHash = await generateHash(context);
    setData(prevData => ({
      ...prevData,
      [key]: newHash
    }));
    return newHash;
  }

  const getContext = (): Context => {
    return toContext(data.context);
  }

  const defineContext = (context: ItemContext) => {
    setData(prevData => ({
      ...prevData,
      initialHash: "",
      actualHash: "",
      backup: context,
      context
    }));
  }

  const updateContext = (context: ItemContext) => {
    setData(prevData => ({
      ...prevData,
      context
    }));
  }

  return (
    <StoreContext.Provider value={{ ...data, getContext, defineContext, updateContext }}>
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
