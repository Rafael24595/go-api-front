const MILLISECOND = { label: "ms", time: 1 };
const SECOND = { label: "s", time: 1000 };
const MINUTE = { label: "m", time: SECOND.time * 60 };
const HOUR = { label: "h", time: MINUTE.time * 60 };
const DAY = { label: "d", time: HOUR.time * 24 };
const YEAR = { label: "y", time: DAY.time * 365 };

export const TIME_UNITS = [YEAR, DAY, HOUR, MINUTE, SECOND, MILLISECOND];

export type TimeUnitLabel = typeof TIME_UNITS[number]["label"];

export function millisecondsToTime(ms: number, limit?: TimeUnitLabel): string {
    if (Number.isNaN(ms)) {
        return "";
    }

    const units = [YEAR, DAY, HOUR, MINUTE, SECOND, MILLISECOND];

    const parts: string[] = [];

    for (const u of units) {
        if (limit && u.label === limit) {
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
