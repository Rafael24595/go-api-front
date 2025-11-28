export interface TimeUnit {
    label: string,
    time: number
}

export const MILLISECOND: TimeUnit = { label: "ms", time: 1 };
export const SECOND: TimeUnit = { label: "s", time: 1000 };
export const MINUTE: TimeUnit = { label: "m", time: SECOND.time * 60 };
export const HOUR: TimeUnit = { label: "h", time: MINUTE.time * 60 };
export const DAY: TimeUnit = { label: "d", time: HOUR.time * 24 };
export const YEAR: TimeUnit = { label: "y", time: DAY.time * 365 };

export const TIME_UNITS = [YEAR, DAY, HOUR, MINUTE, SECOND, MILLISECOND];


export function millisecondsToTime(ms: number, limit?: TimeUnit): string {
    if (Number.isNaN(ms)) {
        return "";
    }

    const parts: string[] = [];

    for (const u of TIME_UNITS) {
        if (limit && u.label === limit.label) {
            break;
        }

        const amount = Math.floor(ms / u.time);
        if (amount > 0 || parts.length > 0 || u.label === "ms") {
            parts.push(`${amount}${u.label}`);
        }
        ms %= u.time;
    }

    return parts.join(" ");
}

export function millisecondsToDate(milliseconds: number): string {
    const date = new Date(milliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function formatBytes(bytes: number): string {
    if (bytes == null || Number.isNaN(bytes)) {
        return "";
    }

    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;

    if (Math.round(gb) > 0) {
        return `${gb.toFixed(2)} GB`;
    }
    if (Math.round(mb) > 0) {
        return `${mb.toFixed(2)} MB`;
    }
    if (Math.round(kb) > 0) {
        return `${kb.toFixed(2)} KB`;
    }

    return `${bytes.toFixed(2)} Bytes`;
}

export const statusCodeToCss = (code: any) => {
    const toString = typeof code == 'string' ? code : `${code}`;
    if (toString.length == 0) {
        return ""
    }
    return `c${toString[0]}xx`;
}