import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  BarChart3,
  Hash,
  Settings,
  Users,
  Clock,
  FileText,
  TrendingDown,
  Zap,
  Target,
  Timer,
  Activity,
  MessageSquare,
  Bell,
  User,
  Shield,
  Plus,
  Search,
  HelpCircle,
  Keyboard,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  X,
  LogOut,
  Moon
} from 'lucide-react';
// import { Link, useLocation } from 'react-router-dom'; // TODO: Add routing later
import type { Board } from '../types';

// Types
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  badge?: number;
  children?: MenuItem[];
  isCollapsible?: boolean;
  permission?: string;
}

interface SidebarSection {
  id: string;
  title: string;
  items: MenuItem[];
  isCollapsible: boolean;
  defaultExpanded?: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  workspace: string;
  isOnline: boolean;
  permissions: string[];
  teamSize: number;
}

interface Notifications {
  total?: number;
  dashboard?: number;
  activity?: number;
  unreadMessages?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPath?: string;
  user: User;
  boards: Board[];
  notifications?: Notifications;
}

// Main Sidebar Component
export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  currentPath = '',
  user,
  boards,
  notifications = {}
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['workspace', 'boards'])
  );
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const menuSections: SidebarSection[] = [
    {
      id: 'main',
      title: 'Main',
      isCollapsible: false,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          href: '/dashboard'
        },
        {
          id: 'boards',
          label: 'All Boards',
          icon: Kanban,
          href: '/boards'
        },
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          href: '/analytics',
          permission: 'view_analytics'
        }
      ]
    },
    {
      id: 'boards',
      title: 'Your Boards',
      isCollapsible: true,
      defaultExpanded: true,
      items: boards.slice(0, 3).map(board => ({
        id: `board-${board.id}`,
        label: board.title,
        icon: Hash,
        href: `/board/${board.id}`
      }))
    },
    {
      id: 'team',
      title: 'Team',
      isCollapsible: true,
      items: [
        {
          id: 'team-members',
          label: 'Members',
          icon: Users,
          href: '/team/members',
          badge: user.teamSize
        },
        {
          id: 'activity',
          label: 'Activity',
          icon: Activity,
          href: '/activity'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      isCollapsible: true,
      items: [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          href: '/settings/profile'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Settings,
          href: '/settings'
        }
      ]
    }
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ 
        x: isOpen ? 0 : -280,
        width: isCollapsed ? 80 : 280 
      }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`
        fixed left-0 top-0 h-full sidebar border-r z-50
        ${isCollapsed ? 'w-20' : 'w-72'}
        flex flex-col overflow-hidden
      `}
    >
      {/* Sidebar Header */}
      <SidebarHeader 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onClose={onToggle}
      />

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar-dark">
        {menuSections.map(section => (
          <SidebarSection
            key={section.id}
            section={section}
            isCollapsed={isCollapsed}
            isExpanded={expandedSections.has(section.id)}
            onToggleExpand={() => toggleSection(section.id)}
            currentPath={currentPath}
            user={user}
          />
        ))}
      </div>

      {/* Sidebar Footer */}
      <SidebarFooter 
        user={user}
        isCollapsed={isCollapsed}
      />
    </motion.aside>
  );
};

