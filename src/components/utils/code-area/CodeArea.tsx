import './CodeArea.css';

interface CodeAreaProps {
    code: string,
}

export const CodeArea = ({ code }: CodeAreaProps) => {
    
    return (
    <div className="terminal">
        <pre>{code}</pre>
    </div>
)};