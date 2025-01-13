import { Dispatch, SetStateAction, useEffect } from 'react';

import { useMutation, useQuery } from '@apollo/client';

import { Message, MessageEdge, MessageSender, Mutation, Query } from '../../__generated__/resolvers-types.ts';

import {
  MESSAGE_ADDED_SUBSCRIPTION,
  MESSAGE_UPDATED_SUBSCRIPTION,
  MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION
} from '../chat.queries.ts';

export const useMessage = (
  textToSend: string,
  setTextToSend?: Dispatch<SetStateAction<string>>
) => {
  const { data, subscribeToMore, loading: isMessagesLoading } = useQuery<Query>(MESSAGES_QUERY, {
    variables: {
      first: 100,
    },
    fetchPolicy: 'cache-first',
  });

  const [sendMessage, { loading: isMessageSending }] = useMutation<Mutation>(SEND_MESSAGE_MUTATION, {
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

  const createNewMessageId = (newMessage: Message): string => {
    if (newMessage.sender === MessageSender.Admin) {
      return newMessage.id;
    }

    return newMessage.updatedAt;
  };

  const subscribeToMessageAdd = () => {
    return subscribeToMore({
      document: MESSAGE_ADDED_SUBSCRIPTION,
      updateQuery: (prev: Query, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newMessage: Message = subscriptionData.data.messageAdded;

        const isMessageRepeated: boolean = prev.messages.edges.some((message: MessageEdge) =>
          message.node.id === newMessage.id);

        if (isMessageRepeated) {
          return prev;
        }

        const newEndCursor: number = prev.messages.edges.length + 1;

        return {
          messages: {
            ...prev.messages,
            edges: [
              ...prev.messages.edges,
              {
                __typename: "MessageEdge",
                cursor: newEndCursor.toString(),
                node: { ...newMessage, id: createNewMessageId(newMessage) }
              }
            ],
            pageInfo: {
              ...prev.messages.pageInfo,
              endCursor: newEndCursor,
            }
          }
        };
      }
    });
  };

  const subscribeToMessageUpdate = () => {
    return subscribeToMore({
      document: MESSAGE_UPDATED_SUBSCRIPTION,
      updateQuery: (prev: Query, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const changedMessage: Message = subscriptionData.data.messageUpdated;

        const changedMessages = prev.messages.edges.map(message => {
          if (message.node.id === changedMessage.id) {
            return {
              ...message,
              node: { ...message.node, updatedAt: changedMessage.updatedAt, status: changedMessage.status }
            };
          }

          return message;
        });

        return {
          messages: {
            ...prev.messages,
            edges: [
              ...changedMessages,
            ],
          }
        };
      }
    });
  };

  useEffect(() => {
    const unsubscribeToMessageAdd = subscribeToMessageAdd();
    const unsubscribeToMessageUpdate = subscribeToMessageUpdate();

    return () => {
      unsubscribeToMessageAdd();
      unsubscribeToMessageUpdate();
    };
  }, [subscribeToMore]);

  return {
    messages,
    handleMessageSend,
    isMessagesLoading,
    isMessageSending,
  };
};