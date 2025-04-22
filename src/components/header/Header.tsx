import { useState } from 'react';
import { useStoreContext } from '../../store/StoreProviderContext';
import { useStoreRequest } from '../../store/StoreProviderRequest';
import { useStoreSession } from '../../store/StoreProviderSession';
import { SessionModal } from './session/SessionModal';
import { ProfileImage } from './session/ProfileImage';

import './Header.css';

interface Payload {
    modalSession: boolean;
}

export function Header() {
    const { userData } = useStoreSession();
    const request = useStoreRequest();
    const context = useStoreContext();

    const [data, setData] = useState<Payload>({
        modalSession: false,
    });

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

    const openSessionModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalSession: true
        }));
    };

    const closeSessionModal = () => {
        setData((prevData) => ({
            ...prevData,
            modalSession: false
        }));
    };

    return (
        <div id="header-container">
            <div id="user-container">
                {(request.cacheLenght() > 0 || context.cacheLenght() > 0) && (
                    <div id="unsafe-container">
                        <span className="button-modified-status visible" title={makeUnsavedTitle()}></span>
                    </div>
                )}
                <button id="session-preview" className="button-div" type="button" onClick={openSessionModal}>
                    <span id="username-preview">{userData.username}</span>
                    <ProfileImage size="small"/>
                </button>
            </div>
            <SessionModal
                isOpen={data.modalSession}
                onClose={closeSessionModal}
            />
        </div>
    )
}