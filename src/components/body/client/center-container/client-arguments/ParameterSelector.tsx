import { useState } from 'react';
import { QueryArguments } from './query-arguments/QueryArguments';
import { HeaderArguments } from './header-arguments/HeaderArguments';
import { AuthArguments } from './auth-arguments/AuthArguments';
import { BodyArguments } from './body-arguments/BodyArguments';
import { StatusKeyValue } from '../../../../../interfaces/StatusKeyValue';
import { Auths, Body, Request } from '../../../../../interfaces/request/Request';
import { CONTENT_TYPE as CONTENT_TYPE_TEXT } from './body-arguments/text/TextData';
import { Dict } from '../../../../../types/Dict';
import { detachStatusKeyValue } from '../../../../../services/Utils';

import './ParameterSelector.css'

const VIEW_QUERY = "query";
const VIEW_HEADER = "header";
const VIEW_AUTH = "auth";
const VIEW_BODY = "body";

const DEFAULT_CURSOR = VIEW_QUERY;

const mergeStatusKeyValue = (oldValues: Dict<StatusKeyValue[]>, newValues: StatusKeyValue[]): Dict<StatusKeyValue[]> => {
    for (const value of newValues) {
        const vector = oldValues[value.key];
        if(!vector) {
            oldValues[value.key] = [value]
            continue;
        }
        vector.push(value)
    }
    return oldValues
}

interface ParameterSelectorProps {
    request?: Request
    cursorStatus?: string;
}

interface Payload {
    cursor: string;
    query: StatusKeyValue[];
    header: StatusKeyValue[];
    auth: Auths;
    body: Body;
}

export function ParameterSelector({request, cursorStatus}: ParameterSelectorProps) {
    const [table, setTable] = useState<Payload>({
        cursor: cursorStatus || DEFAULT_CURSOR,
        query: request ? detachStatusKeyValue(request.query.queries) : [],
        header: request ? detachStatusKeyValue(request.header.headers) : [],
        auth: request ? request.auth : { status: false, auths: {} },
        body: request ? request.body : { status: true, contentType: CONTENT_TYPE_TEXT, payload: "" }
    });

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTable({...table, cursor: e.target.value})
    };

    const queryChange = (rows: StatusKeyValue[]) => {
        setTable({...table, query: rows})
    }

    const headerChange = (rows: StatusKeyValue[]) => {
        setTable({...table, header: rows})
    }

    const authChange = (auth: Auths) => {
        setTable({...table, auth: auth})
    }

    const bodyChange = (body: Body) => {
        setTable({...table, body: body})
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