import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { OrderProvider } from './context/OrderContext.jsx';
import { SidebarProvider } from './context/SidebarContext.jsx';
import { DeliveryProfileProvider } from './context/DeliveryProfileContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
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
  </StrictMode>,
)
