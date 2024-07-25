import React from "react";
import { Button, IconButton, Modal, ModalBody, Image, Text, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure } from "@chakra-ui/react";
import { ViewIcon } from "@chakra-ui/icons";

const ProfileModal = ({ user, children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            {children ? (
                <span onClick={onOpen}>{children}</span>
            ) : (
                <IconButton
                    d={{ base: "flex" }}
                    icon={<ViewIcon />}
                    onClick={onOpen}
                />
            )}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent h='350px'>
                    <ModalHeader
                        fontSize="30px"
                        fontFamily="Work Sans"
                        d="flex"
                        justifyContent="center"
                    >
                        {user.name}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        minHeight="200px"
                    >
                        <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                            <Image
                                borderRadius="full"
                                boxSize="150px"
                                src={user.pic}
                                alt={null}
                                backgroundColor="#ddd"
                            />
                            {user.pic ? null : (
                                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                    {user.name}
                                </span>
                            )}
                        </div>

                        <Text>
                            Email: {user.email}
                        </Text>
                    </ModalBody>

                    <ModalFooter justifyContent="flex-end">
                        <Button colorScheme='blue' mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default ProfileModal;
