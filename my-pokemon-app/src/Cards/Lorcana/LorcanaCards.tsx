import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LorcanaCardData from './LorcanaCardData';

type LorcanaCardsProps = {
    selectedListId?: string;
    isInAddMode?: boolean;
};

const LorcanaCards: React.FC<LorcanaCardsProps> = ({ selectedListId, isInAddMode }) => {
    const [cards, setCards] = useState<LorcanaCardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const [filter, setFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [selectedCard, setSelectedCard] = useState<LorcanaCardData | null>(null);
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
                url = `http://localhost:8000/api/lorcana-cards/`
            } else {
                url = !isInAddMode ? `http://localhost:8000/api/lorcana-cards-by-list/${selectedListId}/` : `http://localhost:8000/api/lorcana-cards/`;
            }
            const response = await axios.get(url, params);
            if (Array.isArray(response.data.data)) {
                setCards(response.data.data.map((card: any) => ({
                    id: card.id,
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

    const handleAddCard = async (card: LorcanaCardData) => {
        if (selectedListId) {
            try {
                const response = await axios.post('http://localhost:8000/api/add-card-to-list/', {
                    list_id: selectedListId,
                    card_id: card.id,
                    card_type: 'lorcana'
                });

                if (response.status === 200) {
                    console.log('Card added to list successfully');
                }
            } catch (error) {
                console.error('Error adding card to list:', error);
            }
        }
    };

    const handleSearchClick = () => {
        fetchData(1);
        setCurrentPage(1);
    };

    const paginate = (value: number) => {
        setCurrentPage(value);
        fetchData(value);
    };

    const handleCardInfo = (card: LorcanaCardData) => {
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
                            <Card sx={{ position: 'relative', '&:hover .cardActions': { opacity: 1 } }}>
                                <CardMedia
                                    component="img"
                                    height="auto"
                                    image={card.Image}
                                    alt={card.Name}
                                />
                                <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                                    {card.Name}
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
                onChange={(_, value) => paginate(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default LorcanaCards;
