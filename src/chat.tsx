import React from "react";

import cn from "clsx";
import { ItemContent, Virtuoso } from "react-virtuoso";

import { useChat } from './chat.hooks.ts';

import { Loader } from './components/loader/loader.tsx';
import { Status } from './components/status/status.tsx';

import css from "./chat.module.css";

import { LoadDirection, type Message, MessageSender, } from "../__generated__/resolvers-types";
import { LoaderType } from './components/loader/loader.types.ts';

const Item: React.FC<Message> = ({ text, sender, status }) => {
  return (
    <div className={css.item}>
      <div
        className={cn(
          css.message,
          sender === MessageSender.Admin ? css.out : css.in
        )}
      >
        {text}

        <div className={css.status}>
          <Status variant={status} />
        </div>
      </div>
    </div>
  );
};

const getItem: ItemContent<Message, unknown> = (_, data) => {
  return <Item {...data} />;
};

export const Chat: React.FC = () => {
  const {
    messages,
    handleMessageSend,
    handleNewMessageChange,
    newMessageText,
    isMessagesLoading,
    isMessageSending,
    handleLoadMore,
  } = useChat();

  return (
    <div className={css.root}>
      <div className={css.container}>
        <Virtuoso
          className={css.list}
          data={messages.map(message => message.node) as Message[]}
          itemContent={getItem}
          startReached={() => handleLoadMore(LoadDirection.Before)}
          endReached={() => handleLoadMore(LoadDirection.After)}
        />
      </div>
      <div className={css.footer}>
        <input
          type="text"
          className={css.textInput}
          placeholder="Message text"
          value={newMessageText}
          onChange={handleNewMessageChange}
        />
        <button onClick={handleMessageSend} className={css.button} disabled={isMessageSending}>
          {isMessageSending ? <Loader className={css.buttonLoader} /> : 'Send'}
        </button>
      </div>

      {isMessagesLoading && <Loader type={LoaderType.Cover} />}
    </div>
  );
};
