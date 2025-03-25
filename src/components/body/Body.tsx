import { StoreProviderContext } from '../../store/StoreProviderContext'
import { Client } from './client/Client'

import './Body.css'
import { StoreProviderRequest } from '../../store/StoreProviderRequest'

export function Body() {
    return (
        <div id='body-content'>
            <StoreProviderRequest>
                <StoreProviderContext>
                    <Client/>
                </StoreProviderContext>
            </StoreProviderRequest>
        </div>
    )
}