import { ClientBody } from "../components/body/client/ClientBody.tsx"
import { Footer } from "../components/footer/Footer.tsx"
import { Header } from "../components/header/Header.tsx"
import { ClientProviders } from "../store/Providers.tsx"

function ClientPage() {
    return (
        <>
            <ClientProviders>
                <Header />
                <ClientBody />
                <Footer />
            </ClientProviders>
        </>
    )
}

export default ClientPage
