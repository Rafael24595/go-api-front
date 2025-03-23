import { useEffect, useState } from "react";
import { MethodSelector } from "./method-selector/MethodSelector";
import { ItemRequestParameters, ParameterSelector } from "./client-arguments/ParameterSelector";
import { Request } from "../../../../interfaces/request/Request";
import { executeFormAction } from "../../../../services/api/ServiceManager";
import { Response } from "../../../../interfaces/response/Response";
import { insertAction, pushHistoric } from "../../../../services/api/ServiceStorage";
import { StatusKeyValue } from "../../../../interfaces/StatusKeyValue";
import { detachStatusKeyValue, generateHash } from "../../../../services/Utils";
import { Context, newContext } from "../../../../interfaces/context/Context";

import './ContentContainer.css'

const AUTO_READ_URI_KEY = "AutoReadUriKey";

interface ContentContainerProps {
    request: Request;
    response?: Response;
    reloadRequestSidebar: () => void
    onValueChange: (request: Request, response: Response) => void
}

interface Payload {
    autoReadUri: boolean;
    initialHash: string;
    actualHash: string;
    context: Context;
    backup: Request;
    request: Request;
    response?: Response;
}

export function ContentContainer({ request, response, reloadRequestSidebar, onValueChange }: ContentContainerProps) {
    const [data, setData] = useState<Payload>({
        autoReadUri: getCursor(),
        initialHash: "",
        actualHash: "",
        context: newContext("anonymous"),
        backup: request,
        request: request,
        response: response
    });

    useEffect(() => {
        if(data.actualHash == "") {
            setHash("initialHash", data.backup);
            setHash("actualHash", data.backup);
        }
        
        if (data.request) {
            setHash("actualHash", data.request);
        }

    }, [data.request]);

    const setHash = async (key: string, request: Request) => {
        const newHash = await generateHash(request);
        setData(prevData => ({
            ...prevData,
            [key]: newHash
        }));
    }
    
    const contextChange = (context: Context) => {
        setData({ ...data, context });
    };

    const urlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newRequest = {...data.request, uri: e.target.value};
        setData({ ...data, request: newRequest });
    };

    const methodChange = (method: string) => {
        let newRequest = {...data.request, method: method};
        setData({ ...data, request: newRequest });
    };

    const readUri = (): StatusKeyValue[] => {
        const url = new URL(data.request.uri);
        const queryParams = new URLSearchParams(url.search);
        const newQueries = { ...data.request.query.queries };
        let counter = 0;
        for (const [key, value] of queryParams.entries()) {
            const exists = newQueries[key];
            if(exists == undefined) {
                newQueries[key] = [];
            }
            const item: StatusKeyValue = {
                order: counter,
                status: true,
                key: key,
                value: value
            };
            newQueries[key].push(item);
            counter++;
        }

        url.search = "";

        let newQuery = {...data.request.query, queries: newQueries };
        let newRequest = {...data.request, uri: url.toString(), query: newQuery};
        setData({ ...data, request: newRequest });

        return detachStatusKeyValue(newQueries);
    }

    const onReadUriChange = (autoReadUri: boolean) => {
        console.log("Auto processing uri query parameters status: " + autoReadUri);
        setCursor(autoReadUri);
        setData({ ...data, autoReadUri: autoReadUri });
    }

    const parametersChange = (parameters: ItemRequestParameters) => {
        let newRequest = { ...data.request, ...parameters };
        setData({ ...data, request: newRequest });
    }

    const executeAction = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if(data.request.timestamp == 0) {
            data.request.timestamp = Date.now();
        }

        if(data.request.name == "") {
            data.request.name = `temp-${data.request.method}-${data.request.timestamp}`;
        }

        let apiResponse = await executeFormAction(data.request, data.context);

        onValueChange(data.request, apiResponse.response);
        setData({ ...data, response: apiResponse.response });

        //TODO: Manage user session.
        apiResponse = await pushHistoric("anonymous", data.request, apiResponse.response);

        data.request._id = apiResponse.request._id;

        reloadRequestSidebar();

        onValueChange(data.request, apiResponse.response);
    };

    const insertFormAction = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        if(data.request.timestamp == 0) {
            data.request.timestamp = Date.now();
        }

        if(data.request.status == "draft") {
            const newName = prompt("Insert a name: ");
            if(newName == null) {
                return;
            }
    
            data.request.name = newName;
        }

        //TODO: Manage user session.
        let apiResponse = await insertAction("anonymous", data.request, data.response);

        data.request._id = apiResponse.request._id;

        onValueChange(data.request, apiResponse.response);
        //TODO: Manage user session.
        apiResponse = await pushHistoric("anonymous", apiResponse.request, apiResponse.response);

        reloadRequestSidebar();

        onValueChange(data.request, data.response || apiResponse.response);
    };

    return (
        <div id='content-container'>
            <form id="client-form" onSubmit={executeAction}>
                <div id="client-bar">
                    <MethodSelector selected={data.request.method} onMethodChange={methodChange}/>
                    <input id="url" className="client-bar-component section-header-element" name="url" type="text" onChange={urlChange} value={data.request.uri}/>
                    <button type="submit" id="client-button-send" className="client-bar-component section-header-element">Send</button>
                </div>
                <div id="client-content">
                    <ParameterSelector 
                        autoReadUri={data.autoReadUri} 
                        context={data.context}
                        parameters={data.request} 
                        readUri={readUri}
                        onContextChange={contextChange}
                        onReadUriChange={onReadUriChange} 
                        onValueChange={parametersChange}/>
                </div>
                <div id="client-buttons" className="border-top">
                    <button type="submit" className="button-modify" onClick={insertFormAction}>
                        <span className={`button-modified-status ${ data.initialHash != data.actualHash && "visible" }`}></span>
                        <span>Save</span>
                        <span className="button-modified-status"></span>
                    </button>
                </div>
            </form>
        </div>
    )
}

const getCursor = () => {
    return localStorage.getItem(AUTO_READ_URI_KEY) == "true";
}

const setCursor = (autoReadUri: boolean) => {
    localStorage.setItem(AUTO_READ_URI_KEY, `${autoReadUri}`);
}
