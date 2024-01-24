import { ReactNode, createContext, useContext, useState } from "react";
import Card from "./Card";
import CardType from "./CardType";
import axios from "axios";

export type CardList = {
    id: string;
    created_by: string;
    created_on: string;
    name: string;
    type: CardType;
    cards: Card[];
    market_value: number;
};

interface ListContextType {
    listData: CardList[];
    updateListData: (newData: CardList[]) => void;
    updateListInDatabase: (listId: string, updatedList: CardList) => Promise<void>;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export const useList = () => {
    const context = useContext(ListContext);
    if (!context) {
        throw new Error('useList must be used within a ListProvider');
    }
    return context;
};

interface ListProviderProps {
    children: ReactNode;
}

export const ListProvider: React.FC<ListProviderProps> = ({ children }) => {
    const [listData, setListData] = useState<CardList[]>([]);

    const updateListData = (newData: CardList[]) => {
        setListData(newData);
    };

    const updateListInDatabase = async (listId: string, updatedList: CardList): Promise<void> => {
        try {
            await axios.post(`http://localhost:8000/api/card-lists/update/${listId}/`, updatedList);
            updateListData(listData.map(list => list.id === listId ? updatedList : list));
        } catch (error) {
            console.error('Error updating list in database', error);
            throw error;
        }
    };


    return (
        <ListContext.Provider value={{ listData, updateListData, updateListInDatabase }}>
            {children}
        </ListContext.Provider>
    );
};