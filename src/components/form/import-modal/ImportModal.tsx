import React, { useEffect, useState } from 'react';
import { Modal } from '../../utils/modal/Modal';
import { useAlert } from '../../utils/alert/Alert';
import { EAlertCategory } from '../../../interfaces/AlertData';
import { formatBytes, millisecondsToDate } from '../../../services/Tools';
import { fetchFile } from '../../../services/api/ServiceClient';
import { useStoreStatus } from '../../../store/StoreProviderStatus';
import { ModalButton } from '../../../interfaces/ModalButton';

import './ImportModal.css';

export type SubmitArgs<T,> = { items: T[], file?: File }

interface ImportModalProps<T> {
    modal: ImportModalDataProps,
    isOpen: boolean,
    onSubmit(payload: SubmitArgs<T>): Promise<void>,
    onClose: () => void,
}

export interface ImportModalDataProps {
    title: React.ReactNode,
    dimension: ImportModalDimension,
    cacheKey: string,
    cursors?: ImportModalInput[],
    placeholder?: string,
    parseBlob: <T, >(fileBlob: string) => { items: T[], warning?: string }
}

interface ImportModalDimension {
    width: string,
    height: string,
    maxWidth: string,
    maxHeight: string
}

export enum ImportModalInput {
    CURSOR_LOCAL = "local",
    CURSOR_REMOTE = "remote",
    CURSOR_TEXT = "text",
}

const ImportModalInputTag = {
    [ImportModalInput.CURSOR_LOCAL]: "Local",
    [ImportModalInput.CURSOR_REMOTE]: "Remote",
    [ImportModalInput.CURSOR_TEXT]: "Text",
}

const DEFAULT_CURSOR = ImportModalInput.CURSOR_TEXT;

const DEFAULT_CURSORS = [
    ImportModalInput.CURSOR_LOCAL,
    ImportModalInput.CURSOR_REMOTE,
    ImportModalInput.CURSOR_TEXT
];

interface Payload<T> {
    items: T[]
    warning?: string
    file: File | null
    fileUri: string
    fileBlob: string
    fileType: string
}

export function ImportModal<T>({ modal, isOpen, onSubmit, onClose }: ImportModalProps<T>) {
    const { find, store } = useStoreStatus();
    const { push } = useAlert();

    const CUSORS = modal.cursors || DEFAULT_CURSORS;

    const [data, setData] = useState<Payload<T>>(
        cleanData(
            find(modal.cacheKey, {
                def: DEFAULT_CURSOR,
                range: CUSORS
            })));

    useEffect(() => {
        setData((prevData) =>
            cleanData(prevData.fileType));
    }, [isOpen]);

    const submit = async () => {
        if (!data.file) {
            push({
                category: EAlertCategory.WARN,
                content: "Please select a file first"
            });
            return;
        }

        await onSubmit({ items: data.items, file: data.file }).then(clear);
    }

    const close = () => {
        clear();
        onClose();
    }

    const clear = () => {
        setData((prevData) =>
            cleanData(prevData.fileType));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files == null) {
            return;
        }

        return loadBlob(files[0]);
    };

    const changeFileType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const value = e.target.value;
        if (!CUSORS.find(c => c == value)) {
            return;
        }

        store(modal.cacheKey, value);

        setData(cleanData(value));
    }

    const changeFileUri = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setData((prevData) => ({
            ...prevData,
            fileUri: e.target.value
        }));
    }

    const changeFileBlob = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setData((prevData) => ({
            ...prevData,
            fileBlob: e.target.value
        }));
    }

    const fetchUriFile = async () => {
        const file = await fetchFile(data.fileUri).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if (!file) {
            return;
        }

        return loadBlob(file);
    }

    const loadFileBlob = async () => {
        const file = new File([data.fileBlob], "text", { type: "blob" });
        return loadBlob(file);
    }

    const loadBlob = async (file: File) => {
        const { items, warning } = modal.parseBlob<T>(await file.text());
        if (warning && warning != "") {
            setData((prevData) => ({
                ...prevData,
                items: [],
                warning: warning,
                file: null
            }));

            return;
        }
        
        setData((prevData) => ({
            ...prevData,
            items: items,
            warning: undefined,
            file: file,
        }))
    }

    const buttons: ModalButton[] = [
        {
            title: "Submit",
            type: "submit",
            callback: {
                func: submit
            }
        },
        {
            title: "Close",
            callback: {
                func: close
            }
        }
    ];

    return (
        <Modal
            buttons={buttons}
            titleCustom={modal.title}
            style={{ ...modal.dimension }}
            isOpen={isOpen}
            onClose={close}>
            <div id="modal-selector-container">
                <div>
                    <h3 className="selector-title">Selector:</h3>
                    <div id="selector-container">
                        <div id="selector-type">
                            <div id="selector-input">
                                <label htmlFor="file-type">File: </label>
                                <select name="file-type" value={data.fileType} onChange={changeFileType}>
                                    {CUSORS.map(c => (
                                        <option key={c} value={c}>{ImportModalInputTag[c]}</option>
                                    ))}
                                </select>
                            </div>
                            <div id="selector-button">
                                {data.fileType == ImportModalInput.CURSOR_REMOTE && (
                                    <button type="button" onClick={fetchUriFile}>Load</button>
                                )}
                                {data.fileType == ImportModalInput.CURSOR_TEXT && (
                                    <button type="button" onClick={loadFileBlob}>Load</button>
                                )}
                            </div>
                        </div>
                        <div id="selector-file">
                            {data.fileType == ImportModalInput.CURSOR_LOCAL && (
                                <input type="file" onChange={handleFileChange} />
                            )}
                            {data.fileType == ImportModalInput.CURSOR_REMOTE && (
                                <input type="text" placeholder={modal.placeholder} value={data.fileUri} onChange={changeFileUri} />
                            )}
                            {data.fileType == ImportModalInput.CURSOR_TEXT && (
                                <textarea value={data.fileBlob} onChange={changeFileBlob}></textarea>
                            )}
                        </div>

                    </div>
                </div>
                {data.file && (
                    <div>
                        <h3 className="selector-title">Metadata <span title="Number of items">[{data.items.length}]</span>:</h3>
                        <div id="metadata-container">
                            <div className="metadata-fragment">
                                <p><span className="metadata-title">Name: </span> <span className="metadata-value">{data.file.name}</span></p>
                                <p><span className="metadata-title">Size: </span> <span className="metadata-value">{formatBytes(data.file.size)}</span></p>
                            </div>
                            <div className="metadata-fragment">
                                <p><span className="metadata-title">Type: </span> <span className="metadata-value">{data.file.type || "binary"}</span></p>
                                <p><span className="metadata-title">Modified: </span> <span className="metadata-value">{millisecondsToDate(data.file.lastModified)}</span></p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

const cleanData = <T,>(fileType: string): Payload<T> => {
    return {
        items: [],
        warning: undefined,
        file: null,
        fileUri: "",
        fileBlob: "",
        fileType: fileType
    }
}
