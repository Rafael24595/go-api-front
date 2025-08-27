import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { fetchAuthenticate, fetchLogin, fetchLogout, fetchRefresh, fetchRemove, fetchSignin, fetchUserData } from "../services/api/ServiceManager";
import { newUserData, UserData } from "../interfaces/UserData";
import { Dict } from "../types/Dict";
import { generateHash } from "../services/Utils";
import { putRefreshHandler } from "../services/api/ApiManager";

interface StoreProviderSessionType {
  userData: UserData;
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signin: (username: string, password1: string, password2: string, isAdmin: boolean) => Promise<void>
  remove: () => Promise<void>
  fetchUser: () => Promise<void>
  authenticate: (oldPassword: string, newPassword1: string, newPassword2: string) => Promise<void>
  pushTrigger: (key: string, trigger: Trigger) => Promise<void>
}

type Trigger = (newUser: UserData, oldUser: UserData) => void

interface Payload {
  userData: UserData;
  hash: string;
  triggers: Dict<Trigger>
  loaded: boolean;
}

const StoreSession = createContext<StoreProviderSessionType | undefined>(undefined);

export const StoreProviderSession: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    userData: newUserData(),
    hash: "",
    triggers: {},
    loaded: false
  });

  const userDataRef = useRef(data.userData);
  const triggersRef = useRef(data.triggers);
  const fetchingRef = useRef(false);

  useEffect(() => {
    fetchUserRetry();

    const interval = setInterval(() => {
      fetchUserRetry();
    }, 30 * 60 * 1000);

    putRefreshHandler(refresh);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    userDataRef.current = data.userData;
  }, [data.userData]);

  useEffect(() => {
    triggersRef.current = data.triggers;
  }, [data.triggers]);

  const login = async (username: string, password: string) => {
    const userData = await fetchLogin(username, password);
    return defineUserData(userData);
  };

  const logout = async () => {
    const userData = await fetchLogout();
    return defineUserData(userData);
  };

  const authenticate = async (oldPassword: string, newPassword1: string, newPassword2: string) => {
    const userData = await fetchAuthenticate(oldPassword, newPassword1, newPassword2);
    return defineUserData(userData);
  };

  const signin = async (username: string, password1: string, password2: string, isAdmin: boolean) => {
    await fetchSignin(username, password1, password2, isAdmin);
  };

  const remove = async () => {
    const userData = await fetchRemove();
    return defineUserData(userData);
  };

  const fetchUser = async () => {
    if (fetchingRef.current == true) {
      return;
    }

    fetchingRef.current = true;

    await fetchUserRetry();

    fetchingRef.current = false;
  };

  const fetchUserRetry = async (retry?: number) => {
    await fetchUserData()
      .then(async (newUser) => {
        defineUserData(newUser);
      }).catch((e) => {
        if (retry == undefined && e != undefined && e.statusCode == 401) {
          fetchUserRetry(1);
        }
      });
  };

  const refresh = async () => {
    const userData = await fetchRefresh();
    return defineUserData(userData, true);
  };

  const defineUserData = async (newUser: UserData, forceTriggers?: boolean) => {
    const newHash = await generateHash(newUser);
    const oldUser = userDataRef.current;

    setData(prevData => {
      if (prevData.hash === newHash) {
        return { 
          ...prevData, 
          loaded: true
        };
      }

      return {
        ...prevData,
        userData: newUser,
        hash: newHash,
        loaded: true,
      };
    });

    if(forceTriggers || newUser.username != oldUser.username) {
      executeTriggers(newUser, oldUser);
    }
  };

  const executeTriggers = (newUser: UserData, oldUser: UserData) => {
    Object.values(triggersRef.current).forEach(f => f(newUser, oldUser));
  };

  const pushTrigger = async (key: string, trigger: Trigger) => {
    setData(prevData => ({
      ...prevData,
      triggers: { ...prevData.triggers, [key]: trigger }
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
