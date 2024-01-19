import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';

const HomePage: React.FC = () => {
    return (
        <Container>
            <Box sx={{ textAlign: 'center', marginTop: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>
                    Welcome to Deck Directory
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Discover and Track the Value of Your Card Collection
                </Typography>

                <Typography paragraph>
                    Card Tracker is your go-to platform for identifying, valuing, and managing your card collection. Our tool allows you to easily scan your cards, get real-time market values, and manage your collection like a pro.
                </Typography>

                <Button variant="contained" color="primary" href="/register">
                    Create Your Account
                </Button>

                <Box sx={{ textAlign: 'left', marginTop: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Features
                    </Typography>
                    <ul>
                        <li>Card Identification: Upload a picture of your card and let our AI-powered tool do the rest.</li>
                        <li>Real-time Valuation: Get up-to-date market values for your cards.</li>
                        <li>Collection Management: Organize and track the value of your collection over time.</li>
                    </ul>
                </Box>
            </Box>
        </Container>
    );
};

export default HomePage;
