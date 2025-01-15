import { ChangeEvent, useState } from 'react';

import { useMessage } from './hooks/useMessage.ts';

export const useChat = () => {
  const MESSAGES_PER_PAGE = 10;

  const [newMessageText, setNewMessageText] = useState<string>('');

  const {
    messages,
    handleMessageSend: sendMessage,
    isMessagesLoading,
    isMessageSending,
    pageInfo,
    handleLoadMore,
  } = useMessage(MESSAGES_PER_PAGE);

  const handleMessageSend = async () => {
    await sendMessage(newMessageText);

    setNewMessageText('');
  };

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
    pageInfo,
    handleLoadMore,
  };
};