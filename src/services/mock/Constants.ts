import { KeyValue } from "../../interfaces/KeyValue"


export enum StepType {
    INPUT = "input",
    ARRAY = "array",
    FIELD = "field",
    VALUE = "value",
    OPERATOR = "operator"
}

export const Types: KeyValue[] = [
    {
        key: StepType.INPUT,
        value: "Input",
    },
    {
        key: StepType.ARRAY,
        value: "Array",
    },
    {
        key: StepType.FIELD,
        value: "Field",
    },
    {
        key: StepType.VALUE,
        value: "Value",
    },
    {
        key: StepType.OPERATOR,
        value: "Operator",
    },
];

export enum StepInput {
    PAYLOAD = "payload",
    HEADER = "header",
}

export const Inputs: KeyValue[] = [
    {
        key: StepInput.PAYLOAD,
        value: "Payload",
    },
    {
        key: StepInput.HEADER,
        value: "Header",
    }
];

export enum StepOperator {
    EQ = "eq",
    NE = "ne",
    GT = "gt",
    GTE = "gte",
    LT = "lt",
    LTE = "lte",
    AND = "and",
    OR = "or"
}

export const Operators: KeyValue[] = [
    {
        key: StepOperator.EQ,
        value: "Equals",
    },
    {
        key: StepOperator.NE,
        value: "Not equals",
    },
    {
        key: StepOperator.GT,
        value: "Greater",
    },
    {
        key: StepOperator.GTE,
        value: "Greater equals",
    },
    {
        key: StepOperator.LT,
        value: "Less",
    },
    {
        key: StepOperator.LTE,
        value: "Less equals",
    },
    {
        key: StepOperator.AND,
        value: "And",
    },
    {
        key: StepOperator.OR,
        value: "Or",
    }
];