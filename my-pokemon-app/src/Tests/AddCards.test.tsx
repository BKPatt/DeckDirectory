import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddCard from '../Components/AddCard';

describe('AddCard Component', () => {
    const mockDeleteCard = jest.fn();
    const mockDecrementCardQuantity = jest.fn();
    const mockIncrementCardQuantity = jest.fn();
    const mockClose = jest.fn();
    const mockCard = { id: 1, name: 'Sample Card' };

    const defaultProps = {
        selectedCardListId: '1',
        cardQuantity: 2,
        deleteCard: mockDeleteCard,
        decrementCardQuantity: mockDecrementCardQuantity,
        incrementCardQuantity: mockIncrementCardQuantity,
        close: mockClose,
        card: mockCard,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly when selectedCardListId is provided', () => {
        render(<AddCard {...defaultProps} />);

        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('-')).toBeInTheDocument();
        expect(screen.getByText('+')).toBeInTheDocument();
    });

    test('does not render when selectedCardListId is not provided', () => {
        render(<AddCard {...defaultProps} selectedCardListId={undefined} />);

        expect(screen.queryByText('2')).not.toBeInTheDocument();
        expect(screen.queryByText('-')).not.toBeInTheDocument();
        expect(screen.queryByText('+')).not.toBeInTheDocument();
    });

    test('calls incrementCardQuantity when + button is clicked', () => {
        render(<AddCard {...defaultProps} />);

        const incrementButton = screen.getByText('+');
        fireEvent.click(incrementButton);

        expect(mockIncrementCardQuantity).toHaveBeenCalledWith(mockCard);
    });

    test('calls decrementCardQuantity when - button is clicked and quantity is greater than 1', () => {
        render(<AddCard {...defaultProps} cardQuantity={2} />);

        const decrementButton = screen.getByText('-');
        fireEvent.click(decrementButton);

        expect(mockDecrementCardQuantity).toHaveBeenCalledWith(mockCard);
    });

    test('calls deleteCard and close when - button is clicked and quantity is 1', () => {
        render(<AddCard {...defaultProps} cardQuantity={1} />);

        const decrementButton = screen.getByText('-');
        fireEvent.click(decrementButton);

        expect(mockDeleteCard).toHaveBeenCalledWith(mockCard);
        expect(mockClose).toHaveBeenCalled();
    });
});
