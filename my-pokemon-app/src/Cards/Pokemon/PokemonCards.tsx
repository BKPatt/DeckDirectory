import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { CardData } from './CardData';
import CardInfo from './PokemonCardInfo';
import { CardList, useList } from '../../Types/CardList'

type PokemonCardsProps = {
    selectedListId?: string;
    isInAddMode?: boolean;
};

const PokemonCards: React.FC<PokemonCardsProps & { onListUpdate?: () => void }> = ({ selectedListId, isInAddMode, onListUpdate }) => {
    const [cards, setCards] = useState<CardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const [showData, setShowData] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [filter, setFilter] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [cardQuantities, setCardQuantities] = useState<{ [key: string]: number }>({});
    const { listData, updateListData } = useList();

    const fetchData = async (page: number = 1) => {
        try {
            const params = {
                params: {
                    search: search,
                    page: page,
                    page_size: cardsPerPage,
                    list_id: selectedListId,
                }
            };
            let url = isInAddMode == null ? `http://localhost:8000/api/pokemon-cards/`
                : !isInAddMode ? `http://localhost:8000/api/cards-by-list/${selectedListId}/`
                    : `http://localhost:8000/api/pokemon-cards/`;
            const response = await axios.get(url, params);

            if (response.data && Array.isArray(response.data.data)) {
                let fetchedCards: CardData[] = response.data.data;

                const uniqueCards: CardData[] = [];
                const cardCount: { [key: string]: number } = {};

                fetchedCards.forEach((card: CardData) => {
                    if (!cardCount[card.id]) {
                        uniqueCards.push(card);
                        cardCount[card.id] = 1;
                    } else {
                        cardCount[card.id]++;
                    }
                });

                setCards(uniqueCards);
                setCardQuantities(cardCount);
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
        handleListUpdate();
    }, [selectedListId]);

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

    const handleListUpdate = async () => {
        const updatedList = await fetchListData();
        if (updatedList && listData) {
            const index = listData.findIndex(list => list.id === updatedList.id);
            if (index !== -1) {
                const updatedListData = [
                    ...listData.slice(0, index),
                    updatedList,
                    ...listData.slice(index + 1)
                ];
                updateListData(updatedListData);
            }
        }
    };

    const fetchListData = async (): Promise<CardList | null> => {
        if (!selectedListId) return null;
        const getListByIdUrl = `http://localhost:8000/api/get-list-by-id/${selectedListId}/`;
        try {
            const response = await axios.get(getListByIdUrl);
            return response.data;
        } catch (error) {
            console.error(`Error fetching updated list data:`, error);
            return null;
        }
    }

    const updateCardQuantity = async (cardId: string, operation: 'increment' | 'decrement') => {
        const url = `http://localhost:8000/api/update-card-quantity/`;

        try {
            await axios.post(url, {
                list_id: selectedListId,
                card_id: cardId,
                card_type: 'pokemon',
                operation
            });
            console.log(`Card quantity ${operation}ed successfully`);
        } catch (error) {
            console.error(`Error in ${operation}ing card quantity:`, error);
        }
    };

    const incrementCardQuantity = (card: CardData) => {
        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [card.id]: (prevQuantities[card.id] || 0) + 1
        }));
        updateCardQuantity(card.id, 'increment');
        handleListUpdate();
        onListUpdate?.();
    };

    const decrementCardQuantity = (card: CardData) => {
        setCardQuantities(prevQuantities => {
            if (prevQuantities[card.id] > 1) {
                updateCardQuantity(card.id, 'decrement');
                return { ...prevQuantities, [card.id]: prevQuantities[card.id] - 1 };
            }
            return prevQuantities;
        });
        handleListUpdate();
        onListUpdate?.();
    };

    const handleDeleteCard = (card: CardData) => {
        deleteCardFromList(card.id).then(() => {
            fetchData(currentPage);
        });
        handleListUpdate();
        onListUpdate?.();
    };

    const deleteCardFromList = async (cardId: string) => {
        const url = `http://localhost:8000/api/delete-card-from-list/`;
        try {
            const response = await axios.delete(url, {
                data: {
                    list_id: selectedListId,
                    card_id: cardId,
                    card_type: 'pokemon'
                }
            });
            if (response.status === 200) {
                console.log('Card deleted from list successfully');
                return true;
            }
        } catch (error) {
            console.error('Error deleting card from list:', error);
            return false;
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
                {Array.isArray(cards) && cards.map((card, index) => (
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
                            <Box className="cardActions" sx={{ position: 'absolute', top: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', transition: 'opacity 0.3s' }}>
                                {isInAddMode && (
                                    <Button variant="contained" color="primary" onClick={() => handleAddCard(card)} sx={{ mb: 1, width: '70px' }}>
                                        Add
                                    </Button>
                                )}
                                <Button variant="contained" color="primary" onClick={() => handleCardInfo(card)} sx={{ mb: 1, width: '70px' }}>
                                    Info
                                </Button>
                                {selectedListId && !isInAddMode && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {cardQuantities[card.id] > 1 ? (
                                            <Button variant="contained" onClick={() => decrementCardQuantity(card)} sx={{ width: '35px' }}>-</Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleDeleteCard(card)}
                                                sx={{
                                                    width: '35px',
                                                    backgroundColor: 'red',
                                                    '&:hover': {
                                                        backgroundColor: 'darkred',
                                                    },
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )}
                                        <Typography sx={{ mx: 1 }}>{cardQuantities[card.id] || 0}</Typography>
                                        <Button variant="contained" onClick={() => incrementCardQuantity(card)} sx={{ width: '35px' }}>+</Button>
                                    </Box>
                                )}
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