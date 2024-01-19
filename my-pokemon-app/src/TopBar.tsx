import React from 'react';
import { AppBar, Toolbar, Typography, Button, InputBase, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // Vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const drawerWidth = 300;

const TopBar: React.FC = () => {
    return (
      <AppBar position="static">
        <Toolbar sx={{ 
            justifyContent: 'space-between', 
            paddingX: { sm: `${drawerWidth}px` },
            height: '128px'
        }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, width: `${drawerWidth}px` }} />
  
          <Search sx={{ position: 'absolute', display: { scale: '150%' }, left: { sm: `${drawerWidth}px` }, zIndex: 1 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search Card by name..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
  
          <Typography variant="h4" noWrap sx={{ flexGrow: 1, textAlign: 'center' }}>
            Deck Directory
          </Typography>
  
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', scale: '150%', position: 'absolute', right: 500 }}>
          <Button color="inherit" href="/login" sx={{ marginLeft: 'auto' }}>Login</Button>
          <Button variant="outlined" href="/register" color="inherit" sx={{ marginLeft: 1 }}>Create Account</Button>
        </Box>
        </Toolbar>
      </AppBar>
    );
  };
  
  export default TopBar;
