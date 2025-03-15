import { ReactNode } from 'react';
import './Modal.css'

interface ModalProps {
    title?: string
    width?: string
    height?: string
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode
}

export function Modal({ title, height, width, isOpen, onClose, children }: ModalProps) {
    if (!isOpen) {
        return null;
    }

    const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    };
  
    return (
      <div id="modal-area" onClick={handleBackgroundClick}>
        <div id="modal-container" style={{ height: height ? height : "auto", width: width ? width : "" }}>
          {title && (
            <div id="modal-title" className="border-bottom">
              <h3>{ title }:</h3>
          </div>
          )}
          <div id="modal-content">
            {children}
          </div>
          <div id="modal-buttons" className="border-top">
            <button
              onClick={onClose}>
                Close
            </button>
          </div>
        </div>
      </div>
    );
}