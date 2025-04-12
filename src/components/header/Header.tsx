import { useStoreContext } from '../../store/StoreProviderContext';
import { useStoreRequest } from '../../store/StoreProviderRequest';
import { useStoreSession } from '../../store/StoreProviderSession';

import './Header.css'

export function Header() {
    const { userData } = useStoreSession();
    const request = useStoreRequest();
    const context = useStoreContext();

    const makeUnsavedTitle = () => {
        let title = "";
        const requests = request.cacheLenght();
        if(requests > 0) {
            title += `Unsafe requests: ${requests}`;
        }
        const contexts = context.cacheLenght();
        if(contexts > 0) {
            title += `\nUnsafe contexts: ${contexts}`;
        }
        return title;
    };

    return (
        <div id="header-container">
            <div id="user-container">
                {(request.cacheLenght() > 0 || context.cacheLenght() > 0) && (
                    <div id="unsafe-container">
                        <span className="button-modified-status visible" title={makeUnsavedTitle()}></span>
                    </div>
                )}
                <span>{userData.username}</span>
            </div>
        </div>
    )
}