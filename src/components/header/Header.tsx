import { useState } from 'react';
import { useStoreSession } from '../../store/system/StoreProviderSession';
import { SessionModal } from './session/SessionModal';
import { ProfileImage } from './session/ProfileImage';
import { useStoreSystem } from '../../store/system/StoreProviderSystem';
import { Combo } from '../utils/combo/Combo';
import { useLocation, useNavigate } from 'react-router-dom';
import { TokenModal } from './token/TokenModal';
import { ViewMenuIcon, viewOptions } from './Constants';
import { useStoreTheme } from '../../store/theme/StoreProviderTheme';

import './Header.css';


interface UnsavedProps {
    messages: () => string;
    isEmpty: () => boolean;
}

interface HeaderProps {
    unsaved: UnsavedProps
}

export function Header({ unsaved }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const { userData, fetchUser, fetchTokens } = useStoreSession();
    const theme = useStoreTheme();
    const system = useStoreSystem();


    const [sessionModal, setSessionModal] = useState<boolean>(false);
    const [tokenModal, setTokenModal] = useState<boolean>(false);

    const showSessionModal = () => {
        fetchUser();
        setSessionModal(true);
    };

    const hideSessionModal = () => {
        setSessionModal(false);
    };

    const showTokenModal = () => {
        fetchTokens();
        setTokenModal(true);
    };

    const hideTokenModal = () => {
        setTokenModal(false);
    };

    const actionGoToClient = () => {
        navigate("/client");
    }

    const actionGoToMock = () => {
        navigate("/mock");
    }

    const locationName = () => {
        switch (location.pathname) {
            case "/client":
                return "client";
            case "/mock":
                return "mock";
            default:
                return undefined;
        }
    }

    return (
        <div id="header-container">
            <button id="logo-container" onClick={system.openModal} title="View system metadata">
                &lt;API&gt;
            </button>
            <div id="user-container">
                {!unsaved.isEmpty() && (
                    <div id="unsave-container">
                        <span className="button-modified-status visible" title={unsaved.messages()}></span>
                    </div>
                )}
                <Combo
                    custom={ViewMenuIcon}
                    focus={locationName()}
                    options={viewOptions(userData, {
                        goToClient: actionGoToClient,
                        goToMock: actionGoToMock,
                        tokenModal: showTokenModal,
                        themeModal: theme.openModal
                    })}
                    optionStyle={{
                        width: "max-content",
                        minWidth: "150px"
                    }} />
                <button id="session-preview" className="button-div" type="button" title={userData.username} onClick={showSessionModal}>
                    <ProfileImage size="small" />
                </button>
            </div>
            <SessionModal
                isOpen={sessionModal || userData.first_time}
                onClose={hideSessionModal}
            />
            <TokenModal
                isOpen={tokenModal}
                onClose={hideTokenModal} />
        </div>
    )
}
