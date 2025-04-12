import './App.css'
import { Body } from './components/body/Body.tsx'
import { Footer } from './components/footer/Footer.tsx'
import { Header } from './components/header/Header.tsx'
import { Alert } from './components/utils/alert/Alert.tsx'
import { StoreProviderCache } from './store/StoreProviderCache.tsx'
import { StoreProviderStatus } from './store/StoreProviderStatus.tsx'

function App() {
  return (
    <>
      <StoreProviderCache>
        <StoreProviderStatus>
          <Alert>
            <Header/>
            <Body/>
            <Footer/>
          </Alert>
        </StoreProviderStatus>
      </StoreProviderCache>
    </> 
  )
}

export default App
