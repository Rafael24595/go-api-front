import React, { useEffect, useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { useAlert } from '../utils/alert/Alert';
import { EAlertCategory } from '../../interfaces/AlertData';
import { formatBytes, millisecondsToDate } from '../../services/Tools';
import { ItemRequest } from '../../interfaces/request/Request';
import { useStoreStatus } from '../../store/StoreProviderStatus';

import './ImportModal.css';

const FILE_TYPE_KEY = "ImportModalKey";

interface ImportRequestModalProps {
    isOpen: boolean,
    onSubmit(collections: ItemRequest[]): Promise<void>,
    onClose: () => void,
}

const CURSOR_LOCAL = "local";
const CURSOR_TEXT = "text";

const VALID_CURSORS = [CURSOR_LOCAL, CURSOR_TEXT];

const DEFAULT_CURSOR = CURSOR_LOCAL;

interface Payload {
    requests: ItemRequest[]
    file: File | null
    fileBlob: string
    fileType: string
}

export function ImportRequestModal({ isOpen, onSubmit, onClose }: ImportRequestModalProps) {
    const { find, store } = useStoreStatus();

    const { push } = useAlert();

    const [data, setData] = useState<Payload>({
        requests: [],
        file: null,
        fileBlob: "",
        fileType: find(FILE_TYPE_KEY, {
            def: DEFAULT_CURSOR,
            range: VALID_CURSORS
        })
    });

    useEffect(() => {
        setData((prevData) => ({
            ...prevData,
            file: null
        }));
      }, [isOpen]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if(files == null) {
            return;
        }

        const file = files[0];
        const requests = parseBlob(await file.text());

        setData((prevData) => ({
            ...prevData,
            file,
            requests
        }));
    };

    const submitOpenaApiModal = async () => {
        if (!data.file) {
            push({
                category: EAlertCategory.WARN,
                content: "Please select a file first"
            });
            return;
        }

        await onSubmit(data.requests).then(resetModal);
    }

    const changeFileType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const value = e.target.value;
        if (!VALID_CURSORS.includes(value)) {
            return;
        }

        store(FILE_TYPE_KEY, value);
        
        setData({
            requests: [],
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
        const requests = parseBlob(data.fileBlob);
        const file = new File([data.fileBlob], "text", { type: "blob" });

        setData((prevData) => ({
            ...prevData,
            file,
            requests
        }))
    }

    const parseBlob = (blob: string) => {
        let requests: ItemRequest[] = [];
        try {
            const json = JSON.parse(blob);
            if(!Array.isArray(json)) {
                requests = [json];
            } else {
                requests = json;
            }
        } catch (e) {
            push({
                category: EAlertCategory.ERRO,
                content: `Invalid format: ${e}`
            });
        }

        return requests;
    }

    const localClose = () => {
        resetModal();
        onClose();
    }

    const resetModal = () => {
        setData((prevData) => ({
            ...prevData,
            file: null,
            fileUri: "",
            fileBlob: "",
        }));
    }

    return (
        <Modal 
            buttons={[
                {
                    title: "Submit",
                    type: "submit",
                    callback: {
                        func: submitOpenaApiModal
                    }
                },
                {
                    title: "Close",
                    callback: {
                        func: localClose
                    }
                }
            ]}  
            title={
                <span>Import Requests</span>
            }
            width="50%"
            height="45%"
            isOpen={isOpen} 
            onClose={localClose}>
                <div id="openapi-selector-container">
                    <div>
                        <h3 className="selector-title">Selector:</h3>
                        <div id="selector-container">
                            <div id="selector-type">
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
                        <div>
                            <h3 className="selector-title">Metadata <span title="Number of collections">[{ data.requests.length }]</span>:</h3>
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
                    )}
                </div>
        </Modal>
    )
}
