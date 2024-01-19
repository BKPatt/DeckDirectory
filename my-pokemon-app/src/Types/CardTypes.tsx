import React from 'react';
import { Link } from 'react-router-dom';
import { Paper, Grid, Card, CardActionArea, CardMedia, CardContent, Typography } from '@mui/material';
import pokemon from '../assets/pokemon.png'
import mtg from '../assets/mtg.png'
import baseball from '../assets/baseball.jpg'
import football from '../assets/football.jpg'
import yugioh from '../assets/yugioh.jpg'
import basketball from '../assets/basketball.jpg'
import hockey from '../assets/hockey.jpg'
import lorcana from '../assets/lorcana.jpg'

const CardTypesPage = () => {
    const cardTypes = [
        { name: 'Pokemon', imageUrl: pokemon },
        { name: 'MTG', imageUrl: mtg },
        { name: 'Yu-Gi-Oh!', imageUrl: yugioh },
        { name: 'Lorcana', imageUrl: lorcana },
        { name: 'Baseball', imageUrl: baseball },
        { name: 'Football', imageUrl: football },
        { name: 'Basketball', imageUrl: basketball },
        { name: 'Hockey', imageUrl: hockey }
    ];

    return (
        <Paper style={{ margin: 'auto', width: 'auto', height: 'auto', padding: '20px' }}>
            <Grid container spacing={2}>
                {cardTypes.map((type, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card component={Link} to={`/cards/${type.name.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                            <CardActionArea>
                                <CardMedia
                                    component="img"
                                    image={type.imageUrl}
                                    alt={type.name}
                                />
                                <CardContent>
                                    <Typography gutterBottom variant="h6" component="div">
                                        {type.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default CardTypesPage;
