import { Button, ConfigProvider, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import {
    BarChartOutlined,
    DesktopOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ReadOutlined,
} from "@ant-design/icons";
import { useEffect, useLayoutEffect, useState, useReducer } from "react";
import type { AppSiderProps } from "../types/appLayout.types";
import type { ItemType, MenuItemType } from "antd/es/menu/interface";
import { useLocation, useNavigate } from "react-router-dom";

export default function AppSider({ setMediaMatched }: AppSiderProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [collapsible, setCollapsible] = useState(false);
    const [collapsedStyle, setCollapsedStyle] = useState("");
    const [openKeys, setOpenKeys] = useState([""]);
    const nav = useNavigate();

    // Custom styles for app logo
    const [titleClasses, setTitleClasses] = useState("");

    // To sync the active items with the location
    const location = useLocation();
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    // Manage layout when media changes
    useLayoutEffect(() => {
        function updatedCollapsed() {
            const isMediaMatched =
                window.matchMedia("(max-width: 930px)").matches;

            // update parent match media
            setMediaMatched(isMediaMatched);

            // Toggle sidebar, make it absolute
            if (isMediaMatched) {
                setCollapsed(true);
                setCollapsible(true);
                setCollapsedStyle(
                    "absolute! left-0 top-0 bottom-0 shadow-sidebar z-[999]",
                );
                setTitleClasses("w-0!");
            } else if (!isMediaMatched) {
                setCollapsed(false);
                setCollapsible(false);
                setCollapsedStyle("");
                setTitleClasses("w-full!");
            }
        }

        window.addEventListener("resize", updatedCollapsed);
        updatedCollapsed();

        return () => window.removeEventListener("resize", updatedCollapsed);
    }, []);

    // Control app logo state
    useEffect(() => {
        if (collapsed) {
            setTitleClasses("w-0!");
        } else {
            setTitleClasses("w-full!");
        }
    }, [collapsed]);

    useEffect(() => {
        switch (location.pathname) {
            case "/freelance-services":
                setSelectedKeys(["freelance-services"]);
                setOpenKeys(["freelance-services-tab"]);
                break;
            case "/freelance-services/analysis":
                setSelectedKeys(["freelance-analysis"]);
                setOpenKeys(["freelance-services-tab"]);
                break;
            default:
                setSelectedKeys([]);
        }
    }, [location.pathname]);

    const sidebarItems: ItemType<MenuItemType>[] = [
        {
            key: "freelance-services-tab",
            icon: <ReadOutlined />,
            label: "Freelance Services",
            children: [
                {
                    key: "freelance-services",
                    icon: <DesktopOutlined />,
                    label: "Dashboard",
                    onClick: () => nav("/freelance-services"),
                },
                {
                    key: "freelance-analysis",
                    icon: <BarChartOutlined />,
                    label: "Anaylsis",
                    onClick: () => nav("/freelance-services/analysis"),
                },
            ],
        },
    ];

    return (
        <Sider
            className={`${collapsedStyle}  bg-inherit! border-e-border-light border-e ${!collapsed ? "w-[240px]! max-w-[240px]! min-w-[240px]!" : ""}`}
            collapsible={collapsible}
            collapsed={collapsed}
            // collapsedWidth={0}
            onCollapse={setCollapsed}
            trigger={null}
        >
            <div
                className={`h-[64px] w-full px-1.5 border-b border-b-border-light flex ${collapsed ? "justify-center" : "justify-between"} items-center`}
            >
                <h1
                    className={`transition-[width] overflow-hidden whitespace-nowrap ${titleClasses} text-xl font-semibold`}
                >
                    Freelancer Kit
                </h1>
                <Button
                    type="text"
                    icon={
                        collapsed ? (
                            <MenuUnfoldOutlined />
                        ) : (
                            <MenuFoldOutlined />
                        )
                    }
                    onClick={() => setCollapsed(!collapsed)}
                    className={`w-[50px]! h-[50px]! text-lg! transition-colors! bg-secondary-white! hover:bg-secondary-white-hover!`}
                />
            </div>

            <div className="px-1.5 py-2 overflow-auto">
                <ConfigProvider
                    theme={{
                        token: {
                            // Note: I tried to add the variable but for some reason antd refuses to use it
                            controlItemBgActive: "var(--color-secondary-white)",
                            controlItemBgHover: "var(--color-secondary-white)",
                        },
                    }}
                >
                    <Menu
                        className="sidebar-menu"
                        mode="inline"
                        inlineCollapsed={collapsed}
                        items={sidebarItems}
                        selectedKeys={selectedKeys}
                        openKeys={openKeys}
                        onOpenChange={setOpenKeys}
                    />
                </ConfigProvider>
            </div>
        </Sider>
    );
}
