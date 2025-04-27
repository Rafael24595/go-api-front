import { Client } from './client/Client'
import { StoreProviderRequests } from '../../store/StoreProviderRequests'

import './Body.css';

export function Body() {
    return (
        <div id='body-content'>
            <StoreProviderRequests>
                <Client/>
            </StoreProviderRequests>
        </div>
    )
}