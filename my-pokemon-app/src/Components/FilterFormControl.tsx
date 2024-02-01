import React from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { OptionType } from '../Types/Options';

interface FilterFormControlProps {
    id: string;
    label: string;
    filterOptions: OptionType[];
    selectedFilter: OptionType | null;
    setSelectedFilter: (value: OptionType | null) => void;
}

const FilterFormControl: React.FC<FilterFormControlProps> = ({
    id,
    label,
    filterOptions,
    selectedFilter,
    setSelectedFilter,
}) => {
    return (
        <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
            <Autocomplete
                id={id}
                disablePortal
                options={filterOptions}
                value={selectedFilter}
                onChange={(_event, newValue: OptionType | null) => setSelectedFilter(newValue)}
                sx={{ width: 200 }}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => <TextField {...params} label={label} />}
            />
        </FormControl>
    );
};

export default FilterFormControl;
