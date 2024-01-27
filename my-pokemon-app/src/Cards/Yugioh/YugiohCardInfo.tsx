import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Card, CardMedia, Tabs, Tab, Divider } from '@mui/material';
import { YugiohCardData } from './YugiohCardData';

type CardInfoProps = {
    card: YugiohCardData;
};

const YugiohCardInfo: React.FC<CardInfoProps> = ({ card }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [imageHeight, setImageHeight] = useState<number | undefined>(undefined);
    const [imageAdjustedHeight, setImageAdjustedHeight] = useState<number | undefined>(undefined);
    const [imageWidth, setImageWidth] = useState<number | undefined>(undefined);
    const imageRef = useRef<HTMLImageElement>(null);
    const tabBoxRef = useRef<HTMLDivElement | null>(null);
    const [tabBoxHeight, setTabBoxHeight] = useState<number>(0);

    const [dimensions, setDimensions] = useState<{
        imageHeight: number | undefined;
        imageWidth: number | undefined;
    }>({
        imageHeight: undefined,
        imageWidth: undefined,
    });

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };

    const updateDimensions = () => {
        const imageCurrent = imageRef.current;
        const tabBoxCurrent = tabBoxRef.current;
        if (imageCurrent) {
            setDimensions({
                imageHeight: imageCurrent.clientHeight,
                imageWidth: imageCurrent.clientWidth
            });
        }
        if (tabBoxCurrent) {
            setTabBoxHeight(tabBoxCurrent.clientHeight);
        }
    };

    useEffect(() => {
        if (imageRef.current && tabBoxRef.current) {
            const imageCurrentHeight = imageRef.current.clientHeight;
            const tabBoxCurrentHeight = tabBoxRef.current.clientHeight;
            const adjustedHeight = imageCurrentHeight - tabBoxCurrentHeight - 20;

            setImageHeight(imageCurrentHeight);
            setImageAdjustedHeight(Math.max(0, adjustedHeight));
            setImageWidth(imageRef.current.clientWidth);
        }
    }, [imageHeight, imageWidth, tabBoxHeight]);

    const renderProperty = (label: string, value: string | number | JSX.Element) => (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', margin: '5px' }}>
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', margin: 2, boxShadow: 3, borderRadius: 2 }}>
            <CardMedia
                component="img"
                sx={{
                    width: '40%',
                    objectFit: 'cover',
                    minHeight: imageHeight,
                    maxHeight: imageHeight,
                    minWidth: imageWidth,
                    maxWidth: imageWidth
                }}
                image={card.card_images[0]?.image_url}
                alt={card.name}
                ref={imageRef}
                onLoad={() => {
                    setImageHeight(imageRef.current?.clientHeight);
                    setImageWidth(imageRef.current?.clientWidth)
                }}
            />

            <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, maxHeight: imageHeight }}>
                <Box ref={tabBoxRef} sx={{ flexShrink: 0, marginLeft: '10px' }}>
                    <Typography gutterBottom variant="h5" component="div">
                        {card.name}
                    </Typography>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        aria-label="card info tabs"
                        variant="fullWidth"
                    >
                        <Tab label="Details" />
                        <Tab label="Card Sets" />
                        <Tab label="Prices" />
                    </Tabs>

                    <Divider sx={{ my: 2 }} />
                </Box>

                <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                    {selectedTab === 0 && (
                        <Box sx={{ padding: '10px' }} minHeight={imageAdjustedHeight} maxHeight={`calc(100% - ${tabBoxHeight}px)`}>
                            <Box border={'1px solid #eee'} marginBottom={'20px'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                                {renderProperty('Description', card.desc)}
                            </Box>
                            <Box border={'1px solid #eee'} padding={'10px'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2 }}>
                                {renderProperty('Type', card.type)}
                                {renderProperty('Frame Type', card.frameType)}
                                {card.atk !== undefined && renderProperty('ATK', card.atk)}
                                {card.def !== undefined && renderProperty('DEF', card.def)}
                                {card.level !== undefined && renderProperty('Level', card.level)}
                                {renderProperty('Race', card.race)}
                                {renderProperty('Attribute', card.attribute)}
                            </Box>
                        </Box>
                    )}

                    {selectedTab === 1 && (
                        <Box sx={{ padding: '10px' }} minHeight={imageAdjustedHeight}>
                            {card.card_sets.map((set, index) => (
                                <Box key={index} border={'1px solid #eee'} margin={'10px 0'}>
                                    <Typography variant="h6" component="div" sx={{ textAlign: 'center', my: 2 }}>
                                        {set.set_name}
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2, padding: '10px' }}>
                                        {renderProperty('Set Code', set.set_code)}
                                        {renderProperty('Rarity', set.set_rarity)}
                                        {renderProperty('Price', set.set_price)}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {selectedTab === 2 && (
                        <Box sx={{ padding: '10px' }} minHeight={imageAdjustedHeight}>
                            <Box border={'1px solid #eee'} padding={'10px'}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2 }}>
                                    {renderProperty('Cardmarket', card.card_prices[0]?.cardmarket_price)}
                                    {renderProperty('TCGPlayer', card.card_prices[0]?.tcgplayer_price)}
                                    {renderProperty('eBay', card.card_prices[0]?.ebay_price)}
                                    {renderProperty('Amazon', card.card_prices[0]?.amazon_price)}
                                    {renderProperty('CoolStuffInc', card.card_prices[0]?.coolstuffinc_price)}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Card>
        </Box>
    );
};

export default YugiohCardInfo;
