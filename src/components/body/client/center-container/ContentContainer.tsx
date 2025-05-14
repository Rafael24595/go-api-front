import { MethodSelector } from "./method-selector/MethodSelector";
import { ParameterSelector } from "./client-arguments/ParameterSelector";
import { pushHistoric } from "../../../../services/api/ServiceStorage";
import { useStoreRequest } from "../../../../store/StoreProviderRequest";
import { useStoreRequests } from "../../../../store/StoreProviderRequests";
import { Combo } from "../../../utils/combo/Combo";

import './ContentContainer.css';

export function ContentContainer() {
    const { initialHash, actualHash, request, parent, getRequest, getResponse, discardRequest, defineRequest, updateUri, executeAction, insertRequest } = useStoreRequest();
    const { fetchAll } = useStoreRequests();

    const urlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateUri(e.target.value);
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
                    <input id="url" className="client-bar-component section-header-element" name="url" type="text" onChange={urlChange} value={request.uri} placeholder="Url"/>
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
