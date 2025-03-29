import { newCollection } from '../../../../../interfaces/collection/Collection';
import { insertCollection } from '../../../../../services/api/ServiceStorage';
import { useStoreRequests } from '../../../../../store/StoreProviderRequests';

import './CollectionColumn.css';

export function CollectionColumn() {
    const { collection, fetchCollection } = useStoreRequests();

    const insertNewCollection = async () => {
        const name = prompt("New collection name:");
        if(name == null) {
            return;
        }
        
        const collection = newCollection("anonymous");
        collection.name = name;

        await insertCollection("anonymous", collection);
        await fetchCollection();
    }

    return (
        <>
            <button 
                type="button"
                className="column-option option-button border-bottom"
                onClick={() => insertNewCollection()}>
                <span>New</span>
            </button>
            <div id="actions-container">
                {collection.length > 0 ? (
                    collection.map((cursor) => (
                        <p>{cursor.name}</p>
                    ))
                ) : (
                    <p className="no-data"> - No Collections found - </p>
                )}
            </div>
        </>
    )
}