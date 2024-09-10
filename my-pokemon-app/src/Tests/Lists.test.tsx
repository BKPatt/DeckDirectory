import { render, fireEvent } from '@testing-library/react';
import CardType from '../Types/CardType';
import ListDialog from '../Types/ListDialog';

const onCloseMock = jest.fn();
const currentListMock = {
    id: '123',
    created_by: 'John Doe',
    created_on: '2022-01-01',
    name: 'My List',
    type: 'Pokemon' as CardType,
    cards: [],
    market_value: 100,
    collection_value: 50,
    collected_quantities: {},
};

const ListDialogMock = ({ onClose, currentList }: { onClose: () => void; currentList: typeof currentListMock }) => (
    <ListDialog list={currentList} onClose={onClose} />
);

describe('ListDialog', () => {
    it('renders correctly', () => {
        const { getByText } = render(<ListDialogMock onClose={onCloseMock} currentList={currentListMock} />);
        expect(getByText('My List')).toBeInTheDocument();
        expect(getByText('Collection Value: $50.00')).toBeInTheDocument();
        expect(getByText('List Value: $100.00')).toBeInTheDocument();
    });

    it('calls onClose when closed', () => {
        const { getByText } = render(<ListDialogMock onClose={onCloseMock} currentList={currentListMock} />);
        const closeButton = getByText('Close');
        fireEvent.click(closeButton);
        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
});