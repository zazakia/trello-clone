import { createContext } from 'react';
import type { BoardContextType } from './BoardContext.types';

export const BoardContext = createContext<BoardContextType | null>(null);