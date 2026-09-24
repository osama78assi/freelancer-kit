import { useCallback, useEffect, useState } from "react";
import { type Statistics } from "../../api/types";
import { pageSizeOptions, roundStr } from "../../util/util";
import { getStatistics } from "../../api/freelanceService";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/base";
import {
    Pagination,
    Spin,
    Table,
    type TableColumnsType,
} from "antd";
import type { StatisticsTableProps } from "./types";
import { currencySymbol } from "../../util/util";
import TableConfig from "../util/TableConfig";

export default function StatisticsTable({
    onSearchDone,
    serviceTitle,
}: StatisticsTableProps) {
    const [statistics, setStatistics] = useState<Statistics[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const loadStatistics = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getStatistics({
                limit,
                from: page,
                title: serviceTitle,
            });

            setStatistics(result.statistics);
            setTotal(result.total);
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);

            if (serviceTitle) onSearchDone();
        }
    }, [page, limit, serviceTitle]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    function handlePageChange(newPage: number, newLimit: number) {
        // A new page size always starts again from the first page
        if (newLimit !== limit) {
            setLimit(newLimit);
            setPage(1);
            return;
        }

        setPage(newPage);
    }

    /*
    highestPriceInService: string;
    lowestPriceInService: string;
    avgPriceInService: string;
    totalServicesCount: string;
     */
    const columns: TableColumnsType<Statistics> = [
        { title: "Title", dataIndex: "title", key: "title", width: "25%" },
        {
            title: "Hieghtest Price",
            dataIndex: "highestPriceInService",
            key: "highestPriceInService",
            render: (value, record) => (
                <>
                    {value}
                    <span className="italic text-[0.6rem] font-semibold">
                        {currencySymbol(record.currency)}
                    </span>
                </>
            ),
        },
        {
            title: "Lowest Price",
            dataIndex: "lowestPriceInService",
            key: "lowestPriceInService",
            render: (value, record) => (
                <>
                    {value}
                    <span className="italic text-[0.6rem] font-semibold">
                        {currencySymbol(record.currency)}
                    </span>
                </>
            ),
        },
        {
            title: "Average Price",
            dataIndex: "avgPriceInService",
            key: "avgPriceInService",
            render: (value, record) => (
                <>
                    {roundStr(value)}
                    <span className="italic text-[0.6rem] font-semibold">
                        {currencySymbol(record.currency)}
                    </span>
                </>
            ),
        },
        {
            title: "Total Count",
            dataIndex: "totalServicesCount",
            key: "totalServicesCount",
        },
    ];

    return (
        <div className="flex flex-col gap-2">
            <div className="relative flex-1 rounded-lg">
                <div className="h-full overflow-x-auto overflow-y-hidden">
                    <TableConfig>
                        <Table<Statistics>
                            rowKey="title"
                            columns={columns}
                            dataSource={statistics}
                            pagination={false}
                            sticky
                            bordered
                            className="min-w-[800px]"
                        />
                    </TableConfig>
                </div>

                {/* Overlay that blocks any interaction while loading */}
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-primary-white/60">
                        <Spin size="large" />
                    </div>
                )}
            </div>

            {/* Pagination is separate from the table */}
            <div className="flex justify-end py-2">
                <Pagination
                    size="small"
                    current={page}
                    pageSize={limit}
                    total={total}
                    pageSizeOptions={pageSizeOptions}
                    showSizeChanger
                    disabled={loading}
                    onChange={handlePageChange}
                />
            </div>
        </div>
    );
}
