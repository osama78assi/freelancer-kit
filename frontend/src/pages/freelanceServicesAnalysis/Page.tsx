import { useState } from "react";
import PageContent from "./PageContent";
import PageHeader from "./PageHeader";

export default function Page() {
    const [loading, setLoading] = useState(false);
    const [serviceTitle, setServiceTitle] = useState<string | null>("");

    function handleSearch(title: string) {
        if (title === serviceTitle) return;

        setLoading(true);
        setServiceTitle(title);
    }

    return (
        <>
            <PageHeader
                loading={loading}
                placeholder="Search by entering title and hit enter"
                onClear={() => setServiceTitle(null)}
                onSearch={handleSearch}
            />
            <PageContent
                onSearchDone={() => setLoading(false)}
                serviceTitle={serviceTitle}
            />
        </>
    );
}
