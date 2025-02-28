import { useState } from 'react';
import './ArgumentsSelector.css'
import { QueryArguments } from './query-arguments/QueryArguments';
import { HeaderArguments } from './header-arguments/HeaderArguments';
import { AuthArguments } from './auth-arguments/AuthArguments';
import { BodyArguments } from './body-arguments/BodyArguments';
import { StatusKeyValue } from '../../../../../interfaces/request/StatusKeyValue';

const VIEW_QUERY = "query";
const VIEW_HEADER = "header";
const VIEW_AUTH = "auth";
const VIEW_BODY = "body";

const DEFAULT_CURSOR = VIEW_QUERY;

interface ArgumentsSelectorArgs {
    cursorStatus?: string;
}

export function ArgumentsSelector({cursorStatus}: ArgumentsSelectorArgs) {
    const [cursor, setCursor] = useState(cursorStatus || DEFAULT_CURSOR);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCursor(e.target.value)
    };

    const queryChange = (rows: StatusKeyValue[]) => {

    }

    return (
        <>
            <div id="client-argument-headers">
                <div className="radio-button-group border-bottom">
                    <input type="radio" id="tag-client-query" className="client-tag" name="cursor-argument-client" 
                        checked={cursor === VIEW_QUERY} 
                        value={VIEW_QUERY} 
                        onChange={handleChange}/>
                    <label htmlFor="tag-client-query" id="client-label-query">Query</label>
                    <input type="radio" id="tag-client-header" className="client-tag" name="cursor-argument-client" 
                        checked={cursor === VIEW_HEADER} 
                        value={VIEW_HEADER} 
                        onChange={handleChange}/>
                    <label htmlFor="tag-client-header" id="client-label-header">Headers</label>
                    <input type="radio" id="tag-client-auth" className="client-tag" name="cursor-argument-client" 
                        checked={cursor === VIEW_AUTH} 
                        value={VIEW_AUTH} 
                        onChange={handleChange}/>
                    <label htmlFor="tag-client-auth" id="client-label-auth">Auth</label>
                    <input type="radio" id="tag-client-body" className="client-tag" name="cursor-argument-client" 
                        checked={cursor === VIEW_BODY} 
                        value={VIEW_BODY} 
                        onChange={handleChange}/>
                    <label htmlFor="tag-client-body" id="client-label-body">Body</label>
                </div>
            </div>
            <div id="client-argument-content">
                {cursor === VIEW_QUERY && <QueryArguments onValueChange={queryChange}/>}
                {cursor === VIEW_HEADER && <HeaderArguments/>}
                {cursor === VIEW_AUTH && <AuthArguments/>}
                {cursor === VIEW_BODY && <BodyArguments/>}
            </div>
        </>
    )
}