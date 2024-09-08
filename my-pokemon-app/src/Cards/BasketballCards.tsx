import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EbayItem from '../Types/EbayItem';
import { formatEbay } from './FormatEbay';

const BasketballCards = () => {
    // State for storing fetched cards, search term, pagination
    const [cards, setCards] = useState<EbayItem[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const navigate = useNavigate();

    // Fetch data from eBay API when search term changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use 'basketball card' as default search if no term is provided
                const searchTerm = search.trim() === '' ? 'basketball card' : search;
                const response = await axios.get(`http://localhost:8000/api/fetch-ebay-data/`, { params: { searchTerm } });
                const items = response.data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
                // Format the fetched items
                const formattedCards = formatEbay(items);
                setCards(formattedCards);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchData();
    }, [search]);

    // Handle pagination
    const paginate = (value: number) => {
        setCurrentPage(value);
    };

    // Navigate to individual card page when a card is clicked
    const handleCardClick = (cardTitle: string) => {
        navigate(`/cards/basketball/${cardTitle}`);
    };

    // Calculate which cards to display on current page
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard);

    return (
        <Box sx={{ p: 2 }}>
            {/* Search input */}
            <TextField
                fullWidth
                label="Search Basketball Cards"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />
            {/* Grid of cards */}
            <Grid container spacing={2}>
                {currentCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card onClick={() => handleCardClick(card.title)}>
                            <CardMedia
                                component="img"
                                height="auto"
                                image={card.galleryURL}
                                alt={card.title}
                            />
                            <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                                {card.title}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {/* Pagination controls */}
            <Pagination
                count={Math.ceil(cards.length / cardsPerPage)}
                page={currentPage}
                onChange={(_, value) => paginate(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default BasketballCards;