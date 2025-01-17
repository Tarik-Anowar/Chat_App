import React ,{ createContext, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [selectedChat,setSelectedChat] = useState();
    const [chats,setChats] = useState([]);
    const history = useHistory();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (userInfo) {
            setUser(userInfo);
        } else {
            history.push('/');
        }
    }, [history]);

    return (
        <ChatContext.Provider value={{ user, setUser,selectedChat,setSelectedChat,chats,setChats}}>
            {children}
        </ChatContext.Provider>
    );
};

export const ChatState = () => {
    return useContext(ChatContext);
};

export default ChatProvider;
