import React, { useState } from 'react';
import { Box, Typography, Card, CardMedia, Tabs, Tab, Divider, Button } from '@mui/material';
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
import AddCard from '../../Components/AddCard';

type CardInfoProps = {
    card: CardData;
    selectedCardListId?: string;
    incrementCardQuantity: (card: CardData) => void;
    decrementCardQuantity: (card: CardData) => void;
    deleteCard: (card: CardData) => void;
    close: () => void;
    cardQuantity: number;
};

type EnergyImages = {
    [key: string]: string;
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
    const [selectedTab, setSelectedTab] = useState(0);
    const isPokemonCard = card.supertype === "Pokémon";

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

    const renderCardMarketNormalPrice = () => {
        const priceData = card.cardmarket?.prices;

        if (priceData && (priceData.avg1 || priceData.avg7 || priceData.avg30 || priceData.lowPrice)) {
            return (
                <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1 }}>
                    {priceData.lowPrice && renderProperty('Low Price', <Typography>{priceData.lowPrice}</Typography>)}
                    {priceData.avg7 && renderProperty('Average This Week', <Typography>{priceData.avg7}</Typography>)}
                    {priceData.avg30 && renderProperty('Average This Month', <Typography>{priceData.avg30}</Typography>)}
                    {priceData.trendPrice && renderProperty('Trend Price', <Typography>{priceData.trendPrice}</Typography>)}
                </Box>
            );
        }
        return null;
    };

    const renderCardMarketReverseHoloPrice = () => {
        const priceData = card.cardmarket?.prices;

        if (priceData && (priceData.reverseHoloAvg1 || priceData.reverseHoloAvg7 || priceData.reverseHoloAvg30 || priceData.reverseHoloLow)) {
            return (
                <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1 }}>
                    {priceData.reverseHoloLow && renderProperty('Reverse Holo Low Price', <Typography>{priceData.reverseHoloLow}</Typography>)}
                    {priceData.reverseHoloAvg7 && renderProperty('Reverse Holo Average This Week', <Typography>{priceData.reverseHoloAvg7}</Typography>)}
                    {priceData.reverseHoloAvg30 && renderProperty('Reverse Holo Average This Month', <Typography>{priceData.reverseHoloAvg30}</Typography>)}
                    {priceData.reverseHoloTrend && renderProperty('Reverse Holo Trend Price', <Typography>{priceData.reverseHoloTrend}</Typography>)}
                </Box>
            );
        }
        return null;
    };

    const renderTcgplayerPrice = (priceType: 'normal' | 'holofoil') => {
        const priceData = card.tcgplayer?.prices[priceType];

        if (!priceData || Object.values(priceData).every(value => !value)) {
            return null;
        }

        return (
            <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1 }}>
                {priceData.low && renderProperty('Low', <Typography>{priceData.low.toFixed(2)}</Typography>)}
                {priceData.mid && renderProperty('Average', <Typography>{priceData.mid.toFixed(2)}</Typography>)}
                {priceData.high && renderProperty('High', <Typography>{priceData.high.toFixed(2)}</Typography>)}
                {priceData.market && renderProperty('Market Average', <Typography>{priceData.market.toFixed(2)}</Typography>)}
            </Box>
        );
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const renderDetails = () => {
        return (
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
                        #{formatNumber(card.number, card.set.printedTotal)}/{card.set.printedTotal}
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
        );
    };

    const renderAttacks = () => {
        return (
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
        );
    };

    const renderPrices = () => {
        return (
            <Box>
                <Box>
                    <Typography variant='h5' sx={{ textAlign: 'center' }}>Card Market</Typography>
                    {renderCardMarketNormalPrice()}
                    {renderCardMarketReverseHoloPrice()}
                </Box>
                <Box marginTop={'50px'}>
                    <Typography variant='h5' sx={{ textAlign: 'center' }}>TCG Player</Typography>
                    {card.tcgplayer?.prices.normal && renderTcgplayerPrice('normal')}
                    {card.tcgplayer?.prices.holofoil && renderTcgplayerPrice('holofoil')}
                    {!card.tcgplayer?.prices.normal && !card.tcgplayer?.prices.holofoil && (
                        <Typography>No price data available.</Typography>
                    )}
                </Box>
            </Box>
        );
    };

    const tabConfig = isPokemonCard
        ? [
            { label: "Details", content: renderDetails() },
            { label: "Attacks", content: renderAttacks() },
            { label: "Prices", content: renderPrices() }
        ]
        : [
            { label: "Details", content: renderDetails() },
            { label: "Prices", content: renderPrices() }
        ];

    return (
        <Card sx={{ display: 'flex', m: 2, boxShadow: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ flexShrink: 0, width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <CardMedia
                    component="img"
                    sx={{ maxWidth: '100%', maxHeight: '100%' }}
                    image={card.images.large}
                    alt={card.name}
                />
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
                <Typography gutterBottom variant="h5" component="div">
                    {card.name} - {card.supertype}
                </Typography>

                {isPokemonCard ? (
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
                ) : (
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        aria-label="card info tabs"
                        variant="fullWidth"
                        sx={{ borderBottom: '1px solid rgba(0,0,0,0.12)', marginBottom: '25px' }}
                    >
                        <Tab label="Details" />
                        <Tab label="Prices" />
                    </Tabs>
                )}

                <Divider sx={{ my: 2 }} />
                {tabConfig[selectedTab].content}
            </Box>
        </Card>
    );
};

export default CardInfo;
