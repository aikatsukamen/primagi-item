import React from 'react';

export const categoryToTxt = (category: number) => {
  switch (category) {
    case 1:
      return 'トップス';
    case 2:
      return 'ワンピ';
    case 3:
      return 'ボトムス';
    case 4:
      return 'シューズ';
    case 5:
      return 'アクセ';
    default:
      return '-';
  }
};

export function useDelayedEffect(effect: React.EffectCallback, deps: React.DependencyList, timeout = 1000) {
  React.useEffect(() => {
    const timeoutId = setTimeout(effect, timeout);

    return () => clearTimeout(timeoutId);
  }, deps);
}
