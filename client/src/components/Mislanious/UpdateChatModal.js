import React, { useState } from "react";
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import { ChatState } from "../../context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadge";
import axios from "axios";
import UserListItem from "../UserAvatar/UserListItem";
const UpdateChatModal = ({ fetchAgain, setFetchAgain,fetchMessages,setFetchMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const toast = useToast();
    const { user, selectedChat, setSelectedChat } = ChatState()


    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
            toast({
                title: "Only admins can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(`/api/chat/groupremove`, {
                chatId: selectedChat._id,
                userId: user1._id,
            }, config);
            // user1._id===user._id?setSelectedChat():selectedChat(data);
            setSelectedChat(data);
            fetchMessages();
            setLoading(false);
            setFetchAgain(!fetchAgain);
            toast({
                title: "Successfully removed user",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            })
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
              });
              setLoading(false);
            }
            setGroupChatName("");
    }

    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put('/api/chat/rename',
                {
                    chatId: selectedChat._id,
                    chatName: groupChatName,

                }, config
            );
            setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
            setGroupChatName("");
            toast({
                title: "Renamed Successfully",
                status: "success",
                duration: "5000",
                isClosable: true,
                position: "bottom"
            });
        } catch (error) {
            toast({
                title: "Error Renaming group",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: "bottom"
            });
            setRenameLoading(false);

        }
    }

    const handleSearch = async (query) => {
        if (!query) {
            return;
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.get(`api/user?search=${query}`, config);
            console.log(data);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load the Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            setLoading(false);
        }
    }

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User Already in group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(`/api/chat/groupadd`,
                {
                    chatId: selectedChat._id,
                    userId: user1._id,
                }, config
            );

            setSelectedChat(data);
            setLoading(false);
            setFetchAgain(!fetchAgain);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            setLoading(false);
        }
        setGroupChatName("");
    }


    return (
        <div>
            <IconButton d={{ base: "flex" }} onClick={onOpen}>Open Modal</IconButton>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        All Users:-
                    </ModalBody>

                    <Box
                        display="flex"
                        flexWrap="wrap"
                        justifyContent="flex-start"
                    >
                        {selectedChat.users
                            .filter(u => u._id !== user._id)
                            .map(u => (
                                <UserBadgeItem
                                    key={u._id}
                                    user={u}
                                    handleFunction={() => handleRemove(u)}
                                />
                            ))
                        }
                    </Box>

                    <FormControl d="flex" flexWrap="wrap" p="1" >
                        <Input
                            borderColor="black"
                            placeholder="Enter new Group Name"
                            value={groupChatName}
                            onChange={(e) => setGroupChatName(e.target.value)}
                        />
                    </FormControl>
                    <Button
                        d="flex"
                        variant="solid"
                        colorScheme="teal"
                        m={1}
                        mt={2}
                        isLoading={renameLoading}
                        onClick={handleRename}
                    >
                        Update
                    </Button>
                    <FormControl d="flex" flexWrap="wrap" p="1" >
                        <Input
                            borderColor="black"
                            placeholder="Enter User Name"
                            value={groupChatName}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </FormControl>

                    {loading ? (
                        <Spinner size="lg" />
                    ) : (
                        searchResult?.map((user) => (
                            <UserListItem
                                key={user._id}
                                user={user}
                                handleFunction={() => handleAddUser(user)}
                            />
                        ))
                    )}
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant='ghost'>Secondary Action</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}

export default UpdateChatModal;