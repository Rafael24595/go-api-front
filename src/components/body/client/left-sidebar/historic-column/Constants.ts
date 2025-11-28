import { LiteRequest } from "../../../../../interfaces/client/request/Request";

export const historicOptions = (request: LiteRequest, actions: {
    insert: (request: LiteRequest) => void;
    remove: (request: LiteRequest) => void;
    clone: (request: LiteRequest) => void;
    collect: (request: LiteRequest) => void;
    curl: (request: LiteRequest, applyContext?: boolean) => void;
}) => {
    return [
        {
            icon: "💾",
            label: "Save",
            title: "Save request",
            action: () => actions.insert(request)
        },
        {
            icon: "🗑️",
            label: "Delete",
            title: "Delete request",
            action: () => actions.remove(request)
        },
        {
            icon: "🐑",
            label: "Clone",
            title: "Clone request",
            action: () => actions.clone(request)
        },
        {
            icon: "📚",
            label: "Collect",
            title: "Copy to collection",
            action: () => actions.collect(request)
        },
        {
            icon: "⌨️",
            label: "Curl",
            title: "Show curl",
            action: () => actions.curl(request)
        },
        {
            icon: "⌨️",
            label: "Raw",
            title: "Show raw curl",
            action: () => actions.curl(request, true)
        },
    ]
}