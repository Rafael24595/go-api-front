import { v4 as uuidv4 } from 'uuid';
import { useEffect, useRef, useState } from "react";
import { Record } from "../../interfaces/Metadata";
import { fetchSystemRecords } from "../../services/api/ServiceManager";
import { generateHash } from "../../services/Utils";
import { millisecondsToDate } from "../../services/Tools";

import './Terminal.css';

interface PayloadRecords {
    hash: string;
    records: Record[];
}

const AUTH_LOG: Record = {
    category: "API_AUTH",
    message: "The user does not have privileges to view the logs.",
    timestamp: Date.now()
}

export function Log() {

    const [records, setRecords] = useState<PayloadRecords>({
        hash: "",
        records: []
    });

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchRecords();

        intervalRef.current = setInterval(() => {
            fetchRecords();
        }, 1000);

        return () => {
            unwatch();
        };

    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [records.records]);

    const unwatch = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }

    const fetchRecords = async () => {
        try {
            const records = await fetchSystemRecords();
            const newHash = await generateHash(records);

            setRecords((prevData) => {
                if (prevData.hash == newHash) {
                    return prevData;
                }

                return {
                    hash: newHash,
                    records: records
                };
            });
        } catch (error: any) {
            if (error.statusCode == 403) {
                console.error("The user does not have privileges to view the logs.");
                unwatch();
                setRecords({
                    hash: "",
                    records: [AUTH_LOG]
                });
                return;
            }
            console.error(error);
        }
    };

    const formatRecord = (record: Record) => {
        return `${millisecondsToDate(record.timestamp)} - [${record.category}]: ${record.message}`;
    }

    return (
        <div id="terminal">
            {records.records.map(r => (
                <span key={uuidv4()} className="terminal-output">
                    {formatRecord(r)}
                </span>
            ))}
            <div ref={bottomRef} />
        </div>
    )
}