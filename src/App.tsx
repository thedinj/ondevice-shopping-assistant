import {
    IonApp,
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
    setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { listCircle, settings, cartOutline } from "ionicons/icons";
import { Suspense } from "react";
import { Redirect, Route } from "react-router-dom";
import AppErrorBoundary from "./components/AppErrorBoundary";
import Stores from "./pages/Stores";
import Tab2 from "./pages/Tab2";
import Tab3 from "./pages/Tab3";
import { StoreDatabaseProvider } from "./state/StoreDatabaseContext";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
    return (
        <IonApp>
            <IonReactRouter>
                <AppErrorBoundary>
                    <Suspense fallback={<div>Loading...</div>}>
                        <StoreDatabaseProvider>
                            <IonTabs>
                                <IonRouterOutlet>
                                    <Route exact path="/stores">
                                        <Stores />
                                    </Route>
                                    <Route exact path="/tab2">
                                        <Tab2 />
                                    </Route>
                                    <Route path="/tab3">
                                        <Tab3 />
                                    </Route>
                                    <Route exact path="/">
                                        <Redirect to="/stores" />
                                    </Route>
                                </IonRouterOutlet>
                                <IonTabBar slot="bottom">
                                    <IonTabButton tab="stores" href="/stores">
                                        <IonIcon
                                            aria-hidden="true"
                                            icon={cartOutline}
                                        />
                                        <IonLabel>Stores</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="tab2" href="/tab2">
                                        <IonIcon
                                            aria-hidden="true"
                                            icon={listCircle}
                                        />
                                        <IonLabel>List</IonLabel>
                                    </IonTabButton>
                                    <IonTabButton tab="tab3" href="/tab3">
                                        <IonIcon
                                            aria-hidden="true"
                                            icon={settings}
                                        />
                                        <IonLabel>Settings</IonLabel>
                                    </IonTabButton>
                                </IonTabBar>
                            </IonTabs>
                        </StoreDatabaseProvider>
                    </Suspense>
                </AppErrorBoundary>
            </IonReactRouter>
        </IonApp>
    );
};

export default App;

