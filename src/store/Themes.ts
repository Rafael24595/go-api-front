interface IThemes {
    [key: string]: ITheme
}

export interface ITheme {
    code: string,
    description: string,
    theme: IThemeData
}

export interface IThemeData {
    "bg-color": string;
    "text-color": string;
    "border-color": string;
    "input-color": string;
    "option-disabled-color": string;
    "button-color": string;
    "button-border-color": string;
    "button-hover-color": string;
    "button-delete-color": string;
    "modal-color": string;
    "modal-button-color": string;
    "modal-border-color": string;
    "combo-color": string;
    "combo-hover-color": string;
    "combo-shadow-color": string;
    "selected-gutter": string;
    "selected-line": string;
    "string-color": string;
    "number-color": string;
    "boolean-color": string;
    "undefined-color": string;
    "tag-color": string;
    "scrollbar-track-color": string;
    "scrollbar-color": string;
    "scrollbar-hover-color": string;
    "landing-area-color": string;
}

export const isITheme = (obj: any): obj is ITheme => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.code === 'string' &&
        typeof obj.description === 'string' &&
        isIThemeData(obj.theme)
    );
};

export const isIThemeData = (obj: any): obj is IThemeData => {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }

    const templateKeys = Object.keys(ThemeTemplate);
    const objKeys = Object.keys(obj);

    return (
        templateKeys.length === objKeys.length &&
        templateKeys.every(key => typeof obj[key] === 'string')
    );
};

