import { LiteRequest } from "../../../../../interfaces/client/request/Request";

export const storedGroupOptions = (actions: {
    exportAll: () => void;
    openImportModal: () => void;
    openCurlModal: () => void;
    fetch: () => void;

}) => {
    return [
        {
            icon: "💾",
            label: "Export",
            title: "Export all",
            action: actions.exportAll
        },
        {
            icon: "💽",
            label: "Import",
            title: "Import collections",
            action: actions.openImportModal
        },
        {
            icon: "⌨️",
            label: "Import",
            title: "Import cURL",
            action: actions.openCurlModal
        },
        {
            icon: "🔄",
            label: "Refresh",
            title: "Refresh",
            action: () => actions.fetch
        }
    ]
}

export const storedOptions = (request: LiteRequest, actions: {
    remove: (request: LiteRequest) => void;
    rename: (request: LiteRequest) => void;
    clone: (request: LiteRequest) => void;
    duplicate: (request: LiteRequest) => void;
    showCollect: (request: LiteRequest) => void;
    showMove: (request: LiteRequest) => void;
    export: (request: LiteRequest) => void;
    isCached: (request: LiteRequest) => boolean;
    discard: (request: LiteRequest) => void;
    showCurl: (request: LiteRequest, raw?: boolean) => void;
}) => {
    return [
        {
            icon: "🗑️",
            label: "Delete",
            title: "Delete request",
            action: () => actions.remove(request)
        },
        {
            icon: "✏️",
            label: "Rename",
            title: "Rename request",
            action: () => actions.rename(request)
        },
        {
            icon: "🐑",
            label: "Clone",
            title: "Clone request",
            action: () => actions.clone(request)
        },
        {
            icon: "🐏",
            label: "Duplicate",
            title: "Duplicate request",
            action: () => actions.duplicate(request)
        },
        {
            icon: "📚",
            label: "Collect",
            title: "Copy to collection",
            action: () => actions.showCollect(request)
        },
        {
            icon: "📦",
            label: "Move",
            title: "Move to collection",
            action: () => actions.showMove(request)
        },
        {
            icon: "💾",
            label: "Export",
            title: "Export request",
            action: () => actions.export(request)
        },
        {
            icon: "🧹",
            label: "Discard",
            title: "Discard changes",
            disable: !actions.isCached(request),
            action: () => actions.discard(request)
        },
        {
            icon: "⌨️",
            label: "Curl",
            title: "Show curl",
            action: () => actions.showCurl(request)
        },
        {
            icon: "⌨️",
            label: "Raw",
            title: "Show raw curl",
            action: () => actions.showCurl(request, true)
        },
    ];
}

export const searchOptions = (actions: {
    onFilterTargetChange: (value: string) => void;
}) => {
    return [
        {
            label: "Name",
            name: "name",
            title: "Filter by name",
            action: () => actions.onFilterTargetChange("name")
        },
        {
            label: "Date",
            name: "timestamp",
            title: "Filter by date",
            action: () => actions.onFilterTargetChange("timestamp")
        },
        {
            label: "Method",
            name: "method",
            title: "Filter by method",
            action: () => actions.onFilterTargetChange("method")
        },
        {
            label: "Uri",
            name: "uri",
            title: "Filter by Uri",
            action: () => actions.onFilterTargetChange("uri")
        },
    ]
}