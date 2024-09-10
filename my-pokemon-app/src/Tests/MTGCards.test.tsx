import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import MTGCards from '../Cards/MTG/MTGCards';
import { MTGCardData } from '../Cards/MTG/MTGCardData';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockCardData: MTGCardData[] = [
    {
        id: '1',
        oracle_id: 'oracle-123',
        name: 'Black Lotus',
        lang: 'en',
        released_at: '1993-08-05',
        uri: 'https://api.scryfall.com/cards/abc',
        layout: 'normal',
        image_uris: {
            small: 'small.png',
            normal: 'normal.png',
            large: 'large.png',
            png: 'image.png',
            art_crop: 'art_crop.png',
            border_crop: 'border_crop.png',
        },
        cmc: 0,
        type_line: 'Artifact',
        color_identity: [],
        keywords: [],
        legalities: { commander: 'legal', modern: 'not_legal', legacy: 'legal' },
        games: ['paper', 'mtgo'],
        set: 'lea',
        set_name: 'Limited Edition Alpha',
        set_type: 'core',
        rarity: 'rare',
        artist: 'Christopher Rush',
        prices: { usd: '50000', eur: '45000' },
        related_uris: { gatherer: 'https://gatherer.wizards.com/' },
        count: 1,
        card_count: 1,
        cardIdList: 1,
    },
];

const mockFilterOptions = {
    type_line: [{ label: 'Artifact' }],
    rarities: [{ label: 'Rare' }],
    sets: [{ label: 'Limited Edition Alpha' }],
};

describe('MTGCards Component', () => {
    beforeEach(() => {
        mockedAxios.get.mockImplementation((url) => {
            if (url.includes('api/mtg-cards/') || url.includes('api/mtg-cards-by-list/')) {
                return Promise.resolve({
                    data: {
                        data: mockCardData,
                        total_pages: 1,
                    },
                });
            } else if (url.includes('api/mtg-filter-options/')) {
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
            render(<MTGCards selectedListId="1" isInAddMode={true} />);
        });
        const searchInput = screen.getByLabelText(/Search MTG Cards/i);
        expect(searchInput).toBeInTheDocument();
    });

    test('fetches and displays cards from the API', async () => {
        await act(async () => {
            render(<MTGCards selectedListId="1" isInAddMode={true} />);
        });

        const cardName = screen.getByText(/Black Lotus/i);
        expect(cardName).toBeInTheDocument();
    });

    test('increments card quantity', async () => {
        await act(async () => {
            render(<MTGCards selectedListId="1" isInAddMode={false} />);
        });

        const incrementButton = screen.getAllByRole('button', { name: /\+/i });
        expect(incrementButton.length).toBeGreaterThan(0);

        await act(async () => {
            fireEvent.click(incrementButton[0]);
        });

        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8000/api/update-card-quantity/', {
            list_id: '1',
            card_id: '1',
            card_type: 'mtg',
            operation: 'increment',
        });
    });

    test('decrements card quantity', async () => {
        await act(async () => {
            render(<MTGCards selectedListId="1" isInAddMode={false} />);
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
            card_type: 'mtg',
            operation: 'decrement',
        });
    });

    test('deletes card from the list', async () => {
        await act(async () => {
            render(<MTGCards selectedListId="1" isInAddMode={false} />);
        });

        const deleteButton = screen.getByText(/Delete/i);
        await act(async () => {
            fireEvent.click(deleteButton);
        });

        expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:8000/api/delete-card-from-list/', {
            data: {
                list_id: '1',
                card_id: '1',
                card_type: 'mtg',
            },
        });
    });
});
