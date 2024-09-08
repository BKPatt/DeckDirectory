import { ReactNode, createContext, useState, useCallback } from "react";
import Card from "./Card";
import CardType from "./CardType";
import axios from "axios";

// Define the structure of a CardList
export type CardList = {
    id: string;
    created_by: string;
    created_on: string;
    name: string;
    type: CardType;
    cards: Card[];
    market_value: number;
    collection_value: number;
    collected_quantities: { [key: string]: number };
};

// Define the shape of the context
export interface ListContextType {
    listData: CardList[];
    updateListData: (newData: CardList[]) => void;
    updateListInDatabase: (listId: string, updatedList: CardList) => Promise<void>;
    fetchUpdatedListDetails: (listId: string | undefined) => Promise<void>;
}

// Create the context
export const ListContext = createContext<ListContextType | undefined>(undefined);

// Custom hook for managing list data and operations
export const useList = () => {
    const [listData, setListData] = useState<CardList[]>([]);

    const updateListData = useCallback((newData: CardList[]) => {
        setListData(newData);
    }, []);

    const updateListInDatabase = useCallback(
        async (listId: string, updatedList: CardList): Promise<void> => {
            try {
                await axios.post(`http://localhost:8000/api/card-lists/update/${listId}/`, updatedList);
                updateListData(listData.map(list => list.id === listId ? updatedList : list));
            } catch (error) {
                console.error('Error updating list in database', error);
                throw error;
            }
        },
        [listData, updateListData]
    );

    const fetchUpdatedListDetails = useCallback(
        async (listId: string | undefined): Promise<void> => {
            if (!listId) return;
            try {
                const response = await axios.get(`http://localhost:8000/api/get-list-by-id/${listId}/`);
                if (response.data && response.data.card_list) {
                    const updatedList = response.data.card_list as CardList;
                    const listCards = response.data.list_cards;

                    // Calculate collection value
                    const collectionValue = listCards.reduce((total: number, listCard: { market_value: number; collected: boolean; }) => {
                        if (listCard.collected) {
                            return total + listCard.market_value;
                        }
                        return total;
                    }, 0);

                    // Calculate collected quantities
                    const newCollectedQuantities: { [key: string]: number } = {};
                    listCards.forEach((listCard: { card_id: string; collected: boolean; }) => {
                        const cardId = listCard.card_id;
                        if (cardId && listCard.collected) {
                            newCollectedQuantities[cardId] = (newCollectedQuantities[cardId] || 0) + 1;
                        }
                    });

                    // Update list data with new information
                    const newListData = listData.map((list) =>
                        list.id === listId ? { ...updatedList, collection_value: collectionValue, collected_quantities: newCollectedQuantities } : list
                    );
                    updateListData(newListData);
                }
            } catch (error) {
                console.error('Error fetching updated list details:', error);
            }
        },
        [listData, updateListData]
    );

    return { listData, updateListData, updateListInDatabase, fetchUpdatedListDetails };
};

// Props interface for the ListProvider component
interface ListProviderProps {
    children: ReactNode;
}

// ListProvider component to wrap the application and provide the ListContext
export const ListProvider: React.FC<ListProviderProps> = ({ children }) => {
    const contextValue = useList();
    return (
        <ListContext.Provider value={contextValue}>
            {children}
        </ListContext.Provider>
    );
};