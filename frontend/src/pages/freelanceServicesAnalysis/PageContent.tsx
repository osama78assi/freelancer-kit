import { Content } from "antd/es/layout/layout";
import ChartSection from "../../components/freelanceServicesAnalysis/ChartSection";
import StatisticsTable from "../../components/freelanceServicesAnalysis/StatisticsTable";
import type { StatisticsTableProps } from "../../components/freelanceServicesAnalysis/types";

export default function PageContent({
    onSearchDone,
    serviceTitle,
}: StatisticsTableProps) {
    return (
        <Content className="basis-full flex-col px-1.5 py-2 gap-2 space-y-10! overflow-auto">
            <ChartSection />

            <StatisticsTable
                onSearchDone={onSearchDone}
                serviceTitle={serviceTitle}
            />
        </Content>
    );
}
