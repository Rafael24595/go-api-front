import { ComboOption } from "../../../../../../interfaces/ComboOption"

export const responseConditionOptions = (actions: {
    importSteps: () => void,
    cleanSteps: () => void,
    exportSteps: () => void,
}): ComboOption[] => {
    return [
        {
            icon: "💾",
            label: "Import",
            name: "import",
            title: "Import steps",
            action: actions.importSteps
        },
        {
            icon: "💽",
            label: "Export",
            name: "export",
            title: "Export steps",
            action: actions.exportSteps
        },
        {
            icon: "🧹",
            label: "Clean",
            name: "clean",
            title: "Clean steps",
            action: actions.cleanSteps
        },
    ]
}
