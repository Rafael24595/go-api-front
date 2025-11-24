import { ItemResponse } from '../../../../../../../interfaces/mock/Response';
import { ChangeEvent, useEffect, useState } from 'react';
import { StepType, Inputs, Operators, Types, Formats } from '../../../../../../../services/mock/Constants';
import { ConditionStep, defaultValue, evalueSteps, evalueTypeValue, isLogicalOperator, newConditionStep } from '../../../../../../../services/mock/ConditionStep';
import { KeyValue } from '../../../../../../../interfaces/KeyValue';
import { Optional } from '../../../../../../../types/Optional';
import { useStoreEndPoint } from '../../../../../../../store/mock/StoreProviderEndPoint';

import '../../../../../../structure/status-key-value/StatusKeyValue.css';
import './ConditionArguments.css';

interface Payload {
    steps: ConditionStep[]
    warnings: Map<number, string[]>
}

export function ConditionArguments() {
    const { response, defineResponse } = useStoreEndPoint();

    const makePayload = (response: ItemResponse) => {
        const newSteps = [...response.condition];
        const newWarnings = evalueSteps(newSteps);

        return {
            warnings: newWarnings,
            steps: newSteps
        }
    };

    const [data, setData] = useState<Payload>(makePayload(response));

    useEffect(() => {
        setData(makePayload(response));
    }, [response.condition]);

    const addStep = () => {
        let prevStep = undefined;
        if (data.steps.length > 0) {
            prevStep = data.steps[data.steps.length - 1];
        }

        const newStep = newConditionStep(data.steps.length, prevStep);
        const newSteps = data.steps.concat(newStep);
        resolveResponseSteps(newSteps);
    }

    const removeStep = (step: ConditionStep) => {
        const newSteps = data.steps
            .filter(s => s !== step)
            .map((s, i) => ({ ...s, order: i }));
        resolveResponseSteps(newSteps);
    }

    const onStepTypeChange = (e: ChangeEvent<HTMLSelectElement>, target: ConditionStep) => {
        let newType = e.target.value;
        if (!Types.map(t => t.key).includes(newType)) {
            newType = StepType.INPUT;
        }

        if (target.type != newType) {
            target.value = defaultValue(newType);
        }

        target.type = newType;
        return resolveStep(target);
    }

    const onStepValueChange = (e: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>, target: ConditionStep) => {
        target.value = e.target.value;
        return resolveStep(target);
    }

    const resolveStep = (target: ConditionStep) => {
        const newSteps = manageStepChange(data.steps, target);
        resolveResponseSteps(newSteps);
    }

    const resolveResponseSteps = (steps: ConditionStep[]) => {
        setData({
            steps: steps,
            warnings: evalueSteps(steps)
        });

        response.condition = steps;

        defineResponse(response);
    }

    const manageStepChange = (steps: ConditionStep[], target: ConditionStep) => {
        const index = steps.indexOf(target);
        if (index == -1) {
            return steps;
        }

        steps[index] = fixStep(target);
        return steps;
    }

    const fixStep = (target: ConditionStep) => {
        const result = evalueTypeValue(target)
        target.value = result.value;
        return target;
    }

    const renderStepValue = (step: ConditionStep) => {
        let condType = "text";
        let enums: Optional<KeyValue[]> = undefined;

        switch (step.type) {
            case StepType.INPUT:
                enums = Inputs;
                break;
            case StepType.FORMAT:
                enums = Formats;
                break;
            case StepType.OPERATOR:
                enums = Operators;
                break;
            case StepType.ARRAY:
                condType = "number";
                break;
        }

        if (enums == undefined) {
            return (
                <input id={`cond-value-${step.order}`} name={`cond-value-${step.order}`} type={condType} value={step.value} onChange={(e) => onStepValueChange(e, step)} />
            )
        }

        return (
            <select name={`cond-value-${step.order}`} id={`cond-value-${step.order}`} value={step.value} onChange={(e) => onStepValueChange(e, step)}>
                {enums.map(o => (
                    <option value={o.key}>{o.value}</option>
                ))}
            </select>
        )
    };

    const renderStepConnector = (index: number, step: ConditionStep) => {
        if (index == 0) {
            return <></>
        }

        if (step.type == StepType.OPERATOR) {
            if (isLogicalOperator(step)) {
                return <span className="step-connector">Evalue</span>
            }

            return <span className="step-connector">Compare</span>
        }

        if (data.steps[index - 1].type == StepType.OPERATOR) {
            return <span className="step-connector">With</span>
        }


        return <span className="step-connector">Get</span>
    };

    const makeKey = (item: ConditionStep): string => {
        return `${item.order}-${item.type}`;
    }

    return (
        <>
            <div id="end-form-arguments" className="scroll">
                <p id="condition-form-header">From:</p>
                {data.steps.map((s, i) => (
                    <div key={makeKey(s)} className={`condition-form-step-container ${s.type} ${s.value}`}>
                        {renderStepConnector(i, s)}
                        <div key={`${s.order}`} className="condition-form-step">
                            <span className={`warning-step ${data.warnings.has(s.order) ? "show" : ""}`} title={data.warnings.get(s.order)?.join("\n")}>*</span>
                            <label htmlFor={`cond-type-${s.order}`} className="cond-input ">
                                <select name="cond-type" id={`cond-type-${s.order}`} value={s.type} onChange={(e) => onStepTypeChange(e, s)}>
                                    {Types.map(t => (
                                        <option key={t.key} value={t.key}>{t.value}</option>
                                    ))}
                                </select>
                            </label>
                            <label htmlFor={`cond-value-${s.order}`} className="cond-input cond-value-input">
                                {renderStepValue(s)}
                            </label>
                            <button type="button" className="remove-button show" onClick={() => removeStep(s)}></button>
                        </div>
                    </div>
                ))}
                <span className="step-connector">...</span>
                <div id="condition-form-buttons">
                    <button className="add-button show" type="button" onClick={() => addStep()}></button>
                </div>
            </div>
        </>
    )
}