import { ComboForm } from "../../../../../../interfaces/ComboOption";
import { LiteEndPoint } from "../../../../../../interfaces/mock/EndPoint";

export const endPointGroupOptions = (actions: {
    export: () => void;
    fetch: () => void;
}) => {
    return [
        {
            icon: "💾",
            label: "Export",
            title: "Export all end-point",
            action: () => actions.export()
        },
        {
            icon: "🔄",
            label: "Refresh",
            title: "Refresh",
            action: () => actions.fetch
        }
    ]
}

export const endPointOptions = (endPoint: LiteEndPoint, actions: {
    remove: (endPoint: LiteEndPoint) => void;
    rename: (endPoint: LiteEndPoint) => void;
    clone: (endPoint: LiteEndPoint) => void;
    duplicate: (endPoint: LiteEndPoint) => void;
    isCached: (endPoint: LiteEndPoint) => boolean;
    discard: (endPoint: LiteEndPoint) => void;
    export: (endPoint: LiteEndPoint) => void;
}) => {
    return [
        {
            icon: "🗑️",
            label: "Delete",
            title: "Delete end-point",
            action: () => actions.remove(endPoint)
        },
        {
            icon: "✏️",
            label: "Rename",
            title: "Rename the end-point",
            action: () => actions.rename(endPoint)
        },
        {
            icon: "🐑",
            label: "Clone",
            title: "Clone the end-point without release it",
            action: () => actions.clone(endPoint)
        },
        {
            icon: "🐏",
            label: "Duplicate",
            title: "Duplicate the end-point",
            action: () => actions.duplicate(endPoint)
        },
        {
            icon: "🧹",
            label: "Discard",
            title: "Discard changes",
            disable: !actions.isCached(endPoint),
            action: () => actions.discard(endPoint)
        },
        {
            icon: "💾",
            label: "Export",
            title: "Export end-point",
            action: () => actions.export(endPoint)
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
            label: "Method",
            name: "method",
            title: "Filter by method",
        },
        {
            label: "Path",
            name: "path",
            title: "Filter by path",
        },
        {
            label: "Safe",
            name: "safe",
            title: "Filter by safe status",
        },
    ]
}