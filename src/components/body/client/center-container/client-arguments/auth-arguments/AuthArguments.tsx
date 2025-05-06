import { useEffect, useState } from 'react';
import { AUTH_CODE_BASIC, BasicData } from './basic-data/BasicData';
import { AUTH_CODE_BEARER, BearerData } from './bearer-data/BearerData';
import { Auth, Auths } from '../../../../../../interfaces/request/Request';
import { Dict } from '../../../../../../types/Dict';
import { useStoreRequest } from '../../../../../../store/StoreProviderRequest';
import { useStoreStatus } from '../../../../../../store/StoreProviderStatus';

import './AuthArguments.css';

const VIEW_BASIC = "basic";
const VIEW_BEARER = "bearer";

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

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        store(CURSOR_KEY, e.target.value);
        setData({...data, cursor: e.target.value});
    };

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, status: e.target.checked};
        setData(newData);
        updateAuth(makeAuth(newData));
    };

    const authChange = (code: string, auth: Auth | undefined) => {
        let newData = {...data};
        if(auth != undefined) {
            auth.code = code;
        }

        if(code == AUTH_CODE_BASIC) {
            newData.basic = auth;
        } 
        if(code == AUTH_CODE_BEARER) {
            newData.bearer = auth;
        }

        setData(newData);
        updateAuth(makeAuth(newData));
    }

    const makeAuth = (payload: Payload): Auths => {
        let auths: Dict<Auth> = {};
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
                    <input type="radio" id="tag-auth-basic" className="client-tag" name="cursor-auth" 
                        checked={data.cursor === VIEW_BASIC} 
                        value={VIEW_BASIC} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-auth-basic">Basic</label>
                    <input type="radio" id="tag-auth-bearer" className="client-tag" name="cursor-auth" 
                        checked={data.cursor === VIEW_BEARER} 
                        value={VIEW_BEARER} 
                        onChange={cursorChange}/>
                    <label htmlFor="tag-auth-bearer">Bearer</label>
                </div>
                <div id="client-argument-content">
                    {data.cursor === VIEW_BASIC && <BasicData value={data.basic} onValueChange={authChange}/>}
                    {data.cursor === VIEW_BEARER && <BearerData value={data.bearer} onValueChange={authChange}/>}
                </div>
            </div>
        </>
    )
}
