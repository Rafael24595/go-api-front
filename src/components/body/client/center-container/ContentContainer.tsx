import { MethodSelector } from "./method-selector/MethodSelector";
import { ParameterSelector } from "./client-arguments/ParameterSelector";
import { executeFormAction } from "../../../../services/api/ServiceManager";
import { insertAction, pushHistoric } from "../../../../services/api/ServiceStorage";
import { useStoreContext } from "../../../../store/StoreProviderContext";

import './ContentContainer.css'
import { useStoreRequest } from "../../../../store/StoreProviderRequest";


interface ContentContainerProps {
    reloadRequestSidebar: () => void
}

export function ContentContainer({ reloadRequestSidebar }: ContentContainerProps) {
    const { getContext } = useStoreContext();
    const { initialHash, actualHash, request, getRequest, getResponse, defineRequest, updateRequest, updateName, updateUri } = useStoreRequest();

    const urlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateUri(e.target.value);
    };

    const executeAction = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        const req = getRequest();

        if(req.name == "") {
            const name = `temp-${req.method}-${req.timestamp}`;
            req.name = name;
            updateName(name);
        }

        let apiResponse = await executeFormAction(req, getContext());

        updateRequest(req, apiResponse.response);

        //TODO: Manage user session.
        apiResponse = await pushHistoric("anonymous", req, apiResponse.response);

        req._id = apiResponse.request._id;
        updateRequest(req, apiResponse.response);

        reloadRequestSidebar();
    };

    const insertFormAction = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        const req = getRequest();
        const res = getResponse();

        if(req.status == "draft") {
            const name = prompt("Insert a name: ");
            if(name == null) {
                return;
            }            
            req.name = name;
            updateName(name);
        }

        //TODO: Manage user session.
        let apiResponse = await insertAction("anonymous", req, res);

        req._id = apiResponse.request._id;
        defineRequest(req, res)

        //TODO: Manage user session.
        apiResponse = await pushHistoric("anonymous", apiResponse.request, apiResponse.response);

        reloadRequestSidebar();
    };

    return (
        <div id='content-container'>
            <form id="client-form" onSubmit={executeAction}>
                <div id="client-bar">
                    <MethodSelector/>
                    <input id="url" className="client-bar-component section-header-element" name="url" type="text" onChange={urlChange} value={request.uri}/>
                    <button type="submit" id="client-button-send" className="client-bar-component section-header-element">Send</button>
                </div>
                <div id="client-content">
                    <ParameterSelector/>
                </div>
                <div id="client-buttons" className="border-top">
                    <span className="button-modified-status"></span>
                    <button type="submit" onClick={insertFormAction}>Save</button>
                    <span className={`button-modified-status ${ initialHash != actualHash && "visible" }`}></span>
                </div>
            </form>
        </div>
    )
}
