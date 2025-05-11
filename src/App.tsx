import './App.css'
import { Body } from './components/body/Body.tsx'
import { Footer } from './components/footer/Footer.tsx'
import { Header } from './components/header/Header.tsx'
import { Alert } from './components/utils/alert/Alert.tsx'
import { StoreProviderCache } from './store/StoreProviderCache.tsx'
import { StoreProviderStatus } from './store/StoreProviderStatus.tsx'
import { StoreProviderSession } from './store/StoreProviderSession.tsx'
import { StoreProviderContext } from './store/StoreProviderContext.tsx'
import { StoreProviderRequest } from './store/StoreProviderRequest.tsx'
import { StoreProviderTheme } from './store/theme/StoreProviderTheme.tsx'
import { StoreProviderSystem } from './store/system/StoreProviderSystem.tsx'

function App() {
  return (
    <>
      <Alert>
        <StoreProviderCache>
          <StoreProviderStatus>
              <StoreProviderSession>
                <StoreProviderTheme>
                  <StoreProviderSystem>
                        <StoreProviderContext>
                            <StoreProviderRequest>
                              <Header/>
                              <Body/>
                              <Footer/>
                            </StoreProviderRequest>
                        </StoreProviderContext>
                  </StoreProviderSystem>
                </StoreProviderTheme>
              </StoreProviderSession>
          </StoreProviderStatus>
        </StoreProviderCache>
      </Alert>
    </> 
  )
}

export default App
