import React, { useState, useEffect, useRef } from 'react';
import {
    TextField,
    Button,
    Select,
    MenuItem,
    Typography,
    Box,
    Grid,
    SelectChangeEvent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    TableHead,
    TableRow,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    TableCell,
    TableBody,
    TableContainer,
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

const Lists = () => {
    const { listData, updateListData } = useList();
    const [newListName, setNewListName] = useState<string>('');
    const [newListType, setNewListType] = useState<CardType>('Pokemon');
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState<CardList | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [listToDelete, setListToDelete] = useState<CardList | null>(null);
    const [addCardsDialogOpen, setAddCardsDialogOpen] = useState<boolean>(false);
    const [isInAddMode, setIsInAddMode] = useState<boolean>(true);
    const prevListDataRef = useRef<CardList[] | null>(null);

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
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const fetchLists = () => {
        console.log('fetch')
        fetch('http://localhost:8000/api/cardlists/')
            .then(response => response.json())
            .then(data => {
                updateListData(data.map((list: CardList) => ({ ...list })));
            });
    };

    useEffect(() => {
        if (prevListDataRef.current !== listData) {
            prevListDataRef.current = listData;
        }
    }, [listData]);

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
        fetchLists();
        setAddCardsDialogOpen(false);
        setIsInAddMode(false);
    };

    const handleEditList = (updatedList: CardList) => {
        updateListData(listData.map(list => list.id === updatedList.id ? updatedList : list));
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
        fetchLists();
    };

    const openDialogWithList = (list: CardList) => {
        setDialogOpen(true);
        setSelectedList(list);
        updateListDetails(list.id);
    };

    const closeDialog = () => {
        fetchLists();
        setDialogOpen(false);
        setSelectedList(null);
    };

    const renderListHeader = (): JSX.Element => (
        <TableHead>
            <TableRow>
                <TableCell>List Name</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell>Created On</TableCell>
                <TableCell># of Cards</TableCell>
                <TableCell>Full List Market Value</TableCell>
                <TableCell>List Type</TableCell>
                <TableCell />
            </TableRow>
        </TableHead>
    );

    const renderListItems = (type: CardType): JSX.Element => {
        return (
            <TableBody>
                {listData.filter(list => list.type === type).map((list) => (
                    <TableRow
                        key={list.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        onClick={() => openDialogWithList(list)}
                    >
                        <TableCell component="th" scope="row">
                            {list.name}
                        </TableCell>
                        <TableCell>{list.created_by}</TableCell>
                        <TableCell>{formatDate(list.created_on)}</TableCell>
                        <TableCell>{(list.cards && (list.cards.length)) || 0}</TableCell>
                        <TableCell>${list.market_value}</TableCell>
                        <TableCell>{list.type}</TableCell>
                        <TableCell>
                            <Button
                                variant="contained"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsInAddMode(true);
                                    handleAddCards(list)
                                }}
                            >
                                Add Cards
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ ml: 2 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteList(list)
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

    const cardTypes: CardType[] = ['Pokemon', 'MTG', 'Yu-Gi-Oh!', 'Lorcana', 'Baseball', 'Football', 'Basketball', 'Hockey'];

    let addCardsDialogContent;
    switch (selectedList?.type) {
        case 'Pokemon':
            addCardsDialogContent = (
                <PokemonCards selectedListId={selectedList?.id} isInAddMode={isInAddMode} onListUpdate={fetchLists} />
            );
            break;
        case 'MTG':
            addCardsDialogContent = (
                <MTGCards selectedListId={selectedList?.id} isInAddMode={isInAddMode} onListUpdate={fetchLists} />
            );
            break;
        case 'Yu-Gi-Oh!':
            addCardsDialogContent = (
                <YugiohCards selectedListId={selectedList?.id} isInAddMode={isInAddMode} onListUpdate={fetchLists} />
            );
            break;
        case 'Lorcana':
            addCardsDialogContent = (
                <LorcanaCards selectedListId={selectedList?.id} isInAddMode={isInAddMode} onListUpdate={fetchLists} />
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

    // Define deleteConfirmationDialog
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
                <Accordion key={type}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >
                        <Typography>{type} Lists</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper}>
                            {renderListHeader()}
                            {renderListItems(type)}
                        </TableContainer>
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
