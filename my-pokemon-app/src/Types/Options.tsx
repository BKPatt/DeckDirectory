export type SortOptionType = { label: string; value: string } | null;

export interface OptionType {
    label: string;
}

export type CardProps = {
    selectedListId?: string;
    isInAddMode?: boolean;
};