import { Body } from "../components/body/Body.tsx"
import { Footer } from "../components/footer/Footer.tsx"
import { Header } from "../components/header/Header.tsx"
import { ClientProviders } from "../store/Providers.tsx"

function ClientPage() {
    return (
        <>
            <ClientProviders>
                <Header />
                <Body />
                <Footer />
            </ClientProviders>
        </>
    )
}

export default ClientPage
