import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Grid, Card, CardMedia, Typography, Pagination } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EbayItem from './EbayItem';

const BasketballCards = () => {
    const [cards, setCards] = useState<EbayItem[]>([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage] = useState(20);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let url = `https://svcs.sandbox.ebay.com/services/search/FindingService/v1`;
                url += `?OPERATION-NAME=findItemsByKeywords`;
                url += `&SERVICE-VERSION=1.0.0`;
                url += `&SECURITY-APPNAME=${process.env.REACT_APP_EBAY_API_KEY}`;
                url += `&RESPONSE-DATA-FORMAT=JSON`;
                url += `&REST-PAYLOAD`;
                const searchTerm = search.trim() === '' ? 'basketball card' : search;
                url += `&keywords=${encodeURIComponent(searchTerm)}`;
                // url += `&paginationInput.entriesPerPage=50`;

                const response = await axios.get(url);
                const items = response.data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
                const formattedCards = items.map((item: any) => ({
                    itemId: item.itemId?.[0] || '',
                    title: item.title?.[0] || 'No title',
                    globalId: item.globalId?.[0] || '',
                    primaryCategory: {
                        categoryId: item.primaryCategory?.[0].categoryId?.[0] || '',
                        categoryName: item.primaryCategory?.[0].categoryName?.[0] || ''
                    },
                    galleryURL: item.galleryURL?.[0] || '',
                    viewItemURL: item.viewItemURL?.[0] || '',
                    autoPay: item.autoPay?.[0] || 'false',
                    postalCode: item.postalCode?.[0] || '',
                    location: item.location?.[0] || '',
                    country: item.country?.[0] || '',
                    shippingInfo: item.shippingInfo?.[0] || {}, // Default to an empty object
                    sellingStatus: item.sellingStatus?.[0] || {}, // Default to an empty object
                    listingInfo: item.listingInfo?.[0] || {}, // Default to an empty object
                    returnsAccepted: item.returnsAccepted?.[0] || 'false',
                    condition: {
                        conditionId: item.condition?.[0].conditionId?.[0] || '',
                        conditionDisplayName: item.condition?.[0].conditionDisplayName?.[0] || ''
                    },
                    isMultiVariationListing: item.isMultiVariationListing?.[0] || 'false',
                    topRatedListing: item.topRatedListing?.[0] || 'false'
                }));
                setCards(formattedCards);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchData();
    }, [search]);

    const paginate = (value: number) => {
        setCurrentPage(value);
    };
    const handleCardClick = (cardTitle: string) => {
        navigate(`/cards/basketball/${cardTitle}`);
    };

    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = cards.slice(indexOfFirstCard, indexOfLastCard);

    return (
        <Box sx={{ p: 2 }}>
            <TextField
                fullWidth
                label="Search Basketball Cards"
                variant="outlined"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
                {currentCards.map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <Card onClick={() => handleCardClick(card.title)}>
                            <CardMedia
                                component="img"
                                height="auto"
                                image={card.galleryURL}
                                alt={card.title}
                            />
                            <Typography gutterBottom variant="h6" component="div" sx={{ textAlign: 'center' }}>
                                {card.title}
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

export default BasketballCards;