import React from 'react';
import { Box, Typography, Button } from '@mui/material';

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
                    <Button
                        onClick={() => {
                            if (cardQuantity === 1) {
                                deleteCard(card);
                                close();
                            } else {
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
                    <Typography sx={{ flexGrow: 1, textAlign: 'center' }}>{cardQuantity}</Typography>
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