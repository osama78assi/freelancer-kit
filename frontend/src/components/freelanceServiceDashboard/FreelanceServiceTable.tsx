import { useCallback, useEffect, useState } from "react";
import { Pagination, Spin, Table } from "antd";
import type { TableColumnsType } from "antd";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/base";
import {
    createFreelanceService,
    deleteFreelanceService,
    getFreelanceServices,
    updateFreelanceService,
} from "../../api/freelanceService";
import type {
    CreateFreelanceServiceBody,
    FreelanceService,
    UpdateFreelanceServiceBody,
} from "../../api/types";
import FreelanceServiceActions from "./FreelanceServiceActions";
import { currencySymbol } from "../../util/util";
import type { FreelanceTableProps } from "./types";
import { pageSizeOptions } from "../../util/util";
import TableConfig from "../util/TableConfig";

// antd shows an expand icon even for an empty children array, so remove those
function dropEmptyChildren(list: FreelanceService[]) {
    return list.map((service) => ({
        ...service,
        additionalServices: service.additionalServices?.length
            ? service.additionalServices
            : undefined,
    }));
}

// Replace the updated service wherever it is, at the root or nested under a parent
function replaceService(
    list: FreelanceService[],
    updated: FreelanceService,
): FreelanceService[] {
    return list.map((service) => {
        // In case the update happen for parent service
        if (service.id === updated.id) {
            return { ...service, ...updated };
        }

        // In case the update happen for additional service
        if (service.additionalServices) {
            return {
                ...service,
                additionalServices: replaceService(
                    service.additionalServices,
                    updated,
                ),
            };
        }

        return service;
    });
}

export default function FreelanceServiceTable({
    onSearchDone,
    query,
}: FreelanceTableProps) {
    const [services, setServices] = useState<FreelanceService[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const loadServices = useCallback(async () => {
        setLoading(true);
        try {
            const result = await getFreelanceServices({
                limit,
                from: page,
                q: query,
            });

            // The page can end up empty (e.g. after deleting its last row), step back
            if (result.services.length === 0 && page > 1) {
                setPage(page - 1);
                return;
            }

            setServices(dropEmptyChildren(result.services));
            setTotal(result.total);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);

            if (query) onSearchDone();
        }
    }, [page, limit, query]);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    // Delete, then reload the current page
    async function handleDelete(id: string) {
        try {
            const message = await deleteFreelanceService(id);
            toast.success(message);
            loadServices();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    // Update, then patch the row in the state without reloading
    async function handleUpdate(
        id: string,
        changes: UpdateFreelanceServiceBody,
    ) {
        try {
            const updated = await updateFreelanceService(id, changes);
            setServices((current) => replaceService(current, updated));
            toast.success("Service updated successfully");
            return true;
        } catch (error) {
            toast.error(getErrorMessage(error));
            return false;
        }
    }

    // The new child comes back nested under its parent, so reload the page
    async function handleAddAdditional(values: CreateFreelanceServiceBody) {
        try {
            await createFreelanceService(values);
            toast.success("Additional service added successfully");
            loadServices();
            return true;
        } catch (error) {
            toast.error(getErrorMessage(error));
            return false;
        }
    }

    function handlePageChange(newPage: number, newLimit: number) {
        // A new page size always starts again from the first page
        if (newLimit !== limit) {
            setLimit(newLimit);
            setPage(1);
            return;
        }

        setPage(newPage);
    }

    const columns: TableColumnsType<FreelanceService> = [
        { title: "Title", dataIndex: "title", key: "title", width: "25%" },
        { title: "Content", dataIndex: "content", key: "content" },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            width: 120,
            render: (value, record) => (
                <>
                    {value}{" "}
                    <span className="italic text-[0.6rem] font-semibold">
                        {currencySymbol(record.currency)}
                    </span>
                </>
            ),
        },
        // {
        //     title: "Currency",
        //     dataIndex: "currency",
        //     key: "currency",
        //     width: 110,
        // },
        {
            title: "Actions",
            key: "actions",
            width: 90,
            align: "center",
            render: (_, record) => (
                <FreelanceServiceActions
                    service={record}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    onAddAdditional={handleAddAdditional}
                />
            ),
        },
    ];

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2">
            {/* The table scrolls inside this box, the header stays sticky */}
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg">
                <div className="h-full overflow-auto">
                    <TableConfig>
                        <Table<FreelanceService>
                            rowKey="id"
                            columns={columns}
                            dataSource={services}
                            pagination={false}
                            sticky
                            expandable={{
                                childrenColumnName: "additionalServices",
                            }}
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
            <div className="flex justify-end">
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
