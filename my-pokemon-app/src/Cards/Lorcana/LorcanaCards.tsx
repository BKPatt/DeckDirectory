import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    TextField,
    Grid,
    Pagination,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    Autocomplete
} from '@mui/material';
import LorcanaCardData from './LorcanaCardData';
import { CardList, useList } from '../../Types/CardList';
import LorcanaCardInfo from './LorcanaCardInfo';
import { OptionType, SortOptionType } from '../../Types/Options';
import FilterFormControl from '../../Components/FilterFormControl';
import CardDisplay from '../../Components/CardDisplay';

type LorcanaCardsProps = {
    selectedListId?: string;
    isInAddMode?: boolean;
};

const LorcanaCards: React.FC<LorcanaCardsProps & { onListQuantityChange?: () => void }> = ({ selectedListId, isInAddMode, onListQuantityChange }) => {
    const [cards, setCards] = useState<LorcanaCardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const [showData, setShowData] = useState(false);
    const [selectedCard, setSelectedCard] = useState<LorcanaCardData | null>(null);
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
        color: OptionType[];
        rarity: OptionType[];
        set_name: OptionType[];
    }>({
        color: [],
        rarity: [],
        set_name: [],
    });
    const [colorFilter, setColorFilter] = useState<OptionType | null>(null);
    const [inkableFilter, setInkableFilter] = useState<OptionType | null>(null);
    const [rarityFilter, setRarityFilter] = useState<OptionType | null>(null);
    const [setFilter, setSetFilter] = useState<OptionType | null>(null);
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

            let url = isInAddMode == null ? `http://localhost:8000/api/lorcana-cards/`
                : !isInAddMode ? `http://localhost:8000/api/lorcana-cards-by-list/${selectedListId}/`
                    : `http://localhost:8000/api/lorcana-cards/`;
            const response = await axios.get(url, params);

            if (response.data && Array.isArray(response.data.data)) {
                let fetchedCards: LorcanaCardData[] = response.data.data;

                const quantities: { [key: string]: number } = {};
                fetchedCards.forEach(card => {
                    quantities[card.id] = card.card_count;
                });

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
                    card_count: card.card_count,
                })));
                setTotalPages(response.data.total_pages);

                if (isInAddMode) {
                    const quantitiesUrl = `http://localhost:8000/api/lorcana-cards-by-list/${selectedListId}/`;
                    const quantitiesResponse = await axios.get(quantitiesUrl);
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
        handleListUpdate();
    }, [selectedListId]);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/lorcana-filter-options/');
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
                card_type: 'lorcana',
                operation
            });
            console.log(`Card quantity ${operation}ed successfully`);
        } catch (error) {
            console.error(`Error in ${operation}ing card quantity:`, error);
        }
    };

    const incrementCardQuantity = async (card: LorcanaCardData) => {
        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [card.id]: (prevQuantities[card.id] || 0) + 1
        }));
        updateCardQuantity(card.id.toString(), 'increment');
        handleListUpdate();
        await handleCardQuantityChange();
    };

    const decrementCardQuantity = async (card: LorcanaCardData) => {
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

    const handleDeleteCard = async (card: LorcanaCardData) => {
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
                    card_type: 'lorcana'
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

    const handleAddCard = async (card: LorcanaCardData) => {
        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [card.id]: (prevQuantities[card.id] || 0) + 1
        }));
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
        setCurrentPage(1);
        fetchData(1, {
            color: colorFilter,
            inkable: inkableFilter,
            rarity: rarityFilter,
            set_name: setFilter,
        });
    };

    const paginate = (value: number) => {
        setCurrentPage(value);
        fetchData(value, {
            color: colorFilter,
            inkable: inkableFilter,
            rarity: rarityFilter,
            set_name: setFilter,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setColorFilter(null);
        setInkableFilter(null);
        setRarityFilter(null);
        setSetFilter(null);
        setSortOption(null);

        fetchData(1);
    };

    const handleCardInfo = (card: LorcanaCardData) => {
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
                <LorcanaCardInfo
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
                label="Search Lorcana Cards"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />
            <FilterFormControl
                id="color-filter"
                label="Color"
                filterOptions={filterOptions.color}
                selectedFilter={colorFilter}
                setSelectedFilter={setColorFilter}
            />
            <FilterFormControl
                id="rarity-filter"
                label="Rarity"
                filterOptions={filterOptions.rarity}
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
                    sx={{ width: 200 }}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => <TextField {...params} label="Sort By" />}
                />
            </FormControl>
            <Button sx={{ margin: '5px', width: 100, height: '55px' }} variant="contained" onClick={handleSearchClick}>Search</Button>
            <Button sx={{ margin: '5px', width: 150, height: '55px' }} variant="contained" onClick={handleClearFilters}>Clear Filters</Button>            <Grid container spacing={2}>
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
                        image={card.Image}
                        name={card.Name}
                        id={card.id.toString()}
                        collectedQuantities={collectedQuantities}
                    />
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

export default LorcanaCards;
