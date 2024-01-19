import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EbayItem from '../Types/EbayItem';
import { formatEbay } from './FormatEbay';

const BaseballCards = () => {
    const [cards, setCards] = useState<EbayItem[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = `https://svcs.sandbox.ebay.com/services/search/FindingService/v1`;
                url += `?OPERATION-NAME=findItemsByKeywords`;
                url += `&SERVICE-VERSION=1.0.0`;
                url += `&SECURITY-APPNAME=${process.env.REACT_APP_EBAY_API_KEY}`;
                url += `&RESPONSE-DATA-FORMAT=JSON`;
                url += `&REST-PAYLOAD`;
                const searchTerm = search.trim() === '' ? 'baseball card' : search;
                url += `&keywords=${encodeURIComponent(searchTerm)}`;

                const response = await axios.get(url);
                const items = response.data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
                const formattedCards = formatEbay(items);
                setCards(formattedCards);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchData();
    }, [search]);

    const paginate = (value: number) => {
        setCurrentPage(value);
    };
    const handleCardClick = (cardTitle: string) => {
        navigate(`/cards/baseball/${cardTitle}`);
    };

    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard);

    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                label="Search Baseball Cards"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />
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
            <Pagination
                count={Math.ceil(cards.length / cardsPerPage)}
                page={currentPage}
                onChange={(_, value) => paginate(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default BaseballCards;