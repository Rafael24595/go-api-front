import { StoreProviderContext } from '../../store/StoreProviderContext'
import { Client } from './client/Client'

import './Body.css'
import { StoreProviderRequest } from '../../store/StoreProviderRequest'
import { StoreProviderRequests } from '../../store/StoreProviderRequests'

export function Body() {
    return (
        <div id='body-content'>
            <StoreProviderContext>
                <StoreProviderRequest>
                    <StoreProviderRequests>
                        <Client/>
                    </StoreProviderRequests>
                </StoreProviderRequest>
            </StoreProviderContext>
        </div>
    )
}