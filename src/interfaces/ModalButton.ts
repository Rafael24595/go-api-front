import { CallBack } from "./Callback"

export interface ModalButton {
    title: string,
    type?: "button" | "submit"
    description?: string,
    callback: CallBack | Function,
    icon?: {
        icon: string,
        color?: string
    }
}
