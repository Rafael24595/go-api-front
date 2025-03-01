import { useState } from 'react';
import { AUTH_CODE_BASIC, BasicData } from './basic-data/BasicData';
import { AUTH_CODE_BEARER, BearerData } from './bearer-data/BearerData';
import { Auth, Auths } from '../../../../../../interfaces/request/Request';
import { Dict } from '../../../../../../types/Dict';

import './AuthArguments.css'

const VIEW_BASIC = "basic";
const VIEW_BEARER = "bearer";

const DEFAULT_CURSOR = VIEW_BASIC;

interface AuthArgumentsProps {
    values?: Auths
    cursorStatus?: string;
    onValueChange: (auth: Auths) => void;
}

interface Payload {
    cursor: string;
    status: boolean;
    basic: Auth | undefined;
    bearer: Auth | undefined;
}

export function AuthArguments({values, cursorStatus, onValueChange}: AuthArgumentsProps) {
    const [data, setData] = useState<Payload>({
        cursor: cursorStatus || DEFAULT_CURSOR,
        status: values ? values.status : true,
        basic: values?.auths[AUTH_CODE_BASIC],
        bearer: values?.auths[AUTH_CODE_BEARER]
    });

    const cursorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, cursor: e.target.value};
        setData(newData);
    };

    const statusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newData = {...data, status: e.target.checked};
        setData(newData);
        onValueChange(makeAuth(newData));
    };

    const authChange = (auth: Auth) => {
        let newData = {...data};
        if(auth.code == AUTH_CODE_BASIC) {
            newData.basic = auth;
        } else if(auth.code == AUTH_CODE_BEARER) {
            newData.bearer = auth;
        }
        setData(newData);
        onValueChange(makeAuth(newData));
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
        </>
    )
}