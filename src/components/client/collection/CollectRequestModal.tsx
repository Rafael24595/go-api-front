import { useEffect, useState } from 'react';
import { Modal } from '../../utils/modal/Modal';
import { LiteRequest } from '../../../interfaces/client/request/Request';
import { useStoreCollections } from '../../../store/client/collection/StoreProviderCollections';

import './CollectRequestModal.css';

const NEW_COLLECTION = "";

interface CollectRequestModalProps {
    isOpen: boolean,
    request: LiteRequest,
    parent?: string,
    onSubmit(collectionId: string, collectionName: string, request: LiteRequest, requestName: string): Promise<void>,
    onClose: () => void,
}

interface Payload {
    collectionId: string;
    collectionName: string;
    requestName: string;
}

export function CollectRequestModal({ isOpen, request, parent, onSubmit, onClose }: CollectRequestModalProps) {
    const { collection } = useStoreCollections();

    const [data, setData] = useState<Payload>({
        collectionId: parent || NEW_COLLECTION,
        collectionName: "",
        requestName: request.name,
    });

    useEffect(() => {
        setData(prevData => ({
            ...prevData,
            requestName: request.name,
            collectionName: "",
        }));
    }, [request]);

    useEffect(() => {
        setData(prevData => ({
            ...prevData,
            collectionId: parent || NEW_COLLECTION,
        }));
    }, [parent]);

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
       onClose();
    }

    return (
        <Modal 
            buttons={[
                {
                    title: "Save",
                    type: "submit",
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
            titleCustom={
                <span>Add to Collection</span>
            }
            style={{
                width:"45%",
                height: "40%",
                maxWidth: "700px",
                maxHeight: "400px"
            }}
            isOpen={isOpen} 
            onClose={onClose}>
                <div id="form-group">
                    <div className="form-fragment">
                        <label htmlFor="collection-request-name">Name:</label>
                        <input className="request-name-input" name="collection-request-name" type="text" onChange={requestNameChange} placeholder="Request name" value={data.requestName}/>
                    </div>
                    <div className="form-fragment">
                        <label htmlFor="collection-request-parent">Collection:</label>
                        <select name="collection-request-parent" onChange={collectionChange} value={data.collectionId}>
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
