import { Navigate, Route, Routes } from "react-router-dom";
import FreelanceServiceDashboard from "./pages/freelanceServiceDashboard/Page";
import FreelanceServiceAnalysis from "./pages/freelanceServicesAnalysis/Page";
import AppLayout from "./appLayout/AppLayout";
import { Toaster } from "react-hot-toast";
import { ConfigProvider } from "antd";

function App() {
    return (
        <>
            <ConfigProvider
                theme={{
                    token: {
                        colorPrimary: "#2284a1",
                    },
                }}
            >
                <Routes>
                    <Route path="/" element={<AppLayout />}>
                        <Route
                            path="/"
                            element={<Navigate to={"/freelance-services"} />}
                        />
                        <Route
                            path="/freelance-services"
                            element={<FreelanceServiceDashboard />}
                        />
                        <Route
                            path="/freelance-services/analysis"
                            element={<FreelanceServiceAnalysis />}
                        />
                    </Route>
                </Routes>

                <Toaster position="top-center" />
            </ConfigProvider>
        </>
    );
}

export default App;