export interface Callback {
    func: Function,
    args?: any[]
}

export const VoidCallback: Callback = {
    func: () => {}
}