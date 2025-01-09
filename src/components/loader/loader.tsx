import { FC } from 'react';

import cn, { ClassValue } from 'clsx';

import styles from './loader.module.css';

import { LoaderType } from './loader.types.ts';

interface LoaderProps {
  type?: LoaderType;
  className?: ClassValue;
}

export const Loader: FC<LoaderProps> = ({ className, type = LoaderType.Content }) => {
  const printLoader = () => {
    const loaderElement = <div className={cn(styles.loader, className)} />;

    if (type === LoaderType.Cover) {
      return (
        <div className={styles.loaderContainer}>
          {loaderElement}
        </div>
      );
    }

    return loaderElement;
  };

  return printLoader();
};