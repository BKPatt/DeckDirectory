import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button } from '@mui/material';
import YugiohCardData from './YugiohCardData';

type YugiohCardsProps = {
    selectedListId?: string;
    isInAddMode?: boolean;
};

const YugiohCards: React.FC<YugiohCardsProps> = ({ selectedListId, isInAddMode }) => {
    const [cards, setCards] = useState<YugiohCardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const [filter, setFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [selectedCard, setSelectedCard] = useState<YugiohCardData | null>(null);
    const [showData, setShowData] = useState(false);

    const fetchData = async (page = 1) => {
        try {
            const params = {
                params: {
                    search: search,
                    page: page,
                    page_size: cardsPerPage,
                    list_id: selectedListId,
                }
            };
            let url
            if (isInAddMode == null) {
                url = `http://localhost:8000/api/fetch-yugioh-cards/`
            } else {
                url = !isInAddMode ? `http://localhost:8000/api/cards-by-list/${selectedListId}/` : `http://localhost:8000/api/fetch-yugioh-cards/`;
            }
            const response = await axios.get(url, params);
            if (Array.isArray(response.data.data)) {
                setCards(response.data.data);
                setTotalPages(response.data.total_pages);
            } else {
                console.error('Unexpected response format');
            }
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
        if (selectedListId) {
            fetchData();
        }
    }, [selectedListId]);

    const handleAddCard = async (card: YugiohCardData) => {
        if (selectedListId) {
            try {
                const response = await axios.post('http://localhost:8000/api/add-card-to-list/', {
                    list_id: selectedListId,
                    card_id: card.id,
                    card_type: 'yugioh'
                });

                if (response.status === 200) {
                    console.log('Card added to list successfully');
                }
            } catch (error) {
                console.error('Error adding card to list:', error);
            }
        }
    };

    const handlePageChange = (value: number) => {
        setCurrentPage(value);
        fetchData(value);
    };

    const handleSearchClick = () => {
        fetchData(1);
        setCurrentPage(1);
    };

    const handleCardInfo = (card: YugiohCardData) => {
        setSelectedCard(card);
        setShowData(true);
    };

    const handleCloseDialog = () => {
        setShowData(false);
        setSelectedCard(null);
    };

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
                            <Card sx={{ position: 'relative', '&:hover .cardActions': { opacity: 1 } }}>
                                <CardMedia
                                    component="img"
                                    height="auto"
                                    image={card.card_images[0]?.image_url_small}
                                    alt={card.name}
                                />
                                <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                                    {card.name}
                                </Typography>
                                <Box className="cardActions" sx={{ position: 'absolute', top: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', transition: 'opacity 0.3s' }}>
                                    {isInAddMode && (
                                        <Button variant="contained" color="primary" onClick={() => handleAddCard(card)} sx={{ m: 1 }}>
                                            Add
                                        </Button>
                                    )}
                                    <Button variant="contained" color="primary" onClick={() => handleCardInfo(card)} sx={{ m: 1 }}>
                                        Info
                                    </Button>
                                </Box>
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
