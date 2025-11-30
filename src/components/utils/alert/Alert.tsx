import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { AlertData, AlertDataAsk, EAlertCategory } from "../../../interfaces/AlertData";
import { v4 as uuidv4 } from 'uuid';
import { executeCallback } from "../../../interfaces/Callback";
import { ModalButtonCallBack } from "../../../interfaces/ModalButton";

import './Alert.css';

interface AlertType {
  push: (alert: AlertData) => void;
  ask: (alert: AlertDataAsk) => void;
  remove: (alert: AlertData) => void;
}

interface Payload {
  pending: AlertData[],
  showing: AlertData[],
  executing: boolean,
}

const StoreContext = createContext<AlertType | undefined>(undefined);

export const Alert: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    pending: [],
    showing: [],
    executing: false
  });

  useEffect(() => {
    manage();
  }, [data.pending]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && data.showing.length > 0) {
        const lastAlert = data.showing[data.showing.length - 1];
        remove(lastAlert);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [data.showing]);

  const manage = () => {
    if (data.executing) {
      return
    }

    setData((prevData) => ({
      ...prevData,
      executing: true
    }));

    release();

    const id = setInterval(() => {
      if (data.showing.length > 3) {
        return;
      }

      release();

      if (data.pending.length == 0) {
        clearInterval(id);
      }
    }, 1000);

    setData((prevData) => ({
      ...prevData,
      executing: false
    }));
  };

  const push = (alert: AlertData) => {
    setData((prevData) => ({
      ...prevData,
      pending: [...prevData.pending, alert]
    }));
  }

  const ask = (ask: AlertDataAsk) => {
    push({
      title: ask.title,
      content: ask.content,
      category: EAlertCategory.QUES,
      buttons: ask.buttons,
      time: 5 * 60 * 1000
    });
  }

  const release = (): AlertData | undefined => {
    const newData = { ...data }
    const alert = newData.pending.shift();
    if (alert) {
      newData.showing.push(alert);
      setData(newData);
      setTimeout(() => {
        remove(alert);
      }, alert.time || 5000);
    }
    return alert;
  };

  const remove = (alert: AlertData) => {
    setData((currentData) => {
      const updatedData = { ...currentData };
      const index = updatedData.showing.indexOf(alert);
      if (index != -1) {
        updatedData.showing.splice(index, 1);
      }
      return updatedData;
    });
  }

  const callback = (alert: AlertData, callback: ModalButtonCallBack) => {
    executeCallback(callback);
    remove(alert);
  }

  return (
    <StoreContext.Provider value={{ push, ask, remove }}>
      <div id="alert-queue">
        {data.showing.map(a => (
          <div key={uuidv4()} className="alert-component">
            <div className="alert-title-container">
              <p className="alert-title"> {a.title ? (a.title) : "Alert"}</p>
              <span className="close-button" onClick={() => remove(a)}></span>
            </div>
            <div className="alert-content-container">
              {a.content}
            </div>
            {a.buttons && (
              <form id={uuidv4()} className="alert-buttons">
                {a.buttons.map(b => (
                  <button
                    key={b.title}
                    className="alert-button"
                    type={b.type}
                    autoFocus={b.type == "submit"}
                    onClick={() => callback(a, b.callback)}>
                    {b.title}
                  </button>
                ))}
              </form>
            )}
          </div>
        ))}
      </div>
      {children}
    </StoreContext.Provider>
  );
};

export const useAlert = (): AlertType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreContext");
  }
  return context;
};
