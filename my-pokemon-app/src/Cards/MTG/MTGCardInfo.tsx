import React, { useState } from 'react';
import { Box, Typography, Card, CardMedia, Tabs, Tab, Divider, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { MTGCardData } from './MTGCardData';
import Default from '../../assets/Default.png'

type CardInfoProps = {
    card: MTGCardData;
};

const MTGCardInfo: React.FC<CardInfoProps> = ({ card }) => {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const renderProperty = (label: string, value: string | JSX.Element) => (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginBottom: '5px' }}>
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Box>
    );

    const renderLegalities = (legalities: { [key: string]: string }) => {
        return Object.entries(legalities).map(([format, legality]) =>
            renderProperty(format.charAt(0).toUpperCase() + format.slice(1), legality.charAt(0).toUpperCase() + legality.slice(1))
        );
    };

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
            <Box sx={{ flexShrink: 0, width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CardMedia
                    component="img"
                    sx={{ maxWidth: '100%', maxHeight: '100%' }}
                    image={card.image_uris?.large || Default}
                    alt={card.name}
                />
            </Box>
            <Box sx={{ p: 2, flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <Typography gutterBottom variant="h5" component="div">
                    {card.name}
                </Typography>
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

                {selectedTab === 0 && (
                    <Box>
                        <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                            {card.cmc && renderProperty('Mana Cost', card.cmc.toString())}
                            {card.type_line && renderProperty('Type', card.type_line)}
                            {card.lang && renderProperty('Language', card.lang)}
                            {card.released_at && renderProperty('Realeased', card.released_at)}
                            {card.set_name && renderProperty('Set', card.set_name)}
                            {card.set_type && renderProperty('Set Type', card.set_type)}
                            {card.artist && renderProperty('Artist', card.artist)}
                            {card.rarity && renderProperty('Rarity', card.rarity)}
                        </Box>
                    </Box>
                )}

                {selectedTab === 1 && (
                    <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                        {card.legalities && renderLegalities(card.legalities)}
                    </Box>
                )}

                {selectedTab === 2 && (
                    <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                        {card.games && renderGames(card.games as any[])}
                    </Box>
                )}

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
