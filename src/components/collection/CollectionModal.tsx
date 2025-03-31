import { useEffect, useState } from 'react';
import { Modal } from '../utils/modal/Modal';
import { Request } from '../../interfaces/request/Request';
import { useStoreRequests } from '../../store/StoreProviderRequests';

import './CollectionModal.css';

const NEW_COLLECTION = "";

interface CollectionModalProps {
    isOpen: boolean,
    request: Request,
    onSubmit(collectionId: string, collectionName: string, request: Request, requestName: string): Promise<void>,
    onClose: () => void,
}

interface Payload {
    collectionId: string;
    collectionName: string;
    requestName: string;
}

export function CollectionModal({ isOpen, request, onSubmit, onClose }: CollectionModalProps) {
    const { collection, fetchCollection } = useStoreRequests();

    const [data, setData] = useState<Payload>({
        collectionId: NEW_COLLECTION,
        collectionName: "",
        requestName: request.name,
    });

    useEffect(() => {
        setData(prevData => ({
            ...prevData,
            requestName: request.name,
            collection: NEW_COLLECTION,
            collectionName: "",
        }));
    }, [request]);

    const requestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prevData) => ({
            ...prevData,
            requestName: e.target.value
        }));
    };

    const collectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setData((prevData) => ({
            ...prevData,
            collectionId: e.target.value
        }));
    };

    const collectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData((prevData) => ({
            ...prevData,
            collectionName: e.target.value
        }));
    };

    const submitChanges = async () => {
       await onSubmit(data.collectionId, data.collectionName, request, data.requestName);
       await fetchCollection();
       onClose();
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
                        <input className="request-name-input" name="collection-request-name" type="text" onChange={requestNameChange} placeholder="Request name" value={data.requestName}/>
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
                        {data.collectionId == NEW_COLLECTION && (
                            <>
                                <label htmlFor="collection-request-name">New Collection:</label>
                                <input className="request-name-input" name="collection-request-name" type="text" onChange={collectionNameChange} placeholder="Collection name" value={data.collectionName}/>
                            </>
                        )}
                    </div>
                </div>
        </Modal>
    )
}
