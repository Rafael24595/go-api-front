import './BearerData.css'

interface BearerDataProps {
    values?: any
    onValueChange: (data: any) => void;
}

export function BearerData({values, onValueChange}: BearerDataProps) {
    console.log(values)
    return (
        <>
            <p>//TODO: Implement BearerData</p>
        </>
    )
}