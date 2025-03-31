import { Request } from "../../interfaces/request/Request"

export interface RequestPushToCollection {
	source_id: string;
	target_id: string;
	target_name: string;
	request: Request;
	request_name: string;
	move: Movement;
}

export type Movement = "clone" | "move";
