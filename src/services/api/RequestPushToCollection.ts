import { Request } from "../../interfaces/request/Request"

export interface RequestPushToCollection {
	collection_id:   string;
	collection_name: string;
	request:        Request;
	request_name:    string;
}