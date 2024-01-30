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

const ListDialog: React.FC<ListDialogProps> = ({ list, onClose }) => {
    const [currentList, setCurrentList] = useState<CardList | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const { updateListInDatabase } = useList();

    useEffect(() => {
        if (list) {
            setCurrentList(list);
            if (currentList) {
                setEditedTitle(currentList.name);
            }
        }
    }, []);

    const fetchUpdatedList = async () => {
        if (currentList) {
            try {
                const response = await axios.get(`http://localhost:8000/api/get-list-by-id/${currentList.id}/`);
                if (response.data) {
                    setCurrentList(response.data.card_list);
                }
            } catch (error) {
                console.error('Error fetching updated list:', error);
            }
        }
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditedTitle(event.target.value);
    };

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
                            <Box style={{ textAlign: 'right', marginRight: '10px' }}>
                                Market Value: ${currentList.market_value}
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
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ListDialog;