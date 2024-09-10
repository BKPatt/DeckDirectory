import { render, act } from '@testing-library/react';
import axios from 'axios';
import { CardList, ListProvider, useList } from '../Types/CardList';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockCardList: CardList = {
    id: '1',
    created_by: 'TestUser',
    created_on: '2024-09-09',
    name: 'Test List',
    type: 'Pokemon',
    cards: [
        { id: '1', name: 'Pikachu', type: 'Pokemon' },
        { id: '2', name: 'Charizard', type: 'Pokemon' }
    ],
    market_value: 100,
    collection_value: 0,
    collected_quantities: { '1': 1, '2': 1 },
};

const TestComponent: React.FC = () => {
    const { listData, updateListData, updateListInDatabase, fetchUpdatedListDetails } = useList();

    return (
        <>
            <div data-testid="list-length">{listData.length}</div>
            <button data-testid="update-list" onClick={() => updateListData([mockCardList])}>Update List</button>
            <button
                data-testid="update-list-db"
                onClick={() => updateListInDatabase('1', { ...mockCardList, name: 'Updated Test List' })}
            >
                Update List in DB
            </button>
            <button data-testid="fetch-list-details" onClick={() => fetchUpdatedListDetails('1')}>
                Fetch List Details
            </button>
        </>
    );
};

describe('CardList Context Tests', () => {
    beforeEach(() => {
        mockedAxios.get.mockReset();
        mockedAxios.post.mockReset();
    });

    it('should update the list data when updateListData is called', async () => {
        const { getByTestId } = render(
            <ListProvider>
                <TestComponent />
            </ListProvider>
        );

        expect(getByTestId('list-length').textContent).toBe('0');

        await act(async () => {
            getByTestId('update-list').click();
        });

        expect(getByTestId('list-length').textContent).toBe('1');
    });

    it('should send updated list data to the database when updateListInDatabase is called', async () => {
        mockedAxios.post.mockResolvedValue({ data: {} });

        const { getByTestId } = render(
            <ListProvider>
                <TestComponent />
            </ListProvider>
        );

        await act(async () => {
            getByTestId('update-list-db').click();
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'http://localhost:8000/api/card-lists/update/1/',
            expect.objectContaining({
                name: 'Updated Test List'
            })
        );
    });

    it('should fetch and update list details from the API', async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                card_list: mockCardList,
                list_cards: [
                    { card_id: '1', market_value: 100, collected: true },
                    { card_id: '2', market_value: 200, collected: false }
                ]
            }
        });

        const { getByTestId } = render(
            <ListProvider>
                <TestComponent />
            </ListProvider>
        );

        await act(async () => {
            getByTestId('fetch-list-details').click();
        });

        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/get-list-by-id/1/');
    });

    it('should calculate collection value and quantities correctly after fetching list details', async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                card_list: mockCardList,
                list_cards: [
                    { card_id: '1', market_value: 100, collected: true },
                    { card_id: '2', market_value: 200, collected: true }
                ]
            }
        });

        const { getByTestId } = render(
            <ListProvider>
                <TestComponent />
            </ListProvider>
        );

        await act(async () => {
            getByTestId('fetch-list-details').click();
        });

        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/get-list-by-id/1/');
    });
});
