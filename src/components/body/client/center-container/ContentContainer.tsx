import { useState } from "react";
import { MethodSelector } from "./method-selector/MethodSelector";
import { ItemRequestParameters, ParameterSelector } from "./client-arguments/ParameterSelector";
import { Request } from "../../../../interfaces/request/Request";
import { executeFormAction } from "../../../../services/api/ServiceManager";
import { Response } from "../../../../interfaces/response/Response";
import { pushHistoric } from "../../../../services/api/ServiceStorage";
import { StatusKeyValue } from "../../../../interfaces/StatusKeyValue";
import { detachStatusKeyValue } from "../../../../services/Utils";

import './ContentContainer.css'

const AUTO_READ_URI_KEY = "AutoReadUriKey";

interface ContentContainerProps {
    request: Request;
    onValueChange: (request: Request, response: Response) => void
}

interface Payload {
    autoReadUri: boolean;
    request: Request;
}

export function ContentContainer({request, onValueChange}: ContentContainerProps) {
    const getCursor = () => {
        return localStorage.getItem(AUTO_READ_URI_KEY) == "true";
    }

    const setCursor = (autoReadUri: boolean) => {
        localStorage.setItem(AUTO_READ_URI_KEY, `${autoReadUri}`);
    }

    const [data, setData] = useState<Payload>({
        autoReadUri: getCursor(),
        request: request,
    });
    
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
        for (const [key, value] of queryParams.entries()) {
            const exists = newQueries[key];
            if(exists == undefined) {
                newQueries[key] = [];
            }
            const item: StatusKeyValue = {
                status: true,
                key: key,
                value: value
            };
            newQueries[key].push(item);
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

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        data.request.timestamp = Date.now();
        data.request.name = `temp-${data.request.method}-${data.request.timestamp}`;

        const apiResponse = await executeFormAction(data.request);

        onValueChange(apiResponse.request, apiResponse.response);
        //TODO: Manage user session.
        pushHistoric("anonymous", apiResponse.request, apiResponse.response)
    };

    return (
        <div id='content-container'>
            <form id="client-form" onSubmit={handleSubmit}>
                <div id="client-bar">
                    <MethodSelector selected={data.request.method} onMethodChange={methodChange}/>
                    <input id="url" className="client-bar-component section-header-element" name="url" type="text" onChange={urlChange} value={data.request.uri}/>
                    <button id="client-button-send" className="client-bar-component section-header-element">Send</button>
                </div>
                <div id="client-content">
                    <ParameterSelector 
                        autoReadUri={data.autoReadUri} 
                        parameters={data.request} 
                        readUri={readUri}
                        onReadUriChange={onReadUriChange} 
                        onValueChange={parametersChange}/>
                </div>
                <div id="client-buttons" className="border-top">
                    <button type="submit">Save</button>
                </div>
            </form>
        </div>
    )
}