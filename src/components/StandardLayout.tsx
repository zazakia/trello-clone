import React, { useState } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  Users, 
  FileText, 
  BarChart3,
  Bell,
  Search,
  ChevronDown
} from 'lucide-react';

interface StandardLayoutProps {
  children: React.ReactNode;
}

export const StandardLayout: React.FC<StandardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar - Fixed */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          {/* Left Side - Logo and Mobile Menu */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded hover:bg-gray-100 lg:hidden"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                ProjectFlow
              </h1>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-2 ml-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Left Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                Navigation
              </h2>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded hover:bg-gray-100 lg:hidden"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <SidebarItem icon={Home} label="Dashboard" active />
            <SidebarItem icon={FileText} label="Projects" />
            <SidebarItem icon={BarChart3} label="Analytics" />
            <SidebarItem icon={Users} label="Team" />
            <SidebarItem icon={Settings} label="Settings" />
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              © 2024 ProjectFlow
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`
        transition-all duration-300 ease-in-out
        pt-16 lg:pl-64 min-h-screen
      `}>
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className={`
        bg-white border-t border-gray-200 py-4 px-6
        transition-all duration-300 ease-in-out
        lg:ml-64
      `}>
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
          <div>
            © 2024 ProjectFlow. All rights reserved.
          </div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sidebar Item Component
interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  badge?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active = false, 
  badge 
}) => {
  return (
    <button className={`
      w-full flex items-center justify-between px-3 py-2 rounded
      text-left transition-colors
      ${active
        ? 'bg-blue-100 text-blue-700 font-medium'
        : 'text-gray-700 hover:bg-gray-100'
      }
    `}>
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
};