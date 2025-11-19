import { StepInput, StepOperator, StepType, Inputs, Operators, Formats, StepFormat } from "./Constants"

export interface ConditionStep {
    order: number
    type: string
    value: string
}

export const newConditionStep = (order?: number, prev?: ConditionStep): ConditionStep => {
    if (prev == undefined) {
        return {
            order: order || 0,
            type: StepType.INPUT,
            value: defaultValue(StepType.INPUT)
        }
    }

    if (prev.type == StepType.INPUT && prev.value == StepInput.PAYLOAD) {
        return {
            order: order || 0,
            type: StepType.FORMAT,
            value: defaultValue(StepType.FORMAT)
        }
    }

    if (prev.type == StepType.FIELD) {
        return {
            order: order || 0,
            type: StepType.OPERATOR,
            value: StepOperator.EQ
        }
    }

    if (isCompareOperator(prev)) {
        return {
            order: order || 0,
            type: StepType.VALUE,
            value: defaultValue(StepType.VALUE)
        }
    }

    if (prev.type == StepType.VALUE) {
        return {
            order: order || 0,
            type: StepType.OPERATOR,
            value: StepOperator.AND
        }
    }

    if (isLogicalOperator(prev)) {
        return {
            order: order || 0,
            type: StepType.INPUT,
            value: defaultValue(StepType.INPUT)
        }
    }

    return {
        order: order || 0,
        type: StepType.ARRAY,
        value: defaultValue(StepType.ARRAY)
    }
}

export const evalueSteps = (fragments: ConditionStep[]): Map<number, string[]> => {
    const messages = new Map<number, string[]>();

    let prev = undefined
    for (const fragment of fragments) {
        const stepMessages = [];
        const resultTyp = evalueTypeValue(fragment);
        if (resultTyp.message != undefined) {
            stepMessages.push(resultTyp.message);
        }

        const resultPos = evaluePosition(fragment, prev)
        if (resultPos != undefined) {
            stepMessages.push(resultPos);
        }

        if (stepMessages.length > 0) {
            const list = messages.get(fragment.order) ?? [];
            const newList = list.concat(stepMessages);
            messages.set(fragment.order, newList);
        }

        prev = fragment;
    }

    return messages;
}

export const evalueTypeValue = (target: ConditionStep) => {
    switch (target.type) {
        case StepType.INPUT:
            if (!Inputs.map(o => o.key).includes(target.value)) {
                return { value: defaultValue(StepType.INPUT), message: `Invalid input type ${target.value} on position ${target.order}` }
            }
            break;
        case StepType.FORMAT:
            if (!Formats.map(o => o.key).includes(target.value)) {
                return { value: defaultValue(StepType.INPUT), message: `Invalid format type ${target.value} on position ${target.order}` }
            }
            break;
        case StepType.ARRAY:
            if (isNaN(Number(target.value)) || Number(target.value) < 0) {
                return { value: defaultValue(StepType.ARRAY), message: `Invalid array position ${target.value} on position ${target.order}` }
            }
            break;
        case StepType.OPERATOR:
            if (!Operators.map(o => o.key).includes(target.value)) {
                return { value: defaultValue(StepType.OPERATOR), message: `Invalid operator type ${target.value} on position ${target.order}` }
            }
            break;
    }
    return { value: target.value, message: undefined }
}

export const defaultValue = (type: string) => {
    switch (type) {
        case StepType.INPUT:
            return StepInput.PAYLOAD;
        case StepType.FORMAT:
            return StepFormat.JSON;
        case StepType.ARRAY:
            return "0"
        case StepType.OPERATOR:
            return StepOperator.EQ
        default:
            return ""
    }
}

const evaluePosition = (cursor: ConditionStep, parent?: ConditionStep) => {
    if (parent == undefined) {
        if (cursor.type != StepType.INPUT) {
            return "First elements shold be input type.";
        }
        return;
    }
    
    if (parent.type != StepType.OPERATOR && cursor.type == StepType.INPUT) {
        return `An input operation cannot be applied in the middle of an operation, but ${cursor.type} found on ${cursor.order} position.`
    }

    if (parent.type == StepType.OPERATOR && cursor.type == StepType.OPERATOR) {
        return `A compare operation is required after operator, but ${cursor.type} found on ${cursor.order} position.`
    }

    if (isFormatedInput(parent) && cursor.type != StepType.FORMAT) {
        return `A formatted input requires a format specification, but ${cursor.type} found on ${cursor.order} position.`
    }

    if (isLogicalOperator(parent) && !isComparableRight(cursor)) {
        return `A compare operation is required after logical operator, but ${cursor.type} found on ${cursor.order} position.`
    }

    if (isCompareOperator(parent) && !isComparableRight(cursor)) {
        return `A compare comparable value is required after compare operator, but ${cursor.type} found on ${cursor.order} position.`
    }

    if (isCompareOperator(cursor) && !isComparableLeft(parent)) {
        return `A compare comparable value is required before compare operator, but ${parent.type} found on ${parent.order} position.`
    }

    if (parent.type == StepType.VALUE && cursor.type != StepType.OPERATOR) {
        return `A value cannot be extracted from a flat value, but ${parent.type} found on ${parent.order} position.`
    }

    if (cursor.type == StepType.VALUE && parent.type != StepType.OPERATOR) {
        return `a defined value cannot be extracted from a structure type, but ${parent.type} found on ${parent.order} position`;
    }

    return;
}

export const isFormatedInput = (cursor: ConditionStep) => {
    if (cursor.type != StepType.INPUT) {
        return false;
    }

    switch (cursor.value) {
        case StepInput.PAYLOAD:
            return true
        default:
            return false;
    }
}

export const isLogicalOperator = (cursor: ConditionStep) => {
    if (cursor.type != StepType.OPERATOR) {
        return false;
    }

    switch (cursor.value) {
        case StepOperator.AND:
        case StepOperator.OR:
            return true
        default:
            return false;
    }
}

export const isCompareOperator = (cursor: ConditionStep) => {
    if (cursor.type != StepType.OPERATOR) {
        return false;
    }

    switch (cursor.value) {
        case StepOperator.EQ:
        case StepOperator.NE:
        case StepOperator.GT:
        case StepOperator.GTE:
        case StepOperator.LT:
        case StepOperator.LTE:
            return true
        default:
            return false;
    }
}

const isComparableLeft = (cursor: ConditionStep) => {
    switch (cursor.type) {
        case StepType.ARRAY:
        case StepType.FIELD:
        case StepType.VALUE:
            return true
        default:
            return false;
    }
}

const isComparableRight = (cursor: ConditionStep) => {
    switch (cursor.type) {
        case StepType.INPUT:
        case StepType.VALUE:
            return true
        default:
            return false;
    }
}
