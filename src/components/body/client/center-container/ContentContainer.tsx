import { useEffect, useState } from "react";
import { MethodSelector } from "./method-selector/MethodSelector";
import { ItemRequestParameters, ParameterSelector } from "./client-arguments/ParameterSelector";
import { Request } from "../../../../interfaces/request/Request";
import { executeFormAction } from "../../../../services/api/ServiceManager";
import { Response } from "../../../../interfaces/response/Response";
import { pushHistoric } from "../../../../services/api/ServiceStorage";

import './ContentContainer.css'

interface ContentContainerProps {
    request: Request;
    onValueChange: (request: Request, response: Response) => void
}

interface Payload {
    uriProcess: boolean;
    request: Request;
}

export function ContentContainer({request, onValueChange}: ContentContainerProps) {
    const [data, setData] = useState<Payload>({
        uriProcess: false,
        request: request,
    });

    useEffect(() => {
        let newData = {...data, request};
        setData(newData);
    }, [request]);
    
    const urlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newRequest = {...data.request, uri: e.target.value};
        setData({ ...data, request: newRequest });
    };

    const methodChange = (method: string) => {
        let newRequest = {...data.request, method: method};
        setData({ ...data, request: newRequest });
    };

    const processUri = () => {
        console.log("Processing uri query parameters.");
    }

    const onUriProcessChange = (uriProcess: boolean) => {
        console.log("Auto processing uri query parameters status: " + uriProcess);
        setData({ ...data, uriProcess: uriProcess });
    }

    const parametersChange = (parameters: ItemRequestParameters) => {
        setData({ ...data, ...parameters });
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
                        uriProcess={data.uriProcess} 
                        request={data.request} 
                        processUri={processUri}
                        onUriProcessChange={onUriProcessChange} 
                        onValueChange={parametersChange}/>
                </div>
                <div id="client-buttons" className="border-top">
                    <button type="submit">Save</button>
                </div>
            </form>
        </div>
    )
}