import axios, { isAxiosError } from "axios";

// Shared axios instance, change the base URL to match your backend
export const api = axios.create({
    baseURL: "http://localhost:49155/api/v1",
    headers: { "Content-Type": "application/json" },
});

// Turns any request error into a single message we can show to the user
export function getErrorMessage(error: unknown): string {
    if (isAxiosError(error)) {
        const message = error.response?.data?.message;

        // Validation errors come as an array of issues, show only the first one
        if (Array.isArray(message)) {
            return message[0]?.message ?? "Something went wrong";
        }

        if (typeof message === "string") {
            return message;
        }

        // No response from the server (network error, timeout...)
        return error.message;
    }

    return "Something went wrong";
}
