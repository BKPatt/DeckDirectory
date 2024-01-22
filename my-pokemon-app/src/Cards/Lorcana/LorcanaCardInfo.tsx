import React from 'react';
import { Box, Typography, Card, CardMedia } from '@mui/material';
import LorcanaCardData from './LorcanaCardData';

type CardInfoProps = {
    card: LorcanaCardData;
};

const CardInfo: React.FC<CardInfoProps> = ({ card }) => {
    const renderProperty = (label: string, value: string | JSX.Element) => (
        <Box sx={{ textAlign: 'center', margin: '10px 0' }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginBottom: '5px' }}>
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Box>
    );

    return (
        <Card sx={{ display: 'flex', m: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardMedia
                component="img"
                sx={{ width: 240, maxHeight: '100%', borderRight: '1px solid rgba(0,0,0,0.12)' }}
                image={card.Image}
                alt={card.Name}
            />
            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                <Typography gutterBottom variant="h5" component="div">
                    {card.Name} - {card.Type}
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                    {renderProperty('Artist', card.Artist)}
                    {renderProperty('Set Name', card.Set_Name)}
                    {renderProperty('Set Number', card.Set_Num.toString())}
                    {renderProperty('Color', card.Color)}
                    {renderProperty('Cost', card.Cost.toString())}
                    {renderProperty('Inkable', card.Inkable ? 'Yes' : 'No')}
                    {renderProperty('Rarity', card.Rarity)}
                    {renderProperty('Flavor Text', card.Flavor_Text)}
                    {renderProperty('Card Number', card.Card_Num.toString())}
                    {renderProperty('Body Text', card.Body_Text)}
                </Box>
            </Box>
        </Card>
    );
};

export default CardInfo;
