import { Content } from "antd/es/layout/layout";
import FreelanceServiceTable from "../../components/freelanceServiceDashboard/FreelanceServiceTable";
import type { FreelanceTableProps } from "../../components/freelanceServiceDashboard/types";

export default function PageContent({onSearchDone, query}: FreelanceTableProps) {
    return (
        <Content className="flex min-h-0 flex-1 flex-col px-1.5 py-2">
            <FreelanceServiceTable onSearchDone={onSearchDone} query={query} />
        </Content>
    );
}
