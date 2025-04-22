import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchLogin, fetchLogout, fetchUserData } from "../services/api/ServiceManager";
import { newUserData, UserData } from "../interfaces/UserData";
import { pushInterceptor } from "../services/api/ApiManager";
import { Dict } from "../types/Dict";

interface StoreProviderSessionType {
  userData: UserData;
  loaded: boolean;
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  pushTrigger: (key: string, trigger: Trigger) => Promise<void>
}

type Trigger = () => void

interface Payload {
  userData: UserData;
  triggers: Dict<Trigger>
  loaded: boolean;
}

const StoreSession = createContext<StoreProviderSessionType | undefined>(undefined);

export const StoreProviderSession: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    userData: newUserData(),
    triggers: {},
    loaded: false
  });

  useEffect(() => {
    fetchUser();

    const interval = setInterval(() => {
      fetchUser();
    }, 10000);

    pushInterceptor(
      (response) => response,
      valideSession
    )

    return () => clearInterval(interval);
  }, []);

  const valideSession = (e: any) => {
    if (e.response && e.response.status === 401) {
      fetchLogout();
    }
  }

  const login = async (username: string, password: string) => {
    const userData = await fetchLogin(username, password);
    setData(prevData => ({
      ...prevData,
      userData: userData,
      loaded: true
    }));
    executeTriggers();
  };

  const logout = async () => {
    const userData = await fetchLogout();
    setData(prevData => ({
      ...prevData,
      userData: userData,
      loaded: true
    }));
    executeTriggers();
  };

  const fetchUser = async () => {
    const userData = await fetchUserData();
    setData(prevData => ({
      ...prevData,
      userData: userData,
      loaded: true
    }));
  };

  const executeTriggers = () => {
    Object.values(data.triggers).forEach(f => f());
  };

  const pushTrigger = async (key: string, trigger: Trigger) => {
    setData(prevData => ({
      ...prevData,
      triggers: {...prevData.triggers, [key]: trigger}
    }));
  };

  return (
    <StoreSession.Provider value={{ ...data, login, logout, fetchUser, pushTrigger }}>
      {data.loaded ? children : 
        <>
          <span className="loader"></span>
          <div id="blur-content">
            {children}
          </div>
        </>
      }
    </StoreSession.Provider>
  );
};

export const useStoreSession = (): StoreProviderSessionType => {
  const context = useContext(StoreSession);
  if (!context) {
    throw new Error("useStore must be used within a StoreProviderSession");
  }
  return context;
};
