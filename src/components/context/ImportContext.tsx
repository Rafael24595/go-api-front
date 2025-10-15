import React, { useState } from 'react';
import { useAlert } from '../utils/alert/Alert';
import { EAlertCategory } from '../../interfaces/AlertData';
import { formatBytes, millisecondsToDate } from '../../services/Tools';
import { Context } from '../../interfaces/context/Context';
import { useStoreStatus } from '../../store/StoreProviderStatus';

import '../collection/ImportModal.css';

const FILE_TYPE_KEY = "ImportContextKey";

interface ImportContextProps {
    onSubmit(context: Context): Promise<void>,
}

const CURSOR_LOCAL = "local";
const CURSOR_TEXT = "text";

const VALID_CURSORS = [CURSOR_LOCAL, CURSOR_TEXT];

const DEFAULT_CURSOR = CURSOR_LOCAL;

interface Payload {
    context?: Context
    file: File | null
    fileBlob: string
    fileType: string
}

export function ImportContext({ onSubmit }: ImportContextProps) {
    const { find, store } = useStoreStatus();

    const { push } = useAlert();

    const [data, setData] = useState<Payload>({
        context: undefined,
        file: null,
        fileBlob: "",
        fileType: find(FILE_TYPE_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        })
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if(files == null) {
            return;
        }

        const file = files[0];
        const context = parseBlob(await file.text());

        setData((prevData) => ({
            ...prevData,
            file,
            context
        }));
    };

    const submitImport = async () => {
        if (!data.context) {
            push({
                category: EAlertCategory.WARN,
                content: "Please select a file first"
            });
            return;
        }

        await onSubmit(data.context).then(resetModal);
    }

    const changeFileType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const value = e.target.value;
        if (!VALID_CURSORS.includes(value)) {
            return;
        }

        store(FILE_TYPE_KEY, value);
        
        setData({
            context: undefined,
            file: null,
            fileBlob: "",
            fileType: value
        });
    }

    const changeFileBlob = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setData((prevData) => ({
            ...prevData,
            fileBlob: e.target.value
        }));
    }

    const loadFileBlob = () => {
        const context = parseBlob(data.fileBlob);

        let file = null;
        if(context) {
            file = new File([data.fileBlob], "text", { type: "blob" });
        }

        setData((prevData) => ({
            ...prevData,
            file,
            context
        }))
    }

    const parseBlob = (blob: string): Context | undefined => {
        try {
            return JSON.parse(blob);
        } catch (e) {
            push({
                category: EAlertCategory.ERRO,
                content: `Invalid format: ${e}`
            });
        }
    }

    const resetModal = () => {
        setData((prevData) => ({
            ...prevData,
            file: null,
            fileUri: "",
            fileBlob: "",
        }));
    }

    const calculeLength = () => {
        if(!data.context) {
            return 0;
        }

       return Object.entries(data.context.dictionary)
        .reduce((sum, [_, value]) => sum + Object.keys(value).length, 0);
    }

    return (
        <div id="openapi-selector-container">
            <div>
                <p className="selector-title paragraph">Selector:</p>
                <div id="selector-container">
                    <div id="selector-type" className="line">
                        <label htmlFor="file-type">File: </label>
                        <select name="file-type" value={data.fileType} onChange={changeFileType}>
                            <option value={CURSOR_LOCAL}>Local</option>
                            <option value={CURSOR_TEXT}>Text</option>
                        </select>
                    </div>
                    <div id="selector-file">
                        {data.fileType == CURSOR_LOCAL && (
                            <input type="file" onChange={handleFileChange}/>
                        )}
                        {data.fileType == CURSOR_TEXT && (
                            <>
                                <textarea value={data.fileBlob} onChange={changeFileBlob}></textarea>
                                <button type="button" onClick={loadFileBlob}>Load</button>
                            </>
                        )}
                    </div>
                    
                </div>
            </div>
            { data.file && (
                <>
                    <div>
                        <p className="selector-title paragraph">Metadata <span title="Number of collections">[{ calculeLength() }]</span>:</p>
                        <div id="metadata-container">
                            <div className="metadata-fragment">
                                <p><span className="metadata-title">Name: </span> <span className="metadata-value">{ data.file.name }</span></p>
                                <p><span className="metadata-title">Size: </span> <span className="metadata-value">{ formatBytes(data.file.size) }</span></p>
                            </div>
                            <div className="metadata-fragment">
                                <p><span className="metadata-title">Type: </span> <span className="metadata-value">{ data.file.type || "binary" }</span></p>
                                <p><span className="metadata-title">Modified: </span> <span className="metadata-value">{ millisecondsToDate(data.file.lastModified) }</span></p>
                            </div>
                        </div>
                    </div>
                    <div id="buttons-container">
                        <button type="button" onClick={submitImport}>Load</button>
                    </div>
                </>
            )}
        </div>
    )
}
