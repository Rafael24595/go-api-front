import { ConditionStep } from '../../../../services/mock/ConditionStep';
import { Modal } from '../../../utils/modal/Modal';

import './ImportConditionsModal.css';

interface ImportConditionsModalProps {
    isOpen: boolean,
    onSubmit(steps: ConditionStep[]): void,
    onClose: () => void,
}

export function ImportConditionsModal({ isOpen, onSubmit, onClose }: ImportConditionsModalProps) {

    const submit = async () => {
        onSubmit([]);
        clean();
    }

    const close = () => {
        clean();
        onClose();
    }

    const clean = () => {
    }

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
            <h3>TODO: Import condition as string</h3>
        </Modal>
    )
}
