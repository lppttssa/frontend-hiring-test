import { ChangeEvent, useState } from 'react';

import { useMessage } from './hooks/useMessage.ts';

export const useChat = () => {
  const MESSAGES_PER_PAGE = 10;

  const [newMessageText, setNewMessageText] = useState<string>('');

  const {
    messages,
    handleMessageSend,
    isMessagesLoading,
    isMessageSending,
    pageInfo,
    handleLoadMore,
  } = useMessage(newMessageText, handleTextClear, MESSAGES_PER_PAGE);

  const handleNewMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewMessageText(event.target.value);
  };

  function handleTextClear() {
    setNewMessageText('');
  }

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