import { useState } from 'react';
import { useStoreContext } from '../../store/StoreProviderContext';
import { useStoreRequest } from '../../store/StoreProviderRequest';
import { useStoreSession } from '../../store/StoreProviderSession';
import { SessionModal } from './session/SessionModal';
import { ProfileImage } from './session/ProfileImage';
import { useStoreSystem } from '../../store/system/StoreProviderSystem';

import './Header.css';

interface Payload {
    modalSession: boolean;
}

export function Header() {
    const { userData } = useStoreSession();
    const { openModal } = useStoreSystem();
    const request = useStoreRequest();
    const context = useStoreContext();

    const [data, setData] = useState<Payload>({
        modalSession: false,
    });

    const makeUnsavedTitle = () => {
        let title = "";
        const requests = request.cacheComments();
        if(requests.length > 0) {
            title += requests.join("\n");
        }
        const contexts = context.cacheComments();
        if(contexts.length > 0) {
            title += contexts.join("\n");
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
            <button id="logo-container" onClick={ openModal } title="View system metadata">
                <img src="/assets/GoApiLogo.png" title="GoApi logo" alt="GoApi logo"/>
            </button>
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
                isOpen={data.modalSession || userData.first_time}
                onClose={closeSessionModal}
            />
        </div>
    )
}