
import { useState, useCallback } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
}

export const useLoadingState = (initialState: boolean = false) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialState,
    error: null,
    progress: undefined
  });

  const startLoading = useCallback((progress?: number) => {
    setState({
      isLoading: true,
      error: null,
      progress
    });
  }, []);

  const stopLoading = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      progress: undefined
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState({
      isLoading: false,
      error,
      progress: undefined
    });
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress
    }));
  }, []);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    setProgress
  };
};
