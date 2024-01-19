import React from 'react';
import { ThemeProvider, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import theme from './theme';
import Sidebar from './Sidebar';
import HomePage from './HomePage';
import TopBar from './TopBar';
import CardTypesPage from './CardTypes';
import PokemonCards from './PokemonCards';
import MTGCards from './MTGCards';
import BaseballCards from './BaseballCards';
import FootballCards from './FootballCards';
import YugiohCards from './YugiohCards';
import LorcanaCards from './LorcanaCards';
import BasketballCards from './BasketballCards';
import HockeyCards from './HockeyCards';
import Lists from './Lists';

const App: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    {/* <TopBar /> */}
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