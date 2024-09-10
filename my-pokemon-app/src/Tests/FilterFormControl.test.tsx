import { render, screen, fireEvent } from '@testing-library/react';
import FilterFormControl from '../Components/FilterFormControl';
import { OptionType } from '../Types/Options';

describe('FilterFormControl Component', () => {
    const mockOptions: OptionType[] = [
        { label: 'Option 1' },
        { label: 'Option 2' },
        { label: 'Option 3' },
    ];

    const mockSetSelectedFilter = jest.fn();

    beforeEach(() => {
        mockSetSelectedFilter.mockClear();
    });

    test('renders the filter control with provided label and options', () => {
        render(
            <FilterFormControl
                id="filter-control"
                label="Test Filter"
                filterOptions={mockOptions}
                selectedFilter={null}
                setSelectedFilter={mockSetSelectedFilter}
            />
        );

        expect(screen.getByLabelText('Test Filter')).toBeInTheDocument();
        fireEvent.mouseDown(screen.getByLabelText('Test Filter'));

        const options = screen.getAllByRole('option');
        expect(options.length).toBe(3);
        expect(options[0]).toHaveTextContent('Option 1');
        expect(options[1]).toHaveTextContent('Option 2');
        expect(options[2]).toHaveTextContent('Option 3');
    });

    test('calls setSelectedFilter when an option is selected', () => {
        render(
            <FilterFormControl
                id="filter-control"
                label="Test Filter"
                filterOptions={mockOptions}
                selectedFilter={null}
                setSelectedFilter={mockSetSelectedFilter}
            />
        );

        fireEvent.mouseDown(screen.getByLabelText('Test Filter'));

        const option = screen.getByText('Option 2');
        fireEvent.click(option);

        expect(mockSetSelectedFilter).toHaveBeenCalledWith({ label: 'Option 2' });
    });

    test('displays the selected option', () => {
        render(
            <FilterFormControl
                id="filter-control"
                label="Test Filter"
                filterOptions={mockOptions}
                selectedFilter={{ label: 'Option 1' }}
                setSelectedFilter={mockSetSelectedFilter}
            />
        );

        expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument();
    });

    test('calls setSelectedFilter with null when clearing the selection', () => {
        render(
            <FilterFormControl
                id="filter-control"
                label="Test Filter"
                filterOptions={mockOptions}
                selectedFilter={{ label: 'Option 1' }}
                setSelectedFilter={mockSetSelectedFilter}
            />
        );

        fireEvent.change(screen.getByLabelText('Test Filter'), { target: { value: '' } });

        expect(mockSetSelectedFilter).toHaveBeenCalledWith(null);
    });
});
