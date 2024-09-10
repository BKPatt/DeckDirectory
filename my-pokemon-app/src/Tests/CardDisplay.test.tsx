import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardDisplay from '../Components/CardDisplay';

const mockCard = {
    id: '1',
    name: 'Test Card',
    image: 'test-image.jpg',
};

const defaultProps = {
    card: mockCard,
    onInfoClick: jest.fn(),
    onAddCard: jest.fn(),
    onIncrementCard: jest.fn(),
    onDecrementCard: jest.fn(),
    onDeleteCard: jest.fn(),
    handleIncrementCollectedQuantity: jest.fn(),
    handleDecrementCollectedQuantity: jest.fn(),
    isSelectedListId: true,
    isInAddMode: false,
    collectedStatus: false,
    cardQuantities: { '1': 2 },
    onCheckboxChange: jest.fn(),
    image: 'test-image.jpg',
    name: 'Test Card',
    id: '1',
    collectedQuantities: { '1': 1 },
};

describe('CardDisplay Component', () => {
    test('renders card name and image', () => {
        render(<CardDisplay {...defaultProps} />);

        expect(screen.getByText('Test Card')).toBeInTheDocument();
        expect(screen.getByAltText('Test Card')).toBeInTheDocument();
    });

    test('calls onInfoClick when Info button is clicked', () => {
        render(<CardDisplay {...defaultProps} />);

        const infoButton = screen.getByText('Info');
        fireEvent.click(infoButton);

        expect(defaultProps.onInfoClick).toHaveBeenCalledWith(mockCard);
    });

    test('calls onAddCard when Add button is clicked', () => {
        const updatedProps = {
            ...defaultProps,
            cardQuantities: { '1': 0 },
        };
        render(<CardDisplay {...updatedProps} />);

        const addButton = screen.getByText('Add');
        fireEvent.click(addButton);

        expect(defaultProps.onAddCard).toHaveBeenCalledWith(mockCard);
    });

    test('calls onIncrementCard when correct + button is clicked', () => {
        render(<CardDisplay {...defaultProps} />);

        const incrementButtons = screen.getAllByText('+');
        fireEvent.click(incrementButtons[0]);

        expect(defaultProps.onIncrementCard).toHaveBeenCalledWith(mockCard);
    });

    test('calls onDecrementCard when correct - button is clicked', () => {
        render(<CardDisplay {...defaultProps} />);

        const decrementButtons = screen.getAllByText('-');
        fireEvent.click(decrementButtons[0]);

        expect(defaultProps.onDecrementCard).toHaveBeenCalledWith(mockCard);
    });

    test('calls onDeleteCard when Delete button is clicked', () => {
        const updatedProps = {
            ...defaultProps,
            cardQuantities: { '1': 1 },
        };
        render(<CardDisplay {...updatedProps} />);

        const deleteButton = screen.getByText('Delete');
        fireEvent.click(deleteButton);

        expect(defaultProps.onDeleteCard).toHaveBeenCalledWith(mockCard);
    });

    test('calls onCheckboxChange when collected checkbox is changed from unchecked to checked', () => {
        const updatedProps = {
            ...defaultProps,
            collectedQuantities: { '1': 0 },
        };

        render(<CardDisplay {...updatedProps} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(updatedProps.onCheckboxChange).toHaveBeenCalledWith('1', true);
    });

    test('calls onCheckboxChange when collected checkbox is changed from checked to unchecked', () => {
        const updatedProps = {
            ...defaultProps,
            collectedQuantities: { '1': 1 },
        };

        render(<CardDisplay {...updatedProps} />);

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(updatedProps.onCheckboxChange).toHaveBeenCalledWith('1', false);
    });

    test('calls handleIncrementCollectedQuantity when increment collected button is clicked', () => {
        render(<CardDisplay {...defaultProps} />);

        const incrementCollectedButtons = screen.getAllByText('+');
        fireEvent.click(incrementCollectedButtons[1]);

        expect(defaultProps.handleIncrementCollectedQuantity).toHaveBeenCalledWith('1');
    });

    test('calls handleDecrementCollectedQuantity when decrement collected button is clicked', () => {
        render(<CardDisplay {...defaultProps} />);

        const decrementCollectedButtons = screen.getAllByText('-');
        fireEvent.click(decrementCollectedButtons[1]);

        expect(defaultProps.handleDecrementCollectedQuantity).toHaveBeenCalledWith('1');
    });
});
