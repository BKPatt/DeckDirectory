import React, { Component } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CardList from './CardList'; // Import your CardList type

type ListDialogProps = {
    list: CardList | null;
    onClose: () => void;
};

type ListDialogState = {
    // You can add state variables here if needed
};

class ListDialog extends Component<ListDialogProps, ListDialogState> {
    render() {
        const { list, onClose } = this.props;

        return (
            <Dialog open={Boolean(list)} onClose={onClose}>
                <DialogTitle>{list ? list.name : ''}</DialogTitle>
                <DialogContent>
                    {/* Here you can add content to display the list details */}
                    {list && (
                        <div>
                            <p>Created By: {list.created_by}</p>
                            <p>Created On: {list.created_on}</p>
                            <p>Market Value: ${list.market_value}</p>
                            {/* Additional details can be added here */}
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
