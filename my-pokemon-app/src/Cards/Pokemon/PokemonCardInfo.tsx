import React, { useState } from 'react';
import { Box, Typography, Card, CardMedia, Tabs, Tab, List, ListItem, Divider } from '@mui/material';
import { CardData } from './CardData';
import colorlessEnergy from '../../assets/energies/colorlessEnergy.png';
import darknessEnergy from '../../assets/energies/darknessEnergy.png';
import fairyEnergy from '../../assets/energies/fairyEnergy.png';
import fightingEnergy from '../../assets/energies/fightingEnergy.png';
import fireEnergy from '../../assets/energies/fireEnergy.png';
import grassEnergy from '../../assets/energies/grassEnergy.png';
import lightningEnergy from '../../assets/energies/lightningEnergy.png';
import metalEnergy from '../../assets/energies/metalEnergy.png';
import psychicEnergy from '../../assets/energies/psychicEnergy.png';
import waterEnergy from '../../assets/energies/waterEnergy.png';

type CardInfoProps = {
    card: CardData;
};

const CardInfo: React.FC<CardInfoProps> = ({ card }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const isPokemonCard = card.supertype === "Pokémon";

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    type EnergyImages = {
        [key: string]: string;
    };

    const energyImages: EnergyImages = {
        Colorless: colorlessEnergy,
        Darkness: darknessEnergy,
        Fairy: fairyEnergy,
        Fighting: fightingEnergy,
        Fire: fireEnergy,
        Grass: grassEnergy,
        Lightning: lightningEnergy,
        Metal: metalEnergy,
        Psychic: psychicEnergy,
        Water: waterEnergy,
    };

    const getEnergyImage = (energyType: string) => {
        const formattedEnergyType = energyType.charAt(0).toUpperCase() + energyType.slice(1).toLowerCase();
        return energyImages[formattedEnergyType] || '';
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
                image={card.images.large}
                alt={card.name}
            />
            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
                <Typography gutterBottom variant="h5" component="div">
                    {card.name} - {card.supertype}
                </Typography>

                {isPokemonCard && (
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        aria-label="card info tabs"
                        variant="fullWidth"
                        sx={{ borderBottom: '1px solid rgba(0,0,0,0.12)', marginBottom: '25px' }}
                    >
                        <Tab label="Details" />
                        <Tab label="Attacks" />
                        <Tab label="Legalities" />
                    </Tabs>
                )}

                <Divider sx={{ my: 2 }} />

                {selectedTab === 0 && (
                    <Box>
                        <Box
                            border={'1px solid #eee'}
                            padding={'10px'}
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                                justifyContent: 'center',
                            }}>
                            <img src={card.set.images.logo} alt="Set Symbol" style={{ height: '60px', marginRight: '15px' }} />
                            <Typography variant="h3" style={{ marginRight: '15px' }}>{card.set.name} Set</Typography>
                            <Typography variant="subtitle1">
                                #{formatNumber(card.number, card.set.total)}/{card.set.total}
                            </Typography>
                        </Box>
                        <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
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
                        </Box>}
                    </Box>
                )}

                {selectedTab === 1 && (
                    <Box>
                        {card.abilities && card.abilities.map((ability, index) => (
                            <Box border={'1px solid #eee'} padding={'10px'} key={index} marginBottom={'20px'}>
                                <Typography variant="subtitle1">
                                    <strong>{ability.type}: {ability.name}</strong>
                                </Typography>
                                <Typography variant="body2">{ability.text}</Typography>
                            </Box>
                        ))}

                        {card.attacks.map((attack, index) => (
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
                        ))}
                    </Box>
                )}

                {selectedTab === 2 && (
                    <Box>
                        <Typography variant="subtitle2" marginBottom="15px">
                            <strong>Legalities</strong>:
                        </Typography>
                        {Object.entries(card.legalities).map(([format, status], index) => (
                            <Typography key={index} variant="body2">
                                {format}: {status}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Box>
        </Card>
    );
};

export default CardInfo;
