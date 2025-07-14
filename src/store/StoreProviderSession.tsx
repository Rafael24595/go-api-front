import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchAuthenticate, fetchLogin, fetchLogout, fetchRemove, fetchSignin, fetchUserData } from "../services/api/ServiceManager";
import { newUserData, UserData } from "../interfaces/UserData";
import { Dict } from "../types/Dict";

interface StoreProviderSessionType {
  userData: UserData;
  loaded: boolean;
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signin: (username: string, password1: string, password2: string, isAdmin: boolean) => Promise<void>
  remove: () => Promise<void>
  fetchUser: () => Promise<void>
  authenticate: (oldPassword: string, newPassword1: string, newPassword2: string) => Promise<void>
  pushTrigger: (key: string, trigger: Trigger) => Promise<void>
}

type Trigger = (userData: UserData) => void

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
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, password: string) => {
    const userData = await fetchLogin(username, password);
    setData(prevData => ({
      ...prevData,
      userData: userData,
      loaded: true
    }));
    executeTriggers(userData);
  };

  const logout = async () => {
    const userData = await fetchLogout();
    setData(prevData => ({
      ...prevData,
      userData: userData,
      loaded: true
    }));
    executeTriggers(userData);
  };

  const authenticate = async (oldPassword: string, newPassword1: string, newPassword2: string) => {
    const userData = await fetchAuthenticate(oldPassword, newPassword1, newPassword2);
    setData(prevData => ({
      ...prevData,
      userData: userData,
      loaded: true
    }));
    executeTriggers(userData);
  };

  const signin = async (username: string, password1: string, password2: string, isAdmin: boolean) => {
    await fetchSignin(username, password1, password2, isAdmin);
  };

  const remove = async () => {
    const userData = await fetchRemove();
    setData(prevData => ({
      ...prevData,
      userData: userData,
      loaded: true
    }));
    executeTriggers(userData);
  };

  const fetchUser = async (intent?: number) => {
    await fetchUserData()
      .then((userData) => {
        if (userData.username != data.userData.username) {
          executeTriggers(userData);
        }
        
        setData(prevData => {
          return {
            ...prevData,
            userData: userData,
            loaded: true
          }
        });
      }).catch((e) => {
        if(intent == undefined && e != undefined && e.statusCode == 401) {
          fetchUser(1);
        }
      });
  };

  const executeTriggers = (userData: UserData, triggers?: Dict<Trigger>) => {
    triggers = triggers == undefined ? data.triggers : triggers;
    Object.values(triggers).forEach(f => f(userData));
  };

  const pushTrigger = async (key: string, trigger: Trigger) => {
    setData(prevData => ({
      ...prevData,
      triggers: {...prevData.triggers, [key]: trigger}
    }));
  };

  return (
    <StoreSession.Provider value={{ ...data, login, logout, signin, remove, fetchUser, authenticate, pushTrigger }}>
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
