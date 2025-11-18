import { ComboOption } from "../../../../../interfaces/ComboOption";
import { DEFAULT_RESPONSE, ItemResponse } from "../../../../../interfaces/mock/Response";

export const responseOptions = (response: ItemResponse, actions: {
    delete: (response: ItemResponse) => void;
    rename: (response: ItemResponse) => void;
}): ComboOption[] => {
    return [
        {
            icon: "🗑️",
            label: "Delete",
            title: "Delete response",
            action: () => actions.delete(response),
            disable: response.name == DEFAULT_RESPONSE
        },
        {
            icon: "✏️",
            label: "Rename",
            title: "Rename response",
            action: () => actions.rename(response),
            disable: response.name == DEFAULT_RESPONSE
        }
    ]
}

export const statusOptions = (actions: {
    discard: () => void;
    release: () => void;
}): ComboOption[] => {
    return [
        {
            icon: "🧹",
            label: "Discard",
            title: "Discard end-point",
            action: actions.discard
        },
        {
            icon: "💾",
            label: "Save",
            title: "Save end-point",
            action: actions.release
        },
    ]
}
