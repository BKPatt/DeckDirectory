import React, { Component } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CardList from './CardList';
import formatDate from '../helpers/formatDate';

type ListDialogProps = {
    list: CardList | null;
    onClose: () => void;
};

type ListDialogState = {
    // Add state variables here if needed
};

class ListDialog extends Component<ListDialogProps, ListDialogState> {
    render() {
        const { list, onClose } = this.props;

        return (
            <Dialog open={Boolean(list)} onClose={onClose}>
                <DialogTitle>{list ? list.name : ''}</DialogTitle>
                <DialogContent>
                    {list && (
                        <div>
                            <p>Created By: {list.created_by}</p>
                            <p>Created On: {formatDate(list.created_on)}</p>
                            <p>Market Value: ${list.market_value}</p>
                        </div>
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