// Sidebar Header Component
const SidebarHeader: React.FC<{
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}> = ({ isCollapsed, onToggleCollapse, onClose }) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Kanban className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-gray-900">ProjectFlow</h1>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftClose className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600 hover:text-gray-900 md:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar Section Component
const SidebarSection: React.FC<{
  section: SidebarSection;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  currentPath: string;
  user: User;
}> = ({ section, isCollapsed, isExpanded, onToggleExpand, currentPath, user }) => {
  // Filter items based on user permissions
  const visibleItems = section.items.filter(item => 
    !item.permission || user.permissions.includes(item.permission)
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="px-3 py-2">
      {/* Section Header */}
      {!isCollapsed && (
        <div className="flex items-center justify-between py-2 px-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {section.title}
          </h3>
          {section.isCollapsible && (
            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronDown
                className={`w-3 h-3 text-gray-500 transition-transform ${
                  isExpanded ? '' : '-rotate-90'
                }`}
              />
            </button>
          )}
        </div>
      )}

      {/* Section Items */}
      <AnimatePresence>
        {(isExpanded || !section.isCollapsible) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-1"
          >
            {visibleItems.map(item => (
              <SidebarMenuItem
                key={item.id}
                item={item}
                isCollapsed={isCollapsed}
                isActive={currentPath === item.href}
                level={0}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sidebar Menu Item Component
const SidebarMenuItem: React.FC<{
  item: MenuItem;
  isCollapsed: boolean;
  isActive: boolean;
  level: number;
}> = ({ item, isCollapsed, isActive, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else if (item.onClick) {
      item.onClick();
    }
  };

  const itemContent = (
    <div className={`
      flex items-center justify-between w-full px-3 py-2.5 rounded-lg
      transition-all duration-200 group
      ${isActive
        ? 'bg-blue-100 text-blue-700 font-medium'
        : 'text-gray-700 hover:bg-gray-100'
      }
      ${level > 0 ? 'ml-6 text-sm' : ''}
    `}>
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <Icon className={`
          w-5 h-5 flex-shrink-0
          ${isActive ? 'text-blue-600' : 'text-gray-500'}
        `} />
        
        {!isCollapsed && (
          <span className="truncate">
            {item.label}
          </span>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex items-center space-x-2">
          {/* Badge */}
          {item.badge && item.badge > 0 && (
            <span className={`
              px-2 py-0.5 text-xs font-medium rounded-full
              ${isActive
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
              }
            `}>
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}

          {/* Expand Arrow */}
          {hasChildren && (
            <ChevronDown className={`
              w-4 h-4 text-gray-500 transition-transform
              ${isExpanded ? '' : '-rotate-90'}
            `} />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Main Item */}
      <button onClick={handleClick} className="w-full text-left">
        {itemContent}
      </button>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-4"
            >
              {item.children!.map(child => (
                <SidebarMenuItem
                  key={child.id}
                  item={child}
                  isCollapsed={false}
                  isActive={false}
                  level={level + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// Sidebar Footer Component
const SidebarFooter: React.FC<{
  user: User;
  isCollapsed: boolean;
}> = ({ user, isCollapsed }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="border-t border-gray-200 p-3 bg-gray-50">
      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="flex items-center justify-between mb-3">
          <button
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors group"
            title="Create new board"
          >
            <Plus className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          </button>
          
          <button
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors group"
            title="Search everything"
          >
            <Search className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          </button>
          
          <button
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors group"
            title="Help & Support"
          >
            <HelpCircle className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          </button>
          
          <button
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors group"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>
      )}

      {/* User Profile */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`
            w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg
            transition-all duration-200
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-gray-300"
            />
            <div className={`
              absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
              ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}
            `} />
          </div>

          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role}
              </p>
            </div>
          )}

          {!isCollapsed && (
            <ChevronUp className={`
              w-4 h-4 text-gray-500 transition-transform
              ${showUserMenu ? '' : 'rotate-180'}
            `} />
          )}
        </button>

        {/* User Menu Dropdown */}
        <AnimatePresence>
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`
                absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200
                ${isCollapsed ? 'left-14 w-48' : 'left-0 right-0'}
                z-50
              `}
            >
              <div className="py-2">
                <UserMenuItem icon={User} label="Profile" />
                <UserMenuItem icon={Bell} label="Notifications" />
                <UserMenuItem icon={Settings} label="Settings" />
                <div className="border-t border-gray-200 my-2" />
                <UserMenuItem icon={HelpCircle} label="Help & Support" />
                <UserMenuItem icon={LogOut} label="Sign Out" danger />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// User Menu Item Component
const UserMenuItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  danger?: boolean;
}> = ({ icon: Icon, label, danger = false }) => {
  return (
    <button className={`
      w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors
      ${danger
        ? 'text-red-600 hover:bg-red-50'
        : 'text-gray-700 hover:bg-gray-100'
      }
    `}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

// Mobile Overlay Component
export const MobileSidebarOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}
    </AnimatePresence>
  );
};