import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, useDisclosure, useToast, FormControl, Input, Box } from '@chakra-ui/react';
import { ChatState } from '../../context/ChatProvider';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';
import UserBadgeItem from '../UserAvatar/UserBadge';

const GroupChatModal = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState();

    const toast = useToast();

    const { user, chats, setChats } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };
            const { data } = await axios.get(`https://chat-app-sever-theta.vercel.app/api/user?search=${search}`, config);
            console.log("data " + data);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured",
                description: "Failed to Load Chat",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: 'bottom'
            })
        }


    };

    const handleSubmit = async () => {
        if (!groupChatName || selectedUsers.length <= 2) {
            toast({
                title: "Please Fill All The Fields",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            return;
        }
    
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
            };
            const { data } = await axios.post('https://chat-app-sever-theta.vercel.app/api/chat/group', {
                name: groupChatName,
                users: JSON.stringify(selectedUsers.map(u => u._id)),
            }, config);
            setChats([data, ...chats]);
            onClose(); 
            toast({
                title: "New Group Chat Created",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
        } catch (error) {
            toast({
                title: "Error Occurred",
                description: "Failed to Create Group Chat",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            });
            setLoading(false);
        }
    };
    

    const handleGroup = (user) => {
        const isUserSelected = selectedUsers.some(selUser => selUser._id === user._id);
        if (isUserSelected) {
            toast({
                title: "User already added",
                status: "error",
                duration: "5000",
                isClosable: true,
                position: 'bottom'
            });
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleDelete = (user) => {
        setSelectedUsers(selectedUsers.filter(sel => sel._id !== user._id));
    }

    return (
        <div>
            <span onClick={onOpen}>{children}</span>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="35px" d="flex" justifyContent="center">
                        Create Group-Chat
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody d="flex" flexDir="column" alignItems="center">
                        <FormControl>
                            <Input
                                mb="5px"
                                placeholder='Chat Name'
                                value={groupChatName}
                                borderColor="black"
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <Input
                                mb="5px"
                                placeholder='Add Users'
                                borderColor="black"
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        <Box
                            display="flex"
                            flexWrap="wrap"
                            justifyContent="flex-start" 
                        >
                            {selectedUsers.map(u => (
                                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
                            ))}
                        </Box>

                        {loading ? <div>loading</div> : (
                            searchResult?.slice(0, 4).map(user => (
                                <UserListItem key={user._id} user={user} handleFunction={() => handleGroup(user)} />
                            ))
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
                            Done
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}

export default GroupChatModal;