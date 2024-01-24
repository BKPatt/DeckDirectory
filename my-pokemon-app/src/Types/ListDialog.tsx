import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography } from '@mui/material';
import PokemonCards from '../Cards/Pokemon/PokemonCards';
import MTGCards from '../Cards/MTG/MTGCards';
import YugiohCards from '../Cards/Yugioh/YugiohCards';
import LorcanaCards from '../Cards/Lorcana/LorcanaCards';
import BaseballCards from '../Cards/BaseballCards';
import FootballCards from '../Cards/FootballCards';
import BasketballCards from '../Cards/BasketballCards';
import HockeyCards from '../Cards/HockeyCards';
import CardType from './CardType';
import { CardList } from './CardList';
import formatDate from '../helpers/formatDate';

interface ListDialogProps {
    list: CardList | null;
    onClose: () => void;
}

const ListDialog: React.FC<ListDialogProps> = ({ list, onClose }) => {
    const [currentList, setCurrentList] = useState<CardList | null>(null);

    useEffect(() => {
        if (list) {
            setCurrentList(list);
        }
    }, [list]);

    const renderCardContent = (listType: CardType) => {
        switch (listType) {
            case 'Pokemon':
                return <PokemonCards selectedListId={currentList?.id} isInAddMode={false} />;
            case 'MTG':
                return <MTGCards selectedListId={currentList?.id} isInAddMode={false} />;
            case 'Yu-Gi-Oh!':
                return <YugiohCards selectedListId={currentList?.id} isInAddMode={false} />;
            case 'Lorcana':
                return <LorcanaCards selectedListId={currentList?.id} isInAddMode={false} />;
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
            <DialogTitle textAlign="center" marginBottom={'15px'}>
                {currentList ? currentList.name : ''}
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
