"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  LogOut,
} from 'lucide-react';
import { SmartAvatar } from '@/components/ui/SmartAvatar';

// Types
interface DropdownItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  divider?: boolean;
}

interface UserDropdownProps {
  userName: string;
  onLogout?: () => void;
}

// Custom hook for click outside
const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export const UserDropdown: React.FC<UserDropdownProps> = ({
  userName,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    closeDropdown();
    onLogout?.();
  }, [closeDropdown, onLogout]);

  const menuItems: DropdownItem[] = [
    { id: 'logout', label: 'Log out', icon: <LogOut size={18} />, onClick: handleLogout },
  ];

  useClickOutside(dropdownRef, closeDropdown);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
          hover:bg-gray-100 active:scale-95
          ${isOpen ? 'bg-gray-100' : ''}
        `}
        id="user-menu-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        <SmartAvatar
          useSignedInUser={true}
          size={32}
          className="border border-gray-200"
        />
        <span className="hidden md:inline max-w-40 truncate text-sm font-medium text-gray-900">{userName}</span>
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
          absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100
          transform transition-all duration-200 origin-top-right z-50
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
          }
        `}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="user-menu-button"
      >
        {/* Menu Items */}
        <div className="py-2">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              {item.divider && index > 0 && (
                <div className="my-2 border-t border-gray-100" role="separator" />
              )}
              <MenuItem
                item={item}
                isFocused={false}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else closeDropdown();
                }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/5 z-40 lg:hidden" 
          onClick={closeDropdown}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

// Sub-component for individual menu items
interface MenuItemProps {
  item: DropdownItem;
  isFocused: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isFocused, onClick }) => {
  const itemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.focus();
    }
  }, [isFocused]);

  const baseClasses = `
    w-full flex items-center justify-between px-4 py-2.5 text-sm
    transition-colors duration-150 outline-none
    ${item.danger 
      ? 'text-red-600 hover:bg-red-50' 
      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    }
    ${isFocused ? 'bg-gray-50' : ''}
  `;

  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className={`${item.danger ? 'text-red-500' : 'text-gray-500'}`}>
          {item.icon}
        </span>
        <span className="font-medium">{item.label}</span>
      </div>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className={baseClasses}
        role="menuitem"
        onClick={onClick}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={itemRef}
      onClick={onClick}
      className={baseClasses}
      role="menuitem"
      tabIndex={isFocused ? 0 : -1}
    >
      {content}
    </button>
  );
};

export default UserDropdown;
