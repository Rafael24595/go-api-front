export interface SystemMetadata {
	session_id: string,
	session_time: number,
	core_name: string,
	core_version: string,
    core_replace: boolean,
	render_release: string,
    render_name: string,
	render_version: string
    front_name: string,
	front_version: string,
    viewer_sources: ViewerSource[]
}

export interface ViewerSource {
    name: string,
	route: string,
	description: string
}

export function emptySystemMetadata(): SystemMetadata {
    return {
        session_id: "", 
        session_time: 0,
        core_name: "",
        core_version: "",
        core_replace: false,
        render_release: "",
        render_name: "",
        render_version: "",
        front_name: "",
        front_version: "",
        viewer_sources: []
    }
}

export interface Record {
	category: string,
	message: string,
	timestamp: number
}
