import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Context, fromContext, ItemContext, newContext, newItemContext, toContext } from "../interfaces/context/Context";
import { findContext } from "../services/api/ServiceStorage";
import { generateHash } from "../services/Utils";

interface StoreProviderContextType {
  initialHash: string;
  actualHash: string;
  backup: ItemContext;
  context: ItemContext;
  getContext: () => Context;
  defineContext: (value: ItemContext) => void;
  switchContext: (value?: ItemContext) => Promise<void>;
  updateContext: (value: ItemContext) => void;
  fectchContext: () => Promise<void>;
}

interface Payload {
  initialHash: "",
  actualHash: "",
  backup: ItemContext;
  context: ItemContext;
  loading: boolean;
}

const StoreContext = createContext<StoreProviderContextType | undefined>(undefined);

export const StoreProviderContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    initialHash: "",
    actualHash: "",
    backup: newItemContext("anonymous"),
    context: newItemContext("anonymous"),
    loading: true,
  });

  useEffect(() => {
    fectchContext();
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
    const newHash = await generateHash(toContext(context));
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
      context: context,
      loading: false
    }));
  }

  const switchContext = async (context?: ItemContext) => {
    if(!context) {
      await fectchContext();
      return;
    }

    if(context._id != data.context._id) {
      defineContext(context);
    }
  }

  const updateContext = (context: ItemContext) => {
    setData(prevData => ({
      ...prevData,
      context
    }));
  }

  const fectchContext = async () => {
    const context = await findContext("anonymous")
      .catch(() => newContext("anonymous"));
    const item = fromContext(context );
    defineContext(item);
  };

  return (
    <StoreContext.Provider value={{ ...data, getContext, defineContext, switchContext, updateContext, fectchContext }}>
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
