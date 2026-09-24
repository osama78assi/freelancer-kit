import { Header } from "antd/es/layout/layout";
import type { ReactNode } from "react";

export default function AppHeader({ children }: { children: ReactNode }) {
    return (
        <Header className="bg-primary-white! h-[64px]! flex items-center justify-between w-full px-1.5! border-b border-b-border-light">
            {children}
        </Header>
    );
}
