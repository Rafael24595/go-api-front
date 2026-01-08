import { MethodSelector } from "./method-selector/MethodSelector";
import { ParameterSelector } from "./client-arguments/ParameterSelector";
import { useStoreRequest } from "../../../../store/client/request/StoreProviderRequest";
import { Combo } from "../../../utils/combo/Combo";

import './ContentContainer.css';

export function ContentContainer() {
    const { request, waitingRequest, discardRequest, releaseAction, updateUri, executeAction, isModified } = useStoreRequest();

    const urlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateUri(e.target.value);
    };

    return (
        <div id='content-container'>
            <div id="client-form">
                <div id="client-bar">
                    <MethodSelector/>
                    <input id="url" className="client-bar-component section-header-element" name="url" type="text" onChange={urlChange} value={request.uri} placeholder="Url"/>
                    <button id="client-button-send" className="client-bar-component section-header-element" onClick={executeAction} disabled={waitingRequest}>Send</button>
                </div>
                <div id="client-content">
                    <ParameterSelector/>
                </div>
                <div id="client-buttons" className="border-top">
                    <span className="button-modified-status"></span>
                    <button type="submit" onClick={releaseAction}>Save</button>
                    <div className={`button-modified-container ${ isModified() ? "visible" : "" }`}>
                        <Combo 
                            custom={(
                                <span className={`button-modified-status ${ isModified() ? "visible" : "" }`}></span>
                            )}
                            options={[
                                {
                                    icon: "🧹",
                                    label: "Discard",
                                    title: "Discard request",
                                    action: discardRequest
                                },
                                {
                                    icon: "💾",
                                    label: "Save",
                                    title: "Save request",
                                    action: releaseAction
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
