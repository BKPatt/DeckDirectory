import { ReactNode, createContext, useContext, useState } from "react";
import Card from "./Card";
import CardType from "./CardType";

export type CardList = {
    cardCount: number;
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

    return (
        <ListContext.Provider value={{ listData, updateListData }}>
            {children}
        </ListContext.Provider>
    );
};

