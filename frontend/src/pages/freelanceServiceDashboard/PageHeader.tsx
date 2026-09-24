import { Col, Row } from "antd";
import AppHeader from "../../appLayout/AppHeader";
import AddFreelanceService from "../../components/freelanceServiceDashboard/AddFreelanceService";
import SearchInput from "../../components/util/SearchInput";
import { type SearchInputProps } from "../../components/util/types";

interface PageHeaderProps extends SearchInputProps {
    onSuccessAdding: () => void;
}

export default function PageHeader({
    onSuccessAdding,
    onSearch,
    loading,
    onClear,
}: PageHeaderProps) {
    // In the future if we will have more than one action we need to make them as a menu in the small screen
    // const [collapse, setCollapse] = useState(false);

    // useEffect(() => {
    //     function handleMediaChange() {
    //         if (window.matchMedia("(max-width: 830px)").matches) {
    //             setCollapse(true);
    //         } else {
    //             setCollapse(false);
    //         }
    //     }

    //     window.addEventListener("resize", handleMediaChange);
    //     handleMediaChange();

    //     return () => window.removeEventListener("resize", handleMediaChange);
    // }, []);

    return (
        <AppHeader>
            <Row
                gutter={12}
                className="flex w-full items-center justify-between"
            >
                <Col className="shrink flex-auto" xs={{ flex: "2%" }}>
                    <h1 className="m-0 text-lg font-semibold">Dashboard</h1>
                </Col>

                <Col className="shrink" xs={{ flex: "auto" }}>
                    <SearchInput
                        placeholder="Search by title and hit enter"
                        onSearch={onSearch}
                        loading={loading}
                        onClear={onClear}
                    />
                </Col>

                <Col xs={{ flex: "4%" }} md={{ flex: "10%" }}>
                    <AddFreelanceService onSuccessAdding={onSuccessAdding} />
                </Col>
            </Row>
        </AppHeader>
    );
}
