import { useEffect, useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { v4 as uuidv4 } from 'uuid';
import { fixOrder, ItemStatusCategoryKeyValue, StatusCategoryKeyValue as StrStatusCategoryKeyValue } from '../../interfaces/StatusCategoryKeyValue';
import { StatusCategoryKeyValue } from '../body/client/center-container/client-arguments/status-category-key-value/StatusCategoryKeyValue';
import { Context, ItemContext, toContext } from '../../interfaces/context/Context';
import { importContext, insertContext } from '../../services/api/ServiceStorage';
import { useStoreContext } from '../../store/StoreProviderContext';
import { downloadFile } from '../../services/Utils';
import { ImportContext } from './ImportContext';
import { EAlertCategory } from '../../interfaces/AlertData';
import { useAlert } from '../utils/alert/Alert';
import { useStoreStatus } from '../../store/StoreProviderStatus';

import './ContextModal.css';

const PREVIEW_CATEGORY_KEY = "ContextModalPreviewPreviewCategory";
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
-H "\${header.header-key}: \${header.header-value}"`;

const translateDomain = (domain: string) => {
    switch (domain) {
        case "collection":
            return "Collection";
        case "user":
        default:
            return "Client"
    }
}

const EMPTY_FILTER: Filter = {
    status: "none",
    category: "none",
    key: "",
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
    categoryPreview: string;
    template: string;
    preview: string;
    showPreview: boolean;
    showImport: boolean;
    filter: Filter;
    status: boolean;
    argument: ItemStatusCategoryKeyValue[];
}

export function ContextModal({ isOpen, onClose }: ContextModalProps) {
    const { find, findOrDefault, store } = useStoreStatus();

    const { initialHash, actualHash, context, getContext, defineContext, updateContext, fetchContext } = useStoreContext();

    const { push } = useAlert();

    const [data, setData] = useState<Payload>({
        categoryPreview: find(PREVIEW_CATEGORY_KEY, {
            def: "global"
        }),
        template: find(CONTENT_KEY, {
            def: TEMPLATE
        }),
        preview: find(CONTENT_KEY, {
            def: TEMPLATE
        }),
        showPreview: findOrDefault(STATUS_KEY, {
            def: true,
            parser: (v) => v == "true"
        }),
        showImport: false,
        filter: findOrDefault(FILTER_KEY, {
            def: EMPTY_FILTER,
            parser: (v) => JSON.parse(v)
        }),
        status: context.status,
        argument: context.dictionary
    });

    useEffect(() => {
        setData(prevData => ({
            ...prevData,
            status: context.status,
            argument: context.dictionary
        }));
        updatePreview(context.status, data.template, data.categoryPreview, context.dictionary);
    }, [context]);

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
        store(FILTER_KEY, JSON.stringify(EMPTY_FILTER));
    }

    const filterContext = (item: ItemStatusCategoryKeyValue): boolean => {
        if(data.filter.status != "none" && data.filter.status != `${item.status}`) {
            return false;
        }
        if(data.filter.category != "none" && data.filter.category != item.category) {
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
        store(FILTER_KEY, JSON.stringify(newFilter));
    };

    const onStatusChange = (e: React.ChangeEvent<HTMLInputElement>)  => {
        updateContext(makeContext(e.target.checked, data.argument));
        updatePreview(e.target.checked, data.template, data.categoryPreview, data.argument);
    }

    const rowTrim = (order: number) => {
        if(order < 0 || data.argument.length < order ) {
            return;
        }

        let newArgument = copyRows();
        newArgument.splice(order, 1);

        newArgument = fixOrder(newArgument);

        updatePreview(data.status, data.template, data.categoryPreview, newArgument);
        updateContext(makeContext(data.status, newArgument));
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

        newArgument = fixOrder(newArgument);

        updatePreview(data.status, data.template, data.categoryPreview, newArgument);
        updateContext(makeContext(data.status, newArgument));
    }

    const copyRows = (): ItemStatusCategoryKeyValue[] => {
        return [...data.argument].map(r => ({...r, focus: ""}));
    }

    const switchPreview = () => {
        setData({...data, showPreview: !data.showPreview});
        store(STATUS_KEY, !data.showPreview);
    }

    const switchImport = () => {
        setData((prevData) => ({
            ...prevData,
            showImport: !prevData.showImport  
        }));
    }

    const onPreviewCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        store(PREVIEW_CATEGORY_KEY, e.target.value);
        updatePreview(data.status, data.template, e.target.value, data.argument);
    }

    const previewClean = () => {
        updatePreview(data.status, "", "global", data.argument);
    }

    const updateTemplate = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updatePreview(data.status, e.target.value, data.categoryPreview, data.argument);
    }

    const updatePreview = (status: boolean, template: string, category: string, argument: ItemStatusCategoryKeyValue[]) => {
        store(CONTENT_KEY, template);

        const newData = { 
            status, 
            template, 
            categoryPreview: category, 
            argument: argument, 
            preview: template,
        };

        if(!status || template == "") {
            setData(prevData => ({
                ...prevData,
                ...newData
            }));
            return;
        }
        
        let newPreview = template;
        for (const arg of argument) {
            if(!arg.status) {
                continue;
            }
            if(arg.category == category) {
                const pattern = new RegExp(`\\$\\{(?:${arg.category}\\.)?${arg.key}\\}`, "g");
                newPreview = newPreview.replace(pattern, arg.value);
            } else {
                newPreview = newPreview.replace(`\${${arg.category}.${arg.key}}`, arg.value);
            }
        }

        newData.preview = newPreview;

        setData(prevData => ({
            ...prevData,
            ...newData
        }));
    }

    const submitContext = async () => {
        const newContext = getContext();
        const response = await insertContext(newContext);
        context._id = response._id;
        defineContext(context);
    }

    const makeContext = (status: boolean, argument: ItemStatusCategoryKeyValue[]): ItemContext => {
        return {...context, 
            status: status,
            dictionary: argument,
        };
    }

    function exportContext(): void {
        const name = `context_${context.owner}_${Date.now()}.json`;
        downloadFile(name, toContext(context));
    }

    const submitImportContext = async (source: Context) => {
        const target = getContext();
        const result = await importContext(target, source).catch(e =>
            push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
        if(!result) {
            return;
        }
        
        setData((prevData) => ({
            ...prevData,
            showImport: false  
        }));

        await fetchContext(result._id);
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
            title={
                <span id="context-title-container">
                    <span>{translateDomain(context.domain)} Context</span>
                    <span className={`button-modified-status ${ initialHash != actualHash && "visible" }`}></span>
                </span>
            }
            width="70%"
            height="80%"
            isOpen={isOpen} 
            onClose={onClose}>
                <div id="preview-title" className="border-bottom">
                    <p className="title">Preview:</p>
                    <div id="preview-buttons">
                        <button type="button" className="button-tag" onClick={switchPreview}>{ data.showPreview ? "Hide" : "Show" }</button>
                        <button type="button" className="button-tag" onClick={previewClean}>Clean</button>
                    </div>
                </div>
                {data.showPreview ? (
                    <div id="preview-container">
                        <div id="preview-params">
                            <div className="preview-select-param">
                                <label htmlFor="test-category">Category:</label>
                                <select name="test-category" onChange={onPreviewCategoryChange}>
                                    {ROW_DEFINITION.categories.map(c => (
                                        <option key={c.value} value={c.value} selected={data.filter.category == c.value}>{c.key}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div id="preview-areas">
                            <pre className="preview-component">{ data.preview }</pre>
                            <textarea className="preview-component" onChange={updateTemplate} value={data.template}/>
                        </div>
                    </div>
                ) : (
                    <br />
                )}
                <div id="dictionary-title" className="border-bottom">
                    <div id="dictionary-status">
                        <input type="checkbox" onChange={onStatusChange} checked={data.status}/>
                        <p className="title">Dictionary:</p>
                    </div>
                    <div>
                        <button type="button" className="button-tag" onClick={switchImport}><span>{ data.showImport ? "Variables" : "Import" }</span></button>
                        <button type="button" className="button-tag" onClick={exportContext}>Export</button>
                    </div>
                </div>

                {data.showImport ? (
                    <div id="import-container">
                        <ImportContext
                            onSubmit={submitImportContext}/>
                    </div>
                ) : (
                    <>
                        <div id="dictionary-items">
                            <p id="dictionary-items-counter">
                                Showing: {data.argument.filter(filterContext).length} <span>/</span> {data.argument.length} items
                            </p>
                            <div id="filter-container">
                                <div className='filter-fragment'>
                                    <label htmlFor="filter-status">Status:</label>
                                    <select name="filter-status" onChange={onFilterStatusChange}>
                                        {STATUS_VALUES.map(s => (
                                            <option key={s.value} value={s.value} selected={data.filter.status == s.value}>{s.key}</option>    
                                        ))}
                                    </select>
                                </div>
                                <div className='filter-fragment'>
                                <label htmlFor="filter-category">Category:</label>
                                    <select name="category" onChange={onFilterCategoryChange}>
                                        <option value="none">None</option>
                                        {ROW_DEFINITION.categories.map(c => (
                                            <option key={c.value} value={c.value} selected={data.filter.category == c.value}>{c.key}</option>
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
                                        order: item.order,
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
                    </>
                )}
        </Modal>
    )
}
