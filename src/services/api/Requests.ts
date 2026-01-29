import { Context } from "../../interfaces/client/context/Context";
import { Request } from "../../interfaces/client/request/Request";
import { CmdLocalApp } from "../../interfaces/system/Cmd";

export type Movement = "clone" | "move";

export interface RequestLogin {
	username: string
	password: string
}

export interface RequestSignin {
	username: string
	password_1: string
	password_2: string
	is_admin: boolean
}

export interface RequestAuthentication {
	old_password: string
	new_password_1: string
	new_password_2: string
}

export interface RequestImportContext {
	target: Context;
	source: Context;
}

export interface RequestCloneCollection {
	collection_name: string;
}

export interface RequestRequestCollect {
	source_id: string;
	target_id: string;
	target_name: string;
	request: Request;
	request_name: string;
	move: Movement;
}

export interface RequestSortNodes {
	nodes: RequestNode[]
}

export interface RequestNode {
	order: number
	item: string
}

export interface CmdCompPayload {
    cmd: string
    apps: CmdApp[]
}

export interface CmdApp {
    order: number
    flag: string
    help: string
}

export function localToCmdApp(local: CmdLocalApp): CmdApp {
	return {
		order: local.order,
		flag: local.flag,
		help: local.help
	}
}
