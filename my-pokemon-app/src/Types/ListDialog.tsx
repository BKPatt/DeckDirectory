import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import PokemonCards from '../Cards/Pokemon/PokemonCards';
import MTGCards from '../Cards/MTG/MTGCards';
import YugiohCards from '../Cards/Yugioh/YugiohCards';
import LorcanaCards from '../Cards/Lorcana/LorcanaCards';
import BaseballCards from '../Cards/BaseballCards';
import FootballCards from '../Cards/FootballCards';
import BasketballCards from '../Cards/BasketballCards';
import HockeyCards from '../Cards/HockeyCards';
import CardType from './CardType';
import { CardList, useList } from './CardList';
import axios from 'axios';

interface ListDialogProps {
    list: CardList | null;
    onClose: () => void;
}

interface ListCard {
    id: number;
    pokemon_card: number | null;
    yugioh_card: number | null;
    mtg_card: number | null;
    lorcana_card: number | null;
    market_value: number;
    collected: boolean;
}

interface UpdatedList extends CardList {
    collection_value: number;
    market_value: number;
}

const ListDialog: React.FC<ListDialogProps> = ({ list, onClose }) => {
    const [currentList, setCurrentList] = useState<CardList | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [collectionValue, setCollectionValue] = useState(0);
    const { updateListInDatabase } = useList();

    // Initialize the dialog with the provided list
    useEffect(() => {
        if (list) {
            setCurrentList(list);
            setEditedTitle(list.name);
            fetchUpdatedList();
        }
    }, [list]);

    // Fetch updated list details from the server
    const fetchUpdatedList = async (): Promise<void> => {
        if (currentList) {
            try {
                const response = await axios.get<{ card_list: UpdatedList; list_cards: ListCard[] }>(`http://localhost:8000/api/get-list-by-id/${currentList.id}/`);
                if (response.data) {
                    const updatedList = response.data.card_list;
                    const listCards = response.data.list_cards;

                    // Calculate the collection value based on collected cards
                    const newCollectionValue = listCards.reduce((total, card) => {
                        return card.collected ? total + card.market_value : total;
                    }, 0);

                    setCurrentList(updatedList);
                    setCollectionValue(newCollectionValue);
                }
            } catch (error) {
                console.error('Error fetching updated list:', error);
            }
        }
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedTitle(event.target.value);
    };

    // Handle 'Enter' key press when editing the title
    const handleKeyDown = async (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            setIsEditing(false);
            if (currentList) {
                const updatedList = { ...currentList, name: editedTitle };
                await updateListInDatabase(currentList.id, updatedList);
                setCurrentList(updatedList);
            }
        }
    };

    // Render the appropriate card component based on the list type
    const renderCardContent = (listType: CardType) => {
        switch (listType) {
            case 'Pokemon':
                return (
                    <PokemonCards
                        selectedListId={currentList?.id}
                        isInAddMode={false}
                        onListQuantityChange={fetchUpdatedList}
                    />
                );
            case 'MTG':
                return (
                    <MTGCards
                        selectedListId={currentList?.id}
                        isInAddMode={false}
                        onListQuantityChange={fetchUpdatedList}
                    />
                );
            case 'Yu-Gi-Oh!':
                return (
                    <YugiohCards
                        selectedListId={currentList?.id}
                        isInAddMode={false}
                        onListQuantityChange={fetchUpdatedList}
                    />
                );
            case 'Lorcana':
                return (
                    <LorcanaCards
                        selectedListId={currentList?.id}
                        isInAddMode={false}
                        onListQuantityChange={fetchUpdatedList}
                    />
                );
            case 'Baseball':
                return <BaseballCards />;
            case 'Football':
                return <FootballCards />;
            case 'Basketball':
                return <BasketballCards />;
            case 'Hockey':
                return <HockeyCards />;
            default:
                return <div>No card data available</div>;
        }
    };

    return (
        <Dialog open={Boolean(currentList)} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle textAlign="center" marginBottom={'15px'} onClick={() => setIsEditing(true)}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        {currentList && (
                            <Box>
                                Collection Value: ${typeof currentList.collection_value === 'number' ? currentList.collection_value.toFixed(2) : parseFloat(currentList.collection_value).toFixed(2)}
                            </Box>
                        )}
                    </Box>
                    <Box>
                        {isEditing ? (
                            <TextField
                                fullWidth
                                autoFocus
                                value={editedTitle}
                                onChange={handleTitleChange}
                                onKeyDown={handleKeyDown}
                                onBlur={() => setIsEditing(false)}
                            />
                        ) : (
                            editedTitle
                        )}
                    </Box>
                    <Box>
                        {currentList && (
                            <Box>
                                List Value: ${typeof currentList.market_value === 'number' ? currentList.market_value.toFixed(2) : parseFloat(currentList.market_value).toFixed(2)}
                            </Box>
                        )}
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                {currentList && (
                    <>
                        {renderCardContent(currentList.type)}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Box display="flex" width={'100%'} justifyContent="left" alignItems="center">
                    <Button>
                        Buy Missing Cards
                    </Button>
                    <Button>
                        List Collected Cards
                    </Button>
                </Box>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ListDialog;