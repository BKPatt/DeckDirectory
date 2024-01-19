import React, { Component } from 'react';
import { TextField, Button, Select, MenuItem, Typography, Box, Grid, SelectChangeEvent, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import ListDialog from './ListDialog'
import ListItemComponent from './ListItemComponent';
import ListsState from './ListsState';
import CardList from './CardList';
import CardType from './CardType';

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
            listToDelete: null
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
                }));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    componentDidMount() {
        fetch('http://localhost:8000/api/cardlists/')
            .then(response => response.json())
            .then(data => this.setState({
                lists: data.map((list: CardList) => ({
                    ...list,
                }))
            }));
    }



    handleListNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ newListName: e.target.value });
    }

    handleListTypeChange = (event: SelectChangeEvent<CardType>) => {
        this.setState({ newListType: event.target.value as CardType });
    };

    handleAddCards = (list: CardList) => {
        // Implementation for adding cards to the list
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
                <Typography variant="h6">{type} Lists</Typography>
                {filteredLists.map((list) => (
                    <ListItemComponent key={list.id} list={list} />
                ))}
            </Box>
        );
    }

    render() {
        const { newListName, newListType, lists, dialogOpen, selectedList } = this.state;
        const cardTypes: CardType[] = ['Pokemon', 'MTG', 'Yu-Gi-Oh!', 'Lorcana', 'Baseball', 'Football', 'Basketball', 'Hockey'];

        const renderListHeader = () => (
            <Grid container alignItems="center" sx={{ borderBottom: '1px solid #e0e0e0', py: 1 }}>
                <Grid item xs={2}>
                    <Typography variant="subtitle1">List Name</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="subtitle1">Created By</Typography>
                </Grid>
                <Grid item xs={1}>
                    <Typography variant="subtitle1">Created On</Typography>
                </Grid>
                <Grid item xs={1}>
                    <Typography variant="subtitle1"># of Cards</Typography>
                </Grid>
                <Grid item xs={2}>
                    <Typography variant="subtitle1">Full List Market Value</Typography>
                </Grid>
                <Grid item xs={1}>
                    <Typography variant="subtitle1">List Type</Typography>
                </Grid>
            </Grid>
        );

        const renderListItems = () => cardTypes.map((type) => (
            <Box key={type} sx={{ mt: 2 }}>
                {lists.filter(list => list.type === type).map((list) => {
                    return (
                        <Grid
                            container
                            alignItems="center"
                            key={list.id}
                            onClick={() => this.openDialogWithList(list)}
                            sx={{
                                py: 1,
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <Grid item xs={2}>
                                <Typography>{list.name}</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography>{list.created_by}</Typography>
                            </Grid>
                            <Grid item xs={1}>
                                <Typography>{list.created_on}</Typography>
                            </Grid>
                            <Grid item xs={1}>
                                <Typography>{ }</Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography>${list.market_value}</Typography>
                            </Grid>
                            <Grid item xs={1}>
                                <Typography>{list.type}</Typography>
                            </Grid>
                            <Grid item xs={1} marginRight={'50px'}>
                                <Button
                                    variant="contained"
                                    style={{ width: '125px' }}
                                    onClick={(e) => {
                                        this.handleAddCards(list);
                                        e.stopPropagation();
                                    }}
                                >
                                    Add Cards
                                </Button>
                            </Grid>
                            <Grid item xs={1}>
                                <Button
                                    variant="contained"
                                    style={{ width: '125px' }}
                                    onClick={(e) => {
                                        this.handleDeleteList(list);
                                        e.stopPropagation();
                                    }}
                                >
                                    Delete List
                                </Button>
                            </Grid>
                        </Grid>
                    );
                })}
            </Box>
        ));

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

                <Typography variant="h5" gutterBottom component="div" sx={{ mt: 4 }}>
                    Your Lists
                </Typography>
                {renderListHeader()}
                {renderListItems()}
                {deleteConfirmationDialog}
                {dialogOpen && <ListDialog list={selectedList} onClose={this.closeDialog} />}
            </Box>
        );
    }
}

export default Lists;