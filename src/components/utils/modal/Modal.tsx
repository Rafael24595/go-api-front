import { ReactNode } from 'react';
import './Modal.css'
import { ModalButton } from '../../../interfaces/ModalButton';

interface ModalProps {
    title?: string
    width?: string
    height?: string
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode
    buttons?: ModalButton[]
}

export function Modal({ title, height, width, isOpen, onClose, children, buttons }: ModalProps) {
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
            {buttons ? (
              buttons.map(b => (
                <button
                  key={b.title}
                  type="button"
                  onClick={() => b.callback.func(b.callback.args)}>
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
        </div>
      </div>
    );
}