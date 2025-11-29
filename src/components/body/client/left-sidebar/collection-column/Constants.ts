import { LiteItemCollection, LiteItemNodeRequest } from "../../../../../interfaces/client/collection/Collection"
import { LiteRequest } from "../../../../../interfaces/client/request/Request";
import { ComboForm } from "../../../../../interfaces/ComboOption";

export const collectionGroupOptions = (actions: {
    openOpenaApiModal: () => void;
    exportAll: () => void;
    openImportModal: () => void;
    fetchCollection: () => void;
}) => {
    return [
        {
            icon: "📃",
            label: "OpenApi",
            title: "Load an OpenApi definition",
            action: actions.openOpenaApiModal
        },
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
            action: () => actions.openImportModal()
        },
        {
            icon: "🔄",
            label: "Refresh",
            title: "Refresh",
            action: () => actions.fetchCollection()
        }
    ]
}

export const collectionOptions = (collection: LiteItemCollection, actions: {
    remove: (collection: LiteItemCollection) => void;
    rename: (collection: LiteItemCollection) => void;
    clone: (collection: LiteItemCollection) => void;
    newCollectionRequest: (collection: LiteItemCollection) => void;
    exportCollection: (collection: LiteItemCollection) => void;
    exportRequests: (collection: LiteItemCollection) => void;
    openImportRequestModal: (collection: LiteItemCollection) => void;
    discard: (collection: LiteItemCollection) => void;
    isParentCached: (id: string) => boolean;
    isContextCached: (id: string) => boolean;
    discardContext: (context?: string) => void;
    showCurlModal: (collection: LiteItemCollection) => void;
}) => {
    return [
        {
            icon: "🗑️",
            label: "Delete",
            title: "Delete collection",
            action: () => actions.remove(collection)
        },
        {
            icon: "✏️",
            label: "Rename",
            title: "Rename request",
            action: () => actions.rename(collection)
        },
        {
            icon: "🐏",
            label: "Duplicate",
            title: "Duplicate collection",
            action: () => actions.clone(collection)
        },
        {
            icon: "💡",
            label: "Request",
            title: "New request",
            action: () => actions.newCollectionRequest(collection)
        },
        {
            icon: "💾",
            label: "Export",
            title: "Export collection",
            action: () => actions.exportCollection(collection)
        },
        {
            icon: "📀",
            label: "Export",
            title: "Export requests",
            action: () => actions.exportRequests(collection)
        },
        {
            icon: "💽",
            label: "Import",
            title: "Import requests",
            action: () => actions.openImportRequestModal(collection)
        },
        {
            icon: "⌨️",
            label: "Import",
            title: "Import cURL",
            action: () => actions.showCurlModal(collection)
        },
        {
            icon: "🧹",
            label: "Request",
            title: "Discard requests changes",
            disable: !actions.isParentCached(collection._id),
            action: () => actions.discard(collection)
        },
        {
            icon: "🧹",
            label: "Context",
            title: "Discard context changes",
            disable: !actions.isParentCached(collection._id),
            action: () => actions.discardContext(collection.context)
        },
    ]
}

export const requestOptions = (collection: LiteItemCollection, node: LiteItemNodeRequest, actions: {
    removeFrom: (request: LiteRequest) => void;
    renameFromCollection: (request: LiteRequest) => void;
    cloneFromCollection: (request: LiteRequest) => void;
    showDuplicateModal: (collection: LiteItemCollection, request: LiteRequest) => void;
    showMoveModal: (collection: LiteItemCollection, request: LiteRequest) => void;
    takeFrom: (request: LiteRequest) => void;
    isCached: (request: LiteRequest) => boolean;
    discardRequest: (request: LiteRequest) => void;
    showCurl: (request: LiteRequest, asRaw?: boolean) => void;
}) => {
    return [
        {
            icon: "🗑️",
            label: "Delete",
            title: "Delete from collection",
            action: () => actions.removeFrom(node.request)
        },
        {
            icon: "✏️",
            label: "Rename",
            title: "Rename request",
            action: () => actions.renameFromCollection(node.request)
        },
        {
            icon: "🐑",
            label: "Clone",
            title: "Clone request",
            action: () => actions.cloneFromCollection(node.request)
        },
        {
            icon: "🐏",
            label: "Duplicate",
            title: "Duplicate to collection",
            action: () => actions.showDuplicateModal(collection, node.request)
        },
        {
            icon: "📦",
            label: "Move",
            title: "Move to collection",
            action: () => actions.showMoveModal(collection, node.request)
        },
        {
            icon: "🧷",
            label: "Take",
            title: "Take from collection",
            action: () => actions.takeFrom(node.request)
        },
        {
            icon: "🧹",
            label: "Discard",
            title: "Discard changes",
            disable: !actions.isCached(node.request),
            action: () => actions.discardRequest(node.request)
        },
        {
            icon: "⌨️",
            label: "Curl",
            title: "Show curl",
            action: () => actions.showCurl(node.request)
        },
        {
            icon: "⌨️",
            label: "Raw",
            title: "Show raw curl",
            action: () => actions.showCurl(node.request, true)
        }
    ]
}

export const searchOptions = (): ComboForm[] => {
    return [
        {
            label: "Name",
            name: "name",
            title: "Filter by name",
        },
        {
            label: "Date",
            name: "timestamp",
            title: "Filter by date",
        },
        {
            label: "Request Name",
            name: "req-name",
            title: "Filter by request name",
        },
        {
            label: "Request Date",
            name: "req-timestamp",
            title: "Filter by request date",
        },
        {
            label: "Method",
            name: "method",
            title: "Filter by method",
        },
        {
            label: "Uri",
            name: "uri",
            title: "Filter by Uri",
        },
    ]
}