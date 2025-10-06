import { Fragment, useState } from 'react';
import { QueryArguments } from './query-arguments/QueryArguments';
import { HeaderArguments } from './header-arguments/HeaderArguments';
import { AuthArguments } from './auth-arguments/AuthArguments';
import { BodyArguments } from './body-arguments/BodyArguments';
import { ContextModal } from '../../../../context/ContextModal';
import { useStoreContext } from '../../../../../store/StoreProviderContext';
import { useStoreStatus } from '../../../../../store/StoreProviderStatus';
import { CookieArguments } from './cookie-arguments/CookieArguments';
import { KeyValue } from '../../../../../interfaces/KeyValue';

import './ParameterSelector.css';

const VIEW_QUERY = "query";
const VIEW_HEADER = "header";
const VIEW_COOKIE = "cookie";
const VIEW_AUTH = "auth";
const VIEW_BODY = "body";

const cursors: KeyValue[] = [
    {
        key: VIEW_QUERY,
        value: "Query",
    },
    {
        key: VIEW_HEADER,
        value: "Headers",
    },
    {
        key: VIEW_COOKIE,
        value: "Cookies",
    },
    {
        key: VIEW_AUTH,
        value: "Auth",
    },
    {
        key: VIEW_BODY,
        value: "Body",
    },
];

const VALID_CURSORS = cursors.map(c => c.key);
const DEFAULT_CURSOR = VIEW_QUERY;

const CURSOR_KEY = "ParameterSelectorCursor";

export function ParameterSelector() {
    const { find, store } = useStoreStatus();

    const [cursor, setCursor] = useState<string>(
        find(CURSOR_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        }));

    const [modalStatus, setModalStatus] = useState<boolean>(false);

    const { initialHash, actualHash } = useStoreContext();

    const cursorChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        cursorChange(e.target.value);
    };

    const cursorChange = (cursor: string) => {
        store(CURSOR_KEY, cursor);
        setCursor(cursor);
    };

    return (
        <>
            <div id="client-argument-headers">
                <div id="parameter-selector-components" className="border-bottom">    
                    <div className="radio-button-group">
                        {cursors.map(c => (
                            <Fragment key={c.key}>
                                <input type="radio" id={`tag-client-${c.key.toLowerCase()}`} className="client-tag" name="cursor-client"
                                    checked={cursor === c.key} 
                                    value={c.key} 
                                    onChange={cursorChangeEvent}/>
                                <button
                                    type="button"
                                    className="button-tag"
                                    onClick={() => cursorChange(c.key)}>
                                    {c.value}
                                </button>
                            </Fragment>
                        ))}
                        <div id="context-buttons">
                            <button type="button" className="button-tag" onClick={() => setModalStatus(true)}>
                                <span className={`button-modified-status small display ${ initialHash != actualHash && "visible" }`}></span>
                                Context
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`client-argument-content-items ${cursor === VIEW_QUERY ? "show" : ""}`}>
                <QueryArguments/>
            </div>
            <div className={`client-argument-content-items ${cursor === VIEW_HEADER ? "show" : ""}`}>
               <HeaderArguments/>
            </div>
            <div className={`client-argument-content-items ${cursor === VIEW_COOKIE ? "show" : ""}`}>
                <CookieArguments/>
            </div>
            <div className={`client-argument-content-items ${cursor === VIEW_AUTH ? "show" : ""}`}>
                <AuthArguments/>
            </div>
            <div className={`client-argument-content-items ${cursor === VIEW_BODY ? "show" : ""}`}>
                <BodyArguments/>
            </div>
            <ContextModal
                isOpen={modalStatus}
                onClose={() => setModalStatus(false)}/>
        </>
    )
}
