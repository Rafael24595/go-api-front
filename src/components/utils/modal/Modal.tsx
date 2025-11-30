import React, { ReactNode, useEffect } from 'react';
import { ModalButton } from '../../../interfaces/ModalButton';
import { executeCallback } from '../../../interfaces/Callback';

import './Modal.css';

interface ModalProps extends React.HTMLAttributes<HTMLFormElement> {
  titleCustom?: string | ReactNode
  isOpen: boolean,
  onClose: () => void,
  children: ReactNode
  buttons?: ModalButton[]
}

export function Modal({ titleCustom, isOpen, onClose, children, buttons, ...rest }: ModalProps) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <div id="modal-area" onClick={handleBackgroundClick}>
      <form id="modal-container"
        {...rest}
        style={{
          ...rest.style,
          height: rest.style?.height ? rest.style.height : "auto",
          width: rest.style?.width ? rest.style.width : "",
          minHeight: rest.style?.minHeight ? rest.style.minHeight : "300px",
          minWidth: rest.style?.minWidth ? rest.style.minWidth : "500px",
        }}
        onSubmit={handleSubmit}>
        {titleCustom && (
          <div id="modal-title" className="border-bottom">
            <h3>{titleCustom}</h3>
          </div>
        )}
        <div id="modal-content">
          {children}
        </div>
        <div id="modal-buttons" className="border-top">
          {buttons ? (
            buttons.map(b => (
              <button
                key={b.title}
                title={b.description || ''}
                type={b.type || 'button'}
                onClick={() => executeCallback(b.callback)}>
                {b.title}
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={onClose}>
              Close
            </button>
          )}

        </div>
      </form>
    </div>
  );
}