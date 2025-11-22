import { DEFAULT_RESPONSE } from '../../../../../interfaces/mock/Response';
import { millisecondsToDate, millisecondsToTime } from '../../../../../services/Tools';
import { useStoreEndPoint } from '../../../../../store/mock/StoreProviderEndPoint';

import './EndPointMetrics.css';

export function EndPointMetrics() {
    const { endPoint, metrics, fetchMetrics } = useStoreEndPoint();

    const totalUptime = () => {
        let time = 0;
        if (metrics.end_point != "") {
            time = metrics.total_uptime;
        }

        return millisecondsToTime(time);
    }

    const lastStarted = () => {
        if (metrics.end_point == "") {
            return ""
        }
        return millisecondsToDate(metrics.last_started);
    }

    const countResponses = () => {
        return Object.values(metrics.count_responses).reduce((p, c) => p + c, 0);
    }

    const minLatency = () => {
        return millisecondsToTime(metrics.min_latency);
    }

    const maxLatency = () => {
        return millisecondsToTime(metrics.max_latency);
    }

    const avgLatency = () => {
        return millisecondsToTime(metrics.avg_latency);
    }

    const makeResponseSign = (response: string): { name: string, timestamp?: number } => {
        const match = response.match(/^(.*)-(\d*)$/);
        if (!match || match.length < 3) {
            return { name: response }
        }

        return { name: match[1], timestamp: Number.parseInt(match[2]) }
    }

    const sortRequests = (a: [string, number], b: [string, number]) => {
        if (a[0].startsWith(`${DEFAULT_RESPONSE}-`)) {
            return -1;
        }
        return a[1] - b[1];
    }

    return (
        metrics.end_point == "" ? (
            <div id="empty-metrics-container">
                <p>- No Metrics Found -</p>
            </div>
        ) : (
            <div id="right-sidebar-metrics">
                <div className="end-point-metadata-title-container border-bottom">
                    <p className="end-point-metadata-title">Metrics «{endPoint.name}»:</p>
                </div>
                <table className="end-point-metrics-block">
                    <tbody>
                        <tr>
                            <td className="end-point-metrics-fragment-title">Uptime:</td>
                            <td>{totalUptime()}</td>
                        </tr>
                        <tr>
                            <td className="end-point-metrics-fragment-title">Started:</td>
                            <td>{lastStarted()}</td>
                        </tr>
                        <tr>
                            <td className="end-point-metrics-fragment-title">Count:</td>
                            <td>{countResponses()}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="end-point-metadata-title-container middle border-bottom">
                    <p className="end-point-metadata-title">Latency:</p>
                </div>
                <table className="end-point-metrics-block">
                    <tbody>
                        <tr>
                            <td className="end-point-metrics-fragment-title">Minumun latency:</td>
                            <td>{minLatency()}</td>
                        </tr>
                        <tr>
                            <td className="end-point-metrics-fragment-title">Maximum latency:</td>
                            <td>{maxLatency()}</td>
                        </tr>
                        <tr>
                            <td className="end-point-metrics-fragment-title">Average latency:</td>
                            <td>{avgLatency()}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="end-point-metadata-title-container middle border-bottom">
                    <p className="end-point-metadata-title">Responses [{Object.keys(metrics.count_responses).length}]:</p>
                </div>
                <div className="end-point-metrics-block">
                    <table id="responses-table">
                        <tbody>
                            <tr>
                                <th>Total</th>
                                <th>Name</th>
                                <th>Defined</th>
                            </tr>
                            {Object.entries(metrics.count_responses).sort(sortRequests).map(e => {
                                const sign = makeResponseSign(e[0]);
                                return (
                                    <tr>
                                        <td className="response-history-count">{e[1]}</td>
                                        <td className="response-history-name ">{sign.name}</td>
                                        {sign.timestamp && (
                                            <td className="response-history-timestamp">{millisecondsToDate(sign.timestamp)}</td>
                                        )}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                </div>
            </div >
        )
    );
}