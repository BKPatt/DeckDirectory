import * as React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';
import homeIcon from './assets/homeIcon.png';
import ListIcon from '@mui/icons-material/List';
import InfoIcon from '@mui/icons-material/Info';
import ChatIcon from '@mui/icons-material/Chat';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const drawerWidth = 240;

const Sidebar: React.FC = () => {
    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    <ListItemButton href="/" sx={{ justifyContent: 'center', marginBottom: 5 }}>
                        <ListItemIcon>
                            <img src={homeIcon} alt="Home" style={{ width: 200, height: 200 }} />
                        </ListItemIcon>
                    </ListItemButton>
                    <ListItemButton href="/lists">
                        <ListItemIcon>
                            <ListIcon />
                        </ListItemIcon>
                        <ListItemText primary="My Lists" />
                    </ListItemButton>
                    <ListItemButton href="/cards">
                        <ListItemIcon>
                            <InfoIcon />
                        </ListItemIcon>
                        <ListItemText primary="Card Type" />
                    </ListItemButton>
                    <ListItemButton>
                        <ListItemIcon>
                            <ChatIcon />
                        </ListItemIcon>
                        <ListItemText primary="Discord" />
                    </ListItemButton>
                    <ListItemButton href="/goPro">
                        <ListItemIcon>
                            <StarBorderIcon />
                        </ListItemIcon>
                        <ListItemText primary="Pro Membership" />
                    </ListItemButton>
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
