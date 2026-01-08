import { Dispatch, SetStateAction } from "react";
import { PayloadCollection, PayloadRequest } from "./Helper";
import { UserData } from "../../../interfaces/system/UserData";
import { SignedPayload } from "../../../interfaces/SignedPayload";
import { ItemNodeCollection, ItemNodeRequest } from "../../../interfaces/client/collection/Collection";
import { findAllAction } from "../../../services/api/ServiceStorage";
import { findAllCollection } from "../../../services/api/ServiceCollection";
import { findAllHistoric } from "../../../services/api/ServiceHistory";
import { generateHash } from "../../../services/Utils";

interface StoreControllerCollectionType {
  setHistoric: Dispatch<SetStateAction<PayloadRequest>>,
  setStored: Dispatch<SetStateAction<PayloadRequest>>,
  setCollection: Dispatch<SetStateAction<PayloadCollection>>
}

export const useCollectionController = ({ setHistoric, setStored, setCollection }: StoreControllerCollectionType) => {
  const fetchAll = async (userData: UserData) => {
    fetchHistoric(userData);
    fetchStored(userData);
    fetchCollection(userData);
  };

  const fetchHistoric = async (userData: UserData): Promise<string> => {
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

    setHistoric((prevData) => {
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

  const fetchStored = async (userData: UserData): Promise<string> => {
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

    setStored((prevData) => {
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

  const fetchCollection = async (userData: UserData): Promise<string> => {
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

    setCollection((prevData) => {
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

  const cleanAll = () => {
    setHistoric({
      hash: "",
      items: [],
    });
    setStored({
      hash: "",
      items: [],
    });
    setCollection({
      hash: "",
      items: [],
    });
  };

  return {
    fetchAll, fetchHistoric, fetchStored,
    fetchCollection, cleanAll
  }
}
