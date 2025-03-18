import { Callback } from "./Callback"

export interface ModalButton {
    title: string,
    callback: Callback,
    icon?: {
        icon: string,
        color?: string
    }
}