import React, { Component } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Typography } from '@mui/material';
import CardList from './CardList';
import formatDate from '../helpers/formatDate';
import PokemonCards from '../Cards/Pokemon/PokemonCards';
import MTGCards from '../Cards/MTG/MTGCards';
import YugiohCards from '../Cards/Yugioh/YugiohCards';
import LorcanaCards from '../Cards/Lorcana/LorcanaCards';
import BaseballCards from '../Cards/BaseballCards';
import FootballCards from '../Cards/FootballCards';
import BasketballCards from '../Cards/BasketballCards';
import HockeyCards from '../Cards/HockeyCards';
import CardType from './CardType';

type ListDialogProps = {
    list: CardList | null;
    onClose: () => void;
};

class ListDialog extends Component<ListDialogProps> {
    renderCardContent = (listType: CardType) => {
        switch (listType) {
            case 'Pokemon':
                return <PokemonCards selectedListId={this.props.list?.id} />;
            case 'MTG':
                return <MTGCards selectedListId={this.props.list?.id} />;
            case 'Yu-Gi-Oh!':
                return <YugiohCards selectedListId={this.props.list?.id} />;
            case 'Lorcana':
                return <LorcanaCards />;
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

    render() {
        const { list, onClose } = this.props;

        return (
            <Dialog
                open={Boolean(list)}
                onClose={onClose}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle textAlign='center' marginBottom={'15px'}>{list ? list.name : ''}</DialogTitle>
                <DialogContent>
                    {list && (
                        <>
                            <Grid container spacing={2}>
                                <Grid item xs={4}>
                                    <Typography variant="body1">Created By: {list.created_by}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body1">Created On: {formatDate(list.created_on)}</Typography>
                                </Grid>
                                <Grid item xs={4}>
                                    <Typography variant="body1">Market Value: ${list.market_value}</Typography>
                                </Grid>
                            </Grid>
                            {this.renderCardContent(list.type)}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default ListDialog;
