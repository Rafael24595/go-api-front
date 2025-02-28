import './BasicData.css'

interface BasicProps {
    values?: any
    onValueChange: (data: any) => void;
}

export function BasicData({values, onValueChange}: BasicProps) {
    console.log(values)
    return (
        <>
            <p>//TODO: Implement BasicData</p>
        </>
    )
}