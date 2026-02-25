import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { useOrders } from '../context/OrderContext';
import { useChat } from '../context/ChatContext';

const Layout = ({ children }) => {
  const { isCollapsed, isMobileOpen, closeMobileSidebar } = useSidebar();
  const { addMessageToActive } = useChat();

  return (
    <div className="min-h-screen flex transition-colors duration-500 bg-brand-background text-brand-text-primary">


      {/* Sidebar Overlay for Mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-20' : 'lg:ml-[260px]'}
      `}>
        <Header />
        <main className="flex-1 overflow-x-hidden p-0">
          {children}
        </main>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
