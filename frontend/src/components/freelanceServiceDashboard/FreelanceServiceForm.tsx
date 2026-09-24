import { useState } from "react";
import { Button, Form, Input, InputNumber, Select } from "antd";
import type { UpdateFreelanceServiceBody } from "../../api/types";
import type {
    FreelanceServiceFormErrors,
    FreelanceServiceFormProps,
    FreelanceServiceFormState,
} from "./types";

// ISO 4217 codes known by the browser (needs "ES2022" in the tsconfig lib)
const currencyCodes = Intl.supportedValuesOf("currency");
const currencyOptions = currencyCodes.map((code) => ({ value: code, label: code }));

// Same rules as the API docs
function validate(values: FreelanceServiceFormState) {
    const errors: FreelanceServiceFormErrors = {};

    if (!values.title.trim()) {
        errors.title = "The title is required";
    } else if (values.title.length > 400) {
        errors.title = "The title can't be longer than 400 characters";
    }

    if (!values.content.trim()) {
        errors.content = "The content is required";
    }

    if (values.price === null) {
        errors.price = "The price is required as a number";
    }

    if (!values.currency || !currencyCodes.includes(values.currency)) {
        errors.currency = "Pick a valid currency";
    }

    return errors;
}

export default function FreelanceServiceForm({
    data,
    isUpdate = false,
    onSubmit,
}: FreelanceServiceFormProps) {
    const [values, setValues] = useState<FreelanceServiceFormState>({
        title: data?.title ?? "",
        content: data?.content ?? "",
        price: data?.price ?? null,
        currency: data?.currency || "USD",
        parentServiceId: data?.parentServiceId ?? undefined,
    });
    const [errors, setErrors] = useState<FreelanceServiceFormErrors>({});
    const [submitting, setSubmitting] = useState(false);

    function changeValue(
        field: keyof FreelanceServiceFormErrors,
        value: string | number | null,
    ) {
        setValues((current) => ({ ...current, [field]: value }));
        // Clear the error of the field the user is fixing
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    // Compare the state with the original data and keep only what changed
    function getChanges() {
        const changes: UpdateFreelanceServiceBody = {};

        if (values.title !== data?.title) changes.title = values.title;
        if (values.content !== data?.content) changes.content = values.content;
        if (values.price !== data?.price) changes.price = values.price as number;
        if (values.currency !== data?.currency) changes.currency = values.currency;

        return changes;
    }

    // The API rejects an empty update body, so there is nothing to save yet
    const nothingChanged = isUpdate && Object.keys(getChanges()).length === 0;

    async function handleSubmit() {
        const newErrors = validate(values);
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        // Update sends only the changed fields, add sends everything
        const fields = isUpdate
            ? getChanges()
            : {
                  title: values.title,
                  content: values.content,
                  price: values.price as number,
                  currency: values.currency,
              };

        // Always send the parent id when there is one (child services)
        const payload = { ...fields, parentServiceId: values.parentServiceId };

        setSubmitting(true);
        try {
            await onSubmit(payload);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Form layout="vertical" autoComplete="off" onFinish={handleSubmit}>
            <Form.Item
                label="Title"
                required
                validateStatus={errors.title ? "error" : undefined}
                help={errors.title}
            >
                <Input
                    value={values.title}
                    maxLength={400}
                    showCount
                    onChange={(e) => changeValue("title", e.target.value)}
                />
            </Form.Item>

            <Form.Item
                label="Content"
                required
                validateStatus={errors.content ? "error" : undefined}
                help={errors.content}
            >
                <Input.TextArea
                    rows={4}
                    value={values.content}
                    onChange={(e) => changeValue("content", e.target.value)}
                />
            </Form.Item>

            <Form.Item
                label="Price"
                required
                validateStatus={errors.price ? "error" : undefined}
                help={errors.price}
            >
                <InputNumber
                    style={{ width: "100%" }}
                    value={values.price}
                    onChange={(value) => changeValue("price", value)}
                />
            </Form.Item>

            <Form.Item
                label="Currency"
                required
                validateStatus={errors.currency ? "error" : undefined}
                help={errors.currency}
            >
                <Select
                    showSearch
                    placeholder="Select a currency"
                    value={values.currency}
                    options={currencyOptions}
                    onChange={(value) => changeValue("currency", value)}
                    defaultValue={"USD"}
                />
            </Form.Item>

            <div className="flex justify-end">
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    disabled={nothingChanged}
                >
                    {isUpdate ? "Save changes" : "Add service"}
                </Button>
            </div>
        </Form>
    );
}