import React from 'react';
import {
    Box,
    Card,
    CardMedia,
    Typography,
    Grid,
    Button,
    Checkbox,
} from '@mui/material';

interface CardDisplayProps {
    card: any;
    onInfoClick: (card: any) => void;
    onAddCard: (card: any) => void;
    onIncrementCard: (card: any) => void;
    onDecrementCard: (card: any) => void;
    onDeleteCard: (card: any) => void;
    handleIncrementCollectedQuantity: (card: any) => void;
    handleDecrementCollectedQuantity: (card: any) => void;
    isSelectedListId: boolean;
    isInAddMode?: boolean;
    collectedStatus?: boolean;
    cardQuantities: { [key: string]: number; };
    onCheckboxChange?: (cardId: string, isChecked: boolean) => void;
    image: string;
    name: string;
    id: string;
    collectedQuantities: { [key: string]: number };
}

const CardDisplay: React.FC<CardDisplayProps> = ({
    card,
    onInfoClick,
    onAddCard,
    onIncrementCard,
    onDecrementCard,
    onDeleteCard,
    handleIncrementCollectedQuantity,
    handleDecrementCollectedQuantity,
    isSelectedListId,
    isInAddMode,
    collectedStatus,
    cardQuantities,
    onCheckboxChange,
    image,
    name,
    id,
    collectedQuantities,
}) => {
    return (
        <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card>
                {isSelectedListId && !isInAddMode && (
                    <Typography variant="h6" component="div" sx={{ textAlign: 'center', mt: 1 }}>
                        {name}
                    </Typography>
                )}
                <Box onClick={() => onInfoClick(card)} sx={{ position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'relative', '&:hover .cardActions': { opacity: 1 } }}>
                        <CardMedia
                            component="img"
                            height="auto"
                            image={image}
                            alt={name}
                        />
                        <Box
                            className="cardActions"
                            sx={{
                                position: 'absolute',
                                top: 0,
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                opacity: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                transition: 'opacity 0.3s'
                            }}
                        >
                            {isSelectedListId && (
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        {(cardQuantities[id] > 0) ? (
                                            <Box sx={{ display: 'flex' }}>
                                                {cardQuantities[id] === 1 ? (
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteCard(card)
                                                        }}
                                                        sx={{
                                                            width: '35px',
                                                            backgroundColor: 'red',
                                                            '&:hover': {
                                                                backgroundColor: 'darkred',
                                                            },
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDecrementCard(card)
                                                        }}
                                                        sx={{ width: '35px' }}
                                                    >
                                                        -
                                                    </Button>
                                                )}
                                                <Typography sx={{ mx: 1 }}>{cardQuantities[id] || 0}</Typography>
                                                <Button
                                                    variant="contained"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onIncrementCard(card)
                                                    }}
                                                    sx={{ width: '35px' }}
                                                >
                                                    +
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddCard(card)
                                                }}
                                                sx={{ mb: 1, width: '70px' }}
                                            >
                                                Add
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            )}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInfoClick(card)
                                }}
                                sx={{ mb: 1, width: '70px' }}
                            >
                                Info
                            </Button>
                        </Box>
                    </Box>
                </Box>
                {!(isSelectedListId && !isInAddMode) && (
                    <Typography variant="h6" component="div" sx={{ textAlign: 'center', mt: 1 }}>
                        {name}
                    </Typography>
                )}
                {isSelectedListId && !isInAddMode && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
                        <Checkbox
                            checked={collectedStatus || false}
                            onChange={(e) => onCheckboxChange?.(id, e.target.checked)}
                            color="primary"
                        />
                        <Typography variant="body2" component="span">
                            Collected
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                onClick={() => handleDecrementCollectedQuantity(id)}
                                sx={{
                                    minWidth: '35px',
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
                            <Typography sx={{ mx: 1 }}>{collectedQuantities[id] || 0}</Typography>
                            <Button
                                onClick={() => handleIncrementCollectedQuantity(id)}
                                sx={{
                                    minWidth: '35px',
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
                )}
            </Card>
        </Grid>
    );
};

export default CardDisplay;
