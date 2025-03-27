import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { findAllAction, findAllHistoric } from "../services/api/ServiceStorage";
import { Request } from "../interfaces/request/Request";

interface StoreProviderRequestsType {
  historic: Request[];
  stored: Request[];
  fetchAll: () => Promise<void>;
  fetchHistoric: () => Promise<void>;
  fetchStored: () => Promise<void>;
}

interface Payload {
  historic: Request[];
  stored: Request[];
}

const StoreContext = createContext<StoreProviderRequestsType | undefined>(undefined);

export const StoreProviderRequests: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    historic: [],
    stored: []
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
};

  const fetchHistoric = async () => {
      try {
          const data = (await findAllHistoric("anonymous"))
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
          const data = (await findAllAction("anonymous"))
              .sort((a, b) => b.timestamp - a.timestamp);
          setData((prevData) => ({
            ...prevData,
            stored: data
          }));
      } catch (error) {
          console.error("Error fetching history:", error);
      }
  };

  return (
    <StoreContext.Provider value={{ ...data, fetchAll, fetchHistoric, fetchStored }}>
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
