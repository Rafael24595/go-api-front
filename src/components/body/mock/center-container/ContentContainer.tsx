import { VIEW_END_POINTS } from '../MockBody';
import { EndPointForm } from './end-point-form/EndPointForm';

import './ContentContainer.css';

interface ContentContainerProps {
    cursor: string;
}

export function ContentContainer({ cursor }: ContentContainerProps) {
    return (
        <div id='content-container'>
            <div className={`mock-selector-form-option  ${cursor === VIEW_END_POINTS ? "show" : ""}`}>
                <EndPointForm />
            </div>
        </div>
    )
}
