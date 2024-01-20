import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CardData from './CardData';

const PokemonCards = () => {
    const [cards, setCards] = useState<CardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = async () => {
        try {
            const params = new URLSearchParams();

            if (search) {
                params.append('search', search);
            }
            if (filter) {
                params.append('filter', filter);
            }
            params.append('page', currentPage.toString());

            const response = await axios.get('http://localhost:8000/api/pokemon-cards/', { params });

            setCards(response.data.data);
            setTotalPages(response.data.total_pages);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearchClick = () => {
        setCurrentPage(1);
        fetchData();
    };

    const paginate = (value: number) => {
        setCurrentPage(value);
        fetchData();
    };

    const handleCardClick = (cardName: string) => {
        navigate(`/cards/pokemon/${cardName}`);
    };

    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                label="Search Pokémon Cards"
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
                {cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card onClick={() => handleCardClick(card.name)}>
                            <CardMedia
                                component="img"
                                height="auto"
                                image={card.images.small}
                                alt={card.name}
                            />
                            <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                                {card.name}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, value) => paginate(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default PokemonCards;    