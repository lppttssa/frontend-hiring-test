import { ChangeEvent, useState } from 'react';

import { useMessage } from './hooks/useMessage.ts';

export const useChat = () => {
  const [newMessageText, setNewMessageText] = useState<string>('');

  const {
    messages,
    handleMessageSend,
    isMessagesLoading,
    isMessageSending,
  } = useMessage(newMessageText, setNewMessageText);

  const handleNewMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewMessageText(event.target.value);
  };

  return {
    handleNewMessageChange,
    messages,
    handleMessageSend,
    newMessageText,
    isMessagesLoading,
    isMessageSending,
  };
};