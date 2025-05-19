import React, { useEffect, useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { useAlert } from '../utils/alert/Alert';
import { EAlertCategory } from '../../interfaces/AlertData';
import { formatBytes, millisecondsToDate } from '../../services/Tools';
import { fetchFile } from '../../services/api/ServiceClient';
import { useStoreStatus } from '../../store/StoreProviderStatus';

import './ImportModal.css';

const FILE_TYPE_KEY = "OpenApiModalKey";

interface ImportOpenApiModalProps {
    isOpen: boolean,
    onSubmit(file: File): Promise<void>,
    onClose: () => void,
}

const CURSOR_LOCAL = "local";
const CURSOR_REMOTE = "remote";
const CURSOR_TEXT = "text";

const VALID_CURSORS = [CURSOR_LOCAL, CURSOR_REMOTE, CURSOR_TEXT];

const DEFAULT_CURSOR = CURSOR_LOCAL;

interface Payload {
    file: File | null
    fileUri: string
    fileBlob: string
    fileType: string
}

export function ImportOpenApiModal({ isOpen, onSubmit, onClose }: ImportOpenApiModalProps) {
    const { find, store } = useStoreStatus();

    const { push } = useAlert();

    const [data, setData] = useState<Payload>({
        file: null,
        fileUri: "",
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if(files == null) {
            return;
        }

        setData((prevData) => ({
            ...prevData,
            file: files[0]
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

        await onSubmit(data.file).then(resetModal);
    }

    const changeFileType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const value = e.target.value;
        if (!VALID_CURSORS.includes(value)) {
            return;
        }

        store(FILE_TYPE_KEY, value);
        
        setData({
            file: null,
            fileUri: "",
            fileBlob: "",
            fileType: value
        });
    }

    const changeFileUri = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setData((prevData) => ({
            ...prevData,
            fileUri: e.target.value
        }));
    }

    const fetchUriFile = async () => {
        const file = await fetchFile(data.fileUri).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if(!file) {
            return;
        }

        setData((prevData) => ({
            ...prevData,
            file
        }))
    }

    const changeFileBlob = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setData((prevData) => ({
            ...prevData,
            fileBlob: e.target.value
        }));
    }

    const loadFileBlob = async () => {
        const file = new File([data.fileBlob], "text", { type: "blob" });

        setData((prevData) => ({
            ...prevData,
            file
        }))
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
            titleCustom={
                <span>Upload an OpenAPI File</span>
            }
            style={{
                width:"50%",
                height: "45%",
                maxWidth: "800px",
                maxHeight: "450px"
            }}
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
                                    <option value={CURSOR_REMOTE}>Remote</option>
                                    <option value={CURSOR_TEXT}>Text</option>
                                </select>
                            </div>
                            <div id="selector-file">
                                {data.fileType == CURSOR_LOCAL && (
                                    <input type="file" onChange={handleFileChange}/>
                                )}
                                {data.fileType == CURSOR_REMOTE && (
                                    <>
                                        <input type="text" placeholder="https://swagger.io/docs/specification/v3_0/basic-structure" value={data.fileUri} onChange={changeFileUri}/>
                                        <button type="button" onClick={fetchUriFile}>Load</button>
                                    </>
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
                            <h3 className="selector-title">Metadata:</h3>
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
