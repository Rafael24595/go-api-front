import { Modal } from '../../utils/modal/Modal'
import { useStoreSession } from '../../../store/StoreProviderSession';
import { useState } from 'react';
import { newToken } from '../../../interfaces/Token';
import { copyTextToClipboard } from '../../../services/Utils';
import { EAlertCategory } from '../../../interfaces/AlertData';
import { useAlert } from '../../utils/alert/Alert';

import './TokenModal.css';

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
    raw: string;
}

const emptyPayload = (): Payload => {
    return {
        name: "",
        description: "",
        expires: "",
        scopes: [],
        raw: ""
    }
}

const scopes = [
    {
        name: "Mock API",
        title: "Allows request to mock API",
        value: "mockapi"
    }
];

export function TokenModal({ isOpen, onClose }: TokenModalProps) {
    const { userData, tokens, fetchTokens, insertToken } = useStoreSession();

    const { push } = useAlert();

    const [view, setView] = useState<View>("list");

    const [data, setData] = useState<Payload>(emptyPayload());

    const submit = async () => {
        console.log(data)

        setData({
            ...emptyPayload(),
            raw: "O9FHKIBTUE0CqPlgAGJl2DspWtoWiTmOFioaD4gGKW2ZoQCvh7c9KfwSzWRH7G6E"
        });

        //TODO: Replace with Temporal.
        /*const expires = new Date(data.expires).getTime();

        const token = newToken(expires, data.name, data.description, ...data.scopes);
        const raw = await insertToken(token);
        setData({
            ...emptyPayload(),
            raw: raw
        });*/
        //close();
    };

    const close = () => {
        cancel();
        onClose();
    };

    const cancel = () => {
        setView('list');
        clean();
    };

    const clean = () => {
        setData(emptyPayload());
    };

    const title = () => {
        if (view == "list") {
            return listTitle;
        }

        return insertTitle;
    }

    const listTitle = (
        <span>{userData.username} tokens</span>
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

    const changeView = (v: View) => {
        setView(v)
    }

    const listChildren = (
        <>
            <button onClick={() => changeView("insert")}>Generate</button>
            <div>
                {tokens.map(token => (
                    <>
                        <p>{token.name}</p>
                    </>
                ))}
            </div>
        </>
    );

    const copyRawToClipboard = () => {
        copyTextToClipboard(data.raw,
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
                    {data.raw != "" && (
                        <div className="token-form-fragment raw-fragment">
                            <input type="text" id="token-name" name="token-name" value={data.raw} readOnly />
                            <button className="copy-raw-button" onClick={copyRawToClipboard}></button>
                        </div>
                    )}
                    <div className="token-form-fragment">
                        <label htmlFor="token-name">Name:</label>
                        <input type="text" id="token-name" name="token-name" value={data.name} onChange={onNameChange} autoComplete="on" />
                    </div>
                    <div className="token-form-fragment">
                        <label htmlFor="token-description">Description:</label>
                        <textarea rows={4} id="token-description" name="token-description" value={data.description} onChange={onDescriptionChange}></textarea>
                    </div>
                    <div className="token-form-fragment">
                        <label htmlFor="token-expires">Expires:</label>
                        <input type="date" id="token-expires" name="token-expires" value={data.expires} onChange={onExpiresChange} autoComplete="on" />
                    </div>
                    <div className="token-form-fragment">
                        <span className="token-form-fragment-label">Scopes:</span>
                        <div id="token-scopes-container">
                            {scopes.map(scope => (
                                <label key={scope.value}>
                                    <input
                                        type="checkbox"
                                        name="token-scopes"
                                        value={scope.value}
                                        title={scope.title}
                                        checked={data.scopes.includes(scope.value)}
                                        onChange={onScopesChange}
                                    />
                                    {scope.name}
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