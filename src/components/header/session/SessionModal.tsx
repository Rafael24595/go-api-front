import { useState } from 'react';
import { useStoreSession } from '../../../store/StoreProviderSession';
import { Modal } from '../../utils/modal/Modal';
import { millisecondsToDate } from '../../../services/Tools';
import { ProfileImage } from './ProfileImage';
import { fetchAuthenticate } from '../../../services/api/ServiceManager';
import { EAlertCategory } from '../../../interfaces/AlertData';
import { useAlert } from '../../utils/alert/Alert';
import { useStoreTheme } from '../../../store/theme/StoreProviderTheme';

import './SessionModal.css';

interface SessionModalProps {
    isOpen: boolean,
    onClose: () => void,
}

interface Payload {
    view: "" | "login" | "signin";
    username: string;
    oldPassword: string;
    newPassword1: string;
    newPassword2: string;
    isAdmin: boolean;
}

export function SessionModal({ isOpen, onClose }: SessionModalProps) {
    const { userData, login, logout, signin, remove } = useStoreSession();
    const { isDark, openModal, toggleDefaultThemes } = useStoreTheme();

    const { push } = useAlert();

    const onLogin = async () => {
        await login(data.username, data.newPassword1)
            .then(onLocalClose)
            .catch(e =>push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
    };

    const onSignin = async () => {
        await signin(data.username, data.newPassword1, data.newPassword2, data.isAdmin)
            .then(() => {
                push({
                    title: "Sign In",
                    category: EAlertCategory.INFO,
                    content: `The user ${data.username} has been registered successfully`,
                });
                resetView();
            })
            .catch(e => push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
    };

    const onAuthenticate = async () => {
        await fetchAuthenticate(data.oldPassword, data.newPassword1, data.newPassword2)
            .then(onLocalClose)
            .catch(e =>push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
    };

    const onLogout = async () => {
        await logout();
        onLocalClose();
    };

    const onRemove = async () => {
        if (!confirm(`The user ${userData.username} will be removed. Are you sure?`)) {
            return;
        } 

        await remove()
            .then(onLocalClose)
            .catch(e =>push({
                title: `[${e.statusCode}] ${e.statusText}`,
                category: EAlertCategory.ERRO,
                content: e.message,
            }));
    };

    const onLocalClose = async () => {
        resetView()
        onClose();
    };

    const openThemesModal = async () => {
        openModal()
        onClose();
    };

    const [data, setData] = useState<Payload>({
        view: "",
        username: "",
        oldPassword: "",
        newPassword1: "",
        newPassword2: "",
        isAdmin: false,
    });
    
    const viewLogin = () => {
        setData((prevData) => ({
            ...prevData,
            view: 'login'
        }));
    };

    const viewSignin = () => {
        setData((prevData) => ({
            ...prevData,
            view: 'signin'
        }));
    };

    const resetView = () => {
        setData((prevData) => ({
            ...prevData,
            view: "",
            username: "",
            oldPassword: "",
            newPassword1: "",
            newPassword2: "",
            isAdmin: false,
        }));
    };

    const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>)  => {
        setData((prevData) => ({
            ...prevData,
            username: e.target.value
        }));
    }

    const onOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>)  => {
        setData((prevData) => ({
            ...prevData,
            oldPassword: e.target.value
        }));
    }

    const onNewPassword1Change = (e: React.ChangeEvent<HTMLInputElement>)  => {
        setData((prevData) => ({
            ...prevData,
            newPassword1: e.target.value
        }));
    }

    const onNewPassword2Change = (e: React.ChangeEvent<HTMLInputElement>)  => {
        setData((prevData) => ({
            ...prevData,
            newPassword2: e.target.value
        }));
    }

    const onIsAdminChange = (e: React.ChangeEvent<HTMLInputElement>)  => {
        setData((prevData) => ({
            ...prevData,
            isAdmin: e.target.checked
        }));
    }

    const logedTitle = `Session [${userData.username}]`;
    const signinTitle = `Sign in`;
    const validTitle = `Authenticate [${userData.username}]`;
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
            type: "submit",
            callback: {
                func: onLogin
            }
        },
        ...logedButtons
    ];

    const signinButtons = [
        {
            title: "Send",
            type: "submit",
            callback: {
                func: onSignin
            }
        },
        ...logedButtons
    ];

    const validButtons = [
        {
            title: "Send",
            type: "submit",
            callback: {
                func: onAuthenticate
            }
        }
    ];

    const loginView = (
        <div id="login-container">
            <div id="session-data">
                <div className="session-form-fragment">
                    <label htmlFor="username">Username:</label>
                    <input type="text" name="username" value={data.username} onChange={onUsernameChange}/>
                </div>
                <div className="session-form-fragment">
                    <label htmlFor="password">Password:</label>
                    <input type="password" name="password" value={data.newPassword1} onChange={onNewPassword1Change} autoComplete="on"/>
                </div>
            </div>
            <div id="session-links">
                <button type="button" className="button-anchor small" onClick={resetView}>Cancel</button>
            </div>
        </div>
    );

    const signinView = (
        <div id="login-container">
            <div id="session-data">
                <div className="session-form-fragment">
                    <label htmlFor="username">Username:</label>
                    <input type="text" name="username" value={data.username} onChange={onUsernameChange}/>
                </div>
                <div className="session-form-fragment">
                    <label htmlFor="password-1">Password:</label>
                    <input type="password" name="password-1" value={data.newPassword1} onChange={onNewPassword1Change} autoComplete="on"/>
                </div>
                <div className="session-form-fragment">
                    <label htmlFor="password-2">Repeat Password:</label>
                    <input type="password" name="password-2" value={data.newPassword2} onChange={onNewPassword2Change} autoComplete="on"/>
                </div>
                <div id="admin-fragment" className="session-form-fragment line">
                    <label htmlFor="admin">Register as admin:</label>
                    <input type="checkbox" name="admin" value={data.username} onChange={onIsAdminChange}/>
                </div>
            </div>
            <div id="session-links">
                <button type="button" className="button-anchor small" onClick={resetView}>Cancel</button>
            </div>
        </div>
    );

    const validView = (
        <div id="login-container">
            <div id="session-data">
                <div className="session-form-fragment">
                    <label htmlFor="old-password">Old Password:</label>
                    <input type="password" name="old-password" value={data.oldPassword} onChange={onOldPasswordChange} autoComplete="on"/>
                </div>
                <div className="session-form-fragment">
                    <label htmlFor="new-password-1">New Password:</label>
                    <input type="password" name="new-password-1" value={data.newPassword1} onChange={onNewPassword1Change} autoComplete="on"/>
                </div>
                <div className="session-form-fragment">
                    <label htmlFor="new-password-2">Repeat Password:</label>
                    <input type="password" name="new-password-2" value={data.newPassword2} onChange={onNewPassword2Change} autoComplete="on"/>
                </div>
            </div>
            <div id="session-links">
                <button type="button" className="button-anchor small" onClick={onLogout}>Logout</button>
                {!userData.is_protected && (
                    <button type="button" className="button-anchor small" onClick={onRemove}>Delete</button>
                )}
            </div>
        </div>
    );

    const logedView = (
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
                <button className="button-anchor small margin" onClick={openThemesModal}>🎨 Themes 🎨</button>
                {!userData.is_protected && (
                    <button type="button" className="button-anchor small" onClick={onRemove}>Delete</button>
                )}
                {userData.is_admin && (
                    <button type="button" id="signin-button" className="button-anchor small" onClick={viewSignin}>Sign in</button>
                )}
            </div>
        </div>
    );
    
    const loadButtons = () => {
        if(data.view == 'login') {
            return loginButtons;
        }

        if(data.view == 'signin') {
            return signinButtons;
        }

        if(userData.first_time){
            return validButtons
        }

        return logedButtons
    }

    const loadTitle = () => {
        if(data.view == 'login') {
            return loginTitle;
        }

        if(data.view == 'signin') {
            return signinTitle;
        }

        if(userData.first_time){
            return validTitle
        }

        return logedTitle
    }

    const loadView = () => {
        if(data.view == 'login') {
            return loginView;
        }

        if(data.view == 'signin') {
            return signinView;
        }

        if(userData.first_time){
            return validView;
        }

        return logedView;
    }

    return (
        <Modal 
            buttons={loadButtons()}  
            title={ 
                <div id="session-title-container">
                    <span className="select-none">{ loadTitle() }</span>
                    <button className={`toggle-theme-button ${ isDark() ? "off" : ""}`} onClick={toggleDefaultThemes} onDoubleClickCapture={() => console.log("ci")}></button>
                </div>
             }
            height="400px"
            width="250px"
            minHeight="350px"
            minWidth="250px"
            isOpen={isOpen} 
            onClose={onLocalClose}>
                {loadView()}
        </Modal>
    )
}
