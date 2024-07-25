import React from "react";
import { Box } from '@chakra-ui/react';
import { CloseIcon } from "@chakra-ui/icons";

const UserBadgeItem = ({ user, handleFunction }) => {
    return (
        <Box
            px={2}
            py={1}
            m={1}
            variant="solid"
            fontSize={12}
            backgroundColor="rgba(34, 34, 34, 0.8)"            color="white"
            cursor="pointer"
            borderRadius="12px"
            onClick={handleFunction}
            display="flex"
            alignItems="center"
        >
            <span style={{ marginRight: '2px' }}>{user.name}</span>
            <CloseIcon ml={1}/>
        </Box>
    );
};

export default UserBadgeItem;
