import React, { useState } from 'react';
import { useAlert } from '../utils/alert/Alert';
import { EAlertCategory } from '../../interfaces/AlertData';
import { formatBytes, millisecondsToDate } from '../../services/Tools';
import { Context } from '../../interfaces/context/Context';

import '../collection/ImportModal.css';

const FILE_TYPE_KEY = "ImportContextKey";

interface ImportContextProps {
    onSubmit(context: Context): Promise<void>,
}

type FileType = "local" | "text";

interface Payload {
    context?: Context
    file: File | null
    fileBlob: string
    fileType: FileType
}

export function ImportContext({ onSubmit }: ImportContextProps) {
    const { push } = useAlert();

    const [data, setData] = useState<Payload>({
        context: undefined,
        file: null,
        fileBlob: "",
        fileType: findFileType()
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
        if (value != "local" && value != "text") {
            return;
        }

        storeFileType(value);
        
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
                    <div id="selector-type">
                        <label htmlFor="file-type">File: </label>
                        <select name="file-type" value={data.fileType} onChange={changeFileType}>
                            <option value="local">Local</option>
                            <option value="text">Text</option>
                        </select>
                    </div>
                    <div id="selector-file">
                        {data.fileType == 'local' && (
                            <input type="file" onChange={handleFileChange}/>
                        )}
                        {data.fileType == 'text' && (
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

const findFileType = (): FileType => {
    const value = localStorage.getItem(FILE_TYPE_KEY);
    if(value != "local" && value != "text") {
        return "local";
    }
    return value;
}

const storeFileType = (fileType: FileType) => {
    localStorage.setItem(FILE_TYPE_KEY, fileType);
}
