import { CallBack } from "./Callback"

export type ModalButtonCallBack = CallBack | Function | undefined;

export interface ModalButton {
    title: string,
    type?: "button" | "submit"
    description?: string,
    callback?: ModalButtonCallBack,
    icon?: {
        icon: string,
        color?: string
    }
}
