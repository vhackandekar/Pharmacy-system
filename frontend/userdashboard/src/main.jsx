import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { OrderProvider } from './context/OrderContext.jsx';
import { SidebarProvider } from './context/SidebarContext.jsx';
import { DeliveryProfileProvider } from './context/DeliveryProfileContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';

import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <OrderProvider>
          <SidebarProvider>
            <DeliveryProfileProvider>
              <ChatProvider>
                <App />
              </ChatProvider>
            </DeliveryProfileProvider>
          </SidebarProvider>
        </OrderProvider>
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
)
