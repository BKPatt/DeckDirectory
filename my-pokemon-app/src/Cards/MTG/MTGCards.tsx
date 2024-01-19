import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Default from '../../assets/Default.png'
import MTGCardData from './MTGCardData';

const MTGCards = () => {
    const [cards, setCards] = useState<MTGCardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            let url = '';
            let response;

            if (search) {
                url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(search)}&page=1`;
                response = await axios.get(url);
                setCards(response.data.data.map((card: MTGCardData) => ({
                    name: card.name,
                    small: card.image_uris?.small
                })));
            } else {
                url = `https://api.scryfall.com/cards/search?q=*&page=1&order=name`;
                response = await axios.get(url);
                const allCards = response.data.data;

                if (allCards.length < 45) {
                    let additionalCards: MTGCardData[] = [];
                    for (let i = 2; i <= 3; i++) {
                        const nextPageResponse = await axios.get(`https://api.scryfall.com/cards/search?q=*&page=${i}&order=name`);
                        additionalCards = additionalCards.concat(nextPageResponse.data.data);
                    }
                    setCards(allCards.concat(additionalCards).slice(0, 45));
                } else {
                    setCards(allCards.slice(0, 45));
                }
            }
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    const handleSearchClick = () => {
        fetchData();
    };

    const paginate = (value: number) => {
        setCurrentPage(value);
    };

    const handleCardClick = (cardName: string) => {
        navigate(`/cards/mtg/${encodeURIComponent(cardName)}`);
    };

    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard);

    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                label="Search MTG Cards"
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
                                    image={card.image_uris?.small || Default}
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

export default MTGCards;