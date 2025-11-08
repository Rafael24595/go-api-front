import { SystemProviders } from './store/Providers.tsx';
import AppRoutes from './routes/AppRoutes.tsx';
import { BrowserRouter } from 'react-router-dom';

import './App.css';

function App() {
  return (
    <>
      <BrowserRouter>
        <SystemProviders>
          <AppRoutes />
        </SystemProviders>
      </BrowserRouter>
    </>
  )
}

export default App
