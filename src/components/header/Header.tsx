import { useState } from 'react';
import { useStoreSession } from '../../store/system/StoreProviderSession';
import { SessionModal } from './session/SessionModal';
import { ProfileImage } from './session/ProfileImage';
import { useStoreSystem } from '../../store/system/StoreProviderSystem';

import './Header.css';


interface UnsavedProps {
    messages: () => string;
    isEmpty: () => boolean;
}

interface HeaderProps {
    unsaved: UnsavedProps
}


interface Payload {
    modalSession: boolean;
}

export function Header({ unsaved }:HeaderProps) {
    const { userData, fetchUser } = useStoreSession();
    const { openModal } = useStoreSystem();
    

    const [data, setData] = useState<Payload>({
        modalSession: false,
    });

    const openSessionModal = () => {
        fetchUser();
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
                &lt;API&gt;
            </button>
            <div id="user-container">
                {!unsaved.isEmpty() && (
                    <div id="unsave-container">
                        <span className="button-modified-status visible" title={unsaved.messages()}></span>
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