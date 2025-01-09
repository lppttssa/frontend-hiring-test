import { gql } from '@apollo/client';

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