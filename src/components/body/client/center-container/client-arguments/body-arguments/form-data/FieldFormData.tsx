import { useEffect, useRef, useState } from 'react';
import { CleanItemBodyParameter, ItemBodyParameter } from '../../../../../../../interfaces/request/Request';
import { useAlert } from '../../../../../../utils/alert/Alert';
import { EAlertCategory } from '../../../../../../../interfaces/AlertData';

import './FieldFormData.css';

const BINARY = "binary";
const FORMDATA = "formdata";

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const ROW_DEFINITION = {
    key: "Key", 
    value: "Value", 
    disabled: true 
}

interface FieldFormDataProps {
    order?: number
    focus?: string
    value?: ItemBodyParameter
    disabled?: boolean
    rowPush: (row: CleanItemBodyParameter, focus: string, order?: number) => void;
    rowTrim: (order: number) => void;
}

export function FieldFormData({order, focus, value, disabled, rowPush, rowTrim}: FieldFormDataProps) {
    const { push } = useAlert();

    const inputKey = useRef<HTMLInputElement>(null);
    const inputValue = useRef<HTMLInputElement>(null);

    const [row, setRow] = useState<CleanItemBodyParameter>({
        order: order || 0,
        status: value ? value.status : false,
        isFile: value ? value.isFile: false,
        fileType: value ? value.fileType: "",
        fileName: value ? value.fileName: "",
        key: value ? value.key : "",
        value: value ? value.value : "",
    });

    const handleChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(disabled) {
            return;
        }

        const newRow = {...row, status: e.target.checked }
        setRow(newRow)
        rowPush(newRow, e.target.name, order)
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(disabled) {
            const key = e.target.name == "key" ? e.target.value : "";
            const value = e.target.name == "value" ? e.target.value : "";
            rowPush({ 
                order: 0, 
                status: true, 
                isFile: false, 
                fileType: "",
                fileName: "",
                key: key, 
                value: value 
            },  e.target.name, order)    
            return;
        }

        const newRow = {
            ...row, 
            [e.target.name]: e.target.value 
        };

        setRow(newRow)
        rowPush(newRow, e.target.name, order)
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        try {
            const { name, mimeType, content } = await extractFileInfo(file);
            if(disabled) {
                rowPush({ 
                    order: 0, 
                    status: true, 
                    isFile: true, 
                    fileType: mimeType,
                    fileName: name,
                    key: "", 
                    value: content 
                },  e.target.name, order)    
                return;
            }
    
            const newRow = {
                ...row, 
                isFile: true, 
                fileType: mimeType,
                fileName: name,
                value: content 
            };
    
            setRow(newRow)
            rowPush(newRow, e.target.name, order)
        } catch (err) {
            console.error("Error reading file:", err);
        }
    };

    const extractFileInfo = (file: File): Promise<{ name: string; mimeType: string, content: string }> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
      
          reader.onload = () => {
            if(file.size > MAX_SIZE_BYTES) {
                push({
                    category: EAlertCategory.WARN,
                    content: "The file exceeds the limit allowed"
                });

                resolve({
                    name: "",
                    mimeType: "",
                    content: "",
                });
                return;
            }

            const result = reader.result as string;
            const base64 = result.split(',')[1];
            
            resolve({
              name: file.name,
              mimeType: file.type,
              content: base64,
            });
          };
      
          reader.onerror = () => {
            reject(new Error("Failed to read file"));
          };
      
          reader.readAsDataURL(file);
        });
    }

    const previewFile = (row: CleanItemBodyParameter) => {
        const byteChars = atob(row.value);
        const byteArrays = [];
      
        for (let offset = 0; offset < byteChars.length; offset += 512) {
          const slice = byteChars.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length).fill(0).map((_, i) => slice.charCodeAt(i));
          byteArrays.push(new Uint8Array(byteNumbers));
        }
      
        const blob = new Blob(byteArrays, { type: row.fileType });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank", windowPreferences(500, 500));
    }

    const windowPreferences = (width: number, height: number) => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const left = (screenWidth / 2) - (width / 2);
        const top = (screenHeight / 2) - (height / 2);
    
        return `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`;
    }

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const isFile = e.target.value == BINARY;
        if(disabled) {
            rowPush({ 
                order: 0, 
                status: true, 
                isFile: isFile, 
                fileType: "",
                fileName: "",
                key: "", 
                value: "" 
            }, "key", order)    
            return;
        }

        const newRow = {
            ...row, 
            isFile: isFile, 
            fileType: "",
            fileName: "",
            value: "" 
        };

        setRow(newRow)
        rowPush(newRow, e.target.name, order)
    };

    const handleDelete = () => {
        if(order != undefined) {
            rowTrim(order)
        }
    };

    const hasFile = (row: CleanItemBodyParameter) => {
        return row.isFile && row.value != "";
    }

    const fileStatusMessage = (row: CleanItemBodyParameter) => {
        if(!hasFile(row)) {
            return "No file selected";
        }

        if(row.fileName == "") {
            return "Unnamed file";
        }

        return row.fileName;
    }

    useEffect(() => {
        if(focus == "key") {
            inputKey.current?.focus()
            return;
        }
        if(focus == "value") {
            inputValue.current?.focus()
            return;
        }
    }, []);

    return (
        <>
            <div className="parameter-container">{}
                <input name="status" type="checkbox" onChange={handleChecked} disabled={disabled} checked={row.status}/>
                <select className="parameter-input secondary" name="is-file" onChange={handleCategoryChange}>
                    <option value={BINARY} selected={row.isFile}>Binary</option>
                    <option value={FORMDATA} selected={!row.isFile}>Data</option>
                </select>
                <input className="parameter-input" ref={inputKey} name="key" type="text" onChange={handleChange} placeholder={ROW_DEFINITION.key} value={row.key}/>
                {row.isFile ? (
                    <>
                        <div className="custom-input-file parameter-input">
                            {hasFile(row) && (
                                <button className="input-file-preview" type="button" title="Preview document" onClick={() => previewFile(row)}>📑</button>
                            )}
                            <button type="button" title="Select file">
                                <label className="file-label">
                                    <div>📁</div>
                                    <input className="parameter-input" name="binary" type="file" onChange={handleFileChange}/>
                                </label>
                            </button>
                            <span id="fileName" className="file-name" title={fileStatusMessage(row)} >{fileStatusMessage(row)}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <input className="parameter-input" ref={inputValue} name="value" type="text" onChange={handleChange} placeholder={ROW_DEFINITION.value} value={row.value}/>
                    </>                    
                )}
                <button type="button" className={`remove-button ${!disabled ? "show" : ''}`} onClick={handleDelete} disabled={disabled}></button>
            </div>
        </>
    )
}