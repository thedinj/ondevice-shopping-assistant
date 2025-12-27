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
import { cartOutline, listCircle, settings } from "ionicons/icons";
import { Suspense } from "react";
import { Redirect, Route } from "react-router-dom";
import AppErrorBoundary from "./components/AppErrorBoundary";
import LoadingFallback from "./components/LoadingFallback";
import { DatabaseProvider } from "./db/DatabaseContext";
import { LLMModalProvider } from "./llm/shared/LLMModalContext";
import Settings from "./pages/Settings";
import ShoppingList from "./pages/ShoppingList";
import StoreAislesPage from "./pages/StoreAislesPage";
import StoreDetail from "./pages/StoreDetail";
import StoreItemsPage from "./pages/StoreItemsPage";
import StoresList from "./pages/StoresList";

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
                    <Suspense fallback={<LoadingFallback />}>
                        <DatabaseProvider>
                            <LLMModalProvider>
                                <IonTabs>
                                    <IonRouterOutlet>
                                        <Route exact path="/stores">
                                            <StoresList />
                                        </Route>
                                        <Route exact path="/stores/:id">
                                            <StoreDetail />
                                        </Route>
                                        <Route exact path="/stores/:id/items">
                                            <StoreItemsPage />
                                        </Route>
                                        <Route exact path="/stores/:id/aisles">
                                            <StoreAislesPage />
                                        </Route>
                                        <Route exact path="/shoppinglist">
                                            <ShoppingList />
                                        </Route>
                                        <Route path="/settings">
                                            <Settings />
                                        </Route>
                                        <Route exact path="/">
                                            <Redirect to="/stores" />
                                        </Route>
                                    </IonRouterOutlet>
                                    <IonTabBar slot="bottom">
                                        <IonTabButton
                                            tab="stores"
                                            href="/stores"
                                        >
                                            <IonIcon
                                                aria-hidden="true"
                                                icon={cartOutline}
                                            />
                                            <IonLabel>Stores</IonLabel>
                                        </IonTabButton>
                                        <IonTabButton
                                            tab="shoppinglist"
                                            href="/shoppinglist"
                                        >
                                            <IonIcon
                                                aria-hidden="true"
                                                icon={listCircle}
                                            />
                                            <IonLabel>Basket</IonLabel>
                                        </IonTabButton>
                                        <IonTabButton
                                            tab="settings"
                                            href="/settings"
                                        >
                                            <IonIcon
                                                aria-hidden="true"
                                                icon={settings}
                                            />
                                            <IonLabel>Settings</IonLabel>
                                        </IonTabButton>
                                    </IonTabBar>
                                </IonTabs>
                            </LLMModalProvider>
                        </DatabaseProvider>
                    </Suspense>
                </AppErrorBoundary>
            </IonReactRouter>
        </IonApp>
    );
};

export default App;
