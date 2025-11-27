import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useStoreStatus } from "../StoreProviderStatus";
import { isITheme, isIThemeData, ITheme, IThemeData, Themes, ThemesDefault, ThemeTemplate } from "./Themes";
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

const STORAGE_THEME_KEY = "StoreProviderThemeCache";
const TRIGGER_KEY = "StoreProviderThemeTrigger";

const THEME_LIGHT = "light";
const THEME_DARK = "dark";

const DEFAULT_THEMES = [THEME_LIGHT, THEME_DARK];

const CUSTOM_THEME = "custom-theme";

const CURSOR_LOCAL = "local";
const CURSOR_TEXT = "text";

const VALID_CURSORS = [CURSOR_LOCAL, CURSOR_TEXT];

const DEFAULT_CURSOR = CURSOR_LOCAL;

interface StoreProviderThemeType {
  theme: string;
  isDark: () => boolean;
  openModal: () => void;
  closeModal: () => void;
  loadCustom: (themeName: string, themeObj: IThemeData) => void;
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

const StoreTheme = createContext<StoreProviderThemeType | undefined>(undefined);

export const StoreProviderTheme: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userData, pushTrigger } = useStoreSession();
  const { find, findAll, store, remove } = useStoreStatus();
  const { push } = useAlert();

  const [customThemes, setCustomThemes] = useState<Dict<ITheme>>({});

  const makeCacheKey = (userData: UserData) => {
    return `${STORAGE_THEME_KEY}-${userData.username}`
  }

  const [theme, setTheme] = useState(
    find(makeCacheKey(userData), {
      def: THEME_LIGHT
    })
  );

  const [modalData, setModalData] = useState<Payload>({
    isOpen: false,
    themeName: find(makeCacheKey(userData), {
      def: THEME_LIGHT
    }),
    customName: "",
    theme: null,
    file: null,
    fileBlob: "",
    fileType: DEFAULT_CURSOR
  });

  useEffect(() => {
    pushTrigger(TRIGGER_KEY, findSessionTheme);
    preloadCustomThemes();
    preloadCursorTheme();
  }, []);

  useEffect(() => {
    if (userData.username == "") {
      return;
    }

    store(makeCacheKey(userData), theme);
    document.documentElement.setAttribute('data-theme', theme);
    setModalData((prevData) => ({
      ...prevData,
      themeName: theme
    }));
  }, [theme]);

  const findSessionTheme = (userData: UserData) => {
    const theme = find(makeCacheKey(userData), {
      def: THEME_LIGHT
    });
    preloadCursorTheme(theme);
  }

  const preloadCustomThemes = async () => {
    const cachedThemes = findAll(CUSTOM_THEME, {
      prefix: true,
      parser: parseCache
    });

    const newCustomThemes: Dict<ITheme> = {};
    for (const theme of cachedThemes) {
      newCustomThemes[theme.code] = theme;
    }
    setCustomThemes(newCustomThemes);
  }

  const preloadCursorTheme = async (cursorTheme?: string) => {
    if (cursorTheme == undefined) {
      cursorTheme = theme;
    }

    if (DEFAULT_THEMES.includes(cursorTheme)) {
      setTheme(cursorTheme);
      return;
    }

    const themePreload = Themes[cursorTheme];
    if (themePreload) {
      loadCustom(themePreload.code, themePreload.theme);
      return;
    }

    const themeCache = find(cursorTheme, {
      def: ThemesDefault["light"],
      parser: parseCache
    });
    if (themeCache && typeof themeCache === 'object') {
      loadCustom(themeCache.code, themeCache.theme);
      return;
    }
  }

  const findTheme = (themeName: string): Optional<ITheme> => {
    const themeDefault = ThemesDefault[themeName];
    if (themeDefault) {
      return themeDefault;
    }

    const themePreload = Themes[themeName];
    if (themePreload) {
      return themePreload;
    }

    const customTheme = customThemes[modalData.themeName];
    if (customTheme) {
      return customTheme;
    }
  }

  const parseCache = (cache: string) => {
    try {
      const data = JSON.parse(cache);
      if (isITheme(data)) {
        return data;
      }
    } catch (e) {
      //
    }
    return null;
  }

  const isDark = () => {
    return theme == THEME_DARK;
  }

  const toggleDefaultThemes = () => {
    setTheme(prev => {
      return prev === THEME_LIGHT ? THEME_DARK : THEME_LIGHT;
    });
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

  const loadCustom = (themeName: string, themeObj: IThemeData) => {
    injectCustomTheme(themeName, themeObj);
    setTheme(themeName);
  }

  const injectCustomTheme = (themeName: string, themeObj: IThemeData) => {
    const existingStyle = document.querySelector(`style[data-theme-name="${themeName}"]`);
    const cssContent = jsonToCSS(themeName, themeObj);

    document.documentElement.setAttribute("data-theme", themeName);

    if (existingStyle) {
      existingStyle.textContent = cssContent;
      return;
    }

    const style = document.createElement('style');
    style.setAttribute('data-theme-name', themeName);
    style.textContent = cssContent;
    document.head.appendChild(style);
  }

  const jsonToCSS = (themeName: string, themeObj: IThemeData) => {
    const cssVars = Object.entries(themeObj)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');
    return `[data-theme="${themeName}"] {\n${cssVars}\n}`;
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

  const downloadTemplate = async () => {
    downloadFile("theme-template", ThemeTemplate);
  };

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
    if (DEFAULT_THEMES.includes(modalData.themeName)) {
      setTheme(modalData.themeName);
      return;
    }

    const theme = Themes[modalData.themeName];
    if (theme) {
      loadCustom(theme.code, theme.theme);
      return;
    }

    const customTheme = customThemes[modalData.themeName];
    if (customTheme) {
      loadCustom(customTheme.code, customTheme.theme);
      return;
    }

    if (modalData.theme != null) {
      applyCustomChanges(modalData.customName, modalData.theme);
      return;
    }

    push({
      category: EAlertCategory.ERRO,
      content: `Cannot load theme: ${modalData.themeName}`
    });
  }

  const applyCustomChanges = async (themeName: string, themeObj: IThemeData) => {
    if (DEFAULT_THEMES.includes(modalData.customName)) {
      push({
        category: EAlertCategory.ERRO,
        content: `Cannot use the specified name: ${modalData.customName}`
      });
      return;
    }

    const key = `${CUSTOM_THEME}-${themeName}`;

    loadCustom(key, themeObj);

    const themeData: ITheme = {
      code: key,
      description: modalData.customName,
      theme: themeObj,
    };

    store(key, themeData, {
      stringifier: (v) => JSON.stringify(v)
    });

    const newCustomThemes = { ...customThemes };
    newCustomThemes[themeData.code] = themeData;

    setCustomThemes(newCustomThemes);

    return;
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

  const deleteCustomTheme = () => {
    remove(modalData.themeName);
    const exists = customThemes[modalData.themeName];
    if (exists) {
      const newCustomThemes = { ...customThemes };
      delete newCustomThemes[modalData.themeName];
      setCustomThemes(newCustomThemes);
    }
    setTheme(THEME_LIGHT);
    setModalData((prevData) => ({
      ...prevData,
      themeName: THEME_LIGHT
    }));
  }

  return (
    <StoreTheme.Provider value={{ theme, isDark, openModal, closeModal, loadCustom, toggleDefaultThemes, loadThemeWindow }}>
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
              {Object.keys(customThemes).length > 0 && (
                <>(
                  <option disabled>---- STORAGE ----</option>
                  {Object.values(customThemes).map(v => (
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
              {customThemes[modalData.themeName] && (
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

export const useStoreTheme = (): StoreProviderThemeType => {
  const context = useContext(StoreTheme);
  if (!context) {
    throw new Error("useStoreTheme must be used within a StoreProviderTheme");
  }
  return context;
};
