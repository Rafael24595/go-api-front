import { Fragment, useEffect, useState } from 'react';
import { AUTH_CODE_BASIC, BasicData } from './basic-data/BasicData';
import { AUTH_CODE_BEARER, BearerData } from './bearer-data/BearerData';
import { Auth, Auths } from '../../../../../../interfaces/client/request/Request';
import { Dict } from '../../../../../../types/Dict';
import { useStoreRequest } from '../../../../../../store/client/StoreProviderRequest';
import { useStoreStatus } from '../../../../../../store/StoreProviderStatus';
import { KeyValue } from '../../../../../../interfaces/KeyValue';

import './AuthArguments.css';

const VIEW_BASIC = "basic";
const VIEW_BEARER = "bearer";

const cursors: KeyValue[] = [
    {
        key: VIEW_BASIC,
        value: "Basic",
    },
    {
        key: VIEW_BEARER,
        value: "Bearer",
    }
];

const VALID_CURSORS = [VIEW_BASIC, VIEW_BEARER];

const DEFAULT_CURSOR = VIEW_BASIC;

const CURSOR_KEY = "AuthArgumentsCursor";

interface Payload {
    cursor: string;
    status: boolean;
    basic: Auth | undefined;
    bearer: Auth | undefined;
}

export function AuthArguments() {
    const { find, store } = useStoreStatus();

    const { request, updateAuth } = useStoreRequest();

    const [data, setData] = useState<Payload>({
        cursor: find(CURSOR_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        }),
        status: request.auth.status,
        basic: request.auth.auths[AUTH_CODE_BASIC],
        bearer: request.auth.auths[AUTH_CODE_BEARER]
    });

    useEffect(() => {
        setData(prevData => ({
            ...prevData,
            status: request.auth.status,
            basic: request.auth.auths[AUTH_CODE_BASIC],
            bearer: request.auth.auths[AUTH_CODE_BEARER]
        }));
    }, [request.auth]);

    const cursorChangeEvvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        cursorChange(e.target.value);
    };

    const cursorChange = (cursor: string) => {
        store(CURSOR_KEY, cursor);
        setData({...data, cursor});
    };

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newData = {...data, status: e.target.checked};
        setData(newData);
        updateAuth(makeAuth(newData));
    };

    const authChange = (type: string, auth: Auth | undefined) => {
        const newData = {...data};
        if(auth != undefined) {
            auth.type = type;
        }

        if(type == AUTH_CODE_BASIC) {
            newData.basic = auth;
        } 
        if(type == AUTH_CODE_BEARER) {
            newData.bearer = auth;
        }

        setData(newData);
        updateAuth(makeAuth(newData));
    }

    const makeAuth = (payload: Payload): Auths => {
        const auths: Dict<Auth> = {};
        if(payload.basic) {
            auths[AUTH_CODE_BASIC] = payload.basic;
        }
        if(payload.bearer) {
            auths[AUTH_CODE_BEARER] = payload.bearer;
        }
        return {
            status: payload.status,
            auths: auths
        }
    }

    return (
        <>
            <div id="client-argument-content">
                <div className="radio-button-group border-bottom">
                    <input 
                        name="status" 
                        id="auth-enable" 
                        type="checkbox" 
                        checked={data.status}
                        onChange={statusChange}/>
                    {cursors.map(c => (
                        <Fragment key={c.key}>
                            <input type="radio" id={`tag-auth-${c.key.toLowerCase()}`} className="client-tag" name="cursor-auth"
                                checked={data.cursor === c.key} 
                                value={c.key} 
                                onChange={cursorChangeEvvent}/>
                            <button
                                type="button"
                                className="button-tag"
                                onClick={() => cursorChange(c.key)}>
                                {c.value}
                            </button>
                        </Fragment>
                    ))}
                </div>
                <div id="client-argument-content" className="no-scroll">
                    {data.cursor === VIEW_BASIC && <BasicData value={data.basic} onValueChange={authChange}/>}
                    {data.cursor === VIEW_BEARER && <BearerData value={data.bearer} onValueChange={authChange}/>}
                </div>
            </div>
        </>
    )
}
