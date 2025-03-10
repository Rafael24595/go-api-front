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

export function ContentContainer({request, onValueChange}: ContentContainerProps) {
    const [data, setData] = useState<Request>(request);

    useEffect(() => {
        console.log("State Updated:", request);
        setData(request);
    }, [request]);
    
    const urlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, uri: e.target.value });
    };

    const methodChange = (method: string) => {
        setData({ ...data, method });
    };

    const parametersChange = (parameters: ItemRequestParameters) => {
        setData({ ...data, ...parameters });
    }

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();

        data.timestamp = Date.now();
        data.name = `temp-${data.method}-${data.timestamp}`;

        const apiResponse = await executeFormAction(data);

        onValueChange(apiResponse.request, apiResponse.response);
        //TODO: Manage user session.
        pushHistoric("anonymous", apiResponse.request, apiResponse.response)
    };

    return (
        <div id='content-container'>
            <form id="client-form" onSubmit={handleSubmit}>
                <div id="client-bar">
                    <MethodSelector selected={data.method} onMethodChange={methodChange}/>
                    <input id="url" className="client-bar-component section-header-element" name="url" type="text" onChange={urlChange} value={data.uri}/>
                    <button id="client-button-send" className="client-bar-component section-header-element">Send</button>
                </div>
                <div id="client-content">
                    <ParameterSelector request={data} onValueChange={parametersChange}/>
                </div>
                <div id="client-buttons" className="border-top">
                    <button type="submit">Save</button>
                </div>
            </form>
        </div>
    )
}