import React, { useState, useEffect } from "react";
import { ChatState } from "../context/ChatProvider";
import { useToast, Box, Button, Stack, Text, Flex } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import getSender from "../config/ChatLogics";
import GroupChatModal from "./Mislanious/GroupChatModel";
import StatusModal from "./Mislanious/Status";
import instance from "../config/config.js";
const MyChats = ({ fetchAgain }) => {
    const { user, setChats, chats, selectedChat, setSelectedChat } = ChatState();
    const toast = useToast();
    const [loggedUser, setLoggedUser] = useState();

    const fetchChats = async () => {
        try {
            if (!user || !user.token) {
                toast({
                    title: 'No user',
                    description: "Failed to load chats",
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                withCredentials: true, 
            };
            const { data } = await axios.get("https://chat-app-sever-theta.vercel.app/api/chat", config);
            setChats(data);
        } catch (err) {
            toast({
                title: 'Error Occurred Here',
                description: "Failed to load chats",
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
    }, [fetchAgain, setChats]);

    return (
        <Box
            display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
            flexDirection="column"
            padding="3px"
            width={{ base: "100vw", md: "100vw", lg: "31vw" }} // Full width on small devices, 31% width on larger devices
            height="100%" // Full screen height on small devices, auto height on larger devices
            bg="white"
            borderRadius="lg"
            borderWidth="2px"
        >
            <Box
                pb={3}
                px={3}
                fontSize={{ base: "28px", md: "30px" }}
                d="flex"
                w="100%"
                fontFamily="Work sans"
                justifyContent="space-between"
            >
                <Text fontWeight="bold">My Chats</Text>
                <Flex justifyContent="space-between">
                    <Flex>
                        <StatusModal>
                            <Button>status</Button>
                        </StatusModal>

                    </Flex>

                    <Flex>
                        <GroupChatModal>
                            <Button
                                d="flex"
                                fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                                rightIcon={<AddIcon />}
                                style={{ float: "right" }}
                            >
                                New Chat Group
                            </Button>
                        </GroupChatModal>
                    </Flex>
                </Flex>


            </Box>
            <Box
                d="flex"
                flexDir="column"
                p={3}
                bg="#f8f8f8"
                w="100%"
                h="calc(100vh - 112px)"
                borderRadius="lg"
                overflowY="auto"
            >
                {chats ? (
                    <Stack overflowY="auto">
                        {chats.map((chat) => (
                            <Box
                                key={chat._id}
                                onClick={() => setSelectedChat(chat)}
                                cursor="pointer"
                                bg={selectedChat && selectedChat._id === chat._id ? "#38B2AC" : "#E8E8E8"}
                                color={selectedChat && selectedChat._id === chat._id ? "white" : "black"}
                                py={2}
                                borderRadius="lg"
                                mb={2}

                            >
                                <Text>
                                    {!chat.isGroup
                                        ? getSender({ loggedUser, users: chat.users })
                                        : chat.chatName}
                                </Text>
                            </Box>
                        ))}
                    </Stack>
                ) : (
                    <ChatLoading />
                )}
            </Box>
        </Box>
    );
};

export default MyChats;
