import { Layout } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { Outlet } from "react-router-dom";
import AppSider from "./AppSider";
import { useState } from "react";

export default function AppLayout() {
    const [mediaMatched, setMediaMatched] = useState(false);

    return (
        <Layout className="h-dvh overflow-auto bg-primary-white! text-primary-black relative!">
            <AppSider setMediaMatched={setMediaMatched} />

            <Layout
                className={`${mediaMatched ? "ml-[80px] w-[75%-80px]" : "w-[75%]"} bg-inherit! overflow-auto`}
            >
                <Outlet />
            </Layout>
        </Layout>
    );
}
