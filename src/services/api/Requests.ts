import { Context } from "../../interfaces/context/Context";
import { Request } from "../../interfaces/request/Request";

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

export interface RequestSortCollection {
	nodes: RequestCollectionNode[]
}

export interface RequestCollectionNode {
	order: number
	request: string
}
