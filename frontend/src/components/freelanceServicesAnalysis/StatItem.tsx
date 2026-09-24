import { Flex, Skeleton, Statistic } from "antd";
import type { ReactNode } from "react";

export default function StatItem({
    icon,
    stat,
    statTitle,
    loading,
}: {
    icon: ReactNode;
    stat: string;
    statTitle: string;
    loading: boolean;
}) {
    if (loading) {
        return <Skeleton.Node active={true} />;
    }

    return (
        <Flex
            className={`statistic-item border border-primary/50 bg-primary/2 rounded-md pe-3! gap-2`}
        >
            <Flex className="items-center p-1!">
                <div className="bg-primary/80 text-primary-white! rounded-sm p-0.5 px-1 h-[50px] w-[50px] text-2xl flex justify-center items-center">
                    {icon}
                </div>
            </Flex>

            <Flex className=" pt-1!">
                <Statistic
                    title={statTitle}
                    value={stat}
                    className="flex flex-col"
                />
            </Flex>
        </Flex>
    );
}
