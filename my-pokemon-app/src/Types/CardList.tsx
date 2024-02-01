import { ReactNode, createContext, useState, useCallback } from "react";
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

export interface ListContextType {
    listData: CardList[];
    updateListData: (newData: CardList[]) => void;
    updateListInDatabase: (listId: string, updatedList: CardList) => Promise<void>;
    fetchUpdatedListDetails: (listId: string) => Promise<void>;
}

export const ListContext = createContext<ListContextType | undefined>(undefined);

export const useList = () => {
    const [listData, setListData] = useState<CardList[]>([]);

    const updateListData = useCallback((newData: CardList[]) => {
        setListData(newData);
    }, []);

    const updateListInDatabase = useCallback(async (listId: string, updatedList: CardList): Promise<void> => {
        try {
            await axios.post(`http://localhost:8000/api/card-lists/update/${listId}/`, updatedList);
            updateListData(listData.map(list => list.id === listId ? updatedList : list));
        } catch (error) {
            console.error('Error updating list in database', error);
            throw error;
        }
    }, [listData, updateListData]);

    const fetchUpdatedListDetails = useCallback(async (listId: string): Promise<void> => {
        try {
            const response = await axios.get(`http://localhost:8000/api/get-list-by-id/${listId}/`);
            if (response.data && response.data.card_list) {
                const updatedList = response.data.card_list as CardList;
                const newListData = listData.map((list) =>
                    list.id === listId ? updatedList : list
                );
                updateListData(newListData);
            }
        } catch (error) {
            console.error('Error fetching updated list details:', error);
        }
    }, [listData, updateListData]);

    return {
        listData,
        updateListData,
        updateListInDatabase,
        fetchUpdatedListDetails
    };
};

interface ListProviderProps {
    children: ReactNode;
}

export const ListProvider: React.FC<ListProviderProps> = ({ children }) => {
    const contextValue = useList();
    return (
        <ListContext.Provider value={contextValue}>
            {children}
        </ListContext.Provider>
    );
};
