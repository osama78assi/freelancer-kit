import type { Dispatch, ReactNode, SetStateAction } from "react";

export type AppSiderProps = {
    setMediaMatched: Dispatch<SetStateAction<boolean>>;
};

export type AppContentProps = {
    children: ReactNode;
    mediaMatched: boolean;
};

