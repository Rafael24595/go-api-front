import { LiteRequest } from "../../../../../interfaces/request/Request";

export const storedGroupOptions = (actions: {
    exportAll: () => void;
    openImportModal: () => void;
    openCurlModal: () => void;
    fetchStored: () => void;

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
            action: () => actions.fetchStored
        }
    ]
}

export const storedOptions = (request: LiteRequest, actions: {
    deleteStored: (request: LiteRequest) => void;
    renameStored: (request: LiteRequest) => void;
    cloneStored: (request: LiteRequest) => void;
    duplicateStored: (request: LiteRequest) => void;
    openCollectModal: (request: LiteRequest) => void;
    openMoveModal: (request: LiteRequest) => void;
    exportRequest: (request: LiteRequest) => void;
    isCached: (request: LiteRequest) => boolean;
    discardRequest: (request: LiteRequest) => void;
    showCurl: (request: LiteRequest, raw?: boolean) => void;
}) => {
    return [
        {
            icon: "🗑️",
            label: "Delete",
            title: "Delete request",
            action: () => actions.deleteStored(request)
        },
        {
            icon: "✏️",
            label: "Rename",
            title: "Rename request",
            action: () => actions.renameStored(request)
        },
        {
            icon: "🐑",
            label: "Clone",
            title: "Clone request",
            action: () => actions.cloneStored(request)
        },
        {
            icon: "🐏",
            label: "Duplicate",
            title: "Duplicate request",
            action: () => actions.duplicateStored(request)
        },
        {
            icon: "📚",
            label: "Collect",
            title: "Copy to collection",
            action: () => actions.openCollectModal(request)
        },
        {
            icon: "📦",
            label: "Move",
            title: "Move to collection",
            action: () => actions.openMoveModal(request)
        },
        {
            icon: "💾",
            label: "Export",
            title: "Export request",
            action: () => actions.exportRequest(request)
        },
        {
            icon: "🧹",
            label: "Discard",
            title: "Discard changes",
            disable: !actions.isCached(request),
            action: () => actions.discardRequest(request)
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