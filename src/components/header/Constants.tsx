import { ComboOption } from "../../interfaces/ComboOption";
import { hasRole, Role, UserData } from "../../interfaces/system/UserData";

export const ViewMenuIcon = (
    <div id="apps-button-menu">
        <div className="apps-menu-row">
            <span className="cube" />
            <span className="cube" />
            <span className="cube" />
        </div>
        <div className="apps-menu-row">
            <span className="cube" />
            <span className="cube" />
            <span className="cube" />
        </div>
        <div className="apps-menu-row">
            <span className="cube" />
            <span className="cube" />
            <span className="cube" />
        </div>
    </div>
)

export const viewOptions = (userData: UserData, actions: {
    goToClient: () => void;
    goToMock: () => void;
    tokenModal: () => void;
    themeModal: () => void;
}): ComboOption[] => {
    return [
        {
            label: "Client View",
            title: "Go to client view",
            name: "client",
            action: actions.goToClient
        },
        {
            label: "Mock View",
            title: "Go to mock view",
            name: "mock",
            action: actions.goToMock
        },
        {
            label: "Tokens Modal",
            title: "Show tokens modal",
            disable: hasRole(userData, Role.ROLE_ANONYMOUS),
            action: actions.tokenModal
        },
        {
            label: "Themes Modal",
            title: "Show themes modal",
            action: actions.themeModal
        }
    ]
}
