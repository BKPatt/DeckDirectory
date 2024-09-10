import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListDialog from '../Types/ListDialog';
import { ListProvider, CardList } from '../Types/CardList';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ListDialog Component', () => {
    const mockList: CardList = {
        id: '1',
        created_by: 'user1',
        created_on: '2024-09-01',
        name: 'Test List',
        type: 'Pokemon',
        cards: [],
        market_value: 100,
        collection_value: 50,
        collected_quantities: {}
    };

    const mockListCards = [
        { id: 1, pokemon_card: 1, yugioh_card: null, mtg_card: null, lorcana_card: null, market_value: 50, collected: true },
        { id: 2, pokemon_card: 2, yugioh_card: null, mtg_card: null, lorcana_card: null, market_value: 30, collected: false }
    ];

    const onCloseMock = jest.fn();

    beforeEach(() => {
        mockedAxios.get.mockResolvedValue({
            data: {
                card_list: mockList,
                list_cards: mockListCards
            }
        });
    });

    test('renders the dialog with the correct initial data', async () => {
        render(
            <ListProvider>
                <ListDialog list={mockList} onClose={onCloseMock} />
            </ListProvider>
        );

        expect(screen.getByText('Collection Value: $50.00')).toBeInTheDocument();
        expect(screen.getByText('List Value: $100.00')).toBeInTheDocument();
        expect(screen.getByText('Test List')).toBeInTheDocument();
    });

    test('allows editing the title and saving the new title on Enter key press', async () => {
        render(
            <ListProvider>
                <ListDialog list={mockList} onClose={onCloseMock} />
            </ListProvider>
        );

        fireEvent.click(screen.getByText('Test List'));

        const titleInput = screen.getByDisplayValue('Test List');
        fireEvent.change(titleInput, { target: { value: 'Updated List' } });
        fireEvent.keyDown(titleInput, { key: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText('Updated List')).toBeInTheDocument();
        });
    });

    test('fetches and updates the collection value from the API', async () => {
        render(
            <ListProvider>
                <ListDialog list={mockList} onClose={onCloseMock} />
            </ListProvider>
        );

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/get-list-by-id/1/');
            expect(screen.getByText('Collection Value: $50.00')).toBeInTheDocument();
        });
    });

    test('calls the onClose function when the close button is clicked', () => {
        render(
            <ListProvider>
                <ListDialog list={mockList} onClose={onCloseMock} />
            </ListProvider>
        );

        fireEvent.click(screen.getByText('Close'));

        expect(onCloseMock).toHaveBeenCalled();
    });

    test('renders the correct card component based on the list type', () => {
        render(
            <ListProvider>
                <ListDialog list={mockList} onClose={onCloseMock} />
            </ListProvider>
        );

        expect(screen.getByLabelText('Search Pokémon Cards')).toBeInTheDocument();
    });
});
