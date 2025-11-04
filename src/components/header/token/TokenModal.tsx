import { Modal } from '../../utils/modal/Modal'
import { useStoreSession } from '../../../store/StoreProviderSession';
import { useState } from 'react';
import { newToken, Token } from '../../../interfaces/Token';
import { copyTextToClipboard } from '../../../services/Utils';
import { EAlertCategory } from '../../../interfaces/AlertData';
import { useAlert } from '../../utils/alert/Alert';

import './TokenModal.css';
import { millisecondsToDate } from '../../../services/Tools';
import { ModalButton } from '../../../interfaces/ModalButton';
import { VoidCallback } from '../../../interfaces/Callback';

interface TokenModalProps {
    isOpen: boolean,
    onClose: () => void,
}

type View = "list" | "insert";

interface Payload {
    name: string;
    description: string;
    expires: string;
    scopes: string[];
}

const emptyPayload = (): Payload => {
    return {
        name: "",
        description: "",
        expires: "",
        scopes: [],
    }
}

export function TokenModal({ isOpen, onClose }: TokenModalProps) {
    const { userData, scopes, tokens, insertToken, deleteToken } = useStoreSession();

    const { ask, push } = useAlert();

    const [view, setView] = useState<View>("list");

    const [raw, setRaw] = useState<string>("");

    const [data, setData] = useState<Payload>(emptyPayload());

    const [openTokenData, setOpenTokenData] = useState<string[]>([]);

    const onOpenTokenDataChange = (token: Token) => {
        setOpenTokenData((prevData) =>
            prevData.includes(token.id)
                ? prevData.filter(s => s !== token.id)
                : [...prevData, token.id]
        );
    };

    const changeView = (v: View) => {
        cleanRaw();
        setView(v);
    }

    const submit = async () => {
        //TODO: Replace with Temporal.
        const expires = new Date(data.expires).getTime();

        const token = newToken(expires, data.name, data.description, ...data.scopes);
        const raw = await insertToken(token);
        setRaw(raw);
        cancel();
    };

    const askRemove = async (token: Token) => {
        const content = `The token '${token.name}' will be deleted, are you sure?`;
        const buttons: ModalButton[] = [
            {
                title: "Yes",
                type: "submit",
                callback: {
                    func: () => remove(token)
                }
            },
            {
                title: "No",
                callback: VoidCallback
            }
        ];
        ask({ content, buttons });
    };

    const remove = async (token: Token) => {
        cleanRaw();
        await deleteToken(token);
    };

    const close = () => {
        cancel();
        cleanRaw();
        onClose();
    };

    const cancel = () => {
        setView('list');
        clean();
    };

    const clean = () => {
        setData(emptyPayload());
    };

    const cleanRaw = () => {
        setRaw("");
    };

    const title = () => {
        if (view == "list") {
            return listTitle;
        }

        return insertTitle;
    }

    const listTitle = (
        <div id="user-tokens-title">
            <span>{userData.username} tokens</span>
            <button onClick={() => changeView("insert")}>Generate</button>
        </div>
    );

    const insertTitle = (
        <span>Generate token</span>
    );

    const buttons = () => {
        if (view == "list") {
            return listButtons;
        }

        return insertButtons;
    }

    const listButtons = [
        {
            title: "Close",
            callback: {
                func: close
            }
        }
    ]

    const insertButtons = [
        {
            title: "Save",
            callback: {
                func: submit
            }
        },
        {
            title: "Cancel",
            callback: {
                func: cancel
            }
        },
        {
            title: "Close",
            callback: {
                func: close
            }
        }
    ]

    const children = () => {
        if (view == "list") {
            return listChildren;
        }

        return insertChildren;
    }

    const copyRawToClipboard = () => {
        copyTextToClipboard(raw,
            () => push({
                category: EAlertCategory.INFO,
                content: "The token has been copied to the clipboard"
            }),
            (err) => push({
                category: EAlertCategory.ERRO,
                content: `The token could not be copied to the clipboard: ${err.message}`
            }),
        );
    }

    const tokenStatus = (token: Token) => {
        const now = Date.now()
        if (now > token.expire) {
            return "Expired"
        }
        return "Active"
    }

    const findScope = (scope: string) => {
        return scopes.filter(s => s.code == scope).shift()
    }

    const listChildren = (
        <>
            {raw != "" && (
                <div id="generated-token-container">
                    <p id="generated-token-title">Generated token:</p>
                    <div id="generated-token-data">
                        <div className="token-form-fragment raw-fragment">
                            <input type="text" id="token-raw" name="token-raw" value={raw} readOnly />
                            <button className="copy-raw-button" onClick={copyRawToClipboard}></button>
                        </div>
                        <p className="small-warning"><span className="important-block"></span>Make sure to save the token, as you won't be able to see it again.</p>
                    </div>
                </div>
            )}
            <div>
                {tokens.map(token => (
                    <div key={token.id} className="token-container">
                        <div className="token-data-container">
                            <button className="token-metadata" onClick={() => onOpenTokenDataChange(token)}>
                                <span className="token-data">
                                    <span className={`token-name token-status-${tokenStatus(token).toLowerCase()}`}>{tokenStatus(token)}</span>
                                    <span className="preserve-space"> - </span>
                                    <span className="token-name" title={millisecondsToDate(token.timestamp)}>{token.name}</span>
                                    {token.description != "" && (
                                        <>
                                            <span className="preserve-space">: </span>
                                            <span className="token-description" title={token.description}>{token.description}</span>
                                        </>
                                    )}
                                </span>
                                <span className="token-dates">
                                    <span className="token-expires">Expires {millisecondsToDate(token.expire)}</span>
                                </span>
                            </button>
                            <div className="token-buttons">
                                <button onClick={() => askRemove(token)}>Delete</button>
                            </div>
                        </div>
                        <div>
                            {openTokenData.includes(token.id) && (
                                <div className="token-scopes-enum">
                                    <span className="token-name">Scope: </span>
                                    {token.scopes.map((scope, i) => (
                                        <>
                                            <span className="scope-enum" title={findScope(scope)?.title}>{scope}</span>
                                            {i < token.scopes.length - 1 && <span className="comma">, </span>}
                                        </>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prevData) => ({
            ...prevData,
            name: e.target.value
        }));
    }

    const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setData((prevData) => ({
            ...prevData,
            description: e.target.value
        }));
    }

    const onExpiresChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prevData) => ({
            ...prevData,
            expires: e.target.value
        }));
    }

    const onScopesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setData((prevData) => {
            const scopes = prevData.scopes.includes(value)
                ? prevData.scopes.filter((scope) => scope !== value)
                : [...prevData.scopes, value]
            return {
                ...prevData,
                scopes
            }
        });
    }

    const insertChildren = (
        <>
            <div id="insert-token-container">
                <div id="token-data">
                    <div className="token-form-fragment">
                        <label htmlFor="token-name">Name:</label>
                        <input type="text" id="token-name" name="token-name" value={data.name} onChange={onNameChange} autoComplete="on" required />
                    </div>
                    <div className="token-form-fragment">
                        <label htmlFor="token-description">Description:</label>
                        <textarea rows={4} id="token-description" name="token-description" value={data.description} onChange={onDescriptionChange} autoComplete="on"></textarea>
                    </div>
                    <div className="token-form-fragment">
                        <label htmlFor="token-expires">Expires:</label>
                        <input type="date" id="token-expires" name="token-expires" value={data.expires} onChange={onExpiresChange} autoComplete="on" required />
                    </div>
                    <div className="token-form-fragment">
                        <span className="token-form-fragment-label">Scopes:</span>
                        <div id="token-scopes-container">
                            {scopes.map(scope => (
                                <label key={scope.value} title={scope.title}>
                                    <input
                                        type="checkbox"
                                        name="token-scopes"
                                        value={scope.value}
                                        checked={data.scopes.includes(scope.value)}
                                        onChange={onScopesChange}
                                    />
                                    {scope.code}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <Modal
            buttons={buttons()}
            titleCustom={title()}
            style={{
                height: "450px",
                width: "600px",
                minHeight: "350px",
                minWidth: "250px"
            }}
            isOpen={isOpen}
            onClose={close}>
            {children()}
        </Modal>
    )
}