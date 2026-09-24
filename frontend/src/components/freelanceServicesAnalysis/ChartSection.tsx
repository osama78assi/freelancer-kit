import { Collapse, ConfigProvider } from "antd";
import MainChart from "./MainChart";

export default function ChartSection() {
    return (
        <ConfigProvider
            theme={{ components: { Collapse: { contentBg: "trasnparent" } } }}
        >
            <Collapse
                className="chart-collapser"
                defaultActiveKey={"main-chart-summary"}
                bordered
                items={[
                    {
                        key: "main-chart-summary",
                        label: (
                            <h1 className="text-[1rem] self-center font-semibold">
                                Chart & Best 10 Services
                            </h1>
                        ),
                        children: <MainChart />,
                    },
                ]}
            />
        </ConfigProvider>
    );
}
