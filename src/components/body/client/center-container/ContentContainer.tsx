import { useState } from "react";
import { MethodSelector } from "./method-selector/MethodSelector";
import { ItemRequestParameters, ParameterSelector } from "./client-arguments/ParameterSelector";
import { Auths, Body, Headers, Queries, Request } from "../../../../interfaces/request/Request";
import { CONTENT_TYPE as CONTENT_TYPE_TEXT } from './client-arguments/body-arguments/text/TextData';
import { HttpMethod } from "../../../../constants/HttpMethod";
import { executeFormAction } from "../../../../services/api/ServiceManager";

import './ContentContainer.css'

interface ItemRequest {
    url: string;
    method: string;
    query: Queries;
    header: Headers;
    auth: Auths;
    body: Body;
}

export function ContentContainer() {
    const [formData, setFormData] = useState<ItemRequest>({
        url: "",
        method: HttpMethod.GET,
        query: { queries: {} },
        header: { headers: {} },
        auth: { status: true, auths: {} },
        body: { status: true, contentType: CONTENT_TYPE_TEXT, payload: "" }
      });
    
    const urlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const methodChange = (method: string) => {
        setFormData({ ...formData, method });
    };

    const parametersChange = (parameters: ItemRequestParameters) => {
        setFormData({ ...formData, ...parameters });
    }

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const request = makeRequest();
        executeFormAction(request);
        console.log("Form Data Submitted:", formData);
    };

    const makeRequest = (): Request => {
        const now = Date.now();
        const name = `temp-${formData.method}-${now}`;
        return {
            timestamp: Date.now(),
            name: name,
            method: formData.method,
            uri: formData.url,
            query: formData.query,
            header: formData.header,
            cookie: { cookies: {} },
            body: formData.body,
            auth: formData.auth,
            status: "historic",
        }
    }

    return (
        <div id='content-container'>
            <form id="client-form" onSubmit={handleSubmit}>
                <div id="client-bar">
                    <MethodSelector selected={formData.method} onMethodChange={methodChange}/>
                    <input id="url" className="client-bar-component section-header-element" name="url" type="text" onChange={urlChange} value={formData.url}/>
                    <button id="client-button-send" className="client-bar-component section-header-element">Send</button>
                </div>
                <div id="client-content">
                    <ParameterSelector request={formData} onValueChange={parametersChange}/>
                </div>
                <div id="client-buttons" className="border-top">
                    <button type="submit">Save</button>
                </div>
            </form>
        </div>
    )
}