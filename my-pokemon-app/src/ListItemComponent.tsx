import React from 'react';
import { Button } from '@mui/material';
import CardList from './CardList';

interface ListItemComponentProps {
    list: CardList;
}

const ListItemComponent: React.FC<ListItemComponentProps> = ({ list }) => {
    return (
        <Button>
            {list.name}
        </Button>
    );
};


export default ListItemComponent;
