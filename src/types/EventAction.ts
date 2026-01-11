export enum Events {
    INITIAL = "initial",
    DEFINE = "define",
    UPDATE = "update",
    RELEASE = "release",
    DISCARD = "discard"
}

export interface EventAction {
    reason: string;
    target?: string;
    source?: string;
}

export const InitialEvent: EventAction = {
    reason: Events.INITIAL
}