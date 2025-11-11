import { LiteRequest } from "../../../../../interfaces/client/request/Request";

export const historicOptions = (request: LiteRequest, actions: {
    insertHistoric: (request: LiteRequest) => void;
    deleteHistoric: (request: LiteRequest) => void;
    cloneHistoric: (request: LiteRequest) => void;
    openModal: (request: LiteRequest) => void;
    showCurl: (request: LiteRequest, applyContext?: boolean) => void;
}) => {
    return [
        {
            icon: "💾",
            label: "Save",
            title: "Save request",
            action: () => actions.insertHistoric(request)
        },
        {
            icon: "🗑️",
            label: "Delete",
            title: "Delete request",
            action: () => actions.deleteHistoric(request)
        },
        {
            icon: "🐑",
            label: "Clone",
            title: "Clone request",
            action: () => actions.cloneHistoric(request)
        },
        {
            icon: "📚",
            label: "Collect",
            title: "Copy to collection",
            action: () => actions.openModal(request)
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
    ]
}