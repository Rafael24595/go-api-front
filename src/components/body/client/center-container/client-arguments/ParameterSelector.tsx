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

const DEFAULT_CURSOR = VIEW_QUERY;

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
    request: ItemRequestParameters
    cursorStatus?: string;
    onValueChange: (parameters: ItemRequestParameters) => void;
}

interface Payload {
    cursor: string;
    query: StatusKeyValue[];
    header: StatusKeyValue[];
    auth: Auths;
    body: Body;
}

export function ParameterSelector({request, cursorStatus, onValueChange}: ParameterSelectorProps) {
    const [table, setTable] = useState<Payload>({
        cursor: cursorStatus || DEFAULT_CURSOR,
        query: detachStatusKeyValue(request.query.queries),
        header: detachStatusKeyValue(request.header.headers),
        auth: request.auth,
        body: request.body
    });

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTable({...table, cursor: e.target.value});
    };

    const queryChange = (rows: StatusKeyValue[]) => {
        let newTable = {...table, query: rows};
        setTable(newTable);
        onValueChange(makeRequestParameters(newTable));
    }

    const headerChange = (rows: StatusKeyValue[]) => {
        let newTable = {...table, header: rows};
        setTable(newTable);
        onValueChange(makeRequestParameters(newTable));
    }

    const authChange = (auth: Auths) => {
        let newTable = {...table, auth: auth};
        setTable(newTable);
        onValueChange(makeRequestParameters(newTable));
    }

    const bodyChange = (body: Body) => {
        let newTable = {...table, body: body};
        setTable(newTable);
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
                        checked={table.cursor === VIEW_QUERY} 
                        value={VIEW_QUERY} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-client-query" id="client-label-query">Query</label>
                    <input type="radio" id="tag-client-header" className="client-tag" name="cursor-client"
                        checked={table.cursor === VIEW_HEADER} 
                        value={VIEW_HEADER} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-client-header" id="client-label-header">Headers</label>
                    <input type="radio" id="tag-client-auth" className="client-tag" name="cursor-client"
                        checked={table.cursor === VIEW_AUTH} 
                        value={VIEW_AUTH} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-client-auth" id="client-label-auth">Auth</label>
                    <input type="radio" id="tag-client-body" className="client-tag" name="cursor-client"
                        checked={table.cursor === VIEW_BODY} 
                        value={VIEW_BODY} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-client-body" id="client-label-body">Body</label>
                </div>
            </div>
            <div id="client-argument-content">
                {table.cursor === VIEW_QUERY && <QueryArguments values={table.query} onValueChange={queryChange}/>}
                {table.cursor === VIEW_HEADER && <HeaderArguments values={table.header} onValueChange={headerChange}/>}
                {table.cursor === VIEW_AUTH && <AuthArguments values={table.auth} onValueChange={authChange}/>}
                {table.cursor === VIEW_BODY && <BodyArguments value={table.body} onValueChange={bodyChange}/>}
            </div>
        </>
    )
}