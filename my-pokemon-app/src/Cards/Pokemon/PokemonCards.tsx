import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { CardData } from './CardData';
import CardInfo from './PokemonCardInfo';

type PokemonCardsProps = {
    onAddCard?: (card: CardData) => void;
    selectedListId?: string;
};

const PokemonCards: React.FC<PokemonCardsProps> = ({ onAddCard, selectedListId }) => {
    const [cards, setCards] = useState<CardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const [showData, setShowData] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [filter, setFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);

    const fetchData = async (page = 1) => {
        try {
            const params = {
                params: {
                    search: search,
                    page: page,
                    page_size: cardsPerPage
                }
            };
            const response = await axios.get('http://localhost:8000/api/pokemon-cards/', params);
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

    const handleAddCard = async (card: CardData) => {
        if (selectedListId) {
            try {
                const response = await axios.post('http://localhost:8000/api/add-card-to-list/', {
                    list_id: selectedListId,
                    card_id: card.id,
                    card_type: 'pokemon'
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
        setCurrentPage(1);
        fetchData(1);
    };

    const paginate = (value: number) => {
        fetchData(value);
    };

    const handleCardInfo = (card: CardData) => {
        setSelectedCard(card);
        setShowData(true);
    };

    const handleCloseDialog = () => {
        setShowData(false);
        setSelectedCard(null);
    };

    const cardInfo = selectedCard && (
        <Dialog
            open={showData}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="lg"
        >
            <DialogTitle>{ }</DialogTitle>
            <DialogContent>
                <CardInfo card={selectedCard} />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDialog} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );

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
                        <Card sx={{ position: 'relative', '&:hover .cardActions': { opacity: 1 } }}>
                            <CardMedia
                                component="img"
                                height="auto"
                                image={card.images.small}
                                alt={card.name}
                            />
                            <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                                {card.name}
                            </Typography>
                            <Box className="cardActions" sx={{ position: 'absolute', top: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', transition: 'opacity 0.3s' }}>
                                <Button variant="contained" color="primary" onClick={() => handleAddCard(card)} sx={{ m: 1 }}>
                                    Add
                                </Button>
                                <Button variant="contained" color="primary" onClick={() => handleCardInfo(card)} sx={{ m: 1 }}>
                                    Info
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {cardInfo}
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