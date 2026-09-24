import { ConfigProvider } from "antd";
import type { ReactNode } from "react";

export default function TableConfig({ children }: { children: ReactNode }) {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Table: {
                        rowExpandedBg: "green",
                        headerBg: "var(--color-secondary-white)",
                        colorBgContainer: "var(--color-primary-white)",
                        rowHoverBg: "var(--color-secondary-white-hover)",
                        borderColor: "var(--color-border-light)",
                    },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
}
