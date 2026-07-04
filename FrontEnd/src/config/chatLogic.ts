export const isSameSenderMargin = (messages: any[], m: any, i: number, userId: string) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 0;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameSender = (messages: any[], m: any, i: number, userId: string) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages: any[], i: number, userId: string) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameUser = (messages: any[], m: any, i: number) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

export const getSender = (loggedUser: any, users: any[]) => {
  if (!users || users.length < 2) return "Unknown";
  return users[0]._id === loggedUser.id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser: any, users: any[]) => {
  if (!users || users.length < 2) return null;
  return users[0]._id === loggedUser.id ? users[1] : users[0];
};
