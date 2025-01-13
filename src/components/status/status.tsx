import { FC } from 'react';

import cn from "clsx";

import css from "./status.module.css";

import { MessageStatus } from '../../../__generated__/resolvers-types.ts';

interface StatusProps {
  variant?: MessageStatus;
}

export const Status: FC<StatusProps> = ({ variant = MessageStatus.Sent }) => {
  const printStatus = () => {
    let status: string = '✓';

    if (variant === MessageStatus.Read) {
      status = status.repeat(2);
    }

    if (variant === MessageStatus.Sending) {
      status = '🕐';
    }

    return <span className={cn(css.status, {
      [css.statusHighlighted]: variant === MessageStatus.Read,
    })}>
      {status}
    </span>;
  };

  return printStatus();
};