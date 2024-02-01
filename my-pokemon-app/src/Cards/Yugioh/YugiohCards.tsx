import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Autocomplete } from '@mui/material';
import { YugiohCardData } from './YugiohCardData';
import { CardList, useList } from '../../Types/CardList'
import YugiohCardInfo from './YugiohCardInfo';
import { OptionType, SortOptionType } from '../../Types/Options';
import FilterFormControl from '../../Components/FilterFormControl';
import CardDisplay from '../../Components/CardDisplay';

type YugiohCardsProps = {
    selectedListId?: string;
    isInAddMode?: boolean;
};

const YugiohCards: React.FC<YugiohCardsProps & { onListQuantityChange?: () => void }> = ({ selectedListId, isInAddMode, onListQuantityChange }) => {
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
    const [collectedStatus, setCollectedStatus] = useState<{ [key: string]: boolean }>({});
    const [collectedQuantities, setCollectedQuantities] = useState<{ [key: string]: number }>({});

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
                setTotalPages(response.data.total_pages);

                if (isInAddMode) {
                    const quantitiesUrl = `http://localhost:8000/api/yugioh-cards-by-list/${selectedListId}/`;
                    const quantitiesResponse = await axios.get(quantitiesUrl);
                    console.log(quantitiesResponse.data.data)
                    quantitiesResponse.data.data.forEach((card: any) => {
                        quantities[card.id] = card.card_count || 0;
                    });
                }

                setCardQuantities(quantities);
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

    const handleCardQuantityChange = async () => {
        onListQuantityChange?.();
    };

    const handleAddCard = async (card: YugiohCardData) => {
        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [card.id]: (prevQuantities[card.id] || 0) + 1
        }));
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

    const incrementCardQuantity = async (card: YugiohCardData) => {
        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [card.id]: (prevQuantities[card.id] || 0) + 1
        }));
        updateCardQuantity(card.id.toString(), 'increment');
        handleListUpdate();
        await handleCardQuantityChange();
    };

    const decrementCardQuantity = async (card: YugiohCardData) => {
        setCardQuantities(prevQuantities => {
            if (prevQuantities[card.id] > 1) {
                updateCardQuantity(card.id.toString(), 'decrement');
                return { ...prevQuantities, [card.id]: prevQuantities[card.id] - 1 };
            }
            return prevQuantities;
        });
        handleListUpdate();
        await handleCardQuantityChange();
    };

    const handleDeleteCard = async (card: YugiohCardData) => {
        deleteCardFromList(card.id.toString()).then(() => {
            fetchData(currentPage);
        });
        handleListUpdate();
        await handleCardQuantityChange();
    };

    const handleIncrementCollectedQuantity = (cardId: string) => {
        if (collectedQuantities[cardId] < cardQuantities[cardId]) {
            setCollectedQuantities({
                ...collectedQuantities,
                [cardId]: (collectedQuantities[cardId] || 0) + 1,
            });
            // Add API call to increment collected quantity in backend if needed
        }
    };

    const handleDecrementCollectedQuantity = (cardId: string) => {
        if (collectedQuantities[cardId] > 0) {
            setCollectedQuantities({
                ...collectedQuantities,
                [cardId]: collectedQuantities[cardId] - 1,
            });
            // Add API call to decrement collected quantity in backend if needed
        }
    };

    const handleCheckboxChange = (cardId: string, isChecked: boolean) => {
        setCollectedStatus(prevStatus => ({
            ...prevStatus,
            [cardId]: isChecked
        }));

        const maxQuantity = cardQuantities[cardId] || 0;
        setCollectedQuantities(prevQuantities => ({
            ...prevQuantities,
            [cardId]: isChecked ? maxQuantity : 0,
        }));

        // Add API call to update collected status in backend if needed
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
                <YugiohCardInfo
                    card={selectedCard}
                    selectedCardListId={selectedListId}
                    incrementCardQuantity={incrementCardQuantity}
                    decrementCardQuantity={decrementCardQuantity}
                    deleteCard={handleDeleteCard}
                    close={handleCloseDialog}
                    cardQuantity={cardQuantities[selectedCard.id]}
                />
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
            <FilterFormControl
                id="card-filter"
                label="Card"
                filterOptions={filterOptions.card_type}
                selectedFilter={cardTypeFilter}
                setSelectedFilter={setCardTypeFilter}
            />
            <FilterFormControl
                id="frame-filter"
                label="Frame"
                filterOptions={filterOptions.frame_type}
                selectedFilter={frameTypeFilter}
                setSelectedFilter={setFrameTypeFilter}
            />
            <FilterFormControl
                id="race-filter"
                label="Race"
                filterOptions={filterOptions.race}
                selectedFilter={raceFilter}
                setSelectedFilter={setRaceFilter}
            />
            <FilterFormControl
                id="attribute-filter"
                label="Attribute"
                filterOptions={filterOptions.attribute}
                selectedFilter={attributeFilter}
                setSelectedFilter={setAttributeFilter}
            />
            <FilterFormControl
                id="rarity-filter"
                label="Rarity"
                filterOptions={filterOptions.rarities}
                selectedFilter={rarityFilter}
                setSelectedFilter={setRarityFilter}
            />
            <FilterFormControl
                id="set-filter"
                label="Set"
                filterOptions={filterOptions.set_name}
                selectedFilter={setFilter}
                setSelectedFilter={setSetFilter}
            />
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
                {cards.map((card) => (
                    <CardDisplay
                        key={card.id}
                        card={card}
                        onInfoClick={() => handleCardInfo(card)}
                        onAddCard={() => handleAddCard(card)}
                        onIncrementCard={() => incrementCardQuantity(card)}
                        onDecrementCard={() => decrementCardQuantity(card)}
                        onDeleteCard={() => handleDeleteCard(card)}
                        handleIncrementCollectedQuantity={() => handleIncrementCollectedQuantity(card.id.toString())}
                        handleDecrementCollectedQuantity={() => handleDecrementCollectedQuantity(card.id.toString())}
                        isSelectedListId={!!selectedListId}
                        isInAddMode={isInAddMode}
                        collectedStatus={collectedStatus[card.id]}
                        cardQuantities={cardQuantities}
                        onCheckboxChange={() => handleCheckboxChange}
                        image={card.card_images[0]?.image_url}
                        name={card.name}
                        id={card.id.toString()}
                        collectedQuantities={collectedQuantities}
                    />
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
