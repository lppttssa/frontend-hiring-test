import { Dispatch, SetStateAction } from 'react';

import { useMutation, useQuery } from '@apollo/client';

import { MessageEdge } from '../../__generated__/resolvers-types.ts';

import { MESSAGES_QUERY, SEND_MESSAGE_MUTATION } from '../chat.queries.ts';

export const useMessage = (
  textToSend: string,
  setTextToSend?: Dispatch<SetStateAction<string>>
) => {
  const { data, loading: isMessagesLoading } = useQuery(MESSAGES_QUERY);
  const [sendMessage, {loading: isMessageSending}] = useMutation(SEND_MESSAGE_MUTATION, {
    onError: (error) => {
      console.error('Error while sending message', error);
    }
  });

  const messages: MessageEdge[] = data?.messages.edges || [];

  const handleMessageSend = async () => {
    await sendMessage({ variables: { text: textToSend } });

    if (setTextToSend) {
      setTextToSend('');
    }
  };

  return {
    messages,
    handleMessageSend,
    isMessagesLoading,
    isMessageSending,
  };
};