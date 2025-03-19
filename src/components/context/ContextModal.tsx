import { useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { v4 as uuidv4 } from 'uuid';
import { StatusCategoryKeyValue as StrStatusCategoryKeyValue } from '../../interfaces/StatusCategoryKeyValue';
import { ItemStatusCategoryKeyValue, StatusCategoryKeyValue, toItem } from '../body/client/center-container/client-arguments/status-category-key-value/StatusCategoryKeyValue';
import { Context } from '../../interfaces/context/Context';
import { detachStatusCategoryKeyValue, mergeStatusCategoryKeyValue } from '../../services/Utils';
import { insertContext } from '../../services/api/ServiceStorage';

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

const STATUS_VALUES = [
    {
        key: "None",
        value: "none"
    },
    {
        key: "True",
        value: "true"
    },
    {
        key: "False",
        value: "false"
    }
];

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
    context: Context,
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
    context: Context,
    status: boolean;
    argument: ItemStatusCategoryKeyValue[];
}

export function ContextModal({ isOpen, context, onClose }: ContextModalProps) {
    const [data, setData] = useState<Payload>({
        template: getTemplate(),
        preview: getTemplate(),
        showPreview: getStatus(),
        filter: getFilter(),
        context: context,
        status: context.status,
        argument: toItem(detachStatusCategoryKeyValue(context.dictionary))
    });
    
    const onFilterStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange("status", e.target.value);
    };

    const onFilterCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onFilterChange("category", e.target.value);
    };

    const onFilterKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange("key", e.target.value);
    };

    const onFilterValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange("value", e.target.value);
    };

    const clearFilter = () => {
        setData({...data, filter: EMPTY_FILTER});
    }

    const filterContext = (item: ItemStatusCategoryKeyValue): boolean => {
        if(data.filter.status != "" && data.filter.status != `${item.status}`) {
            return false;
        }
        if(data.filter.category != "" && data.filter.category != item.category) {
            return false;
        }
        if(data.filter.key != "") {
            return matches(data.filter.key, item.key);
            
        }
        if(data.filter.value != "") {
            return matches(data.filter.value, item.value);
        }
        return true;
    }

    const matches = (pattern: string, value: string): boolean => {
        let regexPattern = pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, '\\$&');
        regexPattern = regexPattern.replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(value);
    }

    const onFilterChange = (key: string, value: string) => {
        const newFilter: Filter = {...data.filter, [key]: value};
        setData({...data, filter: newFilter});
        setFilter(newFilter);
    };

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

    const submitContext = async () => {
        const response = await insertContext("anonymous", makeContext());
        //TODO: Review
        //setData({...data, context: response, status: response.status, argument: toItem(detachStatusCategoryKeyValue(response.dictionary))})
    }

    const makeContext = (): Context => {
        return {
            _id: data.context._id,
            status: data.status,
            timestamp: data.context.timestamp,
            dictionary: mergeStatusCategoryKeyValue(data.argument),
            owner: "anonymous",
            modified: data.context.modified
        };
    }

    return (
        <Modal 
            buttons={[
                {
                    title: "Save",
                    callback: {
                        func: submitContext
                    }
                },
                {
                    title: "Close",
                    callback: {
                        func: onClose
                    }
                }
            ]}  
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
                <div id="dictionary-items">
                    <p id="dictionary-items-counter">
                        Showing: {data.argument.filter(filterContext).length} <span>/</span> {data.argument.length} items
                    </p>
                    <div id="filter-container">
                        <div className='filter-fragment'>
                            <label htmlFor="filter-status">Status:</label>
                            <select name="filter-status" onChange={onFilterStatusChange}>
                                {STATUS_VALUES.map(s => (
                                    <option value={s.value} selected={data.filter.status == s.value}>{s.key}</option>    
                                ))}
                            </select>
                        </div>
                        <div className='filter-fragment'>
                        <label htmlFor="filter-category">Category:</label>
                            <select name="category" onChange={onFilterCategoryChange}>
                                <option value="">None</option>
                                {ROW_DEFINITION.categories.map(c => (
                                    <option value={c.value} selected={data.filter.category == c.value}>{c.key}</option>
                                ))}
                            </select>
                        </div>
                        <div className='filter-fragment'>
                            <label htmlFor="filter-key">Key:</label>
                            <input type="input" name="filter-key" onChange={(onFilterKeyChange)} value={data.filter.key}/>
                        </div>
                        <div className='filter-fragment'>
                            <label htmlFor="filter-value">Value:</label>
                            <input type="input" name="filter-value" onChange={onFilterValueChange} value={data.filter.value}/>
                        </div>
                        <div className='filter-fragment'>
                            <button type="button" onClick={clearFilter}>Clean</button>
                        </div>
                    </div>
                </div>
                <div id="context-dictionary-content">
                    {data.argument.filter(filterContext).map((item, i) => (
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