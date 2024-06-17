import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, FormControlLabel, Switch } from '@mui/material';
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
import ConnectEbayAccount from '../eBay/ConnectEbayAccount';
import { OptionType } from './Options';

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
    const { updateListInDatabase } = useList();
    const [isEbayConnected, setIsEbayConnected] = useState(false);
    const [ebayAccessToken, setEbayAccessToken] = useState<string | null>(null);
    const [ebayRefreshToken, setEbayRefreshToken] = useState<string | null>(null);
    const [showEbayModal, setShowEbayModal] = useState(false);
    const [isCollectionView, setIsCollectionView] = useState(false);

    const handleCardTypeChange = async (listCardId: number, cardId: string, cardType: OptionType | null) => {
        if (currentList) {
            try {
                await axios.post('http://localhost:8000/api/update-card-type/', {
                    list_id: currentList.id,
                    list_card_id: listCardId,
                    new_card_type: cardType,
                });
                await fetchUpdatedList();
            } catch (error) {
                console.error("Error updating card type: ", error);
            }
        }
    };

    useEffect(() => {
        if (list) {
            setCurrentList(list);
            setEditedTitle(list.name);
            fetchUpdatedList();

        }
    }, [list]);

    const fetchUpdatedList = async (): Promise<void> => {
        if (currentList) {
            try {
                const response = await axios.get<{ card_list: UpdatedList; list_cards: ListCard[] }>(`http://localhost:8000/api/get-list-by-id/${currentList.id}/`);
                if (response.data) {
                    const updatedList = response.data.card_list;
                    const listCards = response.data.list_cards;

                    const collectionValue = listCards.reduce((total, listCard) => {
                        if (listCard.collected) {
                            return total + listCard.market_value;
                        }
                        return total;
                    }, 0);

                    setCurrentList({ ...updatedList, collection_value: collectionValue });
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

    const handleEbayConnect = (accessToken: string, refreshToken: string) => {
        setEbayAccessToken(accessToken);
        setEbayRefreshToken(refreshToken);
        setIsEbayConnected(true);
    };

    const handleEbayDisconnect = () => {
        setEbayAccessToken(null);
        setEbayRefreshToken(null);
        setIsEbayConnected(false);
    };

    const openEbayModal = () => {
        setShowEbayModal(true);
    };

    const closeEbayModal = () => {
        setShowEbayModal(false);
    };

    const renderCardContent = (listType: CardType) => {
        switch (listType) {
            case 'Pokemon':
                return (
                    <PokemonCards
                        selectedListId={currentList?.id}
                        isInAddMode={false}
                        onListQuantityChange={fetchUpdatedList}
                        onCollectionQuantityChange={fetchUpdatedList}
                        isCollectionView={isCollectionView}
                        onCardTypeChange={handleCardTypeChange}
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
        <>
            <Dialog open={Boolean(currentList)} onClose={onClose} fullWidth maxWidth="lg">
                <DialogTitle textAlign="center" marginBottom={'15px'}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            {currentList && (
                                <Box>
                                    Collection Value: ${typeof currentList.collection_value === 'number' ? currentList.collection_value.toFixed(2) : parseFloat(currentList.collection_value).toFixed(2)}
                                </Box>
                            )}
                        </Box>
                        <Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={isCollectionView}
                                        onChange={(e) => setIsCollectionView(e.target.checked)}
                                        onClick={(e) => e.stopPropagation()}
                                        color="primary"
                                    />
                                }
                                label="Collection View"
                            />
                        </Box>
                        <Box onClick={() => setIsEditing(true)}>
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
                        {isEbayConnected ? (
                            <>
                                <Button onClick={() => console.log('Buy missing cards using eBay')}>
                                    Buy Missing Cards
                                </Button>
                                <Button onClick={() => console.log('List collected cards on eBay')}>
                                    List Collected Cards
                                </Button>
                            </>
                        ) : (
                            <Button onClick={openEbayModal}>Connect eBay Account</Button>
                        )}
                    </Box>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
            <ConnectEbayAccount
                open={showEbayModal}
                onClose={closeEbayModal}
                onConnect={handleEbayConnect}
                clientId={process.env.REACT_APP_EBAY_CLIENT_ID || ''}
                redirectUri={process.env.REACT_APP_EBAY_REDIRECT_URI || ''}
            />
        </>
    );
};

export default ListDialog;