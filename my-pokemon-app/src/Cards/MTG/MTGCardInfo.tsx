import React, { useState } from 'react';
import { Box, Typography, Card, CardMedia, Tabs, Tab, Divider } from '@mui/material';
import { MTGCardData } from './MTGCardData';
import Default from '../../assets/Default.png'
import AddCard from '../../Components/AddCard';

type CardInfoProps = {
    card: MTGCardData;
    selectedCardListId?: string;
    incrementCardQuantity: (card: MTGCardData) => void;
    decrementCardQuantity: (card: MTGCardData) => void;
    deleteCard: (card: MTGCardData) => void;
    close: () => void;
    cardQuantity: number;
};

const MTGCardInfo: React.FC<CardInfoProps> = ({
    card,
    selectedCardListId,
    incrementCardQuantity,
    decrementCardQuantity,
    deleteCard,
    close,
    cardQuantity
}) => {
    // Track the currently selected tab (Details, Legalities, Games, Prices)
    const [selectedTab, setSelectedTab] = useState(0);

    // Handle tab selection change
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    // Function to render a property with a label and value (e.g., 'Artist', 'John Doe')
    const renderProperty = (label: string, value: string | JSX.Element) => (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginBottom: '5px' }}>
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Box>
    );

    // Render legalities (like card format and whether it's legal in those formats)
    const renderLegalities = (legalities: { [key: string]: string }) => {
        return Object.entries(legalities).map(([format, legality]) =>
            renderProperty(format.charAt(0).toUpperCase() + format.slice(1), legality.charAt(0).toUpperCase() + legality.slice(1))
        );
    };

    // Render the games where the card is playable (MTG Arena, MTGO, Paper)
    const renderGames = (games: string[]) => {
        const gameNames: { [key: string]: string } = {
            'arena': 'Magic: The Gathering Arena',
            'paper': 'Traditional Paper-Based',
            'mtgo': 'Magic: The Gathering Online'
        };

        return games.map(game =>
            renderProperty('Game', gameNames[game] || game)
        );
    };

    // Render the card prices across different currencies/formats (USD, EUR, Foils, etc.)
    const renderPrices = (prices: any) => {
        const priceLabels: { [key: string]: string } = {
            'eur': 'EUR',
            'tix': 'TIX',
            'usd': 'USD',
            'eur_foil': 'EUR Foil',
            'usd_foil': 'USD Foil',
            'usd_etched': 'USD Etched'
        };

        return Object.entries(prices).map(([key, value]) => {
            if (value === null || value === undefined) return null;
            return renderProperty(priceLabels[key], value.toString());
        }).filter(Boolean);
    };

    return (
        <Card sx={{ display: 'flex', m: 2, boxShadow: 3, borderRadius: 2, height: '100%' }}>
            {/* Left side: Display the card image */}
            <Box sx={{ flexShrink: 0, width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CardMedia
                    component="img"
                    sx={{ maxWidth: '100%', maxHeight: '100%' }}
                    image={card.image_uris?.large || Default}
                    alt={card.name}
                />
                {/* Add card component to handle card quantity and deletion */}
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

            {/* Right side: Card details and tabs */}
            <Box sx={{ p: 2, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Typography gutterBottom variant="h5" component="div">
                    {card.name}
                </Typography>

                {/* Tabs for switching between card details, legalities, games, and prices */}
                <Tabs
                    value={selectedTab}
                    onChange={handleTabChange}
                    aria-label="card info tabs"
                    variant="fullWidth"
                    sx={{ borderBottom: '1px solid rgba(0,0,0,0.12)', marginBottom: '25px' }}
                >
                    <Tab label="Details" />
                    <Tab label="Legalities" />
                    <Tab label="Games" />
                    <Tab label="Prices" />
                </Tabs>

                <Divider sx={{ my: 2 }} />

                {/* Tab content */}
                {selectedTab === 0 && (
                    <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                        {card.cmc && renderProperty('Mana Cost', card.cmc.toString())}
                        {card.type_line && renderProperty('Type', card.type_line)}
                        {card.lang && renderProperty('Language', card.lang)}
                        {card.released_at && renderProperty('Released', card.released_at)}
                        {card.set_name && renderProperty('Set', card.set_name)}
                        {card.set_type && renderProperty('Set Type', card.set_type)}
                        {card.artist && renderProperty('Artist', card.artist)}
                        {card.rarity && renderProperty('Rarity', card.rarity)}
                    </Box>
                )}

                {/* Legalities tab */}
                {selectedTab === 1 && (
                    <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                        {card.legalities && renderLegalities(card.legalities)}
                    </Box>
                )}

                {/* Games tab */}
                {selectedTab === 2 && (
                    <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                        {card.games && renderGames(card.games as any[])}
                    </Box>
                )}

                {/* Prices tab */}
                {selectedTab === 3 && (
                    <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                        {card.prices && renderPrices(card.prices)}
                    </Box>
                )}
            </Box>
        </Card>
    );
};

export default MTGCardInfo;
