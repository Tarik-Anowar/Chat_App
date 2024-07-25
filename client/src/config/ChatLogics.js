const getSender = ({ loggedUser, users }) => {
    if (!users || users.length < 2) {
        return "Unknown Sender";
    }

    const [firstUser, secondUser] = users;

    if (!firstUser || !secondUser) {
        return "Unknown Sender";
    }

    if (firstUser._id === loggedUser?._id) {
        return secondUser.name;
    } else {
        return firstUser.name;
    }
};

export const isSameSender = (message, m, i, userId) => {
    return (
        i < message.length - 1 &&
        (message[i + 1].sender._id !== m.sender._id ||
            message[i + 1].sender._id === undefined) &&
        message[i].sender._id !== userId
    );
};

export const isLastMessage = (message, i, userId) => {
    return (
        i === message.length - 1 &&
        message[i].sender._id !== userId &&
        message[i].sender._id
    );
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  
    if (
      i < messages.length - 1 &&
      messages[i + 1].sender._id === m.sender._id &&
      messages[i].sender._id !== userId
    )
      return 33;
    else if (
      (i < messages.length - 1 &&
        messages[i + 1].sender._id !== m.sender._id &&
        messages[i].sender._id !== userId) ||
      (i === messages.length - 1 && messages[i].sender._id !== userId)
    )
      return 0;
    else return "auto";
  };


  export const isSameUser = (messages, m, i) => {
    return i > 0 && messages[i - 1].sender._id === m.sender._id;
  };


export default getSender;