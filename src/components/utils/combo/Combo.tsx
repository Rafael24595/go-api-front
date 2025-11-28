import { useState, useRef, useEffect } from "react";
import { ComboOption } from "../../../interfaces/ComboOption";

import './Combo.css';

export type DisplayMode = "default" | "select"

interface OptionsMenuProps {
  custom?: React.ReactNode;
  mode?: DisplayMode,
  focus?: string;
  options: ComboOption[];
  optionStyle?: React.CSSProperties,
}

export const Combo = ({ custom, mode, focus, options, optionStyle }: OptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [yAxis, setYAxis] = useState<"bottom" | "top">("bottom");
  const [xAxis, setXAxis] = useState<"left" | "right">("left");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const isEmpty = options.filter(o => o.disable).length == options.length;

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        boxRef.current !== event.target
      ) {
        setIsOpen(false);
      }
    };

     document.addEventListener("keydown", handleEsc);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    }
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

  const calculateBottom = () => {
    if(mode == "select") {
      return yAxis === "top" ? "100%" : "auto"
    }
    return yAxis === "top" ? "80%" : "auto";
  }

  const calculateTop = () => {
    if(mode == "select") {
      return yAxis === "bottom" ? "100%" : "auto"
    }
    return yAxis === "bottom" ? "80%" : "auto";
  }

  const calculateLeft = () => {
    if(mode == "select") {
      return xAxis === "right" ? "0%" : "auto";
    }
    return xAxis === "right" ? "75%" : "auto";
  }

  const calculateRight = () => {
    if(mode == "select") {
      return xAxis === "left" ? "0%" : "auto";
    }
    return xAxis === "left" ? "75%" : "auto";
  }

  const calculateMarginTop = () => {
    if(mode == "select") {
      return "2px"
    }
    return yAxis === "top" ? "5px" : "0";
  }

  const calculateMarginBottom = () => {
    if(mode == "select") {
      return "2px"
    }
    return yAxis === "bottom" ? "5px" : "0";
  }

  return (
    <div ref={menuRef} className="options-container">
      <button
        onClick={() => !isEmpty && setIsOpen(!isOpen)}
        className={`options-button ${isEmpty ? "disabled" : ""}`}
        disabled={isEmpty}
      >
        {custom ? (
          <>
            { custom }
          </>
        ) : (
          <svg className="combo-svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
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
            ...optionStyle,
            bottom: calculateBottom(),
            top: calculateTop(),
            left: calculateLeft(),
            right: calculateRight(),
            marginBottom: calculateMarginBottom(),
            marginTop: calculateMarginTop(),
          }}
        >
          {options.map((option, index) => (
            !option.disable && (
              <button 
                key={ index } 
                className={`${ focus && option.name == focus ? "selected-combo-option" : "" }`}
                onClick={ () => execute(option) } title={ option.title && option.title }>
                {option.icon && (
                  <span className="option-icon">{ option.icon }</span>
                )}
                <span>{ option.label }</span>
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};
