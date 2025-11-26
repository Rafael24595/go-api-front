import { JSX, useState } from 'react';
import { ConditionStep, isLogicalOperator } from '../../../../services/mock/ConditionStep';
import { Modal } from '../../../utils/modal/Modal';
import { translateEndPointConditions } from '../../../../services/api/ServiceStorage';
import { StepType } from '../../../../services/mock/Constants';
import { useStoreEndPoint } from '../../../../store/mock/StoreProviderEndPoint';

import './ImportConditionsModal.css';

interface ImportConditionsModalProps {
    isOpen: boolean,
    onSubmit(steps: ConditionStep[]): void,
    onClose: () => void,
}

export function ImportConditionsModal({ isOpen, onSubmit, onClose }: ImportConditionsModalProps) {
    const { response, defineResponse } = useStoreEndPoint();

    const [raw, setRaw] = useState<string>("");
    const [steps, setSteps] = useState<ConditionStep[]>();
    const [warning, setWarning] = useState<string>("");

    const onConditionChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setRaw(e.target.value);
    }

    const load = async () => {
        await translateEndPointConditions(raw)
            .then(steps => {
                setSteps(steps);
                setWarning("");
            })
            .catch(e => {
                setWarning(e.message);
                setSteps(undefined);
            });
    }

    const submit = async () => {
        if (!steps) {
            return;
        }

        response.condition = steps;
        defineResponse(response);

        onSubmit([]);
        close();
    }

    const close = () => {
        clean();
        onClose();
    }

    const clean = () => {
        setRaw("");
        setSteps(undefined);
        setWarning("");
    }

    const makeDescription = () => {
        let last: ConditionStep | undefined;
        return steps?.map(step => {
            const element = renderers[step.type](step, last);
            last = step;
            return element;
        });
    };

    return (
        <Modal
            buttons={[
                {
                    title: "Submit",
                    type: "submit",
                    callback: {
                        func: submit
                    }
                },
                {
                    title: "Close",
                    callback: {
                        func: close
                    }
                }
            ]}
            titleCustom={
                <span>Load condition</span>
            }
            style={{
                width: "50%",
                height: "45%",
                maxWidth: "800px",
                maxHeight: "450px"
            }}
            isOpen={isOpen}
            onClose={close}>
            <div id="modal-selector-container">
                <div id="steps-input-loader-container">
                    <div className="steps-loader-title">
                        <h3>Conditions: </h3>
                        <button type="button" onClick={load}>Load</button>
                    </div>
                    <div id="steps-input-loader-textarea">
                        <textarea name="" id="" onChange={onConditionChange} rows={5} value={raw}></textarea>
                    </div>
                </div>
                {warning && (
                    <div>
                        <div className="steps-loader-title">
                            <h3>Warning:</h3>
                        </div>
                        <div id="steps-description-container">
                            <span id="steps-description-title">Description: </span>
                            <span>{warning}.</span>
                        </div>
                    </div>
                )}
                {steps && (
                    <div>
                        <div className="steps-loader-title">
                            <h3>Steps [{steps.length}]:</h3>
                        </div>
                        <div id="steps-description-container">
                            <div className="step-sentence-group">{makeDescription()}</div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

const StepBlock = (element: JSX.Element, cursor: ConditionStep, last?: ConditionStep) => (
    <span key={cursor.order} className={`step-sentence ${isLogicalOperator(cursor) ? "block" : ""}`}>
        <span className={`${!last ? "capitalize" : ""}`}>{element}.</span>
    </span>
);

const StepTag = ({ step }: { step: ConditionStep }) => (
    <span className={`step-type-tag ${step.type}`}>{step.value}</span>
);

const renderers: Record<
    string,
    (step: ConditionStep, last?: ConditionStep) => JSX.Element
> = {

    [StepType.INPUT]: (s, last) => {
        if (last && last.type === StepType.OPERATOR) {
            return StepBlock(<span>Continuing with the input <StepTag step={s} /></span>, s, last);
        }
        return StepBlock(<span>Starting from the input <StepTag step={s} /></span >, s, last)
    },

    [StepType.FORMAT]: (s, last) =>
        StepBlock(<span>Treating it as <StepTag step={s} /></span>, s, last),

    [StepType.ARRAY]: (s, last) =>
        StepBlock(<span>Select index <StepTag step={s} /></span>, s, last),

    [StepType.FIELD]: (s, last) =>
        StepBlock(<span>Navigate to the field <StepTag step={s} /></span>, s, last),

    [StepType.OPERATOR]: (s, last) =>
        StepBlock(<span>Apply the <StepTag step={s} /> operator</span>, s, last),

    [StepType.VALUE]: (s, last) =>
        StepBlock(<span>Using <StepTag step={s} /></span>, s, last),
};
