export interface CallBack {
    func: Function,
    args?: any[]
}

export const executeCallback = (callBack: CallBack | Function) => {
    if(typeof callBack == "function") {
        return callBack();
    }
    return callBack.func(callBack.args);
}

export const VoidCallback: CallBack = {
    func: () => {}
}