import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchUserData } from "../services/api/ServiceManager";
import { newUserData, UserData } from "../interfaces/UserData";

interface StoreProviderSessionType {
  userData: UserData;
  loaded: boolean;
  fetchUser: () => Promise<void>
}
interface Payload {
  userData: UserData;
  loaded: boolean;
}

const StoreSession = createContext<StoreProviderSessionType | undefined>(undefined);

export const StoreProviderSession: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    userData: newUserData(),
    loaded: false
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const userData = await fetchUserData();
    setData(prevData => ({
      ...prevData,
      userData: userData,
      loaded: true
    }));
  };

  return (
    <StoreSession.Provider value={{ ...data, fetchUser }}>
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
