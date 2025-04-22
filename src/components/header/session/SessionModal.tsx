import { useState } from 'react';
import { useStoreSession } from '../../../store/StoreProviderSession';
import { Modal } from '../../utils/modal/Modal';

import './SessionModal.css';
import { millisecondsToDate } from '../../../services/Tools';
import { ProfileImage } from './ProfileImage';

interface SessionModalProps {
    isOpen: boolean,
    onClose: () => void,
}

interface Payload {
    login: boolean;
    username: string;
    password: string;
}

export function SessionModal({ isOpen, onClose }: SessionModalProps) {
    const { userData, login, logout } = useStoreSession();

    const onLogin = async () => {
        await login(data.username, data.password);
        onLocalClose();
    };

    const onLogout = async () => {
        await logout();
        onLocalClose();
    };

    const onLocalClose = async () => {
        clean()
        onClose();
    };

    const logedTitle = `Session [${userData.username}]`;
    const loginTitle = `Login`;

    const logedButtons = [
        {
            title: "Close",
            callback: {
                func: onLocalClose
            }
        }
    ];

    const loginButtons = [
        {
            title: "Login",
            callback: {
                func: onLogin
            }
        },
        ...logedButtons
    ];

    const [data, setData] = useState<Payload>({
        login: false,
        username: "",
        password: ""
    });
    
    const viewLogin = () => {
        setData((prevData) => ({
            ...prevData,
            login: true
        }));
    };

    const closeLogin = () => {
        setData((prevData) => ({
            ...prevData,
            login: false
        }));
    };

    const clean = () => {
        setData((prevData) => ({
            ...prevData,
            login: false,
            username: "",
            password: ""
        }));
    };

    const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>)  => {
        setData((prevData) => ({
            ...prevData,
            username: e.target.value
        }));
    }

    const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>)  => {
        setData((prevData) => ({
            ...prevData,
            password: e.target.value
        }));
    }

    return (
        <Modal 
            buttons={data.login ? loginButtons : logedButtons}  
            title={
                <span>{data.login ? loginTitle : logedTitle }</span>
            }
            height="350px"
            width="250px"
            minHeight="350px"
            minWidth="250px"
            isOpen={isOpen} 
            onClose={onLocalClose}>
                {data.login ? (
                    <div id="login-container">
                        <div id="session-data">
                            <div className="session-form-fragment">
                                <label htmlFor="username">Username:</label>
                                <input type="text" name="username" value={data.username} onChange={onUsernameChange} />
                            </div>
                            <div className="session-form-fragment">
                                <label htmlFor="password">Password:</label>
                                <input type="password" name="password" value={data.password} onChange={onPasswordChange} />
                            </div>
                        </div>
                        <div id="session-links">
                            <button className="button-anchor small" onClick={closeLogin}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div id="login-container">
                        <div id="session-data">
                            <div id="loged-data" title={`Registered on ${millisecondsToDate(userData.timestamp)}`}>
                                <ProfileImage/>
                                <span id="loged-name">{ userData.username }</span>
                            </div>
                        </div>
                        <div id="session-links">
                            <button className="button-anchor small" onClick={viewLogin}>Login</button>
                            <button className="button-anchor small" onClick={onLogout}>Logout</button>
                        </div>
                    </div>
                )}
        </Modal>
    )
}
