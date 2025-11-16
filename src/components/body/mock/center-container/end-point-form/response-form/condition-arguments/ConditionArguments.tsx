import { ItemStatusKeyValue } from '../../../../../../../interfaces/StatusKeyValue';
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
    const { response, updateResponse } = useStoreEndPoint();

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

    const addFragment = () => {
        let prevStep = undefined;
        if (data.steps.length > 0) {
            prevStep = data.steps[data.steps.length - 1];
        }

        const newStep = newConditionStep(data.steps.length, prevStep);
        const newFragments = data.steps.concat(newStep);
        const newWarnings = evalueSteps(newFragments);

        setData({
            warnings: newWarnings,
            steps: newFragments
        });

        response.condition = newFragments;

        updateResponse(response);
    }

    const removeStep = (step: ConditionStep) => {
        let prevStep = undefined;
        if (data.steps.length > 0) {
            prevStep = data.steps[data.steps.length - 1];
        }

        const newFragments = data.steps
            .filter(s => s !== step)
            .map((s, i) => ({ ...s, order: i }));

        const newWarnings = evalueSteps(newFragments);

        setData({
            warnings: newWarnings,
            steps: newFragments
        });

        response.condition = newFragments;

        updateResponse(response);
    }

    const onFragmentTypeChange = (e: ChangeEvent<HTMLSelectElement>, target: ConditionStep) => {
        let newType = e.target.value;
        if (!Types.map(t => t.key).includes(newType)) {
            newType = StepType.INPUT;
        }

        if (target.type != newType) {
            target.value = defaultValue(newType);
        }

        target.type = newType;
        return resolveFragment(target);
    }

    const onFragmentValueChange = (e: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>, target: ConditionStep) => {
        target.value = e.target.value;
        return resolveFragment(target);
    }

    const resolveFragment = (target: ConditionStep) => {
        setData((prevData) => {
            const newSteps = manageFragmentChange(prevData.steps, target);
            const newWarnings = evalueSteps(newSteps);
            return {
                steps: newSteps,
                warnings: newWarnings,
            }
        });
    }

    const manageFragmentChange = (fragments: ConditionStep[], target: ConditionStep) => {
        const index = fragments.indexOf(target);
        if (index == -1) {
            return fragments;
        }

        fragments[index] = fixFragment(target);
        return fragments;
    }

    const fixFragment = (target: ConditionStep) => {
        const result = evalueTypeValue(target)
        target.value = result.value;
        return target;
    }

    const updateItems = async (items: ItemStatusKeyValue[]) => {
        setData((prevData) => ({
            ...prevData,
        }));

        const newResponse: ItemResponse = {
            ...response,
            headers: items
        };

        updateResponse(newResponse);
    };

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
                <input id={`cond-value-${step.order}`} name={`cond-value-${step.order}`} type={condType} value={step.value} onChange={(e) => onFragmentValueChange(e, step)} />
            )
        }

        return (
            <select name={`cond-value-${step.order}`} id={`cond-value-${step.order}`} value={step.value} onChange={(e) => onFragmentValueChange(e, step)}>
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

    return (
        <>
            <div id="end-form-arguments">
                <p id="condition-form-header">From:</p>
                {data.steps.map((s, i) => (
                    <>
                        {renderStepConnector(i, s)}
                        <div key={`${s.order}`} className="condition-form-step">
                            <span className={`warning-step ${data.warnings.has(s.order) ? "show" : ""}`} title={data.warnings.get(s.order)?.join("\n")}>*</span>
                            <label htmlFor={`cond-type-${s.order}`} className="cond-input">
                                <select name="cond-type" id={`cond-type-${s.order}`} value={s.type} onChange={(e) => onFragmentTypeChange(e, s)}>
                                    {Types.map(t => (
                                        <option value={t.key}>{t.value}</option>
                                    ))}
                                </select>
                            </label>
                            <label htmlFor={`cond-value-${s.order}`} className="cond-input cond-value-input">
                                {renderStepValue(s)}
                            </label>
                            <button type="button" className="remove-button show" onClick={() => removeStep(s)}></button>
                        </div>
                    </>
                ))}
                <span className="step-connector">...</span>
                <div id="condition-form-buttons">
                    <button className="add-button show" type="button" onClick={() => addFragment()}></button>
                </div>
            </div>
        </>
    )
}