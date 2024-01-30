import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Autocomplete } from '@mui/material';
import { YugiohCardData } from './YugiohCardData';
import { CardList, useList } from '../../Types/CardList'
import YugiohCardInfo from './YugiohCardInfo';
import { OptionType, SortOptionType } from '../../Types/Options';

type YugiohCardsProps = {
    selectedListId?: string;
    isInAddMode?: boolean;
};

const YugiohCards: React.FC<YugiohCardsProps & { onListUpdate?: () => void }> = ({ selectedListId, isInAddMode, onListUpdate }) => {
    const [cards, setCards] = useState<YugiohCardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const [showData, setShowData] = useState(false);
    const [selectedCard, setSelectedCard] = useState<YugiohCardData | null>(null);
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
        card_type: OptionType[];
        frame_type: OptionType[];
        race: OptionType[];
        attribute: OptionType[];
        set_name: OptionType[];
        rarities: OptionType[];
    }>({
        card_type: [],
        frame_type: [],
        race: [],
        attribute: [],
        set_name: [],
        rarities: [],
    });
    const [cardTypeFilter, setCardTypeFilter] = useState<OptionType | null>(null);
    const [frameTypeFilter, setFrameTypeFilter] = useState<OptionType | null>(null);
    const [raceFilter, setRaceFilter] = useState<OptionType | null>(null);
    const [attributeFilter, setAttributeFilter] = useState<OptionType | null>(null);
    const [setFilter, setSetFilter] = useState<OptionType | null>(null);
    const [rarityFilter, setRarityFilter] = useState<OptionType | null>(null);

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
            let url = isInAddMode == null ? `http://localhost:8000/api/fetch-yugioh-cards/`
                : !isInAddMode ? `http://localhost:8000/api/yugioh-cards-by-list/${selectedListId}/`
                    : `http://localhost:8000/api/fetch-yugioh-cards/`;
            const response = await axios.get(url, params);

            if (response.data && Array.isArray(response.data.data)) {
                let fetchedCards: YugiohCardData[] = response.data.data;

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
                const response = await axios.get('http://localhost:8000/api/yugioh-filter-options/');
                setFilterOptions(response.data);
            } catch (error) {
                console.error('Error fetching filter options:', error);
            }
        };

        fetchFilterOptions();
    }, []);

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
                card_type: 'yugioh',
                operation
            });
            console.log(`Card quantity ${operation}ed successfully`);
        } catch (error) {
            console.error(`Error in ${operation}ing card quantity:`, error);
        }
    };

    const incrementCardQuantity = (card: YugiohCardData) => {
        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [card.id]: (prevQuantities[card.id] || 0) + 1
        }));
        updateCardQuantity(card.id.toString(), 'increment');
        handleListUpdate();
        onListUpdate?.();
    };

    const decrementCardQuantity = (card: YugiohCardData) => {
        setCardQuantities(prevQuantities => {
            if (prevQuantities[card.id] > 1) {
                updateCardQuantity(card.id.toString(), 'decrement');
                return { ...prevQuantities, [card.id]: prevQuantities[card.id] - 1 };
            }
            return prevQuantities;
        });
        handleListUpdate();
        onListUpdate?.();
    };

    const handleDeleteCard = (card: YugiohCardData) => {
        deleteCardFromList(card.id.toString()).then(() => {
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
                    card_type: 'yugioh'
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

    const handlePageChange = (value: number) => {
        setCurrentPage(value);
        fetchData(value);
    };

    const handleSearchClick = () => {
        setCurrentPage(1);
        fetchData(1, {
            card_type: cardTypeFilter,
            frame_type: frameTypeFilter,
            race: raceFilter,
            attribute: attributeFilter,
            rarities: rarityFilter,
            set_name: setFilter,
        });
    };

    const handleCardInfo = (card: YugiohCardData) => {
        setSelectedCard(card);
        setShowData(true);
    };

    const handleCloseDialog = () => {
        setShowData(false);
        setSelectedCard(null);
    };

    const handleClearFilters = () => {
        setSearch('');
        setCardTypeFilter(null);
        setFrameTypeFilter(null);
        setRaceFilter(null);
        setAttributeFilter(null);
        setSetFilter(null);
        setRarityFilter(null);
        setSortOption(null);

        fetchData(1);
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
                <YugiohCardInfo card={selectedCard} />
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
                label="Search Yu-Gi-Oh! Cards"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-card"
                    disablePortal
                    options={filterOptions.card_type}
                    value={cardTypeFilter}
                    onChange={(_event, newValue) => setCardTypeFilter(newValue)}
                    sx={{ width: 175 }}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    renderInput={(params) => <TextField {...params} label="Card Type" />}
                />
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-frame"
                    disablePortal
                    options={filterOptions.frame_type}
                    value={frameTypeFilter}
                    onChange={(_event, newValue) => setFrameTypeFilter(newValue)}
                    sx={{ width: 175 }}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    renderInput={(params) => <TextField {...params} label="Frame Type" />}
                />
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-race"
                    disablePortal
                    options={filterOptions.race}
                    value={raceFilter}
                    onChange={(_event, newValue) => setRaceFilter(newValue)}
                    sx={{ width: 175 }}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    renderInput={(params) => <TextField {...params} label="Race" />}
                />
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-attribute"
                    disablePortal
                    options={filterOptions.attribute}
                    value={attributeFilter}
                    onChange={(_event, newValue) => setAttributeFilter(newValue)}
                    sx={{ width: 175 }}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => <TextField {...params} label="Attribute" />}
                />
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-rarities"
                    disablePortal
                    options={filterOptions.rarities}
                    value={rarityFilter}
                    onChange={(_event, newValue) => setRarityFilter(newValue)}
                    sx={{ width: 175 }}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => <TextField {...params} label="Rarity" />}
                />
            </FormControl>
            <FormControl sx={{ minWidth: { xs: '100%', sm: '160px' }, margin: '5px', mb: 2 }}>
                <Autocomplete
                    id="combo-box-set"
                    disablePortal
                    options={filterOptions.set_name}
                    value={setFilter}
                    onChange={(_event, newValue) => setSetFilter(newValue)}
                    sx={{ width: 175 }}
                    isOptionEqualToValue={(option, value) => option.label === value.label}
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
                    sx={{ width: 175 }}
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
                                image={card.card_images[0]?.image_url}
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
                onChange={(_, value) => handlePageChange(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default YugiohCards;
