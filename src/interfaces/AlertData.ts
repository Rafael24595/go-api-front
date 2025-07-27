import { ModalButton } from "./ModalButton";

export interface AlertDataAsk {
    title?: string,
    content: string,
    buttons: ModalButton[],
}

export interface AlertData {
    title?: string,
    content: string,
    category: EAlertCategory,
    buttons?: ModalButton[],
    time?: number
}

export enum EAlertCategory {
    INFO,
    WARN,
    ERRO,
    QUES
}