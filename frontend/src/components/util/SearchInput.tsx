import type { SearchInputProps } from "./types";
import Search from "antd/es/input/Search";
import toast from "react-hot-toast";

export default function SearchInput({
    onSearch,
    loading,
    onClear,
    placeholder,
}: SearchInputProps) {
    return (
        <Search
            placeholder={placeholder}
            onSearch={(value) => {
                if (value.length === 0) return onClear();

                const trimmed = value.trim();
                if (trimmed.length === 0) {
                    toast.error("Please type something to search", {
                        position: "top-left",
                    });
                    return;
                }

                onSearch(trimmed);
            }}
            allowClear
            onClear={onClear}
            loading={loading}
            // suffix={<span className="cursor-pointer border-s border-s-border-light ps-0.5">clear</span>}
        />
    );
}
