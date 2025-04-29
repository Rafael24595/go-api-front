import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { findAllAction, findAllCollection, findAllHistoric, sortCollectionRequests, sortCollections, sortRequests } from "../services/api/ServiceStorage";
import { Request } from "../interfaces/request/Request";
import { ItemCollection } from "../interfaces/collection/Collection";
import { useStoreSession } from "./StoreProviderSession";
import { RequestNode } from "../services/api/Requests";

interface StoreProviderRequestsType {
  historic: Request[];
  stored: Request[];
  collection: ItemCollection[];
  fetchAll: () => Promise<void>;
  fetchHistoric: () => Promise<void>;
  fetchStored: () => Promise<void>;
  fetchCollection: () => Promise<void>;
  updateStoredOrder: (nodes: RequestNode[]) => Promise<void>;
  updateCollectionsOrder: (nodes: RequestNode[]) => Promise<void>;
  updateCollectionRequestsOrder: (collection: ItemCollection, nodes: RequestNode[]) => Promise<void>;
}

interface Payload {
  historic: Request[];
  stored: Request[];
  collection: ItemCollection[];
}

const TRIGGER_KEY = "StoreRequestsTrigger";

const StoreRequests = createContext<StoreProviderRequestsType | undefined>(undefined);

export const StoreProviderRequests: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { pushTrigger } = useStoreSession();

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

    pushTrigger(TRIGGER_KEY, cleanFetchAll);

    return () => clearInterval(interval);
  }, []);

  const cleanFetchAll = async () => {
    clean();
    fetchAll();
  };

  const clean = async () => {
    setData((prevData) => ({
      ...prevData,
      historic: [],
      stored: [],
      collection: [],
    }));
  };

  const fetchAll = async () => {
    fetchHistoric();
    fetchStored();
    fetchCollection();
  };

  const fetchHistoric = async () => {
    try {
      const data = (await findAllHistoric())
        .sort((a, b) => b.order - a.order)
        .map(n => n.request);
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
        .sort((a, b) => a.order - b.order)
        .map(n => n.request);
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
        .sort((a, b) => a.order - b.order)
        .map(n => n.collection);
      setData((prevData) => ({
        ...prevData,
        collection: data
      }));
    } catch (error) {
      console.error("Error fetching collection:", error);
    }
  };

  const updateStoredOrder = async (nodes: RequestNode[]) => {
    setData((prevData) => {
      const stored = nodes
        .map(n => data.stored.find(r => r._id == n.item))
        .filter(r => r != undefined);
      return {
        ...prevData,
        stored
      }
    })
    await sortRequests(nodes)
  }

  const updateCollectionsOrder = async (nodes: RequestNode[]) => {
    setData((prevData) => {
      const collection = nodes
        .map(n => data.collection.find(r => r._id == n.item))
        .filter(r => r != undefined);
      return {
        ...prevData,
        collection
      }
    })
    await sortCollections(nodes)
  }

  const updateCollectionRequestsOrder = async (collection: ItemCollection, nodes: RequestNode[]) => {
    setData((prevData) => {
      const newCollection = [...prevData.collection];
      for (let i = 0; i < newCollection.length; i++) {
        const cursor = newCollection[i];
        if(cursor._id = collection._id) {
          newCollection[i].nodes = nodes
            .map(n => cursor.nodes.find(r => r.request._id == n.item))
            .filter(r => r != undefined);
        } 
      }
      return {
        ...prevData,
        collection: newCollection
      }
    })
    await sortCollectionRequests(collection._id, nodes)
  }

  return (
    <StoreRequests.Provider value={{ ...data, fetchAll, fetchHistoric, fetchStored, fetchCollection, updateStoredOrder, updateCollectionsOrder, updateCollectionRequestsOrder }}>
      {children}
    </StoreRequests.Provider>
  );
};

export const useStoreRequests = (): StoreProviderRequestsType => {
  const context = useContext(StoreRequests);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderRequests");
  }
  return context;
};
