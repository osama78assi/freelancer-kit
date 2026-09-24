export interface SearchInputProps {
    onSearch: (query: string) => void;
    onClear: () => void;
    loading: boolean;
    placeholder: string;
}
