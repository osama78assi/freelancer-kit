import { useState } from "react";
import { Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../api/base";
import { createFreelanceService } from "../../api/freelanceService";
import type { CreateFreelanceServiceBody } from "../../api/types";
import FreelanceServiceForm from "./FreelanceServiceForm";
import type {
    AddFreelanceServiceProps,
    FreelanceServiceFormValues,
} from "./types";

export default function AddFreelanceService({
    onSuccessAdding,
    className
}: AddFreelanceServiceProps) {
    const [open, setOpen] = useState(false);

    async function handleSubmit(values: FreelanceServiceFormValues) {
        try {
            // The form already validated everything, so all required fields exist
            await createFreelanceService(values as CreateFreelanceServiceBody);
            toast.success("Service added successfully");
            setOpen(false);
            onSuccessAdding();
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    }

    return (
        <>
            <Button
                type="primary"
                className={`transition-all ${className}`}
                icon={<PlusOutlined />}
                onClick={() => setOpen(true)}
            >
                Add service
            </Button>

            <Modal
                title="Add service"
                open={open}
                footer={null}
                destroyOnHidden
                onCancel={() => setOpen(false)}
            >
                <FreelanceServiceForm onSubmit={handleSubmit} />
            </Modal>
        </>
    );
}