import { MethodSelector } from "./method-selector/MethodSelector";
import { ParameterSelector } from "./client-arguments/ParameterSelector";
import { executeFormAction } from "../../../../services/api/ServiceManager";
import { pushHistoric } from "../../../../services/api/ServiceStorage";
import { useStoreContext } from "../../../../store/StoreProviderContext";
import { useStoreRequest } from "../../../../store/StoreProviderRequest";
import { useAlert } from "../../../utils/alert/Alert";
import { EAlertCategory } from "../../../../interfaces/AlertData";
import { useStoreRequests } from "../../../../store/StoreProviderRequests";
import { Combo } from "../../../utils/combo/Combo";

import './ContentContainer.css';

export function ContentContainer() {
    const { getContext } = useStoreContext();
    const { initialHash, actualHash, request, parent, getRequest, getResponse, discardRequest, defineRequest, updateRequest, updateUri, insertRequest } = useStoreRequest();
    const { fetchAll } = useStoreRequests();

    const { push } = useAlert();

    const urlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateUri(e.target.value);
    };

    const executeAction = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        const req = getRequest();

        const newReq = {...req};
        if(newReq.name == "") {
            const name = `temp-${req.method}-${req.timestamp}`;
            newReq.name = name;
        }

        updateRequest(newReq);

        let apiResponse = await executeFormAction(newReq, getContext()).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));

        if(!apiResponse) {
            return;
        }

        updateRequest(newReq, apiResponse.response);

        apiResponse = await pushHistoric(req, apiResponse.response);
        
        newReq._id = apiResponse.request._id;
        updateRequest(newReq, apiResponse.response, req);

        fetchAll();
    };

    const insertFormAction = async () => {
        const req = getRequest();
        const res = getResponse();

        let apiResponse = await insertRequest(req, res);

        const newReq = {...req};
        const newRes = {...res};

        newReq._id = apiResponse.request._id;
        newReq.name = apiResponse.request.name;

        defineRequest(newReq, newRes, parent, req);

        apiResponse = await pushHistoric(apiResponse.request, apiResponse.response);

        fetchAll();
    };

    return (
        <div id='content-container'>
            <div id="client-form">
                <div id="client-bar">
                    <MethodSelector/>
                    <input id="url" className="client-bar-component section-header-element" name="url" type="text" onChange={urlChange} value={request.uri}/>
                    <button id="client-button-send" className="client-bar-component section-header-element" onClick={executeAction}>Send</button>
                </div>
                <div id="client-content">
                    <ParameterSelector/>
                </div>
                <div id="client-buttons" className="border-top">
                    <span className="button-modified-status"></span>
                    <button type="submit" onClick={insertFormAction}>Save</button>
                    <div className={`button-modified-container ${ initialHash != actualHash ? "visible" : "" }`}>
                        <Combo 
                            custom={(
                                <span className={`button-modified-status ${ initialHash != actualHash ? "visible" : "" }`}></span>
                            )}
                            options={[
                                {
                                    icon: "🗑️",
                                    label: "Discard",
                                    title: "Discard request",
                                    action: discardRequest
                                },
                                {
                                    icon: "💾",
                                    label: "Save",
                                    title: "Save request",
                                    action: insertFormAction
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
