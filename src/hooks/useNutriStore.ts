import { useState, useEffect } from 'react';
import { store } from '../services/store';

export function useNutriStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  return store;
}
