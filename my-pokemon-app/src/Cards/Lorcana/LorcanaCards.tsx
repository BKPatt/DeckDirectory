import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LorcanaCardData from './LorcanaCardData';

const LorcanaCards = () => {
    const [cards, setCards] = useState<LorcanaCardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');

    const fetchData = async () => {
        try {
            let url = 'https://api.lorcana-api.com/cards/fetch';
            if (search) {
                url += `?search=${encodeURIComponent(search)}`;
            }

            const response = await axios.get(url);
            setCards(response.data.map((card: any) => ({
                Artist: card.Artist,
                Set_Name: card.Set_Name,
                Set_Num: card.Set_Num,
                Color: card.Color,
                Image: card.Image,
                Cost: card.Cost,
                Inkable: card.Inkable,
                Name: card.Name,
                Type: card.Type,
                Rarity: card.Rarity,
                Flavor_Text: card.Flavor_Text,
                Card_Num: card.Card_Num,
                Body_Text: card.Body_Text,
                Set_ID: card.Set_ID,
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
        navigate(`/cards/lorcana/${encodeURIComponent(cardName)}`);
    };

    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard);

    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                label="Search Lorcana Cards"
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
                            <Card onClick={() => handleCardClick(card.Name)}>
                                <CardMedia
                                    component="img"
                                    height="auto"
                                    image={card.Image}
                                    alt={card.Name}
                                />
                                <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                                    {card.Name}
                                </Typography>
                                {/* Optionally display more card details here */}
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

export default LorcanaCards;
