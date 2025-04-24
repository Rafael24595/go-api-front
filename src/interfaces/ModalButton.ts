import { Callback } from "./Callback"

export interface ModalButton {
    title: string,
    type?: "button" | "submit"
    callback: Callback,
    icon?: {
        icon: string,
        color?: string
    }
}