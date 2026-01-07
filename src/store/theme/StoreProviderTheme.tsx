import { createContext, Dispatch, ReactNode, RefObject, SetStateAction, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { StoreProviderStatusType, useStoreStatus } from "../StoreProviderStatus";
import { isIThemeData, ITheme, IThemeData, parseITheme, ThemeBase, ThemeDark, ThemeLight, Themes, ThemesDefault, ThemeTemplate, themeToCSS } from "./Themes";
import { Modal } from "../../components/utils/modal/Modal";
import { useAlert } from "../../components/utils/alert/Alert";
import { EAlertCategory } from "../../interfaces/AlertData";
import { downloadFile } from "../../services/Utils";
import { formatBytes, millisecondsToDate } from "../../services/Tools";
import { Dict } from "../../types/Dict";
import { Optional } from "../../types/Optional";
import { useStoreSession } from "../system/StoreProviderSession";
import { UserData } from "../../interfaces/system/UserData";
import { createRoot } from "react-dom/client";
import { windowPreferences } from "../../utils/Window";
import { WebData } from "../../interfaces/system/WebData";

const STORAGE_THEME_KEY = "StoreProviderThemeCache";
const TRIGGER_KEY = "StoreProviderThemeTrigger";

const CUSTOM_THEME = "custom-theme";

const CURSOR_LOCAL = "local";
const CURSOR_TEXT = "text";

const VALID_CURSORS = [CURSOR_LOCAL, CURSOR_TEXT];

interface StoreProviderThemeType {
  theme: string;
  isDark: () => boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleDefaultThemes: () => void;
  loadThemeWindow: (width: number, height: number, content: string | Blob | ReactNode) => void
}

interface Payload {
  isOpen: boolean;
  themeName: string;
  customName: string;
  theme: IThemeData | null
  file: File | null
  fileBlob: string
  fileType: string
}

interface TriggerContext {
  cache: StoreProviderStatusType,
  theme: {
    custom: RefObject<Dict<ITheme>>
    pushing: RefObject<boolean>
    set: Dispatch<SetStateAction<string>>
  }
  webData: {
    fetch: () => Promise<WebData>
  }
}

const StoreTheme = createContext<StoreProviderThemeType | undefined>(undefined);

export const StoreProviderTheme: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData, fetchWebData, pushTrigger, trimTrigger, updateWebData } = useStoreSession();
  const storeStatus = useStoreStatus();
  const { findAll, store, remove } = storeStatus;
  const { push } = useAlert();

  const waitingRef = useRef(false);
  const customRef = useRef<Dict<ITheme>>({});

  const [modalData, setModalData] = useState<Payload>({
    isOpen: false,
    themeName: "",
    customName: "",
    theme: null,
    file: null,
    fileBlob: "",
    fileType: ThemeBase.code
  });

  const [theme, setTheme] = useState("");

  const triggerContext = useMemo<TriggerContext>(() => ({
    cache: storeStatus,
    theme: {
      custom: customRef, pushing: waitingRef, set: setTheme
    },
    webData: { fetch: fetchWebData }
  }), []);

  useEffect(() => {
    pushTrigger(TRIGGER_KEY, onSessionChange);
    fetchCustomThemes();

    return () => {
      trimTrigger(TRIGGER_KEY);
    };
  }, []);

  useEffect(() => {
    if (userData.username == "") {
      return;
    }

    document.documentElement.setAttribute('data-theme', theme);

    setModalData((prevData) => ({
      ...prevData,
      themeName: theme
    }));

    waitingRef.current = true;

    const key = makeCacheKey(userData);
    store(key, theme);

    updateWebData({
      theme: theme
    }).then(() => {
      waitingRef.current = false;
    });
  }, [theme]);

  const onSessionChange = useCallback(async (userData: UserData) => {
    const theme = await findSyncThemeCode(triggerContext, userData);
    applyTheme(triggerContext, theme || ThemeBase.code);
  }, []);

  const fetchCustomThemes = () => {
    const cachedThemes = findAll(CUSTOM_THEME, {
      prefix: true,
      parser: parseITheme
    });

    const customThemes: Dict<ITheme> = {};
    for (const theme of cachedThemes) {
      customThemes[theme.code] = theme;
    }

    customRef.current = customThemes;
  }

  const findTheme = (themeName: string): Optional<ITheme> => {
    const themeDefault = ThemesDefault[themeName];
    if (themeDefault) {
      return themeDefault;
    }

    return Themes[themeName] || customRef.current[themeName];
  }

  const defineCustomTheme = (name: string, theme: IThemeData) => {
    const key = `${CUSTOM_THEME}-${name}`;

    if (ThemesDefault[key] || Themes[key]) {
      push({
        category: EAlertCategory.ERRO,
        content: `Cannot use the specified name: ${name}`
      });
      return "";
    }

    customRef.current[key] = {
      code: key,
      description: name,
      theme: theme,
    };

    store(key, theme, {
      stringifier: (v) => JSON.stringify(v)
    });

    return key;
  }

  const deleteCustomTheme = () => {
    remove(modalData.themeName);

    const exists = customRef.current[modalData.themeName];
    if (exists) {
      delete customRef.current[modalData.themeName];
    }

    setTheme(ThemeBase.code);
    setModalData((prevData) => ({
      ...prevData,
      themeName: ThemeBase.code
    }));
  }

  const isDark = () => {
    return theme == ThemeDark.code;
  }

  const toggleDefaultThemes = () => {
    setTheme(theme === ThemeLight.code ? ThemeDark.code : ThemeLight.code);
  }

  const loadThemeWindow = (width: number, height: number, content: string | Blob | ReactNode) => {
    let url = "";
    if (content instanceof Blob) {
      url = URL.createObjectURL(content);
    }

    const newWindow = window.open(url, '_blank', windowPreferences(width, height));
    if (!newWindow) {
      return;
    }

    if (typeof content == 'string') {
      newWindow.document.body.innerHTML = content;
    } else {
      const root = createRoot(newWindow.document.body);
      root.render(<>{content}</>);
    }

    newWindow.document.documentElement.setAttribute('data-theme', theme);

    document.querySelectorAll('link[rel="stylesheet"], style')
      .forEach(node => newWindow.document.head.appendChild(node.cloneNode(true)));
  }

  const openModal = async () => {
    setModalData((prevData) => ({
      ...prevData,
      isOpen: true
    }));
  }

  const closeModal = async () => {
    setModalData((prevData) => ({
      ...prevData,
      isOpen: false
    }));
  }

  const themeNameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModalData((prevData) => ({
      ...prevData,
      themeName: e.target.value
    }));
  };

  const customNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setModalData((prevData) => ({
      ...prevData,
      customName: e.target.value
    }));
  };

  const changeFileType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value;
    if (!VALID_CURSORS.includes(value)) {
      return;
    }

    setModalData((prevData) => ({
      ...prevData,
      theme: null,
      file: null,
      fileBlob: "",
      fileType: value
    }));
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files == null) {
      return;
    }

    const file = files[0];
    const theme = parseBlob(await file.text());
    if (theme == null) {
      resetFile();
      return;
    }

    setModalData((prevData) => ({
      ...prevData,
      file,
      theme
    }));
  };

  const resetFile = (): void => {
    setModalData((prevData) => ({
      ...prevData,
      theme: null,
      file: null,
      fileBlob: ""
    }));
  }

  const changeFileBlob = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setModalData((prevData) => ({
      ...prevData,
      fileBlob: e.target.value
    }));
  }

  const loadFileBlob = () => {
    const theme = parseBlob(modalData.fileBlob);
    if (theme == null) {
      resetFile();
      return;
    }

    const file = new File([modalData.fileBlob], "text", { type: "blob" });

    setModalData((prevData) => ({
      ...prevData,
      file,
      theme
    }));
  }

  const parseBlob = (blob: string) => {
    try {
      const data = JSON.parse(blob);
      if (isIThemeData(data)) {
        return data;
      }

      push({
        category: EAlertCategory.ERRO,
        content: `Invalid theme data format`
      });
    } catch (e) {
      push({
        category: EAlertCategory.ERRO,
        content: `Invalid format: ${e}`
      });
    }
    return null;
  }

  const applyChanges = async () => {
    let name = modalData.themeName;
    if (modalData.theme != null) {
      const key = defineCustomTheme(modalData.customName, modalData.theme);
      if (!key) {
        return;
      }

      name = key;
    }

    if (!applyTheme(triggerContext, name)) {
      push({
        category: EAlertCategory.ERRO,
        content: `Cannot load theme: ${name}`
      });
    }
  }

  const downloadTheme = () => {
    const theme = findTheme(modalData.themeName);
    if (theme) {
      downloadFile(theme.code, theme.theme);
      return;
    }

    push({
      category: EAlertCategory.ERRO,
      content: `Cannot download the theme ${modalData.themeName}`
    });
  }

  const downloadTemplate = async () => {
    downloadFile("theme-template", ThemeTemplate);
  };

  return (
    <StoreTheme.Provider value={{ theme, isDark, openModal, closeModal, toggleDefaultThemes, loadThemeWindow }}>
      {children}
      <Modal
        buttons={[
          {
            title: "Apply",
            type: "submit",
            callback: {
              func: applyChanges
            }
          },
          {
            title: "Close",
            callback: {
              func: closeModal
            }
          }
        ]}
        titleCustom={
          <span>Manage themes</span>
        }
        style={{
          width: "800px",
          height: "530px"
        }}
        isOpen={modalData.isOpen}
        onClose={closeModal}>
        <div id="form-group">
          <div className="form-fragment">
            <label htmlFor="theme-name">Theme:</label>
            <select name="theme-name" onChange={themeNameChange} value={modalData.themeName}>
              <option value={CUSTOM_THEME}>- Custom Theme -</option>
              <option disabled>---- DEFAULT ----</option>
              {Object.values(ThemesDefault).map(v => (
                <option key={v.code} value={v.code}>{v.description}</option>
              ))}
              <option disabled>---- PRELOAD ----</option>
              {Object.values(Themes).map(v => (
                <option key={v.code} value={v.code}>{v.description}</option>
              ))}
              {Object.keys(customRef.current).length > 0 && (
                <>(
                  <option disabled>---- STORAGE ----</option>
                  {Object.values(customRef.current).map(v => (
                    <option key={v.code} value={v.code}>{v.description}</option>
                  ))}
                  )</>
              )}
            </select>
          </div>
          {modalData.themeName == CUSTOM_THEME ? (
            <>
              <div className="form-fragment">
                <label htmlFor="collection-request-name">Theme name:</label>
                <input className="request-name-input" name="collection-request-name" type="text" onChange={customNameChange} placeholder="Theme name" value={modalData.customName} />
              </div>
              <div id="selector-container" className="extend">
                <div id="selector-type" className="line">
                  <label htmlFor="file-type">File: </label>
                  <select name="file-type" value={modalData.fileType} onChange={changeFileType}>
                    <option value={CURSOR_LOCAL}>Local</option>
                    <option value={CURSOR_TEXT}>Text</option>
                  </select>
                </div>
                <div id="selector-file">
                  {modalData.fileType == CURSOR_LOCAL && (
                    <>
                      <input type="file" onChange={handleFileChange} />
                      <button type="button" onClick={downloadTemplate} title="Download template">Template</button>
                    </>
                  )}
                  {modalData.fileType == CURSOR_TEXT && (
                    <>
                      <textarea value={modalData.fileBlob} onChange={changeFileBlob}></textarea>
                      <button type="button" onClick={loadFileBlob}>Load</button>
                    </>
                  )}
                </div>
              </div>
              {modalData.file && (
                <div>
                  <h3 className="selector-title">Metadata:</h3>
                  <div id="metadata-container">
                    <div className="metadata-fragment">
                      <p><span className="metadata-title">Name: </span> <span className="metadata-value">{modalData.file.name}</span></p>
                      <p><span className="metadata-title">Size: </span> <span className="metadata-value">{formatBytes(modalData.file.size)}</span></p>
                    </div>
                    <div className="metadata-fragment">
                      <p><span className="metadata-title">Type: </span> <span className="metadata-value">{modalData.file.type || "binary"}</span></p>
                      <p><span className="metadata-title">Modified: </span> <span className="metadata-value">{millisecondsToDate(modalData.file.lastModified)}</span></p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p id="actions-title">Actions:</p>
              <div className="form-fragment">
                <div className="actions-fragment">
                  <p>Download theme:</p>
                  <button type="button" onClick={downloadTheme}>Download</button>
                </div>
              </div>
              {customRef.current[modalData.themeName] && (
                <div className="form-fragment">
                  <div className="actions-fragment">
                    <p>Delete theme from local storage:</p>
                    <button type="button" onClick={deleteCustomTheme}>Delete</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </StoreTheme.Provider>
  );
};

const applyTheme = (ctx: TriggerContext, theme: string) => {
  const themeDefault = ThemesDefault[theme];
  if (themeDefault) {
    ctx.theme.set(themeDefault.code);
    return true;
  }

  const themeLazy = Themes[theme] || ctx.theme.custom.current[theme];
  if (themeLazy) {
    injectTheme(themeLazy);
    ctx.theme.set(themeLazy.code);
    return true;
  }

  return false;
}

const findSyncThemeCode = async (ctx: TriggerContext, userData: UserData): Promise<Optional<string>> => {
  if (ctx.theme.pushing.current) {
    return findCacheThemeCode(ctx, userData);
  }

  const webData = await ctx.webData.fetch();
  if (userData.username != webData.owner) {
    return;
  }

  return webData.data.theme || findCacheThemeCode(ctx, userData);
}

const findCacheThemeCode = (ctx: TriggerContext, userData: UserData) => {
  const key = makeCacheKey(userData);
  return ctx.cache.find(key, { def: ThemeLight.code });
}

const injectTheme = (theme: ITheme) => {
  const existingStyle = document.querySelector(`style[data-theme-name="${theme.code}"]`);
  const cssContent = themeToCSS(theme);

  document.documentElement.setAttribute("data-theme", theme.code);

  if (existingStyle) {
    existingStyle.textContent = cssContent;
    return;
  }

  const style = document.createElement('style');
  style.setAttribute('data-theme-name', theme.code);
  style.textContent = cssContent;
  document.head.appendChild(style);
}

const makeCacheKey = (userData: UserData) => {
  return `${STORAGE_THEME_KEY}-${userData.username}`
}

export const useStoreTheme = (): StoreProviderThemeType => {
  const context = useContext(StoreTheme);
  if (!context) {
    throw new Error("useStoreTheme must be used within a StoreProviderTheme");
  }
  return context;
};
