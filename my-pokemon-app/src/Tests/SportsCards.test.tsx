import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import BaseballCards from '../Cards/BaseballCards';
import BasketballCards from '../Cards/BasketballCards';
import FootballCards from '../Cards/FootballCards';
import HockeyCards from '../Cards/HockeyCards';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

const mockedNavigate = require('react-router-dom').useNavigate;

const mockEbayData = {
    findItemsByKeywordsResponse: [
        {
            searchResult: [
                {
                    item: [
                        {
                            itemId: ['1'],
                            title: ['Baseball Card'],
                            galleryURL: ['https://image.com/baseball-card.jpg'],
                        },
                        {
                            itemId: ['2'],
                            title: ['Basketball Card'],
                            galleryURL: ['https://image.com/basketball-card.jpg'],
                        },
                    ],
                },
            ],
        },
    ],
};

describe('Sports Cards Components', () => {
    beforeEach(() => {
        mockedAxios.get.mockResolvedValue({
            data: mockEbayData,
        });
    });

    test('BaseballCards renders and displays items', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <BaseballCards />
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            const cardTitles = screen.getAllByText(/Baseball Card/i);
            expect(cardTitles.length).toBeGreaterThan(0);
        });
    });

    test('BasketballCards renders and displays items', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <BasketballCards />
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            const cardTitles = screen.getAllByText(/Basketball Card/i);
            expect(cardTitles.length).toBeGreaterThan(0);
        });
    });

    test('FootballCards renders and displays items', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <FootballCards />
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            const cardTitles = screen.getAllByText(/Football Card/i);
            expect(cardTitles.length).toBeGreaterThan(0);
        });
    });

    test('HockeyCards renders and displays items', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <HockeyCards />
                </MemoryRouter>
            );
        });

        await waitFor(() => {
            const cardTitles = screen.getAllByText(/Hockey Card/i);
            expect(cardTitles.length).toBeGreaterThan(0);
        });
    });

    test('BaseballCards handles search input correctly', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <BaseballCards />
                </MemoryRouter>
            );
        });

        const searchInput = screen.getByLabelText(/Search Baseball Cards/i) as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: 'rare baseball card' } });

        expect(searchInput.value).toBe('rare baseball card');

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/fetch-ebay-data/', {
                params: { searchTerm: 'rare baseball card' },
            });
        });
    });

    // TODO: Fix test
    // test('BasketballCards handles pagination correctly', async () => {
    //     // Mock data with more than 20 items to ensure pagination
    //     const mockPaginatedEbayData = {
    //         findItemsByKeywordsResponse: [
    //             {
    //                 searchResult: [
    //                     {
    //                         item: new Array(25).fill(0).map((_, index) => ({
    //                             itemId: [`${index + 1}`],
    //                             title: [`Basketball Card ${index + 1}`],
    //                             galleryURL: [`https://image.com/basketball-card${index + 1}.jpg`],
    //                         })),
    //                     },
    //                 ],
    //             },
    //         ],
    //     };

    //     mockedAxios.get.mockResolvedValueOnce({
    //         data: mockPaginatedEbayData,
    //     });

    //     await act(async () => {
    //         render(
    //             <MemoryRouter>
    //                 <BasketballCards />
    //             </MemoryRouter>
    //         );
    //     });

    //     // Ensure items are rendered
    //     await waitFor(() => {
    //         const cardTitles = screen.getAllByText(/Basketball Card/i);
    //         expect(cardTitles.length).toBeGreaterThan(0);
    //     });

    //     // Verify pagination to page 2 is present
    //     const page2Button = screen.getByRole('button', { name: /2/i });
    //     fireEvent.click(page2Button);

    //     await waitFor(() => {
    //         const currentPage = screen.getByText(/page 2/i);
    //         expect(currentPage).toBeInTheDocument();
    //     });
    // });

    // TODO: Fix when implemented
    // test('FootballCards navigates to card details on card click', async () => {
    //     const navigateMock = jest.fn();
    //     mockedNavigate.mockReturnValue(navigateMock);

    //     await act(async () => {
    //         render(
    //             <MemoryRouter>
    //                 <FootballCards />
    //             </MemoryRouter>
    //         );
    //     });

    //     // Find a card and simulate a click
    //     const card = screen.getByText(/Football Card/i);
    //     fireEvent.click(card);

    //     await waitFor(() => {
    //         expect(navigateMock).toHaveBeenCalledWith('/cards/football/Football Card');
    //     });
    // });

    test('HockeyCards handles search input correctly', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <HockeyCards />
                </MemoryRouter>
            );
        });

        const searchInput = screen.getByLabelText(/Search Hockey Cards/i) as HTMLInputElement;
        fireEvent.change(searchInput, { target: { value: 'legendary hockey card' } });

        expect(searchInput.value).toBe('legendary hockey card');

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8000/api/fetch-ebay-data/', {
                params: { searchTerm: 'legendary hockey card' },
            });
        });
    });
});
