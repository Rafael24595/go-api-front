import { useState, useRef, useEffect } from "react";
import { ComboOption } from "../../../interfaces/ComboOption";

import './Combo.css';

interface OptionsMenuProps {
  custom?: React.ReactNode;
  options: ComboOption[];
}

export const Combo = ({ custom, options }: OptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [yAxis, setYAxis] = useState<"bottom" | "top">("bottom");
  const [xAxis, setXAxis] = useState<"left" | "right">("left");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        boxRef.current !== event.target
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && menuRef.current && boxRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const boxRect = boxRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const yAxis = menuRect.bottom + boxRect.height > viewportHeight ? "top" : "bottom";
      setYAxis(yAxis);

      const xAxis = menuRect.left - boxRect.width < 0 ? "right" : "left";
      setXAxis(xAxis);
    }
  }, [isOpen]);

  const execute = (option: ComboOption) => {
    option.action();
    setIsOpen(false);
  }

  return (
    <div ref={menuRef} className="options-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="options-button"
      >
        {custom ? (
          <>
            { custom }
          </>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        )}
      </button>
      {isOpen && (
        <div
          ref={boxRef}
          className="options-menu"
          style={{
            bottom: yAxis === "top" ? "75%" : "auto",
            top: yAxis === "bottom" ? "75%" : "auto",
            marginBottom: yAxis === "top" ? "5px" : "0",
            marginTop: yAxis === "bottom" ? "5px" : "0",
            left: xAxis === "right" ? "80%" : "auto",
            right: xAxis === "left" ? "80%" : "auto",
          }}
        >
          {options.map((option, index) => (
            <button key={ index } onClick={ () => execute(option) } title={ option.title && option.title }>
              {option.icon && (
                <span className="option-icon">{ option.icon }</span>
              )}
              <span>{ option.label }</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
