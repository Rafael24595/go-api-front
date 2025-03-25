import { StoreProviderContext } from '../../store/StoreProviderContext'
import { Client } from './client/Client'

import './Body.css'

export function Body() {
    return (
        <div id='body-content'>
            <StoreProviderContext>
                <Client/>
            </StoreProviderContext>
        </div>
    )
}