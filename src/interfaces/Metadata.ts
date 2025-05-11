export interface SystemMetadata {
	session_id: string,
	session_time: number,
	core_name: string,
	core_version: string,
    core_replace: boolean,
	render_name: string,
	render_version: string
}

export function emptySystemMetadata(): SystemMetadata {
    return {
        session_id: "", 
        session_time: 0,
        core_name: "",
        core_version: "",
        core_replace: false,
        render_name: "",
        render_version: "",
    }
}

export interface Record {
	category: string,
	message: string,
	timestamp: number
}
