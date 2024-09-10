import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PokemonCards from '../Cards/Pokemon/PokemonCards';
import axios from 'axios';
import { CardData } from '../Cards/Pokemon/CardData';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockCardData: CardData[] = [
    {
        id: 'test-card-1',
        name: 'Pikachu',
        supertype: 'Pokémon',
        subtypes: ['Basic'],
        level: '10',
        hp: '60',
        types: ['Lightning'],
        evolvesFrom: 'Pichu',
        attacks: [
            {
                name: 'Thunderbolt',
                cost: ['Lightning', 'Colorless'],
                convertedEnergyCost: 2,
                damage: '50',
                text: 'Discard all Energy from this Pokémon.',
            },
        ],
        weaknesses: [{ type: 'Fighting', value: '×2' }],
        retreatCost: ['Colorless'],
        convertedRetreatCost: 1,
        set: {
            id: 'base1',
            name: 'Base Set',
            series: 'Base',
            printedTotal: 102,
            total: 102,
            legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
            ptcgoCode: 'BS',
            releaseDate: '1999-01-09',
            updatedAt: '2022-09-01',
            images: { symbol: 'symbol.png', logo: 'logo.png' },
        },
        rules: ['Rule 1', 'Rule 2'],
        number: '25',
        artist: 'Ken Sugimori',
        rarity: 'Common',
        flavorText: 'Pikachu that can generate powerful electricity have cheek sacs that are extra soft and super stretchy.',
        nationalPokedexNumbers: [25],
        legalities: { unlimited: 'Legal', standard: 'Legal', expanded: 'Legal' },
        count: 1,
        images: { small: 'small.png', large: 'large.png' },
        tcgplayer: undefined,
        cardmarket: undefined,
    },
];

describe('PokemonCards Component', () => {
    beforeEach(() => {
        mockedAxios.get.mockResolvedValue({
            data: {
                data: mockCardData,
                total_pages: 1,
            },
        });
    });

    test('renders the search input', async () => {
        await act(async () => {
            render(<PokemonCards selectedListId="1" isInAddMode={true} />);
        });
        const searchInput = screen.getByLabelText(/Search Pokémon Cards/i);
        expect(searchInput).toBeInTheDocument();
    });

    test('fetches and displays cards from the API', async () => {
        await act(async () => {
            render(<PokemonCards selectedListId="1" isInAddMode={true} />);
        });

        const cardName = screen.getByText(/Pikachu/i);
        expect(cardName).toBeInTheDocument();
    });

    test('opens the card info dialog when a card is clicked', async () => {
        await act(async () => {
            render(<PokemonCards selectedListId="1" isInAddMode={true} />);
        });

        const card = screen.getByText(/Pikachu/i);
        await act(async () => {
            fireEvent.click(card);
        });

        const dialogTitle = await screen.findByText(/Pikachu/i);
        expect(dialogTitle).toBeInTheDocument();
    });

    test('increments card quantity', async () => {
        await act(async () => {
            render(<PokemonCards selectedListId="1" isInAddMode={false} />);
        });

        const incrementButtons = screen.getAllByRole('button', { name: /\+/i });
        expect(incrementButtons.length).toBeGreaterThan(0);

        await act(async () => {
            fireEvent.click(incrementButtons[0]);
        });

        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8000/api/update-card-quantity/', {
            list_id: '1',
            card_id: 'test-card-1',
            card_type: 'pokemon',
            operation: 'increment',
        });
    });

    test('decrements card quantity', async () => {
        await act(async () => {
            render(<PokemonCards selectedListId="1" isInAddMode={false} />);
        });

        const incrementButtons = screen.getAllByRole('button', { name: /\+/i });
        await act(async () => {
            fireEvent.click(incrementButtons[0]);
        });

        const decrementButtons = screen.getAllByRole('button', { name: /-/i });
        await act(async () => {
            fireEvent.click(decrementButtons[0]);
        });

        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8000/api/update-card-quantity/', {
            list_id: '1',
            card_id: 'test-card-1',
            card_type: 'pokemon',
            operation: 'decrement'
        });
    });

    test('deletes card from the list', async () => {
        await act(async () => {
            render(<PokemonCards selectedListId="1" isInAddMode={false} />);
        });

        const deleteButton = screen.getByText(/Delete/i);
        await act(async () => {
            fireEvent.click(deleteButton);
        });

        expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:8000/api/delete-card-from-list/', {
            data: {
                list_id: '1',
                card_id: 'test-card-1',
                card_type: 'pokemon',
            },
        });
    });
});