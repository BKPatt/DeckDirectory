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

    const fetchData = async () => {
        try {
            let url = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';
            if (search) {
                url += `?name=${encodeURIComponent(search)}`;
            }

            const response = await axios.get(url);
            setCards(response.data.data.map((card: YugiohCardData) => ({
                name: card.name,
                card_images: card.card_images
            })));
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };
    fetchData();

    useEffect(() => {
        fetchData();
    }, []);


    const handleSearchClick = () => {
        fetchData();
    };

    const paginate = (value: number) => {
        setCurrentPage(value);
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
                {currentCards.map((card, index) => {
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
                count={Math.ceil(cards.length / cardsPerPage)}
                page={currentPage}
                onChange={(_, value) => paginate(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default YugiohCards;
