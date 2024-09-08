import React from 'react';
import { Box, Typography, Card, CardMedia, Divider } from '@mui/material';
import LorcanaCardData from './LorcanaCardData';
import AddCard from '../../Components/AddCard';

type CardInfoProps = {
    card: LorcanaCardData;
    selectedCardListId?: string;
    incrementCardQuantity: (card: LorcanaCardData) => void;
    decrementCardQuantity: (card: LorcanaCardData) => void;
    deleteCard: (card: LorcanaCardData) => void;
    close: () => void;
    cardQuantity: number;
};

const CardInfo: React.FC<CardInfoProps> = ({
    card,
    selectedCardListId,
    incrementCardQuantity,
    decrementCardQuantity,
    deleteCard,
    close,
    cardQuantity
}) => {
    /**
     * Renders a label and corresponding value for card properties.
     * Used to display different card details like Artist, Set Name, etc.
     * @param label - The label describing the property (e.g., 'Artist')
     * @param value - The value of the property (e.g., 'John Doe')
     */
    const renderProperty = (label: string, value: string | JSX.Element) => (
        <Box sx={{ textAlign: 'center', margin: '10px 0' }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginBottom: '5px' }}>
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Box>
    );

    return (
        <Card sx={{ display: 'flex', m: 2, boxShadow: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ flexShrink: 0, width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {/* Display the card's image */}
                <CardMedia
                    component="img"
                    sx={{ maxWidth: '100%', maxHeight: '100%' }}
                    image={card.Image}
                    alt={card.Name}
                />

                {/* AddCard component for managing card quantity and actions like delete, increment, and decrement */}
                <AddCard
                    selectedCardListId={selectedCardListId}
                    cardQuantity={cardQuantity}
                    deleteCard={() => deleteCard(card)}
                    decrementCardQuantity={() => decrementCardQuantity(card)}
                    incrementCardQuantity={() => incrementCardQuantity(card)}
                    close={close}
                    card={card}
                />
            </Box>

            <Box sx={{ p: 2, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                {/* Display the card's name and type */}
                <Typography gutterBottom variant="h5" component="div">
                    {card.Name} - {card.Type}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Card description and flavor text */}
                <Box sx={{ border: '1px solid #eee', padding: '10px' }} marginTop={'20px'} marginBottom={'20px'}>
                    {renderProperty('', card.Body_Text)}  {/* Card body text */}
                    {renderProperty('', card.Flavor_Text)}  {/* Card flavor text */}
                </Box>

                {/* Display various card properties in a grid format */}
                <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                    {renderProperty('Artist', card.Artist)}
                    {renderProperty('Set Name', card.Set_Name)}
                    {renderProperty('Set Number', card.Set_Num.toString())}
                    {renderProperty('Color', card.Color)}
                    {renderProperty('Cost', card.Cost.toString())}
                    {renderProperty('Inkable', card.Inkable ? 'Yes' : 'No')}
                    {renderProperty('Rarity', card.Rarity)}
                    {renderProperty('Card Number', card.Card_Num.toString())}
                </Box>
            </Box>
        </Card>
    );
};

export default CardInfo;
