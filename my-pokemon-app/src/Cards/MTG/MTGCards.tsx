import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CardList, useList } from '../../Types/CardList'
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, FormControl, Autocomplete } from '@mui/material';
import Default from '../../assets/Default.png'
import { MTGCardData } from './MTGCardData';
import MTGCardInfo from './MTGCardInfo';
import { SortOptionType, OptionType, CardProps } from '../../Types/Options';
import SearchIcon from '@mui/icons-material/Search';

const MTGCards: React.FC<CardProps & { onListUpdate?: () => void }> = ({ selectedListId, isInAddMode, onListUpdate }) => {
    const [cards, setCards] = useState<MTGCardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const [showData, setShowData] = useState(false);
    const [selectedCard, setSelectedCard] = useState<MTGCardData | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [cardQuantities, setCardQuantities] = useState<{ [key: string]: number }>({});
    const [sortOption, setSortOption] = useState<SortOptionType>(null); const sortOptions = [
        { label: 'Name Ascending', value: 'name_asc' },
        { label: 'Name Descending', value: 'name_desc' },
        { label: 'Price Ascending', value: 'price_asc' },
        { label: 'Price Descending', value: 'price_desc' },
    ];
    const { listData, updateListData } = useList();
    const [filterOptions, setFilterOptions] = useState<{
        type_line: OptionType[];
        rarities: OptionType[];
        sets: OptionType[];
    }>({
        type_line: [],
        rarities: [],
        sets: [],
    });
    const [typeFilter, setTypeFilter] = useState<OptionType | null>(null);
    const [rarityFilter, setRarityFilter] = useState<OptionType | null>(null);
    const [setFilter, setSetFilter] = useState<OptionType | null>(null);

    const fetchData = async (page: number = 1, filters = {}) => {
        try {
            const params = {
                params: {
                    search: search,
                    page: page,
                    page_size: cardsPerPage,
                    list_id: selectedListId,
                    sort: sortOption?.value,
                    isInAddMode: isInAddMode,
                    ...filters
                }
            };
            let url = isInAddMode == null ? `http://localhost:8000/api/mtg-cards/`
                : !isInAddMode ? `http://localhost:8000/api/mtg-cards-by-list/${selectedListId}/`
                    : `http://localhost:8000/api/mtg-cards/`;
            const response = await axios.get(url, params);

            if (response.data && Array.isArray(response.data.data)) {
                let fetchedCards: MTGCardData[] = response.data.data;

                const quantities: { [key: string]: number } = {};
                fetchedCards.forEach(card => {
                    quantities[card.id] = card.card_count;
                });

                setCards(fetchedCards);
                setCardQuantities(quantities);
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

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/mtg-filter-options/');
                setFilterOptions(response.data);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchFilterOptions();
    }, []);

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
                card_type: 'mtg',
                operation
            });
            console.log(`Card quantity ${operation}ed successfully`);
        } catch (error) {
            console.error(`Error in ${operation}ing card quantity:`, error);
        }
    };

    const incrementCardQuantity = (card: MTGCardData) => {
        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [card.id]: (prevQuantities[card.id] || 0) + 1
        }));
        updateCardQuantity(card.id, 'increment');
        handleListUpdate();
        onListUpdate?.();
    };

    const decrementCardQuantity = (card: MTGCardData) => {
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

    const handleDeleteCard = (card: MTGCardData) => {
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
                    card_type: 'mtg'
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

    const handleAddCard = async (card: MTGCardData) => {
        if (selectedListId) {
            try {
                const response = await axios.post('http://localhost:8000/api/add-card-to-list/', {
                    list_id: selectedListId,
                    card_id: card.id,
                    card_type: 'mtg'
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
        fetchData(1, {
            type_line: typeFilter,
            rarity: rarityFilter,
            set: setFilter,
        });
    };

    const paginate = (value: number) => {
        fetchData(value, {
            type_line: typeFilter,
            rarity: rarityFilter,
            set: setFilter,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setTypeFilter(null);
        setRarityFilter(null);
        setSetFilter(null);
        setSortOption(null);
    };

    const handleCardInfo = (card: MTGCardData) => {
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
                <MTGCardInfo card={selectedCard} />
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
                label="Search MTG Cards"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-type"
                    disablePortal
                    options={filterOptions.type_line}
                    value={typeFilter}
                    onChange={(_event, newValue) => setTypeFilter(newValue)}
                    sx={{ width: 200 }}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    renderInput={(params) => <TextField {...params} label="Type" />}
                />
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-rarity"
                    disablePortal
                    options={filterOptions.rarities}
                    value={rarityFilter}
                    onChange={(_event, newValue) => setRarityFilter(newValue)}
                    sx={{ width: 200 }}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => <TextField {...params} label="Rarity" />}
                />
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-set"
                    disablePortal
                    options={filterOptions.sets}
                    value={setFilter}
                    onChange={(_event, newValue) => setSetFilter(newValue)}
                    sx={{ width: 200 }}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => <TextField {...params} label="Set" />}
                />
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-sort"
                    disablePortal
                    options={sortOptions}
                    value={sortOption}
                    onChange={(_event, newValue) => setSortOption(newValue)}
                    sx={{ width: 200 }}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => <TextField {...params} label="Sort By" />}
                />
            </FormControl>
            <Button sx={{ margin: '5px', width: 100, height: '55px' }} variant="contained" onClick={handleSearchClick}>Search</Button>
            <Button sx={{ margin: '5px', width: 150, height: '55px' }} variant="contained" onClick={handleClearFilters}>Clear Filters</Button>
            <Grid container spacing={2}>
                {Array.isArray(cards) && cards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card sx={{ position: 'relative', '&:hover .cardActions': { opacity: 1 } }}>
                            <CardMedia
                                component="img"
                                height="auto"
                                image={card.image_uris?.large || Default}
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

export default MTGCards;