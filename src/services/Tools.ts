export function millisecondsToTime(ms: number): string {
    if(Number.isNaN(ms)) {
        return "";
    }

	const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const seconds = Math.floor(ms / 1000) % 60;
    const milliseconds = ms % 1000;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    if (seconds > 0) {
        return `${seconds}s`;
    }

    return `${milliseconds}ms`;
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
    if(bytes == null || Number.isNaN(bytes)) {
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
