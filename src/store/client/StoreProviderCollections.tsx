import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, useMemo, useCallback } from "react";
import { findAllAction, sortRequests } from "../../services/api/ServiceStorage";
import { LiteRequest } from "../../interfaces/client/request/Request";
import { ItemNodeCollection, ItemNodeRequest, LiteItemCollection } from "../../interfaces/client/collection/Collection";
import { useStoreSession } from "../system/StoreProviderSession";
import { RequestNode } from "../../services/api/Requests";
import { generateHash } from "../../services/Utils";
import { findAllCollection, findCollectionLite, sortCollectionRequests, sortCollections } from "../../services/api/ServiceCollection";
import { findAllHistoric } from "../../services/api/ServiceHistory";
import { SignedPayload } from "../../interfaces/SignedPayload";
import { UserData } from "../../interfaces/system/UserData";

interface StoreProviderCollectionsType {
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

interface TriggerContext {
  setHistoric: Dispatch<React.SetStateAction<PayloadRequest>>,
  setStored: Dispatch<React.SetStateAction<PayloadRequest>>,
  setCollection: React.Dispatch<React.SetStateAction<PayloadCollection>>
}

const TRIGGER_KEY = "StoreRequestsTrigger";

const StoreCollection = createContext<StoreProviderCollectionsType | undefined>(undefined);

export const StoreProviderCollections: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData, loaded, fetchUser, pushTrigger, trimTrigger } = useStoreSession();

  const [historic, setHistoric] = useState<PayloadRequest>({
    hash: "",
    items: [],
  });

  const [stored, setStored] = useState<PayloadRequest>({
    hash: "",
    items: [],
  });

  const [collection, setCollection] = useState<PayloadCollection>({
    hash: "",
    items: [],
  });

  const triggerContext = useMemo<TriggerContext>(() => ({
    setHistoric,
    setStored,
    setCollection
  }), []);

  useEffect(() => {
    pushTrigger(TRIGGER_KEY, onSessionChange);

    if (loaded) {
      fetchAll(triggerContext, userData);
    }

    return () => {
      trimTrigger(TRIGGER_KEY);
    };
  }, []);

  const onSessionChange = useCallback(async (userData: UserData) => {
    cleanAll(triggerContext);
    fetchAll(triggerContext, userData);
  }, []);

  const fetchAllWithValidation = async () => {
    fetchHistoricWithValidation();
    fetchStoredWithValidation();
    fetchCollectionWithValidation();
  };

  const fetchHistoricWithValidation = async () => {
    const owner = await fetchHistoric(triggerContext, userData);
    if (owner != userData.username) {
      fetchUser();
    }
  };

  const fetchStoredWithValidation = async () => {
    const owner = await fetchStored(triggerContext, userData);
    if (owner != userData.username) {
      fetchUser();
    }
  };

  const fetchCollectionWithValidation = async () => {
    const owner = await fetchCollection(triggerContext, userData);
    if (owner != userData.username) {
      fetchUser();
    }
  };

  const fetchCollectionItem = async (item: LiteItemCollection) => {
    try {
      const source = await findCollectionLite(item);
      const index = collection.items.findIndex(i => i._id == item._id);
      if (index < 0) {
        return;
      }

      const target = collection.items[index];

      const sourceHash = await generateHash(source);
      const targetHash = await generateHash(target);

      if (sourceHash == targetHash) {
        return;
      }

      fetchCollectionWithValidation();
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
      if (prevData.hash == newHash) {
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
      if (prevData.hash == newHash) {
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
    if (index < 0) {
      return;
    }

    const items = [...collection.items];
    const cursor = items[index];

    items[index].nodes = nodes
      .map(n => cursor.nodes.find(r => r.request._id == n.item))
      .filter(r => r != undefined);

    const newHash = await generateHash(items);

    setCollection((prevData) => {
      if (prevData.hash == newHash) {
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
    <StoreCollection.Provider value={{ historic: historic.items, stored: stored.items, collection: collection.items, fetchAll: fetchAllWithValidation, fetchHistoric: fetchHistoricWithValidation, fetchStored: fetchStoredWithValidation, fetchCollection: fetchCollectionWithValidation, fetchCollectionItem, updateStoredOrder, updateCollectionsOrder, updateCollectionRequestsOrder }}>
      {children}
    </StoreCollection.Provider>
  );
};

const cleanAll = (ctx: TriggerContext) => {
  ctx.setHistoric({
    hash: "",
    items: [],
  });
  ctx.setStored({
    hash: "",
    items: [],
  });
  ctx.setCollection({
    hash: "",
    items: [],
  });
};

const fetchAll = async (ctx: TriggerContext, userData: UserData) => {
  fetchHistoric(ctx, userData);
  fetchStored(ctx, userData);
  fetchCollection(ctx, userData);
};

const fetchHistoric = async (ctx: TriggerContext, userData: UserData): Promise<string> => {
  const response: SignedPayload<ItemNodeRequest[]> = await findAllHistoric()
    .catch((e) => {
      console.error("Error fetching history:", e);
      return { owner: "", payload: [] };
    });

  if (response.owner == "" || response.owner != userData.username) {
    return response.owner;
  }

  const data = response.payload
    .sort((a, b) => b.order - a.order)
    .map(n => n.request);

  const newHash = await generateHash(data);

  ctx.setHistoric((prevData) => {
    if (prevData.hash == newHash) {
      return prevData;
    }

    return {
      items: data,
      hash: newHash
    };
  });

  return response.owner;
};

const fetchStored = async (ctx: TriggerContext, userData: UserData): Promise<string> => {
  const response: SignedPayload<ItemNodeRequest[]> = await findAllAction()
    .catch((e) => {
      console.error("Error fetching stored:", e);
      return { owner: "", payload: [] };
    });

  if (response.owner == "" || response.owner != userData.username) {
    return response.owner;
  }

  const data = response.payload
    .sort((a, b) => a.order - b.order)
    .map(n => n.request);

  const newHash = await generateHash(data);

  ctx.setStored((prevData) => {
    if (prevData.hash == newHash) {
      return prevData;
    }

    return {
      items: data,
      hash: newHash
    };
  });

  return response.owner;
};

const fetchCollection = async (ctx: TriggerContext, userData: UserData): Promise<string> => {
  const response: SignedPayload<ItemNodeCollection[]> = await findAllCollection()
    .catch((e) => {
      console.error("Error fetching collection:", e);
      return { owner: "", payload: [] };
    });

  if (response.owner == "" || response.owner != userData.username) {
    return response.owner;
  }

  const data = response.payload
    .sort((a, b) => a.order - b.order)
    .map(n => n.collection);

  const newHash = await generateHash(data);

  ctx.setCollection((prevData) => {
    if (prevData.hash == newHash) {
      return prevData;
    }

    return {
      items: data,
      hash: newHash
    };
  });

  return response.owner;
};

export const useStoreCollections = (): StoreProviderCollectionsType => {
  const context = useContext(StoreCollection);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderRequests");
  }
  return context;
};
