import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { findAllAction, findAllCollection, findAllHistoric, findCollectionLite, sortCollectionRequests, sortCollections, sortRequests } from "../services/api/ServiceStorage";
import { LiteRequest } from "../interfaces/request/Request";
import { LiteItemCollection, newCollection } from "../interfaces/collection/Collection";
import { useStoreSession } from "./StoreProviderSession";
import { RequestNode } from "../services/api/Requests";
import { generateHash } from "../services/Utils";

interface StoreProviderRequestsType {
  historic: LiteRequest[];
  stored: LiteRequest[];
  collection: LiteItemCollection[];
  fetchAll: () => Promise<void>;
  fetchHistoric: () => Promise<void>;
  fetchStored: () => Promise<void>;
  fetchCollection: () => Promise<void>;
  fetchCollectionItem: (item: LiteItemCollection) => Promise<void>;
  updateStoredOrder: (nodes: RequestNode[]) => Promise<void>;
  updateCollectionsOrder: (nodes: RequestNode[]) => Promise<void>;
  updateCollectionRequestsOrder: (lite: LiteItemCollection, nodes: RequestNode[]) => Promise<void>;
}

interface PayloadRequest {
  items: LiteRequest[];
  hash: string;
}

interface PayloadCollection {
  items: LiteItemCollection[];
  hash: string;
}

const TRIGGER_KEY = "StoreRequestsTrigger";

const StoreRequests = createContext<StoreProviderRequestsType | undefined>(undefined);

export const StoreProviderRequests: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { pushTrigger } = useStoreSession();

  const [historic, setHistoric] = useState<PayloadRequest>({
    items: [],
    hash: ""
  });

  const [stored, setStored] = useState<PayloadRequest>({
    items: [],
    hash: ""
  });

  const [collection, setCollection] = useState<PayloadCollection>({
    items: [],
    hash: ""
  });

  useEffect(() => {
    fetchAll();

    const interval = setInterval(() => {
      fetchAll();
    }, 30 * 60 * 1000);

    pushTrigger(TRIGGER_KEY, cleanFetchAll);

    return () => clearInterval(interval);
  }, []);

  const cleanFetchAll = async () => {
    clean();
    fetchAll();
  };

  const clean = async () => {
    setHistoric({
      items: [],
      hash: "",
    });
    setStored({
      items: [],
      hash: "",
    });
    setCollection({
      items: [],
      hash: "",
    });
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

      const newHash = await generateHash(data);
      
      setHistoric((prevData) => {
        if(prevData.hash == newHash) {
          return prevData;
        }

        return {
          items: data,
          hash: newHash
        };
      });
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const fetchStored = async () => {
    try {
      const data = (await findAllAction())
        .sort((a, b) => a.order - b.order)
        .map(n => n.request);
      
      const newHash = await generateHash(data);

      setStored((prevData) => {
        if(prevData.hash == newHash) {
          return prevData;
        }

        return {
          items: data,
          hash: newHash
        };
      });
    } catch (error) {
      console.error("Error fetching stored:", error);
    }
  };

  const fetchCollection = async () => {
    try {
      const data = (await findAllCollection())
        .sort((a, b) => a.order - b.order)
        .map(n => n.collection);
    
      const newHash = await generateHash(data);

      setCollection((prevData) => {
        if(prevData.hash == newHash) {
          return prevData;
        }

        return {
          items: data,
          hash: newHash
        };
      });
    } catch (error) {
      console.error("Error fetching collection:", error);
    }
  };

  const fetchCollectionItem = async (item: LiteItemCollection) => {
    try {
      const source = await findCollectionLite(item);
      const index = collection.items.findIndex(i => i._id == item._id);
      if(index < 0) {
        return;
      }

      const target = collection.items[index];

      const sourceHash = await generateHash(source);
      const targetHash = await generateHash(target);

      if(sourceHash == targetHash) {
        return;
      }

      fetchCollection();
    } catch (error) {
      console.error("Error fetching collection:", error);
    }
  };

  const updateStoredOrder = async (nodes: RequestNode[]) => {
    const items = nodes
      .map(n => stored.items.find(r => r._id == n.item))
      .filter(r => r != undefined);

    const newHash = await generateHash(items);

    setStored((prevData) => {
      if(prevData.hash == newHash) {
        return prevData;
      }

      return {
        items: items,
        hash: newHash
      };
    });
    
    await sortRequests(nodes)
  }

  const updateCollectionsOrder = async (nodes: RequestNode[]) => {
    const items = nodes
      .map(n => collection.items.find(r => r._id == n.item))
      .filter(r => r != undefined);

    const newHash = await generateHash(items);

    setCollection((prevData) => {
      if(prevData.hash == newHash) {
        return prevData;
      }

      return {
        items: items,
        hash: newHash
      };
    });

    await sortCollections(nodes)
  }

  const updateCollectionRequestsOrder = async (item: LiteItemCollection, nodes: RequestNode[]) => {
    const index = collection.items.findIndex(c => c._id == item._id);
    if(index < 0) {
      return;
    }

    const items = [...collection.items];
    const cursor = items[index];

    items[index].nodes = nodes
      .map(n => cursor.nodes.find(r => r.request._id == n.item))
      .filter(r => r != undefined);

    const newHash = await generateHash(newCollection);

    setCollection((prevData) => {
      if(prevData.hash == newHash) {
        return prevData;
      }

      return {
        items: items,
        hash: newHash
      };
    });

    await sortCollectionRequests(item._id, nodes)
  }

  return (
    <StoreRequests.Provider value={{ historic: historic.items, stored: stored.items, collection: collection.items, fetchAll, fetchHistoric, fetchStored, fetchCollection, fetchCollectionItem, updateStoredOrder, updateCollectionsOrder, updateCollectionRequestsOrder }}>
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
