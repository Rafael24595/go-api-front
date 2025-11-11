import { HTTP_METHODS } from '../../../../../constants/HttpMethod';
import { useStoreEndPoint } from '../../../../../store/mock/StoreProviderEndPoint';

import './EndPointForm.css';

export function EndPointForm() {
    const { endPoint } = useStoreEndPoint();

    return (
        <>
            <div id="end-point-data-form">
                <div id="end-point-form-title-container" className="border-bottom">
                    <p id="end-point-form-title">End Point data:</p>
                    <label htmlFor="end-point-safe" id="end-point-form-safe">
                        <span>{ endPoint.safe ? "🔒" : "🔓" }</span>
                        <input id="end-point-safe" name="safe" type="checkbox" checked={endPoint.safe} />
                    </label>
                </div>
                <div className="end-point-form-fragment">
                    <label htmlFor="end-point-method" className="end-point-form-field column">
                        <span>Method:</span>
                        <select id="end-point-method" className="end-point-form-input" name="method" value={endPoint.method}>
                            {HTTP_METHODS.map((method, index) => (
                                <option key={index} value={method}>
                                    {method}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label htmlFor="end-point-name" className="end-point-form-field column fix">
                        <span>Path:</span>
                        <input id="end-point-name" className="end-point-form-input" name="name" type="text" placeholder="name" value={endPoint.path} autoComplete="on" />
                    </label>
                </div>
                <div className="end-point-form-fragment">
                    
                </div>
            </div>
            <div id="end-point-responses-form">
                <div id="end-point-form-title-container" className="border-bottom">
                    <p id="end-point-form-title">Responses:</p>
                </div>
            </div>
        </>
    );
}