export const Themes: IThemes = {
    marine: {
        code: "marine",
        description: "Marine Go",
        theme: {
            "bg-color": "#1e2a38",
            "text-color": "#f8f8f2",
            "border-color": "#4a6a7b",
            "input-color": "#25313e",
            "option-disabled-color": "#9e9d9d",
            "button-color": "#395870",
            "button-border-color": "#6b93ad",
            "button-hover-color": "#e0e0e0",
            "button-delete-color": "#e74c3c",
            "modal-color": "#2f3f4f",
            "modal-button-color": "#5d6d7e",
            "modal-border-color": "#3d4d5d",
            "combo-color": "#3c4c5c",
            "combo-hover-color": "#4d5d6d",
            "combo-shadow-color": "#101820",
            "selected-gutter": "#95a5a6",
            "selected-line": "#ffffff1a",
            "string-color": "#ff6b81",
            "number-color": "#1abc9c",
            "boolean-color": "#3498db",
            "undefined-color": "#9b59b6",
            "tag-color": "#2ecc71",
            "scrollbar-track-color": "#555f68",
            "scrollbar-color": "#bdc3c7",
            "scrollbar-hover-color": "#ecf0f1",
            "landing-area-color": "#ffffff"
        }
    },
    ocean: {
        code: "ocean",
        description: "Ocean PostgreSQL",
        theme: {
            "bg-color": "#0b1d26",
            "text-color": "#f0f6f8",
            "border-color": "#254d5f",
            "input-color": "#112630",
            "option-disabled-color": "#7b99a5",
            "button-color": "#1f3a4c",
            "button-border-color": "#356678",
            "button-hover-color": "#e4f9ff",
            "button-delete-color": "#ff4f5e",
            "modal-color": "#1a2f3b",
            "modal-button-color": "#3c5c6f",
            "modal-border-color": "#2b4b5d",
            "combo-color": "#243f4f",
            "combo-hover-color": "#2e5567",
            "combo-shadow-color": "#0a1015",
            "selected-gutter": "#7aa0b4",
            "selected-line": "#ffffff1a",
            "string-color": "#ffa07a",
            "number-color": "#00ced1",
            "boolean-color": "#7ec8e3",
            "undefined-color": "#ad5edb",
            "tag-color": "#3ed39e",
            "scrollbar-track-color": "#4b6a7d",
            "scrollbar-color": "#a8c4cc",
            "scrollbar-hover-color": "#d4f0f8",
            "landing-area-color": "#eef9fb"
        }
    },
    desert: {
        code: "desert",
        description: "Desert Rust",
        theme: {
            "bg-color": "#2f1b0c",
            "text-color": "#ffe9d6",
            "border-color": "#a6623f",
            "input-color": "#3b2616",
            "option-disabled-color": "#bfa393",
            "button-color": "#cc7641",
            "button-border-color": "#e8945e",
            "button-hover-color": "#fff0e0",
            "button-delete-color": "#ff5c3d",
            "modal-color": "#4e2e1b",
            "modal-button-color": "#b37755",
            "modal-border-color": "#6c3e26",
            "combo-color": "#593620",
            "combo-hover-color": "#72482b",
            "combo-shadow-color": "#1a0d06",
            "selected-gutter": "#d6a178",
            "selected-line": "#ffffff1a",
            "string-color": "#ff9966",
            "number-color": "#ffc34d",
            "boolean-color": "#ffd699",
            "undefined-color": "#df8ef0",
            "tag-color": "#f5cb5c",
            "scrollbar-track-color": "#ac7d5c",
            "scrollbar-color": "#f2b899",
            "scrollbar-hover-color": "#ffe0c4",
            "landing-area-color": "#fff5ec"
        }
    },
    forest: {
        code: "forest",
        description: "Forest MongoDB",
        theme: {
            "bg-color": "#1b2d24",
            "text-color": "#e8f5e9",
            "border-color": "#40654a",
            "input-color": "#243c2f",
            "option-disabled-color": "#9ebfaf",
            "button-color": "#365e45",
            "button-border-color": "#578b6c",
            "button-hover-color": "#d6fbe3",
            "button-delete-color": "#ef5350",
            "modal-color": "#2c4636",
            "modal-button-color": "#4b7d5f",
            "modal-border-color": "#395e4a",
            "combo-color": "#3a5a46",
            "combo-hover-color": "#49745a",
            "combo-shadow-color": "#121f17",
            "selected-gutter": "#91bfa1",
            "selected-line": "#ffffff1a",
            "string-color": "#a5d6a7",
            "number-color": "#26c6da",
            "boolean-color": "#81d4fa",
            "undefined-color": "#ba68c8",
            "tag-color": "#80cbc4",
            "scrollbar-track-color": "#587d6a",
            "scrollbar-color": "#aedccf",
            "scrollbar-hover-color": "#e0f2f1",
            "landing-area-color": "#f0fdf4"
        }
    },
    tropical: {
        code: "tropical",
        description: "Tropical Clojure",
        theme: {
            "bg-color": "#0d3c49",
            "text-color": "#e1f7ff",
            "border-color": "#58a0b3",
            "input-color": "#184d57",
            "button-color": "#3a8e99",
            "button-border-color": "#5db6c6",
            "button-hover-color": "#c1f7ff",
            "button-delete-color": "#ff6666",
            "modal-color": "#1c5a67",
            "modal-button-color": "#5ca9b8",
            "modal-border-color": "#487983",
            "combo-color": "#2b4d56",
            "combo-hover-color": "#406e78",
            "combo-shadow-color": "#0a1f26",
            "selected-gutter": "#76b9c1",
            "selected-line": "#ffffff1f",
            "string-color": "#ff9b93",
            "number-color": "#16b79d",
            "boolean-color": "#f8b400",
            "undefined-color": "#ff73e5",
            "tag-color": "#66db66",
            "scrollbar-track-color": "#3a646c",
            "scrollbar-color": "#a1c8c9",
            "scrollbar-hover-color": "#c5f1f3",
            "landing-area-color": "#e0f8f9",
            "option-disabled-color": "#6a8890"
        }
    },
    autumn: {
        code: "autumn",
        description: "Autumn Java",
        theme: {
            "bg-color": "#2a1a0f",
            "text-color": "#f9e8c2",
            "border-color": "#6d4f4b",
            "input-color": "#3e2a1e",
            "button-color": "#b34d4d",
            "button-border-color": "#d2897c",
            "button-hover-color": "#ffbe96",
            "button-delete-color": "#e7432a",
            "modal-color": "#3b2e26",
            "modal-button-color": "#855c4d",
            "modal-border-color": "#6a4e3b",
            "combo-color": "#54352b",
            "combo-hover-color": "#6d4e3a",
            "combo-shadow-color": "#1a1108",
            "selected-gutter": "#d1a26a",
            "selected-line": "#ffffff1f",
            "string-color": "#ff8260",
            "number-color": "#b8cc00",
            "boolean-color": "#d1a458",
            "undefined-color": "#f3e4a6",
            "tag-color": "#ff9e2d",
            "scrollbar-track-color": "#5b3c2a",
            "scrollbar-color": "#f5c6b6",
            "scrollbar-hover-color": "#f9d7bd",
            "landing-area-color": "#fcf2e7",
            "option-disabled-color": "#bba392"
        }
    },
    twilight: {
        code: "twilight",
        description: "Twilight Typescript",
        theme: {
            "bg-color": "#282a36",
            "text-color": "#e0e1e7",
            "border-color": "#44475a",
            "input-color": "#37384a",
            "button-color": "#6272a4",
            "button-border-color": "#8be9fd",
            "button-hover-color": "#c3e8fb",
            "button-delete-color": "#ff5555",
            "modal-color": "#3b3f52",
            "modal-button-color": "#7289da",
            "modal-border-color": "#505f76",
            "combo-color": "#383d49",
            "combo-hover-color": "#4f5e6b",
            "combo-shadow-color": "#1e232e",
            "selected-gutter": "#6272a4",
            "selected-line": "#ffffff1f",
            "string-color": "#ff79c6",
            "number-color": "#bd93f9",
            "boolean-color": "#ffb86c",
            "undefined-color": "#ff6e6e",
            "tag-color": "#50fa7b",
            "scrollbar-track-color": "#4d5f72",
            "scrollbar-color": "#b9c9d2",
            "scrollbar-hover-color": "#a1bbcc",
            "landing-area-color": "#f8f9fc",
            "option-disabled-color": "#858a9b"
        }
    },
    sunrise: {
        code: "sunrise",
        description: "Sunrise Fortran",
        theme: {
            "bg-color": "#3a1d4e",
            "text-color": "#fff5d4",
            "border-color": "#6f3879",
            "input-color": "#3f1b46",
            "button-color": "#5d2a6d",
            "button-border-color": "#9f5397",
            "button-hover-color": "#f4e0fa",
            "button-delete-color": "#e84c7e",
            "modal-color": "#4b2d66",
            "modal-button-color": "#703e7f",
            "modal-border-color": "#5c2e68",
            "combo-color": "#4e2d5b",
            "combo-hover-color": "#673a74",
            "combo-shadow-color": "#1a111a",
            "selected-gutter": "#ae7ecf",
            "selected-line": "#ffffff1f",
            "string-color": "#ff9e5d",
            "number-color": "#c9d4ff",
            "boolean-color": "#c988ff",
            "undefined-color": "#f97bf0",
            "tag-color": "#ff9e9e",
            "scrollbar-track-color": "#7e4a82",
            "scrollbar-color": "#dab3d7",
            "scrollbar-hover-color": "#efdaf4",
            "landing-area-color": "#f8e3f8",
            "option-disabled-color": "#bda8c2"
        }
    },
    quartz: {
        code: "quartz",
        description: "Quartz Elixir",
        theme: {
            "bg-color": "#2a1a26",
            "text-color": "#ffeaf4",
            "border-color": "#8c4a70",
            "input-color": "#3b2435",
            "button-color": "#b25283",
            "button-border-color": "#d0709d",
            "button-hover-color": "#ffd4e8",
            "button-delete-color": "#ff6f91",
            "modal-color": "#4a2c3e",
            "modal-button-color": "#c96f98",
            "modal-border-color": "#7d4565",
            "combo-color": "#5c2d46",
            "combo-hover-color": "#824365",
            "combo-shadow-color": "#1c0e18",
            "selected-gutter": "#f1a7c7",
            "selected-line": "#ffffff1a",
            "string-color": "#ffa3b5",
            "number-color": "#ffbad2",
            "boolean-color": "#fcb8d2",
            "undefined-color": "#ea97de",
            "tag-color": "#ffccd5",
            "scrollbar-track-color": "#a15f7f",
            "scrollbar-color": "#f4b5ce",
            "scrollbar-hover-color": "#ffe1ef",
            "landing-area-color": "#fff1f7",
            "option-disabled-color": "#cfa4b8"
        }
    },
    dragon: {
        code: "dragon",
        description: "Dragon Pascal",
        theme: {
            "bg-color": "#0f0026",                  
            "text-color": "#fafffc",                
            "border-color": "#ff00cc",              
            "input-color": "#1c003f",               
            "button-color": "#00ffe7",              
            "button-border-color": "#00ff90",       
            "button-hover-color": "#fafffc",        
            "button-delete-color": "#ff006e",       
            "modal-color": "#240048",               
            "modal-button-color": "#ff6ec7",        
            "modal-border-color": "#00f7ff",        
            "combo-color": "#35005b",               
            "combo-hover-color": "#6f00a3",         
            "combo-shadow-color": "#02000a",        
            "selected-gutter": "#ff85e1",           
            "selected-line": "#ffffff20",           
            "string-color": "#fcbf49",              
            "number-color": "#00f0ff",              
            "boolean-color": "#fffb00",             
            "undefined-color": "#d100ff",           
            "tag-color": "#39ff14",                 
            "scrollbar-track-color": "#330033",     
            "scrollbar-color": "#ff00ff",           
            "scrollbar-hover-color": "#ffccff",     
            "landing-area-color": "#1a0033",        
            "option-disabled-color": "#a0529d"      
        }
    },
    vintage: {
        code: "vintage",
        description: "Vintage COBOL",
        theme: {
            "bg-color": "#f5f0e6",
            "text-color": "#3b322c",
            "border-color": "#a69888",
            "input-color": "#e8e0d1",
            "button-color": "#c3a384",
            "button-border-color": "#9f7f65",
            "button-hover-color": "#fff8f0",
            "button-delete-color": "#b75d5d",
            "modal-color": "#e3d6c3",
            "modal-button-color": "#ac9275",
            "modal-border-color": "#bba58e",
            "combo-color": "#d3bca2",
            "combo-hover-color": "#c2a285",
            "combo-shadow-color": "#6e6254",
            "selected-gutter": "#cab79e",
            "selected-line": "#00000010",
            "string-color": "#8c5e3c",
            "number-color": "#5b7365",
            "boolean-color": "#9a7750",
            "undefined-color": "#b983a6",
            "tag-color": "#688b76",
            "scrollbar-track-color": "#d2c3af",
            "scrollbar-color": "#aa947b",
            "scrollbar-hover-color": "#eee3d3",
            "landing-area-color": "#fdfaf4",
            "option-disabled-color": "#b8a79a"   
        }
    }
}

export const ThemeTemplate: IThemeData = {
    "bg-color": "#ffffff",
    "text-color": "#ffffff",
    "border-color": "#ffffff",
    "input-color": "#ffffff",
    "option-disabled-color": "#ffffff",
    "button-color": "#ffffff",
    "button-border-color": "#ffffff",
    "button-hover-color": "#ffffff",
    "button-delete-color": "#ffffff",
    "modal-color": "#ffffff",
    "modal-button-color": "#ffffff",
    "modal-border-color": "#ffffff",
    "combo-color": "#ffffff",
    "combo-hover-color": "#ffffff",
    "combo-shadow-color": "#ffffff",
    "selected-gutter": "#95a5a6",
    "selected-line": "#ffffff",
    "string-color": "#ffffff",
    "number-color": "#ffffff",
    "boolean-color": "#ffffff",
    "undefined-color": "#ffffff",
    "tag-color": "#ffffff",
    "scrollbar-track-color": "#ffffff",
    "scrollbar-color": "#ffffff",
    "scrollbar-hover-color": "#ffffff",
    "landing-area-color": "#ffffff"
}