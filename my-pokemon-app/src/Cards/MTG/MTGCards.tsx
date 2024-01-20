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
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = async (page = currentPage) => {
        try {
            let url = `http://localhost:8000/api/mtg-cards/?search=${encodeURIComponent(search)}&page=${page}`;
            const response = await axios.get(url);
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
        fetchData();
        setCurrentPage(1);
    };

    const paginate = (value: number) => {
        setCurrentPage(value);
        fetchData(value);
    };

    const handleCardClick = (cardName: string) => {
        navigate(`/cards/mtg/${encodeURIComponent(cardName)}`);
    };

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
                {cards.map((card, index) => {
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
                count={totalPages}
                page={currentPage}
                onChange={(_, value) => paginate(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default MTGCards;