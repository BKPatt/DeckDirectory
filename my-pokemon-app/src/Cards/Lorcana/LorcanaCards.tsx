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
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = async (page = currentPage) => {
        try {
            let url = `http://localhost:8000/api/lorcana-cards/?page=${page}`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            const response = await axios.get(url);
            setCards(response.data.data.map((card: any) => ({
                Artist: card.artist,
                Set_Name: card.set_name,
                Set_Num: card.set_num,
                Color: card.color,
                Image: card.image,
                Cost: card.cost,
                Inkable: card.inkable,
                Name: card.name,
                Type: card.type,
                Rarity: card.rarity,
                Flavor_Text: card.flavor_text,
                Card_Num: card.card_num,
                Body_Text: card.body_text,
                Set_ID: card.set_id,
            })));
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
        navigate(`/cards/lorcana/${encodeURIComponent(cardName)}`);
    };

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
                {cards.map((card, index) => {
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

export default LorcanaCards;
