import { MockBody } from "../components/body/mock/MockBody.tsx"
import { Footer } from "../components/footer/Footer.tsx"
import { Header } from "../components/header/Header.tsx"
import { joinMessages } from "../services/Utils.ts";
import { useStoreEndPoint } from "../store/mock/endpoint/StoreProviderEndPoint.tsx";
import { MockProviders } from "../store/Providers.tsx"

function MockPage() {
    return (
        <>
            <MockProviders>
                <ContextedPage />
            </MockProviders>
        </>
    )
}

function ContextedPage() {
    const endPoint = useStoreEndPoint();

    const isEmptyUnsaved = () => {
        return endPoint.cacheLenght() < 1;
    };

    const unsavedMessages = () => {
        return joinMessages(endPoint.cacheComments());
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
            <MockBody />
            <Footer />
        </>
    )
}

export default MockPage
