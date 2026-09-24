import { useEffect, useState } from "react";
import { type Statistics } from "../../api/types";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/base";
import { getBestStatistics } from "../../api/freelanceService";
import StatItem from "./StatItem";
import { FireOutlined } from "@ant-design/icons";
import { roundStr } from "../../util/util";
import { Skeleton } from "antd";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, YAxis } from "recharts";

export default function MainChart() {
    // Fetch the best statistics
    const [bestStats, setBestStats] = useState<Statistics[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBestStat() {
            setLoading(true);
            try {
                const data = await getBestStatistics();

                setBestStats(
                    data.map((stat) => ({
                        ...stat,
                        avgPriceInService: roundStr(stat.avgPriceInService),
                    })),
                );
            } catch (err) {
                toast.error(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        }

        fetchBestStat();
    }, []);

    // Send the top record to render four elements for each one
    // Render a bar chart with legend for the rest

    return (
        <div className="bg-transparent! flex flex-col gap-2">
            <div className="flex flex-col gap-2">
                <div>
                    {loading ? (
                        <div className="space-y-1">
                            <Skeleton.Node
                                className="w-full!"
                                active
                                classNames={{
                                    content: "w-full! h-[14px]! rounded-xs!",
                                }}
                            />
                            <Skeleton.Node
                                className="w-full!"
                                active
                                classNames={{
                                    content: "w-full! h-[14px]! rounded-xs!",
                                }}
                            />
                        </div>
                    ) : (
                        <h2 className="text-[0.9rem] font-semibold">
                            {bestStats.at(-1)?.title}
                        </h2>
                    )}
                </div>
                <div className="flex justify-evenly gap-2 overflow-auto">
                    <StatItem
                        icon={<FireOutlined />}
                        statTitle="Average Price"
                        stat={
                            roundStr(
                                bestStats.at(-1)?.avgPriceInService || "",
                            ) + bestStats.at(-1)?.currency
                        }
                        loading={loading}
                    />
                    <StatItem
                        icon={<FireOutlined />}
                        statTitle="Total Services Count"
                        stat={bestStats.at(-1)?.totalServicesCount as string}
                        loading={loading}
                    />
                    <StatItem
                        icon={<FireOutlined />}
                        statTitle="Highest Price"
                        stat={
                            (bestStats.at(-1)
                                ?.highestPriceInService as string) +
                            bestStats.at(-1)?.currency
                        }
                        loading={loading}
                    />
                    <StatItem
                        icon={<FireOutlined />}
                        statTitle="Lowest Price"
                        stat={
                            (bestStats.at(-1)?.lowestPriceInService as string) +
                            bestStats.at(-1)?.currency
                        }
                        loading={loading}
                    />
                </div>
            </div>

            <div className="h-[400px]">
                {loading ? (
                    <Skeleton.Node
                        classNames={{
                            root: "h-full! w-full!",
                            content: "w-full! h-full!",
                        }}
                        active
                    />
                ) : (
                    <BarChart
                        responsive
                        className="w-full h-full"
                        data={bestStats}
                    >
                        <Bar
                            dataKey={"highestPriceInService"}
                            name="Highest Price"
                            fill="var(--color-chart-orange)"
                            radius={4}
                            barSize={30}
                        />
                        <Bar
                            dataKey={"avgPriceInService"}
                            name="Average Price"
                            fill="var(--color-chart-green)"
                            radius={4}
                            barSize={30}
                        />
                        <Bar
                            dataKey={"lowestPriceInService"}
                            name="Lowest Price"
                            fill="var(--color-chart-purple)"
                            radius={4}
                            barSize={30}
                        />

                        <Tooltip />
                        <CartesianGrid />
                        <YAxis dataKey={"highestPriceInService"} />
                        <Legend wrapperStyle={{ paddingTop: "0.3rem" }} />
                    </BarChart>
                )}
            </div>
        </div>
    );
}
