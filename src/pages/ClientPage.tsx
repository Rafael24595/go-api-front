import { ClientBody } from "../components/body/client/ClientBody.tsx"
import { Footer } from "../components/footer/Footer.tsx"
import { Header } from "../components/header/Header.tsx"
import { joinMessages } from "../services/Utils.ts";
import { useStoreContext } from "../store/client/StoreProviderContext.tsx";
import { useStoreRequest } from "../store/client/StoreProviderRequest.tsx";
import { ClientProviders } from "../store/Providers.tsx"

function ClientPage() {
    return (
        <ClientProviders>
            <ContextedPage />
        </ClientProviders>
    )
}

function ContextedPage() {
    const request = useStoreRequest();
    const context = useStoreContext();

    const isEmptyUnsaved = () => {
        return request.cacheLenght() < 1 && context.cacheLenght() < 1;
    };

    const unsavedMessages = () => {
        return joinMessages(request.cacheComments(), context.cacheComments());
    };

    const unsaved = () => {
        return {
            isEmpty: isEmptyUnsaved,
            messages: unsavedMessages
        }
    }

    return (
        <>
            <Header unsaved={unsaved()} />
            <ClientBody />
            <Footer />
        </>
    )
}

export default ClientPage
