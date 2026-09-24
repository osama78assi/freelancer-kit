import { useState } from "react";
import { Dropdown, Modal } from "antd";
import type { MenuProps } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    MoreOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons";
import type { CreateFreelanceServiceBody } from "../../api/types";
import FreelanceServiceForm from "./FreelanceServiceForm";
import type {
    FreelanceServiceActionsProps,
    FreelanceServiceFormValues,
} from "./types";

// The trailing "!" makes Tailwind win over antd's own hover styles on menu items
const itemClass = "hover:bg-secondary-white-hover! hover:text-primary!";
const dangerClass = "hover:bg-red-50! hover:text-red-600!";

export default function FreelanceServiceActions({
    service,
    onDelete,
    onUpdate,
    onAddAdditional,
}: FreelanceServiceActionsProps) {
    const [openModal, setOpenModal] = useState<"edit" | "add" | null>(null);
    const [modal, contextHolder] = Modal.useModal();

    function closeModal() {
        setOpenModal(null);
    }

    function confirmDelete() {
        modal.confirm({
            title: "Delete service",
            content: `Are you sure you want to delete "${service.title}"?`,
            okText: "Delete",
            okButtonProps: { danger: true },
            // Returning the promise keeps the button loading until the request ends
            onOk: () => onDelete(service.id),
        });
    }

    async function handleEdit(changes: FreelanceServiceFormValues) {
        const success = await onUpdate(service.id, changes);
        if (success) closeModal();
    }

    async function handleAdd(values: FreelanceServiceFormValues) {
        // The form already validated everything, so all required fields exist
        const success = await onAddAdditional(
            values as CreateFreelanceServiceBody,
        );
        if (success) closeModal();
    }

    // A child service can be edited and deleted, but can't have its own additional services
    const isChild = Boolean(service.parentServiceId);

    const items: MenuProps["items"] = [
        {
            key: "edit",
            label: "Edit",
            icon: <EditOutlined />,
            className: itemClass,
            onClick: () => setOpenModal("edit"),
        },
        ...(isChild
            ? []
            : [
                  {
                      key: "add",
                      label: "Add additional service",
                      icon: <PlusCircleOutlined />,
                      className: itemClass,
                      onClick: () => setOpenModal("add"),
                  },
              ]),
        {
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            className: dangerClass,
            onClick: confirmDelete,
        },
    ];

    return (
        <>
            <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                menu={{ items }}
            >
                <button
                    type="button"
                    aria-label="Service actions"
                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-secondary-white hover:bg-secondary-white-hover hover:text-primary"
                >
                    <MoreOutlined />
                </button>
            </Dropdown>

            <Modal
                title="Edit service"
                open={openModal === "edit"}
                footer={null}
                destroyOnHidden
                onCancel={closeModal}
            >
                <FreelanceServiceForm
                    isUpdate
                    data={service}
                    onSubmit={handleEdit}
                />
            </Modal>

            {/* The parent id travels in the form state, the user never sees it */}
            <Modal
                title="Add additional service"
                open={openModal === "add"}
                footer={null}
                destroyOnHidden
                onCancel={closeModal}
            >
                <FreelanceServiceForm
                    data={{ parentServiceId: service.id }}
                    onSubmit={handleAdd}
                />
            </Modal>

            {contextHolder}
        </>
    );
}