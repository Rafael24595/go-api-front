import { useState } from 'react';
import { QueryArguments } from './query-arguments/QueryArguments';
import { HeaderArguments } from './header-arguments/HeaderArguments';
import { AuthArguments } from './auth-arguments/AuthArguments';
import { BodyArguments } from './body-arguments/BodyArguments';
import { Auths, Body, Headers, Queries } from '../../../../../interfaces/request/Request';
import { ContextModal } from '../../../../context/ContextModal';
import { useStoreContext } from '../../../../../store/StoreProviderContext';

import './ParameterSelector.css';

const VIEW_QUERY = "query";
const VIEW_HEADER = "header";
const VIEW_AUTH = "auth";
const VIEW_BODY = "body";

const VALID_CURSORS = [VIEW_QUERY, VIEW_HEADER, VIEW_AUTH, VIEW_BODY];

const DEFAULT_CURSOR = VIEW_QUERY;

const CURSOR_KEY = "ParameterSelectorCursor";

export interface ItemRequestParameters {
    query: Queries;
    header: Headers;
    body: Body;
    auth: Auths;
}

interface Payload {
    cursor: string;
    modalStatus: boolean;
}

export function ParameterSelector() {
    const [data, setData] = useState<Payload>({
        cursor: getCursor(),
        modalStatus: false,
    });

    const { initialHash, actualHash } = useStoreContext();

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCursor(e.target.value);
        setData({...data, cursor: e.target.value});
    };

    const setModalStatus = (status: boolean) => {
        setData({...data, modalStatus: status});
    };

    return (
        <>
            <div id="client-argument-headers">
                <div id="parameter-selector-components" className="border-bottom">    
                    <div className="radio-button-group">
                        <input type="radio" id="tag-client-query" className="client-tag" name="cursor-client"
                            checked={data.cursor === VIEW_QUERY} 
                            value={VIEW_QUERY} 
                            onChange={cursorChange}/>
                        <label htmlFor="tag-client-query" id="client-label-query">Query</label>
                        <input type="radio" id="tag-client-header" className="client-tag" name="cursor-client"
                            checked={data.cursor === VIEW_HEADER} 
                            value={VIEW_HEADER} 
                            onChange={cursorChange}/>
                        <label htmlFor="tag-client-header" id="client-label-header">Headers</label>
                        <input type="radio" id="tag-client-auth" className="client-tag" name="cursor-client"
                            checked={data.cursor === VIEW_AUTH} 
                            value={VIEW_AUTH} 
                            onChange={cursorChange}/>
                        <label htmlFor="tag-client-auth" id="client-label-auth">Auth</label>
                        <input type="radio" id="tag-client-body" className="client-tag" name="cursor-client"
                            checked={data.cursor === VIEW_BODY} 
                            value={VIEW_BODY} 
                            onChange={cursorChange}/>
                        <label htmlFor="tag-client-body" id="client-label-body">Body</label>
                    </div>
                    <div>
                        <button type="button" className="button-tag" onClick={() => setModalStatus(true)}>
                            <span className={`button-modified-status small display ${ initialHash != actualHash && "visible" }`}></span>
                            Context
                        </button>
                    </div>
                </div>
            </div>
            <div id="client-argument-content">
                {data.cursor === VIEW_QUERY && <QueryArguments/>}
                {data.cursor === VIEW_HEADER && <HeaderArguments/>}
                {data.cursor === VIEW_AUTH && <AuthArguments/>}
                {data.cursor === VIEW_BODY && <BodyArguments/>}
            </div>
            <ContextModal
                isOpen={data.modalStatus}
                onClose={() => setModalStatus(false)}/>
        </>
    )
}

const getCursor = () => {
    const storedValue = localStorage.getItem(CURSOR_KEY);
    return storedValue && VALID_CURSORS.includes(storedValue) ? storedValue : DEFAULT_CURSOR;
}

const setCursor = (cursor: string) => {
    localStorage.setItem(CURSOR_KEY, cursor);
}
