import { useEffect } from 'react';

import { useMutation, useQuery } from '@apollo/client';

import {
  LoadDirection,
  type Message,
  type MessageEdge,
  type Mutation,
  type Query
} from '../../__generated__/resolvers-types.ts';

import {
  MESSAGE_ADDED_SUBSCRIPTION,
  MESSAGE_UPDATED_SUBSCRIPTION,
  MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION
} from '../chat.queries.ts';

export const useMessage = (
  textToSend: string,
  handleTextClear?: () => void,
  messagesToLoad = 10
) => {
  const { data, subscribeToMore, loading: isMessagesLoading, fetchMore } = useQuery<Query>(MESSAGES_QUERY, {
    variables: {
      first: messagesToLoad,
    },
    fetchPolicy: 'cache-first',
  });

  const [sendMessage, { loading: isMessageSending }] = useMutation<Mutation>(SEND_MESSAGE_MUTATION, {
    onError: (error) => {
      console.error('Error while sending message', error);
    }
  });

  const messages: MessageEdge[] = data?.messages.edges || [];
  const pageInfo = data?.messages.pageInfo;

  const handleMessageSend = async () => {
    await sendMessage({ variables: { text: textToSend } });

    if (handleTextClear) {
      handleTextClear();
    }
  };

  const handleLoadMore = (direction: LoadDirection) => {
    const isBefore = direction === LoadDirection.Before;
    const hasMore = isBefore ? pageInfo?.hasPreviousPage : pageInfo?.hasNextPage;

    if (!hasMore) {
      return;
    }

    const cursor = isBefore ? pageInfo?.startCursor : pageInfo?.endCursor;

    fetchMore({
      variables: {
        first: messagesToLoad,
        [isBefore ? LoadDirection.Before : LoadDirection.After]: cursor,
      },
      updateQuery(prev, { fetchMoreResult }) {
        return {
          messages: {
            edges: isBefore
              ? [...fetchMoreResult.messages.edges, ...prev.messages.edges]
              : [...prev.messages.edges, ...fetchMoreResult.messages.edges],
            pageInfo: { ...fetchMoreResult.messages.pageInfo },
          }
        };
      }
    });
  };

  const subscribeToMessageAdd = () => {
    return subscribeToMore({
      document: MESSAGE_ADDED_SUBSCRIPTION,
      updateQuery: (prev: Query, { subscriptionData }) => {
        if (!subscriptionData.data || prev.messages.pageInfo.hasNextPage) {
          return prev;
        }

        const newMessage: Message = subscriptionData.data.messageAdded;

        const isMessageRepeated: boolean = prev.messages.edges.some((message: MessageEdge) =>
          message.node.id === newMessage.id);

        if (isMessageRepeated) {
          return prev;
        }

        return {
          messages: {
            ...prev.messages,
            edges: [
              ...prev.messages.edges,
              { __typename: "MessageEdge", cursor: newMessage.id, node: { ...newMessage } }
            ],
            pageInfo: {
              ...prev.messages.pageInfo,
              endCursor: newMessage.id,
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
  }, []);

  return {
    messages,
    handleMessageSend,
    isMessagesLoading,
    isMessageSending,
    pageInfo: data?.messages.pageInfo,
    handleLoadMore,
  };
};