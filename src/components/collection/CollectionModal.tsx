import { useEffect, useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { Request } from '../../interfaces/request/Request';
import { useStoreRequests } from '../../store/StoreProviderRequests';

import './CollectionModal.css';

const NEW_COLLECTION = "";

interface CollectionModalProps {
    isOpen: boolean,
    request: Request,
    onClose: () => void,
}

interface Payload {
    name: string;
    collection: string;
    newCollection: string;
}

export function CollectionModal({ isOpen, request, onClose }: CollectionModalProps) {
    const { collection } = useStoreRequests();

    const [data, setData] = useState<Payload>({
        name: request.name,
        collection: NEW_COLLECTION,
        newCollection: "",
    });

    useEffect(() => {
        setData(prevData => ({
            ...prevData,
            name: request.name,
            collection: NEW_COLLECTION,
            newCollection: "",
        }));
    }, [request]);

    const nameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prevData) => ({
            ...prevData,
            name: e.target.value
        }));
    };

    const collectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData((prevData) => ({
            ...prevData,
            collection: e.target.value
        }));
    };

    const submitChanges = async () => {
       //TODO: Define.
    }

    return (
        <Modal 
            buttons={[
                {
                    title: "Save",
                    callback: {
                        func: submitChanges
                    }
                },
                {
                    title: "Close",
                    callback: {
                        func: onClose
                    }
                }
            ]}  
            title={
                <span>Add to Collection</span>
            }
            width="45%"
            height="40%"
            isOpen={isOpen} 
            onClose={onClose}>
                <div id="form-group">
                    <div className="form-fragment">
                        <label htmlFor="collection-request-name">Name:</label>
                        <input className="request-name-input" name="collection-request-name" type="text" onChange={nameChange} placeholder="Request name" value={data.name}/>
                    </div>
                    <div className="form-fragment">
                        <label htmlFor="collection-request-parent">Collection:</label>
                        <select name="collection-request-parent" onChange={collectionChange}>
                            <option value={NEW_COLLECTION}>- New Collection -</option>
                            <option disabled>------------------</option>
                            {collection.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-fragment">
                        {data.collection == NEW_COLLECTION && (
                            <>
                                <label htmlFor="collection-request-name">New Collection:</label>
                                <input className="request-name-input" name="collection-request-name" type="text" onChange={nameChange} placeholder="Collection name" value={data.newCollection}/>
                            </>
                        )}
                    </div>
                </div>
        </Modal>
    )
}
