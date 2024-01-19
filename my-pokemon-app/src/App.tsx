import React from 'react';
import { ThemeProvider, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Sidebar from './Sidebar';
import HomePage from './HomePage';
import CardTypesPage from './Types/CardTypes';
import PokemonCards from './Cards/Pokemon/PokemonCards';
import MTGCards from './Cards/MTG/MTGCards';
import BaseballCards from './Cards/BaseballCards';
import FootballCards from './Cards/FootballCards';
import YugiohCards from './Cards/Yugioh/YugiohCards';
import LorcanaCards from './Cards/Lorcana/LorcanaCards';
import BasketballCards from './Cards/BasketballCards';
import HockeyCards from './Cards/HockeyCards';
import Lists from './Lists';

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Box sx={{ display: 'flex', flexGrow: 1, bgcolor: '#333333', color: 'text.primary' }}>
                        <Sidebar />
                        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/cards" element={<CardTypesPage />} />
                                <Route path="/cards/pokemon" element={<PokemonCards />} />
                                <Route path="/cards/mtg" element={<MTGCards />} />
                                <Route path="/cards/yu-gi-oh!" element={<YugiohCards />} />
                                <Route path="/cards/lorcana" element={<LorcanaCards />} />
                                <Route path="/cards/baseball" element={<BaseballCards />} />
                                <Route path="/cards/football" element={<FootballCards />} />
                                <Route path="/cards/basketball" element={<BasketballCards />} />
                                <Route path="/cards/hockey" element={<HockeyCards />} />
                                <Route path="/lists" element={<Lists />} />
                            </Routes>
                        </Box>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
};

export default App;