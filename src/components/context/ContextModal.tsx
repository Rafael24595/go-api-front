import { useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { v4 as uuidv4 } from 'uuid';
import { StatusCategoryKeyValue as StrStatusCategoryKeyValue } from '../../interfaces/StatusCategoryKeyValue';
import { ItemStatusCategoryKeyValue, StatusCategoryKeyValue, toItem } from '../body/client/center-container/client-arguments/status-category-key-value/StatusCategoryKeyValue';

import './ContextModal.css'

const STATUS_KEY = "ContextModalPreviewStatus";
const CONTENT_KEY = "ContextModalPreviewContent";

const ROW_DEFINITION = {
    categories: [
        {
            key: "Global",
            value: "global"
        },
        {
            key: "URI",
            value: "uri"
        },
        {
            key: "Query",
            value: "query"
        },
        {
            key: "Header",
            value: "header"
        },
        {
            key: "Auth",
            value: "auth"
        },
        {
            key: "Payload",
            value: "payload"
        }

    ],
    key: "Key", 
    value: "Value", 
    disabled: true 
}

const TEMPLATE = `curl -X GET https://github.com/\${username}/\${uri.repository}/tree/\${global.branch} \\
-H "\${header.header-key}: \${header.header-value}"`

interface ContextModalProps {
    isOpen: boolean,
    onClose: () => void,
}

interface Payload {
    template: string;
    preview: string;
    showPreview: boolean;
    argument: ItemStatusCategoryKeyValue[];
}

export function ContextModal({ isOpen, onClose }: ContextModalProps) {
    const getStatus = () => {
        return localStorage.getItem(STATUS_KEY) == "true";
    }

    const setStatus = (status: boolean) => {
        localStorage.setItem(STATUS_KEY, `${status}`);
    }

    const getTemplate = () => {
        return localStorage.getItem(CONTENT_KEY) || TEMPLATE;
    }

    const setTemplate = (template: string) => {
        localStorage.setItem(CONTENT_KEY, template);
    }

    const [data, setData] = useState<Payload>({
        template: getTemplate(),
        preview: getTemplate(),
        showPreview: getStatus(),
        argument: toItem([])
    });

    const rowTrim = (order: number) => {
        if(order < 0 || data.argument.length < order ) {
            return;
        }

        let newArgument = copyRows();
        newArgument.splice(order, 1);

        updatePreview(data.template, newArgument);
    }

    const rowPush = (row: StrStatusCategoryKeyValue, focus: string, order?: number) => {
        let newArgument = copyRows();
        if(order != undefined && 0 <= order && data.argument.length >= order) {
            newArgument[order] = {
                ...row, 
                id: newArgument[order].id, 
                focus: ""};
        } else {
            newArgument.push({
                ...row, 
                id: uuidv4(), 
                focus: focus});
        }

        updatePreview(data.template, newArgument);
    }

    const copyRows = (): ItemStatusCategoryKeyValue[] => {
        return [...data.argument].map(r => ({...r, focus: ""}));
    }

    const switchPreview = () => {
        setData({...data, showPreview: !data.showPreview});
        setStatus(!data.showPreview);
    }

    const previewClean = () => {
        updatePreview("", data.argument);
    }

    const updateTemplate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updatePreview(e.target.value, data.argument);
    }

    const updatePreview = (template: string, args: ItemStatusCategoryKeyValue[]) => {
        setTemplate(template);
        if(template == "") {
            return;
        }
        
        let newPreview = template;
        for (const arg of args) {
            if(!arg.status) {
                continue;
            }
            if(arg.category == "global") {
                const pattern = new RegExp(`\\$\\{(?:${arg.category}\\.)?${arg.key}\\}`, "g");
                newPreview = newPreview.replace(pattern, arg.value);
            } else {
                newPreview = newPreview.replace(`\${${arg.category}.${arg.key}}`, arg.value);
            }
        }
        setData({...data, template: template, argument: args, preview: newPreview});
    }

    return (
        <Modal 
            title="Client Context"
            width="70%"
            height="80%"
            isOpen={isOpen} 
            onClose={onClose}>
                <div id="preview-title" className="border-bottom">
                    <p className="title">Preview:</p>
                    <div id="preview-buttons">
                        <button type="button" onClick={previewClean}>Clean</button>
                        <button type="button" onClick={switchPreview}>{ data.showPreview ? "Hide" : "Show" }</button>
                    </div>
                </div>
                {data.showPreview && (
                    <div id="preview-container">
                        <pre className="preview-component">{ data.preview }</pre>
                        <textarea className="preview-component" onChange={updateTemplate} value={data.template}/>
                    </div>
                )}
                <div id="dictionary-title" className="border-bottom">
                    <p className="title">Dictionary:</p>
                </div>
                <div id="client-argument-content">
                    {data.argument.map((item, i) => (
                        <StatusCategoryKeyValue
                            key={`context-param-${item.id}`}
                            order={i}
                            focus={item.focus}
                            value={{
                                status: item.status,
                                category: item.category,
                                key: item.key,
                                value: item.value
                            }}
                            definition={{ 
                                ...ROW_DEFINITION, 
                                disabled: false}}
                            rowPush={rowPush}
                            rowTrim={rowTrim}
                        />
                    ))}
                    <StatusCategoryKeyValue 
                        definition={ ROW_DEFINITION }
                        rowPush={rowPush}
                        rowTrim={rowTrim}
                    />
                </div>
        </Modal>
    )
}