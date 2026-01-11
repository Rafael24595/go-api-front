import { Dispatch, SetStateAction } from "react";
import { generateHash } from "../../../services/Utils";
import { findAllEndPoint } from "../../../services/api/ServiceEndPoint";
import { cleanEndPoints, PayloadEndPoint } from "./Helper";

interface StoreMockEndPointType {
    setEndPoints: Dispatch<SetStateAction<PayloadEndPoint>>
}

export const useMockController = ({ setEndPoints }: StoreMockEndPointType) => {
    const clearAll = async () => {
        setEndPoints(cleanEndPoints());
    };

    const fetchAll = async () => {
        fetchEndPoints();
    };

    const fetchEndPoints = async (): Promise<string> => {
        try {
            const request = await findAllEndPoint();
            const data = request.payload
                .sort((a, b) => a.order - b.order);

            const newHash = await generateHash(data);

            setEndPoints((prevData) => {
                if (prevData.hash == newHash) {
                    return prevData;
                }

                return {
                    items: data,
                    hash: newHash
                };
            });

            return request.owner;
        } catch (error) {
            console.error("Error fetching collection:", error);
            return "";
        }
    };

    return {
        fetchAll, fetchEndPoints, clearAll
    };
}
