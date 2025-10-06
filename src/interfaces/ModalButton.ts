import { Callback } from "./Callback"

export interface ModalButton {
    title: string,
    type?: "button" | "submit"
    description?: string,
    callback: Callback,
    icon?: {
        icon: string,
        color?: string
    }
}
