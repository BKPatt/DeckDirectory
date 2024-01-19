import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type Attack = {
    name: string;
    cost: string[];
    convertedEnergyCost: number;
    damage: string;
    text: string;
};

type Weakness = {
    type: string;
    value: string;
};

type CardSet = {
    id: string;
    name: string;
    series: string;
    printedTotal: number;
    total: number;
    legalities: Record<string, string>;
    ptcgoCode: string;
    releaseDate: string;
    updatedAt: string;
    images: {
        symbol: string;
        logo: string;
    };
};

type CardData = {
    id: string;
    name: string;
    supertype: string;
    subtypes: string[];
    level: string;
    hp: string;
    types: string[];
    attacks: Attack[];
    weaknesses: Weakness[];
    retreatCost: string[];
    convertedRetreatCost: number;
    set: CardSet;
    number: string;
    artist: string;
    rarity: string;
    flavorText: string;
    nationalPokedexNumbers: number[];
    legalities: Record<string, string>;
    images: {
        small: string;
        large: string;
    };
    tcgplayer?: {
        url: string;
        updatedAt: string;
        prices: Record<string, any>;
    };
    cardmarket?: {
        url: string;
        updatedAt: string;
        prices: Record<string, any>;
    };
};

const PokemonCards = () => {
    const [cards, setCards] = useState<CardData[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const url = 'https://api.pokemontcg.io/v2/cards';
            const params = new URLSearchParams();

            if (search) {
                params.append('q', `name:${search}`);
            }
            if (filter) {
                params.append('filterParam', filter);
            }

            const response = await axios.get(url, {
                headers: {
                    'X-Api-Key': process.env.REACT_APP_POKEMON_TCG_API_KEY
                },
                params: params,
            });

            setCards(response.data.data);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    const handleSearchClick = () => {
        fetchData();
    };

    const paginate = (value: number) => {
        setCurrentPage(value);
    };

    const handleCardClick = (cardName: string) => {
        navigate(`/cards/pokemon/${cardName}`);
    };

    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard);

    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                label="Search Pokémon Cards"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />
            <TextField
                label="Filter"
                variant="outlined"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleSearchClick}>Search</Button>
            <Grid container spacing={2}>
                {currentCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card onClick={() => handleCardClick(card.name)}>
                            <CardMedia
                                component="img"
                                height="auto"
                                image={card.images.small}
                                alt={card.name}
                            />
                            <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                                {card.name}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Pagination
                count={Math.ceil(cards.length / cardsPerPage)}
                page={currentPage}
                onChange={(_, value) => paginate(value)}
                sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
        </Box>
    );
};

export default PokemonCards;    