import { useState } from "react";
import PageHeader from "./PageHeader";
import PageContent from "./PageContent";

export default function Page() {
    // Changing the key remounts the content, so the table reloads from page 1
    const [contentKey, setContentKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    function refreshTable() {
        setContentKey((key) => key + 1);
    }

    function handleSearch(query: string) {
        if (query === searchQuery) return;

        setLoading(true);
        setSearchQuery(query);
    }

    return (
        <div className="flex h-screen flex-col">
            <PageHeader
                placeholder="Enter service title and hit search"
                onSuccessAdding={refreshTable}
                onSearch={handleSearch}
                loading={loading}
                onClear={() => setSearchQuery(null)}
            />
            <PageContent
                key={contentKey}
                onSearchDone={() => setLoading(false)}
                query={searchQuery}
            />
        </div>
    );
}
