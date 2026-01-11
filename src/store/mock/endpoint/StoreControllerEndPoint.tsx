import { Dispatch, SetStateAction, useRef } from "react";
import { emptyItemEndPoint, ItemEndPoint, LiteEndPoint } from "../../../interfaces/mock/EndPoint";
import { useStoreCache } from "../../StoreProviderCache";
import { CacheEndPointStore, CacheEndPointFocus } from "../../../interfaces/mock/Cache";
import { useStoreSession } from "../../system/StoreProviderSession";
import { emptyItemResponse, ItemResponse } from "../../../interfaces/mock/Response";
import { deepClone } from "../../../services/Utils";
import { Optional } from "../../../types/Optional";
import { CACHE_CATEGORY_FOCUS } from "../../Constants";
import { useStoreMock } from "../mock/StoreProviderMock";
import { emptyMetrics, Metrics } from "../../../interfaces/mock/Metrics";
import { findEndPoint, findMetrics, insertEndPoint } from "../../../services/api/ServiceEndPoint";
import { Events } from "../../../types/EventAction";
import { CACHE_CATEGORY_STORE, CACHE_KEY_FOCUS, clearEndPointData, newEndPointData, PayloadData } from "./Helper";
import { UserData } from "../../../interfaces/system/UserData";

interface StoreControllerEndPointType {
    setData: Dispatch<SetStateAction<PayloadData>>
    setResponse: Dispatch<SetStateAction<ItemResponse>>
    setMetrics: Dispatch<SetStateAction<Metrics>>
    pushEvent: (reason: string, source?: string | undefined, target?: string | undefined) => void
}

export const useEndPointController = ({ setData, setResponse, setMetrics, pushEvent }: StoreControllerEndPointType) => {
    const { search, excise, remove } = useStoreCache();
    const { fetchUser } = useStoreSession();

    const backupRef = useRef<ItemEndPoint>(emptyItemEndPoint(""));
    const endPointRef = useRef<ItemEndPoint>(emptyItemEndPoint(""));

    const { fetchEndPoints } = useStoreMock();

    const updateMetricsStatus = async (endPoint: ItemEndPoint | LiteEndPoint) => {
        if (endPoint._id == "") {
            setMetrics(emptyMetrics(endPointRef.current));
            return;
        }

        fetchMetricsByEndPoint(endPoint)
            .catch(() => {
                setMetrics(emptyMetrics(endPointRef.current));
            })
    }

    const focusCached = (userData: UserData) => {
        const focus: Optional<CacheEndPointFocus> = search(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
        if (focus != undefined) {
            return fetchEndPointById(userData, focus.endPoint);
        }
        return false;
    }

    const clearAll = (userData: UserData) => {
        const newData = newEndPointData(userData);
        setData(newData);
        setResponse(emptyItemResponse());
        setMetrics(emptyMetrics(newData.endPoint));
    }

    const cleanCache = () => {
        remove(CACHE_CATEGORY_FOCUS, CACHE_KEY_FOCUS);
        excise(CACHE_CATEGORY_STORE);
    }

    const fetchEndPointById = async (userData: UserData, id: string) => {
        pushEvent(Events.DEFINE, endPointRef.current._id, id);

        //TODO: Evalue response focus caching.
        setResponse(emptyItemResponse());

        const cached: Optional<CacheEndPointStore> = search(CACHE_CATEGORY_STORE, id);
        if (cached != undefined) {
            if (cached.endPoint.owner != userData.username) {
                return false;
            }

            restoreEndPoint(cached.endPoint, cached.backup);
            return true;
        }

        if (id == "") {
            return false;
        }

        const endPoint = await findEndPoint(id)
            .catch(err => {
                if (err.statusCode == 404) {
                    fetchUser();
                    return;
                }
                throw err;
            });

        if (!endPoint) {
            return false;
        }

        if (endPoint.owner != userData.username) {
            fetchUser();
            return false;
        }

        restoreEndPoint(endPoint);

        return true;
    }

    const fetchMetrics = async () => {
        return fetchMetricsByEndPoint(endPointRef.current)
    }

    const fetchMetricsByEndPoint = async (endPoint: ItemEndPoint | LiteEndPoint) => {
        const metrics = await findMetrics(endPoint)
            .catch(err => {
                if (err.statusCode == 404) {
                    fetchUser();
                    return;
                }
                throw err;
            });

        if (!metrics) {
            return;
        }

        setMetrics(metrics);
    }

    const injectEndPoint = (userData: UserData, endPoint: ItemEndPoint) => {
        clearAll(userData);

        restoreEndPoint(endPoint);
        pushEvent(Events.DEFINE, endPointRef.current._id, "");
    }

    const releaseEndPoint = async (endPoint?: ItemEndPoint) => {
        endPoint = endPoint || endPointRef.current;

        const oldEndPoint = { ...endPoint };
        const newEndPoint = { ...endPoint };

        if (newEndPoint.name == "" && !renameEndPoint(newEndPoint).ok) {
            return;
        }

        pushEvent(Events.RELEASE, endPointRef.current._id, endPoint._id);

        const id = await insertEndPoint(newEndPoint);
        newEndPoint._id = id;

        if (oldEndPoint._id != newEndPoint._id) {
            remove(CACHE_CATEGORY_STORE, oldEndPoint._id);
        }

        restoreEndPoint(newEndPoint);

        fetchEndPoints();
    }

    const discardEndPoint = (endPoint?: ItemEndPoint | LiteEndPoint) => {
        pushEvent(Events.DISCARD, endPointRef.current._id, (endPoint || backupRef.current)._id);

        if (!endPoint || endPoint._id == backupRef.current._id) {
            return restoreEndPoint(backupRef.current);
        }

        remove(CACHE_CATEGORY_STORE, endPoint._id);

        refreshEndPoint();
    }

    const restoreEndPoint = (endPoint: ItemEndPoint, backup?: ItemEndPoint) => {
        setData(clearEndPointData(endPoint, backup));
        updateMetricsStatus(endPoint);
    }

    const refreshEndPoint = () => {
        setData((prevData) => deepClone(prevData));
        updateMetricsStatus(backupRef.current);
    }

    const renameEndPoint = (endPoint?: ItemEndPoint): { endPoint: ItemEndPoint, ok: boolean } => {
        endPoint = endPoint || endPointRef.current;

        const name = prompt("Insert a name: ", endPoint.name);
        if (name == null) {
            return { endPoint, ok: false };
        }

        endPoint.name = name;
        return { endPoint, ok: true };
    }

    return {
        backupRef,
        endPointRef,

        focusCached, clearAll, cleanCache,
        fetchEndPointById, injectEndPoint, releaseEndPoint,
        renameEndPoint, discardEndPoint, fetchMetrics
    }
}
