import { Col, Row } from "antd";
import AppHeader from "../../appLayout/AppHeader";
import SearchInput from "../../components/util/SearchInput";
import type { SearchInputProps } from "../../components/util/types";

export default function PageHeader({
    onSearch,
    loading,
    onClear,
}: SearchInputProps) {
    return (
        <AppHeader>
            <Row
                gutter={12}
                className="flex w-full items-center justify-between"
            >
                <Col className="shrink flex-auto" xs={{ flex: "2%" }}>
                    <h1 className="m-0 text-lg font-semibold">Statistics</h1>
                </Col>

                <Col xs={{flex: "60%"}}>
                    <SearchInput
                        placeholder="Search by title and hit enter"
                        onSearch={onSearch}
                        loading={loading}
                        onClear={onClear}
                    />
                </Col>
            </Row>
        </AppHeader>
    );
}
