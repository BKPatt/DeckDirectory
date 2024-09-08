import React from 'react';
import { Box, Typography, Button } from '@mui/material';

// Define prop types for the AddCard component
type addCardsProps = {
    selectedCardListId?: string;
    cardQuantity: number;
    deleteCard: (card: any) => void;
    decrementCardQuantity: (card: any) => void;
    incrementCardQuantity: (card: any) => void;
    close: () => void;
    card: any;
}

const AddCard: React.FC<addCardsProps> = ({
    selectedCardListId,
    cardQuantity,
    deleteCard,
    decrementCardQuantity,
    incrementCardQuantity,
    close,
    card,
}) => {

    return (
        // Only render if a card list is selected
        selectedCardListId && (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    px: 2,
                    py: 1
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexGrow: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        maxWidth: '300px'
                    }}
                >
                    {/* Decrement button */}
                    <Button
                        onClick={() => {
                            if (cardQuantity === 1) {
                                // If only one card left, delete it and close the dialog
                                deleteCard(card);
                                close();
                            } else {
                                // Otherwise, just decrement the quantity
                                decrementCardQuantity(card);
                            }
                        }}
                        sx={{
                            flexGrow: 1,
                            backgroundColor: 'transparent',
                            color: 'primary.main',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        -
                    </Button>
                    {/* Display current quantity */}
                    <Typography sx={{ flexGrow: 1, textAlign: 'center' }}>{cardQuantity}</Typography>
                    {/* Increment button */}
                    <Button
                        onClick={() => incrementCardQuantity(card)}
                        sx={{
                            flexGrow: 1,
                            backgroundColor: 'transparent',
                            color: 'primary.main',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        +
                    </Button>
                </Box>
            </Box>
        ));
};

export default AddCard;