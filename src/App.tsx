import './App.css'
import { Body } from './components/body/Body.tsx'
import { Footer } from './components/footer/Footer.tsx'
import { Header } from './components/header/Header.tsx'
import { Alert } from './components/utils/alert/Alert.tsx'
import { StoreProviderStatus } from './store/StoreProviderStatus.tsx'

function App() {
  return (
    <>
    <StoreProviderStatus>
      <Alert>
        <Header/>
        <Body/>
        <Footer/>
      </Alert>
    </StoreProviderStatus>
    </>
  )
}

export default App
