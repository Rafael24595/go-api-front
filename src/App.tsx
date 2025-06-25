import { Body } from './components/body/Body.tsx';
import { Alert } from './components/utils/alert/Alert.tsx';
import { Footer } from './components/footer/Footer.tsx';
import { Header } from './components/header/Header.tsx';
import { StoreProviderCache } from './store/StoreProviderCache.tsx';
import { StoreProviderStatus } from './store/StoreProviderStatus.tsx';
import { StoreProviderSession } from './store/StoreProviderSession.tsx';
import { StoreProviderContext } from './store/StoreProviderContext.tsx';
import { StoreProviderRequest } from './store/StoreProviderRequest.tsx';
import { StoreProviderTheme } from './store/theme/StoreProviderTheme.tsx';
import { StoreProviderSystem } from './store/system/StoreProviderSystem.tsx';
import { StoreProviderRequests } from './store/StoreProviderRequests.tsx';

import './App.css';

function App() {
  return (
    <>
      <Alert>
        <StoreProviderStatus>
          <StoreProviderCache>
            <StoreProviderSession>
              <StoreProviderTheme>
                <StoreProviderSystem>
                  <StoreProviderRequests>
                    <StoreProviderContext>
                      <StoreProviderRequest>
                        <Header />
                        <Body />
                        <Footer />
                      </StoreProviderRequest>
                    </StoreProviderContext>
                  </StoreProviderRequests>
                </StoreProviderSystem>
              </StoreProviderTheme>
            </StoreProviderSession>
          </StoreProviderCache>
        </StoreProviderStatus>
      </Alert>
    </>
  )
}

export default App
