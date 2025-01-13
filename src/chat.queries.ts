import { gql, TypedDocumentNode } from '@apollo/client';

import { type Subscription } from '../__generated__/resolvers-types.ts';

const MESSAGE_FRAGMENT = gql`
  fragment MessageFragment on Message {
      id
      text
      status
      updatedAt
      sender
  }
`;

export const MESSAGES_QUERY = gql`
  ${MESSAGE_FRAGMENT}
  
  query Messages($first: Int, $after: MessagesCursor, $before: MessagesCursor) {
    messages(first: $first after: $after before: $before) {
      edges {
        node {
          ...MessageFragment
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage      
        startCursor
        endCursor
      }
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  ${MESSAGE_FRAGMENT}
  
  mutation SendMessage($text: String!) {
    sendMessage(text: $text) {
      ...MessageFragment
    }
  }
`;

export const MESSAGE_ADDED_SUBSCRIPTION: TypedDocumentNode<Subscription> = gql`
  ${MESSAGE_FRAGMENT}
  
  subscription OnMessageAdded {
    messageAdded {
      ...MessageFragment
    }
  }
`;

export const MESSAGE_UPDATED_SUBSCRIPTION: TypedDocumentNode<Subscription> = gql`
  ${MESSAGE_FRAGMENT}
  
  subscription OnMessageUpdated {
    messageUpdated {
      ...MessageFragment
    }
  }
`;
