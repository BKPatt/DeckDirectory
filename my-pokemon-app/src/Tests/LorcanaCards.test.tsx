import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import LorcanaCards from '../Cards/Lorcana/LorcanaCards';
import LorcanaCardData from '../Cards/Lorcana/LorcanaCardData';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockCardData: LorcanaCardData[] = [
    {
        id: 1,
        Artist: 'John Doe',
        Set_Name: 'First Set',
        Set_Num: 101,
        Color: 'Red',
        Image: 'image1.png',
        Cost: 2,
        Inkable: true,
        Name: 'Elsa',
        Type: 'Character',
        Rarity: 'Rare',
        Flavor_Text: 'Ice queen',
        Card_Num: 25,
        Body_Text: 'She can freeze her enemies.',
        Set_ID: 'SET01',
        card_count: 1,
    },
];

const mockFilterOptions = {
    color: [{ label: 'Red' }],
    rarity: [{ label: 'Rare' }],
    set_name: [{ label: 'First Set' }],
};

describe('LorcanaCards Component', () => {
    beforeEach(() => {
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('api/lorcana-cards/') || url.includes('api/lorcana-cards-by-list/')) {
                return Promise.resolve({
                    data: {
                        data: mockCardData,
                        total_pages: 1,
                    },
                });
            } else if (url.includes('api/lorcana-filter-options/')) {
                return Promise.resolve({ data: mockFilterOptions });
            } else if (url.includes('api/get-list-by-id/')) {
                return Promise.resolve({
                    data: {
                        card_list: {},
                        list_cards: []
                    }
                });
            }
            return Promise.reject(new Error('Not found'));
        });
        mockedAxios.post.mockResolvedValue({ status: 200 });
        mockedAxios.delete.mockResolvedValue({ status: 200 });
    });

    test('renders the search input', async () => {
        await act(async () => {
            render(<LorcanaCards selectedListId="1" isInAddMode={true} />);
        });
        const searchInput = screen.getByLabelText(/Search Lorcana Cards/i);
        expect(searchInput).toBeInTheDocument();
    });

    test('increments card quantity', async () => {
        await act(async () => {
            render(<LorcanaCards selectedListId="1" isInAddMode={false} />);
        });

        await waitFor(() => {
            const incrementButton = screen.getAllByRole('button', { name: /\+/i });
            expect(incrementButton.length).toBeGreaterThan(0);
            fireEvent.click(incrementButton[0]);
        });

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8000/api/update-card-quantity/', {
                list_id: '1',
                card_id: '1',
                card_type: 'lorcana',
                operation: 'increment',
            });
        });
    });

    test('decrements card quantity', async () => {
        await act(async () => {
            render(<LorcanaCards selectedListId="1" isInAddMode={false} />);
        });

        await waitFor(() => {
            const incrementButton = screen.getAllByRole('button', { name: /\+/i });
            fireEvent.click(incrementButton[0]);
        });

        await waitFor(() => {
            const decrementButton = screen.getAllByRole('button', { name: /-/i });
            fireEvent.click(decrementButton[0]);
        });

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8000/api/update-card-quantity/', {
                list_id: '1',
                card_id: '1',
                card_type: 'lorcana',
                operation: 'decrement',
            });
        });
    });

    test('deletes card from the list', async () => {
        await act(async () => {
            render(<LorcanaCards selectedListId="1" isInAddMode={false} />);
        });

        await waitFor(() => {
            const deleteButton = screen.getByText(/Delete/i);
            fireEvent.click(deleteButton);
        });

        await waitFor(() => {
            expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:8000/api/delete-card-from-list/', {
                data: {
                    list_id: '1',
                    card_id: '1',
                    card_type: 'lorcana',
                },
            });
        });
    });
});