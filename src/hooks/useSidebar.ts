import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Start open so you can see it
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Keep sidebar open on desktop, closed on mobile
      if (mobile) {
        setIsOpen(false);
        setIsCollapsed(false);
      } else {
        setIsOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + \ to toggle sidebar
      if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
        event.preventDefault();
        toggle();
      }
      
      // Cmd/Ctrl + Shift + \ to toggle collapse
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === '\\') {
        event.preventDefault();
        toggleCollapse();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggle = () => setIsOpen(!isOpen);
  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return {
    isMobile,
    isOpen,
    isCollapsed,
    toggle,
    close,
    open,
    toggleCollapse
  };
};