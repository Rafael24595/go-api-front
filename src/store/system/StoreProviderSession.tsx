import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { deleteUserToken, fetchAuthenticate, fetchLogin, fetchLogout, fetchRefresh, fetchRemove, fetchSignin, fetchTokenScopes, fetchUserData, fetchUserTokens, fetchUserWebData, insertUserToken, resolveUserWebData } from "../../services/api/ServiceManager";
import { newUserData, UserData } from "../../interfaces/system/UserData";
import { Dict } from "../../types/Dict";
import { generateHash } from "../../services/Utils";
import { putRefreshHandler } from "../../services/api/ApiManager";
import { Scopes, Token } from "../../interfaces/system/Token";
import { emptyWebData, FormWebData, rawToWebData, RawWebData, WebData } from "../../interfaces/system/WebData";

interface StoreProviderSessionType {
  userData: UserData;
  webData: WebData;
  scopes: Scopes[];
  tokens: Token[];

  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signin: (username: string, password1: string, password2: string, isAdmin: boolean) => Promise<void>
  remove: () => Promise<void>

  fetchUser: () => Promise<void>
  fetchTokens: () => Promise<void>
  fetchWebData: () => Promise<WebData>

  insertToken: (token: Token) => Promise<string>
  deleteToken: (token: Token) => Promise<void>

  authenticate: (oldPassword: string, newPassword1: string, newPassword2: string) => Promise<void>
  checkSession: () => Promise<void>

  pushTrigger: (key: string, trigger: Trigger) => void
  trimTrigger: (key: string) => void

  updateWebData: (data: FormWebData) => Promise<boolean>
}

type Trigger = (newUser: UserData, oldUser: UserData) => void

interface Payload {
  hash: string;
  userData: UserData;
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

interface PayloadWebData {
  hash: string;
  webData: WebData;
}

const StoreSession = createContext<StoreProviderSessionType | undefined>(undefined);

export const StoreProviderSession: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Payload>({
    hash: "",
    userData: newUserData(),
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

  const [dataWeb, setDataWeb] = useState<PayloadWebData>({
    hash: "",
    webData: emptyWebData()
  });

  const userDataRef = useRef(data.userData);
  const triggersRef = useRef<Dict<Trigger>>({});
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
    fetchWebData();
  }, [data.userData]);

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

  const fetchWebData = async () => {
    return await fetchUserWebData()
      .then(async (raw) => {
        return defineWebData(raw);
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
        hash: newHash,
        userData: newUser,
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
        hash: newHash,
        scopes: scopes,
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
        hash: newHash,
        tokens: tokens,
      };
    });
  };

  const defineWebData = async (raw: RawWebData) => {
    const webData = rawToWebData(raw);

    const newHash = await generateHash(webData);

    setDataWeb(prevData => {
      if (prevData.hash === newHash) {
        return prevData;
      }

      return {
        hash: newHash,
        webData: webData,
      };
    });

    return webData;
  };

  const executeTriggers = (newUser: UserData, oldUser: UserData) => {
    Object.values(triggersRef.current).forEach(f => f(newUser, oldUser));
  };

  const pushTrigger = (key: string, trigger: Trigger) => {
    triggersRef.current[key] = trigger;
  };

  const trimTrigger = (key: string) => {
    delete triggersRef.current[key];
  };

  const updateWebData = async (data: FormWebData) => {
    const newWebData = {
      ...dataWeb.webData,
      data: {
        theme: data.theme || dataWeb.webData.data.theme
      }
    };

    return resolveUserWebData(newWebData)
      .then(r => {
        defineWebData(r);
        return true;
      })
      .catch(e => {
        console.error(e);
        return false;
      });
  };

  return (
    <StoreSession.Provider value={{
      ...data,
      scopes: dataScopes.scopes,
      tokens: dataTokens.tokens,
      webData: dataWeb.webData,
      login, logout, signin,
      remove, fetchUser, fetchTokens,
      fetchWebData, insertToken, deleteToken,
      authenticate, checkSession, pushTrigger,
      trimTrigger, updateWebData
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
