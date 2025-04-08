import React, { useEffect, useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { useAlert } from '../utils/alert/Alert';
import { EAlertCategory } from '../../interfaces/AlertData';
import { formatBytes, millisecondsToDate } from '../../services/Tools';
import { ItemCollection } from '../../interfaces/collection/Collection';

import './ImportModal.css';

const FILE_TYPE_KEY = "ImportModalKey";

interface ImportCollectionModalProps {
    isOpen: boolean,
    onSubmit(collections: ItemCollection[]): Promise<void>,
    onClose: () => void,
}

type FileType = "local" | "text";

interface Payload {
    collections: ItemCollection[]
    file: File | null
    fileBlob: string
    fileType: FileType
}

export function ImportCollectionModal({ isOpen, onSubmit, onClose }: ImportCollectionModalProps) {
    const { push } = useAlert();

    const [data, setData] = useState<Payload>({
        collections: [],
        file: null,
        fileBlob: "",
        fileType: findFileType()
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
        const collections = parseBlob(await file.text());

        setData((prevData) => ({
            ...prevData,
            file,
            collections
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

        await onSubmit(data.collections).then(resetModal);
    }

    const changeFileType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const value = e.target.value;
        if (value != "local" && value != "text") {
            return;
        }

        storeFileType(value);
        
        setData({
            collections: [],
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
        const collections = parseBlob(data.fileBlob);
        const file = new File([data.fileBlob], "text", { type: "blob" });

        setData((prevData) => ({
            ...prevData,
            file,
            collections
        }))
    }

    const parseBlob = (blob: string) => {
        let collections: ItemCollection[] = [];
        try {
            const json = JSON.parse(blob);
            if(!Array.isArray(json)) {
                collections = [json];
            } else {
                collections = json;
            }
        } catch (e) {
            push({
                category: EAlertCategory.ERRO,
                content: `Invalid format: ${e}`
            });
        }

        return collections;
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
                <span>Import Collections</span>
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
                        <div>
                            <h3 className="selector-title">Metadata <span title="Number of collections">[{ data.collections.length }]</span>:</h3>
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
