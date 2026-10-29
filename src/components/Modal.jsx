import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = '620px' }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element
    const focusable = cardRef.current?.querySelectorAll('input, button, select, textarea');
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-card" ref={cardRef} style={{ maxWidth }}>
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">{title}</h3>
          <button
            onClick={onClose}
            className="icon-btn"
            style={{ width: '30px', height: '30px' }}
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          {children}
        </div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
