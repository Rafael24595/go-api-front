import { useState } from 'react';
import { useStoreSession } from '../../store/system/StoreProviderSession';
import { SessionModal } from './session/SessionModal';
import { ProfileImage } from './session/ProfileImage';
import { useStoreSystem } from '../../store/system/StoreProviderSystem';
import { Combo } from '../utils/combo/Combo';
import { useNavigate } from 'react-router-dom';
import { TokenModal } from './token/TokenModal';
import { hasRole, Role } from '../../interfaces/system/UserData';

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

export function Header({ unsaved }: HeaderProps) {
    const navigate = useNavigate();

    const { userData, fetchUser, fetchTokens } = useStoreSession();
    const { openModal } = useStoreSystem();


    const [data, setData] = useState<Payload>({
        modalSession: false,
    });

    const [tokenModal, setTokenModal] = useState<boolean>(false);

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

    const showTokenModal = () => {
        fetchTokens();
        setTokenModal(true);
    };

    const closeTokenModal = () => {
        setTokenModal(false);
    };

    const goToClient = () => {
        navigate("/client");
    }

    const goToMock = () => {
        navigate("/mock");
    }

    return (
        <div id="header-container">
            <button id="logo-container" onClick={openModal} title="View system metadata">
                &lt;API&gt;
            </button>
            <div id="user-container">
                {!unsaved.isEmpty() && (
                    <div id="unsave-container">
                        <span className="button-modified-status visible" title={unsaved.messages()}></span>
                    </div>
                )}
                <Combo
                    custom={

                        <div id="apps-button-menu">
                            <div className="apps-menu-row">
                                <span className="cube" />
                                <span className="cube" />
                                <span className="cube" />
                            </div>
                            <div className="apps-menu-row">
                                <span className="cube" />
                                <span className="cube" />
                                <span className="cube" />
                            </div>
                            <div className="apps-menu-row">
                                <span className="cube" />
                                <span className="cube" />
                                <span className="cube" />
                            </div>
                        </div>
                    }
                    options={[
                        {
                            label: "Client View",
                            title: "Go to client view",
                            action: goToClient
                        },
                        {
                            label: "Mock View",
                            title: "Go to mock view",
                            action: goToMock
                        },
                        {
                            label: "Tokens View",
                            title: "Go to tokens view",
                            disable: hasRole(userData, Role.ROLE_ANONYMOUS),
                            action: showTokenModal
                        }
                    ]} />
                <button id="session-preview" className="button-div" type="button" title={userData.username} onClick={openSessionModal}>
                    <ProfileImage size="small" />
                </button>
            </div>
            <SessionModal
                isOpen={data.modalSession || userData.first_time}
                onClose={closeSessionModal}
            />
            <TokenModal
                isOpen={tokenModal}
                onClose={closeTokenModal} />
        </div>
    )
}
