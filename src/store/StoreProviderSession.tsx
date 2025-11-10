import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { deleteUserToken, fetchAuthenticate, fetchLogin, fetchLogout, fetchRefresh, fetchRemove, fetchSignin, fetchTokenScopes, fetchUserData, fetchUserTokens, insertUserToken } from "../services/api/ServiceManager";
import { newUserData, UserData } from "../interfaces/UserData";
import { Dict } from "../types/Dict";
import { generateHash } from "../services/Utils";
import { putRefreshHandler } from "../services/api/ApiManager";
import { Scopes, Token } from "../interfaces/Token";

interface StoreProviderSessionType {
  userData: UserData;
  scopes: Scopes[];
  tokens: Token[];
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signin: (username: string, password1: string, password2: string, isAdmin: boolean) => Promise<void>
  remove: () => Promise<void>
  fetchUser: () => Promise<void>
  fetchTokens: () => Promise<void>
  insertToken: (token: Token) => Promise<string>
  deleteToken: (token: Token) => Promise<void>
  authenticate: (oldPassword: string, newPassword1: string, newPassword2: string) => Promise<void>
  checkSession: () => Promise<void>
  pushTrigger: (key: string, trigger: Trigger) => Promise<void>
}

type Trigger = (newUser: UserData, oldUser: UserData) => void

interface Payload {
  userData: UserData;
  hash: string;
  triggers: Dict<Trigger>
  loaded: boolean;
}

interface PayloadScopes {
  hash: string;
  scopes: Scopes[];
}

interface PayloadTokens {
  hash: string;
  tokens: Token[];
}

const StoreSession = createContext<StoreProviderSessionType | undefined>(undefined);

export const StoreProviderSession: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    userData: newUserData(),
    hash: "",
    triggers: {},
    loaded: false
  });

  const [dataScopes, setScopesData] = useState<PayloadScopes>({
    hash: "",
    scopes: [],
  });

  const [dataTokens, setTokensData] = useState<PayloadTokens>({
    hash: "",
    tokens: [],
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
    fetchScopes();
    fetchTokens();
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

  const checkSession = async () => {
    await fetchUser();
  };

  const refresh = async () => {
    const userData = await fetchRefresh();
    return defineUserData(userData, true);
  };

  const fetchScopes = async () => {
    await fetchTokenScopes()
      .then(async (scopes) => {
        defineScopes(scopes);
      }).catch((err) => {
        //TODO: Manage error.
        throw err;
      });
  };

  const fetchTokens = async () => {
    await fetchUserTokens()
      .then(async (tokens) => {
        defineTokens(tokens);
      }).catch((err) => {
        //TODO: Manage error.
        throw err;
      });
  };

  const insertToken = async (token: Token) => {
    const raw = await insertUserToken(token)
      .catch((err) => {
        //TODO: Manage error.
        throw err;
      });
    fetchTokens();
    return raw
  };

  const deleteToken = async (token: Token) => {
    await deleteUserToken(token)
      .catch((err) => {
        //TODO: Manage error.
        throw err;
      });
    fetchTokens();
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

    if (forceTriggers || newUser.username != oldUser.username) {
      executeTriggers(newUser, oldUser);
    }
  };

    const defineScopes = async (scopes: Scopes[]) => {
    scopes = scopes.sort((a, b) => b.code > a.code ? -1 : 1);

    const newHash = await generateHash(scopes);

    setScopesData(prevData => {
      if (prevData.hash === newHash) {
        return prevData;
      }

      return {
        scopes: scopes,
        hash: newHash,
      };
    });
  };

  const defineTokens = async (tokens: Token[]) => {
    tokens = tokens.sort((a, b) => b.timestamp - a.timestamp);

    const newHash = await generateHash(tokens);

    setTokensData(prevData => {
      if (prevData.hash === newHash) {
        return prevData;
      }

      return {
        tokens: tokens,
        hash: newHash,
      };
    });
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
    <StoreSession.Provider value={{
      ...data,
      scopes: dataScopes.scopes,
      tokens: dataTokens.tokens,
      login, logout, signin,
      remove, fetchUser, fetchTokens,
      insertToken, deleteToken, authenticate,
      checkSession, pushTrigger
    }}>
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
