import { useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { v4 as uuidv4 } from 'uuid';
import { StatusKeyValue as StrStatusKeyValue } from '../../interfaces/StatusKeyValue';
import { ItemStatusKeyValue, StatusKeyValue, toItem } from '../body/client/center-container/client-arguments/status-key-value/StatusKeyValue';

import './ContextModal.css'

const STATUS_KEY = "ContextModalPreviewStatus";
const CONTENT_KEY = "ContextModalPreviewContent";

const ROW_DEFINITION = { 
    key: "Key", 
    value: "Value", 
    disabled: true 
}

const TEMPLATE = `curl -X GET https://github.com/\${username}/\${repository} \\
-H "\${header-key}: \${header-value}"`

interface ContextModalProps {
    isOpen: boolean,
    onClose: () => void,
}

interface Payload {
    template: string;
    preview: string;
    showPreview: boolean;
    argument: ItemStatusKeyValue[];
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

    const rowPush = (row: StrStatusKeyValue, focus: string, order?: number) => {
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

    const copyRows = (): ItemStatusKeyValue[] => {
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

    const updatePreview = (template: string, args: ItemStatusKeyValue[]) => {
        setTemplate(template);
        if(template == "") {
            return;
        }
        
        let newPreview = template;
        for (const arg of args) {
            if(!arg.status) {
                continue;
            }
            newPreview = newPreview.replace(`\${${arg.key}}`, arg.value);
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
                        <StatusKeyValue
                            key={`query-param-${item.id}`}
                            order={i}
                            focus={item.focus}
                            value={{
                                status: item.status,
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
                    <StatusKeyValue 
                        definition={ ROW_DEFINITION }
                        rowPush={rowPush}
                        rowTrim={rowTrim}
                    />
                </div>
        </Modal>
    )
}