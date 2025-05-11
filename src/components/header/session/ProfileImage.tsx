import { useStoreSession } from '../../../store/StoreProviderSession';

import './ProfileImage.css';

interface ProfileImageProps {
    size?: "small" | "default",
}

export function ProfileImage({ size }: ProfileImageProps) {
    const { userData } = useStoreSession();

    const initials = (): string => {
        if(userData.username.length == 0) {
            return "";
        }
        return userData.username
            .split(" ")
            .map(f => f[0].toUpperCase())
            .join("");
    }

    const backgroundColor = () => {
        const timestamp = userData.timestamp;
        const input = `${userData.username}-${timestamp.toString()}`;

        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = input.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        hash = hash | 0;

        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).slice(-2);
        }

        return color;
    }

    const color = () => {
        const hex = backgroundColor().replace('#', '');

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        return luminance < 128 ? "#ebebeb" : "black";
    }

    return (
        <div id="profile-image" className={`select-none ${size ? size : ""}`} style={{ 
            backgroundColor: `var(--fix-profile-color, ${backgroundColor()})`, 
            color: `var(--fix-profile-text-color, ${color()})`
            }}>
            {!userData.picture && (
                <span>{initials()}</span>
            )}
        </div>
    )
}
