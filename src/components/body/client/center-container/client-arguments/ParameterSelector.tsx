import { useState } from 'react';
import { QueryArguments } from './query-arguments/QueryArguments';
import { HeaderArguments } from './header-arguments/HeaderArguments';
import { AuthArguments } from './auth-arguments/AuthArguments';
import { BodyArguments } from './body-arguments/BodyArguments';
import { StatusKeyValue } from '../../../../../interfaces/StatusKeyValue';
import { Auths, Body, Headers, Queries } from '../../../../../interfaces/request/Request';
import { Dict } from '../../../../../types/Dict';
import { detachStatusKeyValue } from '../../../../../services/Utils';

import './ParameterSelector.css'

const VIEW_QUERY = "query";
const VIEW_HEADER = "header";
const VIEW_AUTH = "auth";
const VIEW_BODY = "body";

const VALID_CURSORS = [VIEW_QUERY, VIEW_HEADER, VIEW_AUTH, VIEW_BODY];

const DEFAULT_CURSOR = VIEW_QUERY;

const CURSOR_KEY = "ParameterSelectorCursor";

const mergeStatusKeyValue = (newValues: StatusKeyValue[]): Dict<StatusKeyValue[]> => {
    const merge: Dict<StatusKeyValue[]> = {};
    for (const value of newValues) {
        const vector = merge[value.key];
        if(!vector) {
            merge[value.key] = [value]
            continue;
        }
        vector.push(value)
    }
    return merge;
}

export interface ItemRequestParameters {
    query: Queries;
    header: Headers;
    body: Body;
    auth: Auths;
}

interface ParameterSelectorProps {
    autoReadUri: boolean;
    parameters: ItemRequestParameters
    readUri: () => StatusKeyValue[];
    onReadUriChange: (uriProcess: boolean) => void;
    onValueChange: (parameters: ItemRequestParameters) => void;
}

interface Payload {
    cursor: string;
    autoReadUri: boolean;
    query: StatusKeyValue[];
    header: StatusKeyValue[];
    auth: Auths;
    body: Body;
}

export function ParameterSelector({ autoReadUri, parameters, readUri, onReadUriChange, onValueChange }: ParameterSelectorProps) {
    const getCursor = () => {
        const storedValue = localStorage.getItem(CURSOR_KEY);
        return storedValue && VALID_CURSORS.includes(storedValue) ? storedValue : DEFAULT_CURSOR;
    }

    const setCursor = (cursor: string) => {
        localStorage.setItem(CURSOR_KEY, cursor);
    }

    const [data, setData] = useState<Payload>({
        autoReadUri: autoReadUri,
        cursor: getCursor(),
        query: detachStatusKeyValue(parameters.query.queries),
        header: detachStatusKeyValue(parameters.header.headers),
        auth: parameters.auth,
        body: parameters.body
    });
    
    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCursor(e.target.value);
        setData({...data, cursor: e.target.value});
    };

    const onReadUriChangeStatus = (uriProcess: boolean) => {
        let newTable = {...data, autoReadUri: uriProcess};
        setData(newTable);
        onReadUriChange(uriProcess);
    }

    const queryChange = (rows: StatusKeyValue[]) => {
        let newTable = {...data, query: rows};
        setData(newTable);
        onValueChange(makeRequestParameters(newTable));
    }

    const headerChange = (rows: StatusKeyValue[]) => {
        let newTable = {...data, header: rows};
        setData(newTable);
        onValueChange(makeRequestParameters(newTable));
    }

    const authChange = (auth: Auths) => {
        let newTable = {...data, auth: auth};
        setData(newTable);
        onValueChange(makeRequestParameters(newTable));
    }

    const bodyChange = (body: Body) => {
        let newTable = {...data, body: body};
        setData(newTable);
        onValueChange(makeRequestParameters(newTable));
    }

    const makeRequestParameters = (payload: Payload): ItemRequestParameters => {
        return {
            query: { queries: mergeStatusKeyValue(payload.query) },
            header: { headers: mergeStatusKeyValue(payload.header) },
            auth: payload.auth,
            body: payload.body
        }
    }

    return (
        <>
            <div id="client-argument-headers">
                <div className="radio-button-group border-bottom">
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
            </div>
            <div id="client-argument-content">
                {data.cursor === VIEW_QUERY && <QueryArguments 
                    autoReadUri={data.autoReadUri} 
                    argument={data.query} 
                    readUri={readUri}
                    onReadUriChange={onReadUriChangeStatus} 
                    onValueChange={queryChange}/>}
                {data.cursor === VIEW_HEADER && <HeaderArguments 
                    argument={data.header} 
                    onValueChange={headerChange}/>}
                {data.cursor === VIEW_AUTH && <AuthArguments 
                    argument={data.auth} 
                    onValueChange={authChange}/>}
                {data.cursor === VIEW_BODY && <BodyArguments 
                    argument={data.body} 
                    onValueChange={bodyChange}/>}
            </div>
        </>
    )
}