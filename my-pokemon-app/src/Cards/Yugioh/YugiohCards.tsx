import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import YugiohCardData from './YugiohCardData';

const YugiohCards = () => {
    const [cards, setCards] = useState<YugiohCardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = async (page?: number) => {
        try {
            if (!page) {
                page = 1
            }
            const params = {
                params: {
                    name: search,
                    page: page,
                    page_size: cardsPerPage
                }
            };
            const response = await axios.get('http://localhost:8000/api/fetch-yugioh-cards/', params);
            setCards(response.data.data);
            setTotalPages(response.data.total_pages);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePageChange = (value: number) => {
        fetchData(value);
    };

    const handleSearchClick = () => {
        fetchData(1);
        setCurrentPage(1);
    };

    const handleCardClick = (cardName: string) => {
        navigate(`/cards/yugioh/${encodeURIComponent(cardName)}`);
    };

    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard);

    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                label="Search Yu-Gi-Oh! Cards"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Filter"
                variant="outlined"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleSearchClick}>Search</Button>
            <Grid container spacing={2}>
                {cards.map((card, index) => {
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                            <Card onClick={() => handleCardClick(card.name)}>
                                <CardMedia
                                    component="img"
                                    height="auto"
                                    image={card.card_images[0]?.image_url_small}
                                    alt={card.name}
                                />
                                <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                                    {card.name}
                                </Typography>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, value) => handlePageChange(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default YugiohCards;
