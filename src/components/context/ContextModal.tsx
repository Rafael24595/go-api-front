import { useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { v4 as uuidv4 } from 'uuid';
import { StatusCategoryKeyValue as StrStatusCategoryKeyValue } from '../../interfaces/StatusCategoryKeyValue';
import { ItemStatusCategoryKeyValue, StatusCategoryKeyValue, toItem } from '../body/client/center-container/client-arguments/status-category-key-value/StatusCategoryKeyValue';

import './ContextModal.css'

const STATUS_KEY = "ContextModalPreviewStatus";
const CONTENT_KEY = "ContextModalPreviewContent";
const FILTER_KEY = "ContextModalFilterContent";

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

const EMPTY_FILTER: Filter = {
    category: "",
    key: "",
    status: "",
    value: ""
};

interface ContextModalProps {
    isOpen: boolean,
    onClose: () => void,
}

interface Filter {
    status: string
    category: string
    key: string
    value: string
}

interface Payload {
    template: string;
    preview: string;
    showPreview: boolean;
    filter: Filter;
    status: boolean;
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

    const getFilter = () => {
        try {
            const stored = localStorage.getItem(FILTER_KEY);
            if(stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.log(error);
        }
        return EMPTY_FILTER;
    }

    const setFilter = (filter: Filter) => {
        localStorage.setItem(FILTER_KEY, JSON.stringify(filter));
    }

    const [data, setData] = useState<Payload>({
        template: getTemplate(),
        preview: getTemplate(),
        showPreview: getStatus(),
        filter: getFilter(),
        status: true,
        argument: toItem([])
    });

    const onStatusChange = (e: React.ChangeEvent<HTMLInputElement>)  => {
        setData({...data, status: e.target.checked});
    }

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
                    <input type="checkbox" onChange={onStatusChange} checked={data.status}/>
                    <p className="title">Dictionary:</p>
                </div>
                <div id="filter-container">
                    <div className='filter-fragment'>
                        <label htmlFor="filter-status">Status:</label>
                        <input type="checkbox" name="filter-status"/>
                    </div>
                    <div className='filter-fragment'>
                    <label htmlFor="filter-category">Category:</label>
                        <select name="category">
                            {ROW_DEFINITION.categories.map(c => (
                                <option value={c.value}>{c.key}</option>
                            ))}
                        </select>
                    </div>
                    <div className='filter-fragment'>
                        <label htmlFor="filter-key">Key:</label>
                        <input type="input" name="filter-key"/>
                    </div>
                    <div className='filter-fragment'>
                        <label htmlFor="filter-value">Value:</label>
                        <input type="input" name="filter-value"/>
                    </div>
                    <div className='filter-fragment'>
                        <button type="button">Clean</button>
                    </div>
                </div>
                <div id="context-dictionary-content">
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
                        key={uuidv4()}
                        definition={ ROW_DEFINITION }
                        rowPush={rowPush}
                        rowTrim={rowTrim}
                    />
                </div>
        </Modal>
    )
}