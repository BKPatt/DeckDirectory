import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Grid,
    Pagination,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    TextField,
    InputAdornment
} from '@mui/material';
import { CardData, Tcgplayer } from './CardData';
import CardInfo from './PokemonCardInfo';
import { CardList, useList } from '../../Types/CardList'
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import { SortOptionType, OptionType, CardProps } from '../../Types/Options';
import FilterFormControl from '../../Components/FilterFormControl';
import CardDisplay from '../../Components/CardDisplay';

const PokemonCards: React.FC<CardProps & { onListQuantityChange?: () => void }> = ({ selectedListId, isInAddMode, onListQuantityChange }) => {
    const [cards, setCards] = useState<CardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const [showData, setShowData] = useState(false);
    const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [cardQuantities, setCardQuantities] = useState<{ [key: string]: number }>({});
    const [sortOption, setSortOption] = useState<SortOptionType>(null); const sortOptions = [
        { label: 'Name Ascending', value: 'name_asc' },
        { label: 'Name Descending', value: 'name_desc' },
        { label: 'Price Ascending', value: 'price_asc' },
        { label: 'Price Descending', value: 'price_desc' },
    ];
    const { listData, updateListData } = useList();
    const { fetchUpdatedListDetails } = useList();
    const [filterOptions, setFilterOptions] = useState<{
        types: OptionType[];
        subtypes: OptionType[];
        supertypes: OptionType[];
        rarities: OptionType[];
        sets: OptionType[];
    }>({
        types: [],
        subtypes: [],
        supertypes: [],
        rarities: [],
        sets: [],
    });
    const [supertypeFilter, setSupertypeFilter] = useState<OptionType | null>(null);
    const [subtypeFilter, setSubtypeFilter] = useState<OptionType | null>(null);
    const [typeFilter, setTypeFilter] = useState<OptionType | null>(null);
    const [rarityFilter, setRarityFilter] = useState<OptionType | null>(null);
    const [setFilter, setSetFilter] = useState<OptionType | null>(null);
    const [collectedStatus, setCollectedStatus] = useState<{ [key: string]: boolean }>({});
    const [collectedQuantities, setCollectedQuantities] = useState<{ [key: string]: number }>({});

    const transformTcgplayerData = (backendData: any): Tcgplayer => {
        const prices = backendData.prices || {};

        const defaultPriceStructure = {
            low: null,
            mid: null,
            high: null,
            market: null,
            directLow: null
        };

        return {
            url: backendData.url,
            updatedAt: backendData.updatedAt,
            prices: {
                normal: prices.normal
                    ? {
                        low: prices.normal.low ?? 0,
                        mid: prices.normal.mid ?? 0,
                        high: prices.normal.high ?? 0,
                        market: prices.normal.market ?? 0,
                        directLow: prices.normal.directLow ?? 0
                    }
                    : defaultPriceStructure,
                holofoil: prices.holofoil
                    ? {
                        low: prices.holofoil.low ?? 0,
                        mid: prices.holofoil.mid ?? 0,
                        high: prices.holofoil.high ?? 0,
                        market: prices.holofoil.market ?? 0,
                        directLow: prices.holofoil.directLow ?? 0
                    }
                    : defaultPriceStructure
            }
        };
    };

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
            let url = isInAddMode == null ? `http://localhost:8000/api/pokemon-cards/`
                : !isInAddMode ? `http://localhost:8000/api/cards-by-list/${selectedListId}/`
                    : `http://localhost:8000/api/pokemon-cards/`;
            const response = await axios.get(url, params);

            if (response.data && Array.isArray(response.data.data)) {
                let fetchedCards: CardData[] = response.data.data;

                fetchedCards.map((card: CardData) => {
                    if (card.tcgplayer) {
                        card.tcgplayer = transformTcgplayerData(card.tcgplayer);
                    }
                    return card as CardData;
                });

                const uniqueCardsMap = new Map<string, CardData>();
                fetchedCards.forEach(card => {
                    if (!uniqueCardsMap.has(card.id)) {
                        uniqueCardsMap.set(card.id, { ...card });
                    } else {
                        const existingCard = uniqueCardsMap.get(card.id)!;
                        existingCard.count += card.count;
                        uniqueCardsMap.set(card.id, existingCard);
                    }
                });

                const uniqueCards = Array.from(uniqueCardsMap.values());

                const quantities: { [key: string]: number } = {};
                uniqueCards.forEach(card => {
                    quantities[card.id] = card.count;
                });

                setCards(uniqueCards);
                setTotalPages(response.data.total_pages);

                if (isInAddMode) {
                    const quantitiesUrl = `http://localhost:8000/api/cards-by-list/${selectedListId}/`;
                    const quantitiesResponse = await axios.get(quantitiesUrl);
                    quantitiesResponse.data.data.forEach((card: any) => {
                        quantities[card.id] = card.count || 0;
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
                const response = await axios.get('http://localhost:8000/api/filter-options/');
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

    const handleAddCard = async (card: CardData) => {
        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [card.id]: (prevQuantities[card.id] || 0) + 1
        }));
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
        await fetchCardListData();
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

    const fetchCardListData = async (): Promise<void> => {
        if (!selectedListId) return;

        const getListByIdUrl = `http://localhost:8000/api/get-list-by-id/${selectedListId}/`;
        try {
            const response = await axios.get(getListByIdUrl);
            const updatedList = response.data.card_list;
            const listCards = response.data.list_cards;
            const index = listData.findIndex(list => list.id === updatedList.id);
            if (index !== -1) {
                const updatedListData = [
                    ...listData.slice(0, index),
                    updatedList,
                    ...listData.slice(index + 1)
                ];
                updateListData(updatedListData);
            }

            const newCollectedStatus: { [key: string]: boolean } = {};
            const newCollectedQuantities: { [key: string]: number } = {};

            listCards.forEach((listCard: any) => {
                const cardId = listCard.pokemon_card;
                if (!cardId) return;

                if (!newCollectedQuantities[cardId]) newCollectedQuantities[cardId] = 0;
                if (listCard.collected) newCollectedQuantities[cardId]++;

                newCollectedStatus[cardId] = newCollectedQuantities[cardId] > 0;
            });

            setCollectedStatus(newCollectedStatus);
            setCollectedQuantities(newCollectedQuantities);

        } catch (error) {
            console.error(`Error fetching updated list data:`, error);
        }
    };

    const handleIncrementCollectedQuantity = async (cardId: string) => {
        if (collectedQuantities[cardId] < cardQuantities[cardId]) {
            const newQuantities = { ...collectedQuantities, [cardId]: collectedQuantities[cardId] + 1 };
            setCollectedQuantities(newQuantities);

            if (newQuantities[cardId] === 1) {
                handleCheckboxChange(cardId, true)
            }

            await axios.post('http://localhost:8000/api/card-collection/', {
                list_id: selectedListId,
                card_id: cardId,
                card_type: 'pokemon',
                operation: 'add',
            }).then(async response => {

            }).catch(error => {
                setCollectedQuantities(collectedQuantities);
                console.error("Error in handleIncrementCollectedQuantity: ", error)
            });
        }
    };

    const handleDecrementCollectedQuantity = async (cardId: string) => {
        if (collectedQuantities[cardId] > 0) {
            const newQuantities = { ...collectedQuantities, [cardId]: collectedQuantities[cardId] - 1 };
            setCollectedQuantities(newQuantities);

            if (newQuantities[cardId] === 0) {
                handleCheckboxChange(cardId, false)
            }

            await axios.post('http://localhost:8000/api/card-collection/', {
                list_id: selectedListId,
                card_id: cardId,
                card_type: 'pokemon',
                operation: 'remove',
            }).then(async response => {

            }).catch(error => {
                setCollectedQuantities(collectedQuantities);
                console.error("Error in handleDecrementCollectedQuantity: ", error)
            });
        }
    };

    const handleCheckboxChange = async (cardId: string, isChecked: boolean) => {
        const newCollectedStatus = { ...collectedStatus, [cardId]: isChecked };
        setCollectedStatus(newCollectedStatus);

        if (isChecked) {
            await axios.post('http://localhost:8000/api/card-collection/', {
                list_id: selectedListId,
                card_id: cardId,
                card_type: 'pokemon',
                operation: 'add',
            }).then(async response => {
                const newQuantities = { ...collectedQuantities, [cardId]: collectedQuantities[cardId] + 1 };
                setCollectedQuantities(newQuantities);
            }).catch(error => {
                setCollectedStatus(collectedStatus);
                console.error("Error in handleCheckboxChange: ", error)
            });
        } else {
            await axios.post('http://localhost:8000/api/set-card-quantity/', {
                list_id: selectedListId,
                card_id: cardId,
                card_type: 'pokemon',
                collected: false,
            }).then(async response => {
                const newQuantities = { ...collectedQuantities, [cardId]: collectedQuantities[cardId] - collectedQuantities[cardId] };
                setCollectedQuantities(newQuantities);
            }).catch(error => {
                setCollectedStatus(collectedStatus);
                console.error("Error in handleCheckboxChange: ", error)
            });
        }
    };

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

    const incrementCardQuantity = async (card: CardData) => {
        setCardQuantities(prevQuantities => ({
            ...prevQuantities,
            [card.id]: (prevQuantities[card.id] || 0) + 1
        }));

        await updateCardQuantity(card.id, 'increment');
        if (selectedListId) {
            await fetchUpdatedListDetails(selectedListId);
        }
        await handleCardQuantityChange();
    };

    const decrementCardQuantity = async (card: CardData) => {
        setCardQuantities(prevQuantities => {
            if (prevQuantities[card.id] > 1) {
                updateCardQuantity(card.id, 'decrement');
                return { ...prevQuantities, [card.id]: prevQuantities[card.id] - 1 };
            }
            return prevQuantities;
        });
        handleListUpdate();
        handleDecrementCollectedQuantity(card.id)
        await handleCardQuantityChange();
    };

    const handleDeleteCard = async (card: CardData) => {
        deleteCardFromList(card.id).then(() => {
            fetchData(currentPage);
        });
        handleListUpdate();
        handleDecrementCollectedQuantity(card.id)
        await handleCardQuantityChange();
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
        fetchData(1, {
            supertype: supertypeFilter,
            subtype: subtypeFilter,
            type: typeFilter,
            rarity: rarityFilter,
            set: setFilter
        });
    };

    const paginate = (value: number) => {
        fetchData(value, {
            supertype: supertypeFilter,
            subtype: subtypeFilter,
            type: typeFilter,
            rarity: rarityFilter,
            set: setFilter
        });
    };

    const handleCardInfo = (card: CardData) => {
        setSelectedCard(card);
        setShowData(true);
    };

    const handleCloseDialog = () => {
        setShowData(false);
        setSelectedCard(null);
    };

    const handleClearFilters = () => {
        setSearch('');
        setSupertypeFilter(null);
        setSubtypeFilter(null);
        setTypeFilter(null);
        setRarityFilter(null);
        setSetFilter(null);
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
                <CardInfo
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
                label="Search Pokémon Cards"
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
                sx={{ mb: { xs: 2, lg: 2 }, margin: '5px' }}
            />
            <FilterFormControl
                id="supertype-filter"
                label="Supertype"
                filterOptions={filterOptions.supertypes}
                selectedFilter={supertypeFilter}
                setSelectedFilter={setSupertypeFilter}
            />
            <FilterFormControl
                id="combo-box-subtype"
                label="Subtype"
                filterOptions={filterOptions.subtypes}
                selectedFilter={subtypeFilter}
                setSelectedFilter={setSubtypeFilter}
            />
            <FilterFormControl
                id="combo-box-type"
                label="Type"
                filterOptions={filterOptions.types}
                selectedFilter={typeFilter}
                setSelectedFilter={setTypeFilter}
            />
            <FilterFormControl
                id="combo-box-rarity"
                label="Rarity"
                filterOptions={filterOptions.rarities}
                selectedFilter={rarityFilter}
                setSelectedFilter={setRarityFilter}
            />
            <FilterFormControl
                id="combo-box-set"
                label="Set"
                filterOptions={filterOptions.sets}
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
                        handleIncrementCollectedQuantity={() => handleIncrementCollectedQuantity(card.id)}
                        handleDecrementCollectedQuantity={() => handleDecrementCollectedQuantity(card.id)}
                        isSelectedListId={!!selectedListId}
                        isInAddMode={isInAddMode}
                        collectedStatus={collectedStatus[card.id]}
                        cardQuantities={cardQuantities}
                        onCheckboxChange={handleCheckboxChange}
                        image={card.images.large}
                        name={card.name}
                        id={card.id}
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

export default PokemonCards;    