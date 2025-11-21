import { Dict } from "../../types/Dict";
import { ItemEndPoint } from "./EndPoint";

export interface Metrics {
    end_point: string;
    timestamp: number;
    modified: number;
    total_uptime: number;
    last_started: number;
    total_requests: number;
    count_responses: Dict<number>;
    min_latency: number;
    max_latency: number;
    avg_latency: number;
}

export const emptyMetrics = (endPoint: ItemEndPoint): Metrics => {
    return {
        end_point: endPoint._id,
        timestamp: 0,
        modified: 0,
        total_uptime: 0,
        last_started: 0,
        total_requests: 0,
        count_responses: {},
        min_latency: 0,
        max_latency: 0,
        avg_latency: 0
    }
}