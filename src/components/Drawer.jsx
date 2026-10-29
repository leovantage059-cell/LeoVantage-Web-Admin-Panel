import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, children, footer, maxWidth = '560px' }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="drawer-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="drawer-panel" style={{ maxWidth }}>
        <div className="drawer-header">
          <h3 className="drawer-title">{title}</h3>
          <button
            onClick={onClose}
            className="icon-btn"
            style={{ width: '30px', height: '30px' }}
            aria-label="Close drawer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="drawer-body">
          {children}
        </div>

        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </div>
  );
}
