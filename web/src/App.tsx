import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ThemeLoadingScreen } from "./components/ThemeLoadingScreen";
import AppRoutes from "./AppRoutes";
import "./App.css";

function AppContent() {
    const { isLoading } = useTheme();

    return (
        <>
            <ThemeProvider>
                <ThemeLoadingScreen isLoading={isLoading} />
                <AuthProvider>
                    <NotificationProvider>
                        <AppRoutes />
                    </NotificationProvider>
                </AuthProvider>
            </ThemeProvider>
        </>
    );
}

function App() {
    return <AppContent />;
}

export default App;
