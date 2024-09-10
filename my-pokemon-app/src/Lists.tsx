import React, { useState, useEffect } from 'react';
import {
    TextField, Button, Select, MenuItem, Typography, Box, Grid, SelectChangeEvent,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    TableHead, TableRow, Paper, Accordion, AccordionSummary, AccordionDetails,
    TableCell, TableBody, TableContainer,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListDialog from './Types/ListDialog';
import { CardList, useList } from './Types/CardList';
import CardType from './Types/CardType';
import formatDate from './helpers/formatDate';
import PokemonCards from './Cards/Pokemon/PokemonCards';
import MTGCards from './Cards/MTG/MTGCards';
import YugiohCards from './Cards/Yugioh/YugiohCards';
import LorcanaCards from './Cards/Lorcana/LorcanaCards';
import BaseballCards from './Cards/BaseballCards';
import FootballCards from './Cards/FootballCards';
import BasketballCards from './Cards/BasketballCards';
import HockeyCards from './Cards/HockeyCards';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';

const Lists = () => {
    // State management
    const { listData, updateListData } = useList();
    const [newListName, setNewListName] = useState<string>('');
    const [newListType, setNewListType] = useState<CardType>('Pokemon');
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState<CardList | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [listToDelete, setListToDelete] = useState<CardList | null>(null);
    const [addCardsDialogOpen, setAddCardsDialogOpen] = useState<boolean>(false);
    const [isInAddMode, setIsInAddMode] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const clickableStyle = { cursor: 'pointer' };
    const cardTypes: CardType[] = ['Pokemon', 'MTG', 'Yu-Gi-Oh!', 'Lorcana', 'Baseball', 'Football', 'Basketball', 'Hockey'];

    // Pagination state for each card type
    const [paginationState, setPaginationState] = useState<Record<CardType, { currentPage: number, totalPages: number }>>({
        'Pokemon': { currentPage: 1, totalPages: 0 },
        'MTG': { currentPage: 1, totalPages: 0 },
        'Yu-Gi-Oh!': { currentPage: 1, totalPages: 0 },
        'Lorcana': { currentPage: 1, totalPages: 0 },
        'Baseball': { currentPage: 1, totalPages: 0 },
        'Football': { currentPage: 1, totalPages: 0 },
        'Basketball': { currentPage: 1, totalPages: 0 },
        'Hockey': { currentPage: 1, totalPages: 0 },
    });

    // State to store lists by card type
    const [listDataByType, setListDataByType] = useState<Record<CardType, CardList[]>>({
        'Pokemon': [],
        'MTG': [],
        'Yu-Gi-Oh!': [],
        'Lorcana': [],
        'Baseball': [],
        'Football': [],
        'Basketball': [],
        'Hockey': [],
    });

    // Sortable fields and sort state for each card type
    type SortableFields = keyof Pick<CardList, 'name' | 'created_by' | 'created_on' | 'market_value'> | 'num_cards';
    const [sortStates, setSortStates] = useState<Record<CardType, { field: SortableFields, direction: 'asc' | 'desc' }>>({
        'Pokemon': { field: 'name', direction: 'asc' },
        'MTG': { field: 'name', direction: 'asc' },
        'Yu-Gi-Oh!': { field: 'name', direction: 'asc' },
        'Lorcana': { field: 'name', direction: 'asc' },
        'Baseball': { field: 'name', direction: 'asc' },
        'Football': { field: 'name', direction: 'asc' },
        'Basketball': { field: 'name', direction: 'asc' },
        'Hockey': { field: 'name', direction: 'asc' },
    });

    // Function to create a new list
    const createNewList = () => {
        if (!newListName.trim()) {
            alert('Please enter a name for the list.');
            return;
        }
        const newList = {
            created_by: 'dejaboom',
            name: newListName,
            type: newListType,
            market_value: 0
        };

        fetch('http://localhost:8000/api/cardlists/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newList),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                const updatedListData = [...listData, data];
                updateListData(updatedListData);
                setNewListName('');
                fetchListsForType(newListType);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    // Function to fetch lists for a specific card type
    const fetchListsForType = (type: CardType, page = 1, sortField = 'created_on', sortDirection = 'asc') => {
        axios.get(`http://localhost:8000/api/cardlists/?type=${type}&page=${page}&sort_field=${sortField}&sort_direction=${sortDirection}`)
            .then(response => {
                updateListData(response.data.results);
                setListDataByType(prevData => ({
                    ...prevData,
                    [type]: response.data.results,
                }));
                setPaginationState(prevState => ({
                    ...prevState,
                    [type]: {
                        currentPage: page,
                        totalPages: Math.ceil(response.data.count / 10),
                    },
                }));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    // Function to fetch all lists
    const fetchAllLists = () => {
        cardTypes.forEach(type => {
            const currentPage = paginationState[type].currentPage;
            fetchListsForType(type, currentPage);
        });
    };

    useEffect(() => {
        fetchAllLists();
    }, [currentPage]);

    // Event handlers
    const handleListNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewListName(e.target.value);
    }

    const handleListTypeChange = (event: SelectChangeEvent<CardType>) => {
        setNewListType(event.target.value as CardType);
    };

    const handleAddCards = (list: CardList) => {
        setAddCardsDialogOpen(true);
        setSelectedList(list);
        setIsInAddMode(true);
    };

    const closeAddCardDialog = () => {
        fetchAllLists();
        setAddCardsDialogOpen(false);
        setIsInAddMode(false);
    };

    const handlePageChange = (type: CardType, page: number) => {
        setPaginationState(prevState => ({
            ...prevState,
            [type]: {
                ...prevState[type],
                currentPage: page,
            },
        }));
        fetchListsForType(type, page);
    };

    const handleDeleteList = (listToDelete: CardList | null) => {
        setDeleteDialogOpen(true);
        setListToDelete(listToDelete);
    };

    const confirmDelete = () => {
        if (listToDelete) {
            fetch(`http://localhost:8000/api/cardlists/${listToDelete.id}/`, {
                method: 'DELETE',
            })
                .then(() => {
                    updateListData(listData.filter(list => list.id !== listToDelete.id));
                    setDeleteDialogOpen(false);
                    fetchAllLists()
                    setListToDelete(null);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    };

    const updateListDetails = async (listId: string) => {
        try {
            const url = `http://localhost:8000/api/cardlists/${listId}/`;
            const response = await axios.get(url);
            if (response.data) {
                updateListData(listData.map(list => list.id === listId ? response.data : list));
            }
        } catch (error) {
            console.error('Error fetching list details:', error);
        }
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setListToDelete(null);
        fetchAllLists();
    };

    const openDialogWithList = (list: CardList) => {
        setDialogOpen(true);
        setSelectedList(list);
        updateListDetails(list.id);
    };

    const closeDialog = () => {
        fetchAllLists();
        setDialogOpen(false);
        setSelectedList(null);
    };

    // Render functions
    const renderPagination = (type: CardType): JSX.Element => (
        <Pagination
            count={paginationState[type].totalPages}
            page={paginationState[type].currentPage}
            onChange={(event, page) => handlePageChange(type, page)}
        />
    );

    const renderSortIndicator = (type: CardType, field: string) => {
        const state = sortStates[type];
        if (state.field !== field) return null;
        return state.direction === 'asc' ? '↑' : (state.direction === 'desc' ? '↓' : '');
    };

    const sortList = (list: CardList[], sortState: { field: SortableFields, direction: 'asc' | 'desc' }): CardList[] => {
        return list.sort((a, b) => {
            let aValue = sortState.field === 'num_cards' ? a.cards.length : a[sortState.field];
            let bValue = sortState.field === 'num_cards' ? b.cards.length : b[sortState.field];

            if (sortState.field === 'created_on') {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
            }

            if (aValue < bValue) {
                return sortState.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortState.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const handleSortChange = (type: CardType, field: SortableFields) => {
        setSortStates(prev => {
            const currentSort = prev[type];
            let newDirection = 'asc';

            if (currentSort.field === field) {
                newDirection = currentSort.direction === 'asc' ? 'desc' : (currentSort.direction === 'desc' ? '' : 'asc');
            }

            if (newDirection) {
                fetchListsForType(type, 1, field, newDirection);
            } else {
                fetchListsForType(type, 1);
            }

            return {
                ...prev,
                [type]: {
                    field: newDirection ? field : '',
                    direction: newDirection
                }
            };
        });
    };

    const renderListHeader = (type: CardType): JSX.Element => (
        <TableHead>
            <TableRow>
                <TableCell onClick={() => handleSortChange(type, 'name')} style={clickableStyle}>
                    List Name {renderSortIndicator(type, 'name')}
                </TableCell>
                <TableCell onClick={() => handleSortChange(type, 'created_by')} style={clickableStyle}>
                    Created By {renderSortIndicator(type, 'created_by')}
                </TableCell>
                <TableCell onClick={() => handleSortChange(type, 'created_on')} style={clickableStyle}>
                    Created On {renderSortIndicator(type, 'created_on')}
                </TableCell>
                <TableCell onClick={() => handleSortChange(type, 'num_cards')} style={clickableStyle}>
                    # of Cards {renderSortIndicator(type, 'num_cards')}
                </TableCell>
                <TableCell onClick={() => handleSortChange(type, 'market_value')} style={clickableStyle}>
                    Full List Market Value {renderSortIndicator(type, 'market_value')}
                </TableCell>
                <TableCell>List Type</TableCell>
                <TableCell />
            </TableRow>
        </TableHead>
    );

    const renderListItems = (type: CardType): JSX.Element => {
        const sortedLists = sortList(listDataByType[type] || [], sortStates[type]);

        return (
            <TableBody>
                {sortedLists.map((list) => (
                    <TableRow
                        key={list.id}
                        sx={{
                            '&:last-child td, &:last-child th': { border: 0 }, '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            },
                        }}
                        onClick={() => openDialogWithList(list)}
                    >
                        <TableCell component="th" scope="row" style={clickableStyle}>
                            {list.name}
                        </TableCell>
                        <TableCell style={clickableStyle}>{list.created_by}</TableCell>
                        <TableCell style={clickableStyle}>{formatDate(list.created_on)}</TableCell>
                        <TableCell style={clickableStyle}>{(list.cards && list.cards.length) || 0}</TableCell>
                        <TableCell style={clickableStyle}>${list.market_value}</TableCell>
                        <TableCell style={clickableStyle}>{list.type}</TableCell>
                        <TableCell>
                            <Button
                                variant="contained"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsInAddMode(true);
                                    handleAddCards(list);
                                }}
                            >
                                Add Cards
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ ml: 2 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteList(list);
                                }}
                            >
                                Delete List
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );
    };

    // Determine the content for the add cards dialog based on the selected list type
    let addCardsDialogContent;
    switch (selectedList?.type) {
        case 'Pokemon':
            addCardsDialogContent = (
                <PokemonCards selectedListId={selectedList?.id} isInAddMode={isInAddMode} onListQuantityChange={fetchAllLists} />
            );
            break;
        case 'MTG':
            addCardsDialogContent = (
                <MTGCards selectedListId={selectedList?.id} isInAddMode={isInAddMode} onListQuantityChange={fetchAllLists} />
            );
            break;
        case 'Yu-Gi-Oh!':
            addCardsDialogContent = (
                <YugiohCards selectedListId={selectedList?.id} isInAddMode={isInAddMode} onListQuantityChange={fetchAllLists} />
            );
            break;
        case 'Lorcana':
            addCardsDialogContent = (
                <LorcanaCards selectedListId={selectedList?.id} isInAddMode={isInAddMode} onListQuantityChange={fetchAllLists} />
            );
            break;
        case 'Baseball':
            addCardsDialogContent = <BaseballCards />;
            break;
        case 'Football':
            addCardsDialogContent = <FootballCards />;
            break;
        case 'Basketball':
            addCardsDialogContent = <BasketballCards />;
            break;
        case 'Hockey':
            addCardsDialogContent = <HockeyCards />;
            break;
        default:
            addCardsDialogContent = <div>Select a card type</div>;
    }

    // Dialog for adding cards to a list
    const addCardsDialog = (
        <Dialog
            open={addCardsDialogOpen}
            onClose={closeAddCardDialog}
            fullWidth
            maxWidth="lg"
        >
            <DialogTitle id="add-cards-dialog-title">Add Cards</DialogTitle>
            <DialogContent>
                {addCardsDialogContent}
            </DialogContent>
            <DialogActions>
                <Button onClick={closeAddCardDialog} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Dialog for confirming list deletion
    const deleteConfirmationDialog = (
        <Dialog
            open={deleteDialogOpen}
            onClose={cancelDelete}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this list?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancelDelete} color="primary">
                    Cancel
                </Button>
                <Button onClick={confirmDelete} color="primary" autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );

    // Main component render
    return (
        <Box sx={{ width: 'auto', padding: 3 }}>
            <Typography variant="h5" gutterBottom component="div">
                Create a New List
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        sx={{ width: '100%' }}
                        label="List Name"
                        value={newListName}
                        onChange={handleListNameChange}
                        margin="normal"
                    />
                </Grid>
            </Grid>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={9}>
                    <Select
                        fullWidth
                        value={newListType}
                        onChange={handleListTypeChange}
                        displayEmpty
                    >
                        {cardTypes.map((type, index) => (
                            <MenuItem key={index} value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={3}>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={createNewList}
                        sx={{ height: '55px' }}
                    >
                        Create List
                    </Button>
                </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom component="div" sx={{ mt: 4 }} />
            {cardTypes.map((type) => (
                <Accordion key={type} onChange={() => fetchListsForType(type, paginationState[type].currentPage)}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>{type} Lists</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper}>
                            {renderListHeader(type)}
                            {renderListItems(type)}
                        </TableContainer>
                        {renderPagination(type)}
                    </AccordionDetails>
                </Accordion>
            ))}
            {addCardsDialog}
            {deleteConfirmationDialog}
            {dialogOpen && <ListDialog list={selectedList} onClose={closeDialog} />}
        </Box>
    );
};

export default Lists;