import React, { Component } from 'react';
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
import ListDialog from './Types/ListDialog'
import ListItemComponent from './Types/ListItemComponent';
import ListsState from './Types/ListsState';
import CardList from './Types/CardList';
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
import { CardData } from './Cards/Pokemon/CardData';
import Card from './Types/Card';

class Lists extends Component<{}, ListsState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            lists: [],
            newListName: '',
            newListType: 'Pokemon',
            dialogOpen: false,
            selectedList: null,
            deleteDialogOpen: false,
            listToDelete: null,
            addCardsDialogOpen: false,
            isInAddMode: true,
        };
    }

    createNewList = () => {
        const { newListName, newListType } = this.state;
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
                this.setState(prevState => ({
                    lists: [...prevState.lists, {
                        ...data,
                    }],
                    newListName: ''
                }));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    convertCardDataToCard = (cardData: CardData, cardType: CardType): Card => {
        return {
            id: cardData.id,
            name: cardData.name,
            type: cardType
        };
    };

    fetchLists = () => {
        fetch('http://localhost:8000/api/cardlists/')
            .then(response => response.json())
            .then(data => this.setState({
                lists: data.map((list: CardList) => ({ ...list }))
            }));
    };

    handleAddPokemonCardToList = (cardData: CardData) => {
        const card = this.convertCardDataToCard(cardData, 'Pokemon');
        const { selectedList, lists } = this.state;

        console.log("Added")

        if (selectedList) {
            const updatedList = {
                ...selectedList,
                cards: [...(selectedList.cards ?? []), card]
            };

            this.setState({
                lists: lists.map(list => list.id === selectedList.id ? updatedList : list),
                selectedList: updatedList
            }, () => {
                this.fetchLists();
            });
        }
    };

    componentDidMount() {
        fetch('http://localhost:8000/api/cardlists/')
            .then(response => response.json())
            .then(data => this.setState({
                lists: data.map((list: CardList) => ({
                    ...list,
                }))
            }));
        this.fetchLists();
    }

    handleListNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ newListName: e.target.value });
    }

    handleListTypeChange = (event: SelectChangeEvent<CardType>) => {
        this.setState({ newListType: event.target.value as CardType });
    };

    handleAddCards = (list: CardList) => {
        this.setState({ addCardsDialogOpen: true, selectedList: list, isInAddMode: true });
    };

    closeAddCardDialog = () => {
        this.fetchLists()
        this.setState({ addCardsDialogOpen: false, isInAddMode: false });
    };

    handleEditList = (updatedList: CardList) => {
        this.setState(prevState => ({
            lists: prevState.lists.map(list => list.id === updatedList.id ? updatedList : list)
        }));
    };

    handleDeleteList = (listToDelete: CardList | null) => {
        this.setState({ deleteDialogOpen: true, listToDelete });
    };

    confirmDelete = () => {
        const { listToDelete, lists } = this.state;
        if (listToDelete) {
            fetch(`http://localhost:8000/api/cardlists/${listToDelete.id}/`, {
                method: 'DELETE',
            })
                .then(() => {
                    this.setState({
                        lists: lists.filter(list => list.id !== listToDelete.id),
                        deleteDialogOpen: false,
                        listToDelete: null
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    };

    cancelDelete = () => {
        this.setState({ deleteDialogOpen: false, listToDelete: null });
        this.fetchLists()
    };

    openDialogWithList = (list: CardList) => {
        this.setState({ dialogOpen: true, selectedList: list });
    };

    closeDialog = () => {
        this.setState({ dialogOpen: false, selectedList: null });
    };

    renderListsByType = (type: CardType) => {
        const { lists } = this.state;
        const filteredLists = lists.filter(list => list.type === type);

        return (
            <Box>
                <Typography variant="h6">{type}</Typography>
                {filteredLists.map((list) => (
                    <ListItemComponent key={list.id} list={list} />
                ))}
            </Box>
        );
    }

    renderListHeader = (): JSX.Element => (
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

    renderListItems = (type: CardType): JSX.Element => {
        const { lists } = this.state;

        return (
            <TableBody>
                {lists.filter(list => list.type === type).map((list) => (
                    <TableRow
                        key={list.id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        onClick={() => {
                            this.openDialogWithList(list)
                        }}
                    >
                        <TableCell component="th" scope="row">
                            {list.name}
                        </TableCell>
                        <TableCell>{list.created_by}</TableCell>
                        <TableCell>{formatDate(list.created_on)}</TableCell>
                        <TableCell>{(list.cards && list.cards.length) || 0}</TableCell>
                        <TableCell>${list.market_value}</TableCell>
                        <TableCell>{list.type}</TableCell>
                        <TableCell>
                            <Button
                                variant="contained"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.setState({ isInAddMode: true });
                                    this.handleAddCards(list)
                                }}
                            >
                                Add Cards
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ ml: 2 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.handleDeleteList(list)
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

    render() {
        const { newListName, newListType, lists, dialogOpen, selectedList } = this.state;
        const cardTypes: CardType[] = ['Pokemon', 'MTG', 'Yu-Gi-Oh!', 'Lorcana', 'Baseball', 'Football', 'Basketball', 'Hockey'];

        let addCardsDialogContent;
        switch (this.state.selectedList?.type) {
            case 'Pokemon':
                addCardsDialogContent = (
                    <PokemonCards selectedListId={selectedList?.id} isInAddMode={true} />
                );
                break;
            case 'MTG':
                addCardsDialogContent = (
                    <MTGCards selectedListId={selectedList?.id} isInAddMode={true} />
                );
                break;
            case 'Yu-Gi-Oh!':
                addCardsDialogContent = (
                    <YugiohCards selectedListId={selectedList?.id} isInAddMode={true} />
                );
                break;
            case 'Lorcana':
                addCardsDialogContent = (
                    <LorcanaCards selectedListId={selectedList?.id} isInAddMode={true} />
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
                open={this.state.addCardsDialogOpen}
                onClose={this.closeAddCardDialog}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle id="add-cards-dialog-title">Add Cards</DialogTitle>
                <DialogContent>
                    {addCardsDialogContent}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.closeAddCardDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );

        const deleteConfirmationDialog = (
            <Dialog
                open={this.state.deleteDialogOpen}
                onClose={this.cancelDelete}
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
                    <Button onClick={this.cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={this.confirmDelete} color="primary" autoFocus>
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
                            onChange={this.handleListNameChange}
                            margin="normal"
                        />
                    </Grid>
                </Grid>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={9}>
                        <Select
                            fullWidth
                            value={newListType}
                            onChange={this.handleListTypeChange}
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
                            onClick={this.createNewList}
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
                                {this.renderListHeader()}
                                {this.renderListItems(type)}
                            </TableContainer>
                        </AccordionDetails>
                    </Accordion>
                ))}
                {addCardsDialog}
                {deleteConfirmationDialog}
                {dialogOpen && <ListDialog list={selectedList} onClose={this.closeDialog} />}
            </Box>
        );
    }
}

export default Lists;