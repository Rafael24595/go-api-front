import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { findAllAction, findAllCollection, findAllHistoric } from "../services/api/ServiceStorage";
import { Request } from "../interfaces/request/Request";
import { ItemCollection } from "../interfaces/collection/Collection";

interface StoreProviderRequestsType {
  historic: Request[];
  stored: Request[];
  collection: ItemCollection[];
  fetchAll: () => Promise<void>;
  fetchHistoric: () => Promise<void>;
  fetchStored: () => Promise<void>;
  fetchCollection: () => Promise<void>;
}

interface Payload {
  historic: Request[];
  stored: Request[];
  collection: ItemCollection[];
}

const StoreContext = createContext<StoreProviderRequestsType | undefined>(undefined);

export const StoreProviderRequests: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    historic: [],
    stored: [],
    collection: []
  });

  useEffect(() => {
    fetchAll();

    const interval = setInterval(() => {
      fetchAll();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    fetchHistoric();
    fetchStored();
    fetchCollection();
};

  const fetchHistoric = async () => {
      try {
          const data = (await findAllHistoric())
              .sort((a, b) => b.timestamp - a.timestamp);
          setData((prevData) => ({
            ...prevData,
            historic: data
          }));
      } catch (error) {
          console.error("Error fetching history:", error);
      }
  };

  const fetchStored = async () => {
      try {
          const data = (await findAllAction())
              .sort((a, b) => b.timestamp - a.timestamp);
          setData((prevData) => ({
            ...prevData,
            stored: data
          }));
      } catch (error) {
          console.error("Error fetching stored:", error);
      }
  };

  const fetchCollection = async () => {
    try {
        const data = (await findAllCollection())
            .sort((a, b) => b.timestamp - a.timestamp);
        setData((prevData) => ({
          ...prevData,
          collection: data
        }));
    } catch (error) {
        console.error("Error fetching collection:", error);
    }
};

  return (
    <StoreContext.Provider value={{ ...data, fetchAll, fetchHistoric, fetchStored, fetchCollection }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreRequests = (): StoreProviderRequestsType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderClient");
  }
  return context;
};
