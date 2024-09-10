import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import YugiohCards from '../Cards/Yugioh/YugiohCards';
import { YugiohCardData } from '../Cards/Yugioh/YugiohCardData';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockCardData: YugiohCardData[] = [
    {
        id: 1,
        name: 'Dark Magician',
        type: 'Spellcaster',
        frameType: 'normal',
        desc: 'The ultimate wizard in terms of attack and defense.',
        atk: 2500,
        def: 2100,
        level: 7,
        race: 'Spellcaster',
        card_count: 1,
        attribute: 'DARK',
        card_sets: [
            {
                set_name: 'Starter Deck: Yugi',
                set_code: 'SDY-006',
                set_rarity: 'Ultra Rare',
                set_rarity_code: 'UR',
                set_price: '5.00',
            },
        ],
        card_images: [
            {
                id: 1,
                image_url: 'dark_magician.png',
                image_url_small: 'dark_magician_small.png',
                image_url_cropped: 'dark_magician_cropped.png',
            },
        ],
        card_prices: [
            {
                cardmarket_price: '3.50',
                tcgplayer_price: '4.00',
                ebay_price: '4.25',
                amazon_price: '4.75',
                coolstuffinc_price: '5.00',
            },
        ],
    },
];

const mockFilterOptions = {
    card_type: [{ label: 'Spellcaster' }],
    frame_type: [{ label: 'normal' }],
    race: [{ label: 'Spellcaster' }],
    attribute: [{ label: 'DARK' }],
    set_name: [{ label: 'Starter Deck: Yugi' }],
    rarities: [{ label: 'Ultra Rare' }],
};

describe('YugiohCards Component', () => {
    beforeEach(() => {
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('api/fetch-yugioh-cards/') || url.includes('api/yugioh-cards-by-list/')) {
                return Promise.resolve({
                    data: {
                        data: mockCardData,
                        total_pages: 1,
                    },
                });
            } else if (url.includes('api/yugioh-filter-options/')) {
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
            render(<YugiohCards selectedListId="1" isInAddMode={true} />);
        });
        const searchInput = screen.getByLabelText(/Search Yu-Gi-Oh! Cards/i);
        expect(searchInput).toBeInTheDocument();
    });

    test('fetches and displays cards from the API', async () => {
        await act(async () => {
            render(<YugiohCards selectedListId="1" isInAddMode={true} />);
        });

        const cardName = screen.getByText(/Dark Magician/i);
        expect(cardName).toBeInTheDocument();
    });

    test('increments card quantity', async () => {
        await act(async () => {
            render(<YugiohCards selectedListId="1" isInAddMode={false} />);
        });

        const incrementButton = screen.getAllByRole('button', { name: /\+/i });
        expect(incrementButton.length).toBeGreaterThan(0);

        await act(async () => {
            fireEvent.click(incrementButton[0]);
        });

        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8000/api/update-card-quantity/', {
            list_id: '1',
            card_id: '1',
            card_type: 'yugioh',
            operation: 'increment',
        });
    });

    test('decrements card quantity', async () => {
        await act(async () => {
            render(<YugiohCards selectedListId="1" isInAddMode={false} />);
        });

        const incrementButton = screen.getAllByRole('button', { name: /\+/i });
        await act(async () => {
            fireEvent.click(incrementButton[0]);
        });

        const decrementButton = screen.getAllByRole('button', { name: /-/i });
        await act(async () => {
            fireEvent.click(decrementButton[0]);
        });

        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8000/api/update-card-quantity/', {
            list_id: '1',
            card_id: '1',
            card_type: 'yugioh',
            operation: 'decrement',
        });
    });

    test('deletes card from the list', async () => {
        await act(async () => {
            render(<YugiohCards selectedListId="1" isInAddMode={false} />);
        });

        const deleteButton = screen.getByText(/Delete/i);
        await act(async () => {
            fireEvent.click(deleteButton);
        });

        expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:8000/api/delete-card-from-list/', {
            data: {
                list_id: '1',
                card_id: '1',
                card_type: 'yugioh',
            },
        });
    });
});
