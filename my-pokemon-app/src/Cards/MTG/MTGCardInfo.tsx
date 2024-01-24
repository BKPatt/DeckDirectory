import React, { useState } from 'react';
import { Box, Typography, Card, CardMedia, Tabs, Tab, Divider, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { MTGCardData } from './MTGCardData';
import Default from '../../assets/Default.png'

type CardInfoProps = {
    card: MTGCardData;
};

const YugiohCardInfo: React.FC<CardInfoProps> = ({ card }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [dropdownValue, setDropdownValue] = useState('');

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const handleDropdownChange = (event: SelectChangeEvent) => {
        setDropdownValue(event.target.value as string);
    };

    const renderProperty = (label: string, value: string | JSX.Element) => (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', marginBottom: '5px' }}>
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Box>
    );

    const formatNumber = (number: string, total: number) => {
        const totalLength = `${total}`.length;
        return `${number}`.padStart(totalLength, '0');
    };

    return (
        <Card sx={{ display: 'flex', m: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardMedia
                component="img"
                sx={{ width: 'auto', maxWidth: '40%', maxHeight: '100%', borderRight: '1px solid rgba(0,0,0,0.12)' }}
                image={card.image_uris?.small || Default}
                alt={card.name}
            />
            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
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
                    <Tab label="Attacks" />
                    <Tab label="Prices" />
                </Tabs>

                <Divider sx={{ my: 2 }} />

                {selectedTab === 0 && (
                    <Box>
                        {/* <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                            {card.types && card.types.length > 0 && renderProperty('Type', <>{card.types.map((type, index) => <img key={index} src={getEnergyImage(type)} alt={`${type} type`} style={{ width: '20px', height: '20px' }} />)}</>)}
                            {card.hp && renderProperty('HP', card.hp)}
                            {card.retreatCost && card.retreatCost.length > 0 && renderProperty('Retreat Cost', <>{card.retreatCost.map((_, index) => <img key={index} src={getEnergyImage('Colorless')} alt="Colorless energy" style={{ width: '20px', height: '20px', margin: '3px' }} />)}</>)}
                            {card.evolvesFrom && renderProperty('Evolves from', card.evolvesFrom)}
                            {card.artist && renderProperty('Illustrated By', card.artist)}
                            {card.nationalPokedexNumbers && card.nationalPokedexNumbers.length > 0 && renderProperty('National Pokédex #', card.nationalPokedexNumbers.join(', '))}
                            {card.weaknesses && card.weaknesses.map((weakness, index) => (
                                renderProperty('Weaknesses', <Typography><img key={index} src={getEnergyImage(weakness.type)} alt={`${weakness.type} type icon`} style={{ width: '20px', height: '20px' }} /> {weakness.value}</Typography>)
                            ))}
                            {card.rarity && renderProperty('Rarity', card.rarity)}
                        </Box>
                        {card.flavorText && <Box border={'1px solid #eee'} padding={'10px'}>
                            {card.flavorText && card.flavorText}
                        </Box>} */}
                    </Box>
                )}

                {selectedTab === 1 && (
                    <Box>
                        {/* {card.abilities && card.abilities.map((ability, index) => (
                            <Box border={'1px solid #eee'} padding={'10px'} key={index} marginBottom={'20px'}>
                                <Typography variant="subtitle1">
                                    <strong>{ability.type}: {ability.name}</strong>
                                </Typography>
                                <Typography variant="body2">{ability.text}</Typography>
                            </Box>
                        ))} */}

                        {/* {card.attacks.map((attack, index) => (
                            <Box border={'1px solid #eee'} padding={'10px'} key={index}>
                                <Typography variant="subtitle1">
                                    {attack.cost.map((energyType, costIndex) => (
                                        <img
                                            key={costIndex}
                                            src={getEnergyImage(energyType)}
                                            alt={`${energyType} energy`}
                                            style={{ width: '20px', height: '20px', marginRight: '5px' }}
                                        />
                                    ))}
                                    <strong>{attack.name}</strong>
                                </Typography>
                                <Typography variant="body2">{attack.text}</Typography>
                                {attack.damage && <Typography variant="body2">Damage: {attack.damage}</Typography>}
                            </Box>
                        ))} */}
                    </Box>
                )}

                {selectedTab === 2 && (
                    <Box>
                        <FormControl fullWidth>
                            <InputLabel id="select-label">Card Type</InputLabel>
                            <Select
                                labelId="select-label"
                                id="simple-select"
                                value={dropdownValue}
                                label="Card Type"
                                onChange={handleDropdownChange}
                            >
                                <MenuItem value={'Normal'}>Normal</MenuItem>
                                <MenuItem value={'Reverse Holo'}>Reverse Holo</MenuItem>
                            </Select>
                        </FormControl>
                        <Box>
                            {card.prices && renderProperty('Average Sell Price', <Typography>{ }</Typography>)}
                        </Box>
                    </Box>
                )}
            </Box>
        </Card>
    );
};

export default YugiohCardInfo;
