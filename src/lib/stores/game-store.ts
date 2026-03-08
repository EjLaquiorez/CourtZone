// Game store using Zustand
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Game, GameWithDetails, GameFilters } from '@/types';
import { gamesService } from '@/lib/api';

interface LiveGameState {
  gameId: string;
  hostScore: number;
  opponentScore: number;
  timeRemaining: number;
  quarter: number;
  status: 'in_progress' | 'halftime' | 'completed';
  lastUpdate: Date;
}

interface GameState {
  // Current game data
  games: GameWithDetails[];
  currentGame: GameWithDetails | null;
  liveGames: Map<string, LiveGameState>;
  
  // Filters and pagination
  filters: GameFilters;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  
  // Quick match state
  isSearchingQuickMatch: boolean;
  quickMatchPreferences: {
    maxDistance: number;
    skillLevelRange: [number, number];
    gameType: string[];
  };

  // Actions
  setGames: (games: GameWithDetails[]) => void;
  addGame: (game: GameWithDetails) => void;
  updateGame: (gameId: string, updates: Partial<GameWithDetails>) => void;
  removeGame: (gameId: string) => void;
  setCurrentGame: (game: GameWithDetails | null) => void;
  setFilters: (filters: Partial<GameFilters>) => void;
  setCurrentPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Live game actions
  updateLiveGame: (gameId: string, update: Partial<LiveGameState>) => void;
  removeLiveGame: (gameId: string) => void;
  
  // Quick match actions
  startQuickMatch: (preferences?: Partial<typeof this.quickMatchPreferences>) => Promise<void>;
  stopQuickMatch: () => void;
  setQuickMatchPreferences: (preferences: Partial<typeof this.quickMatchPreferences>) => void;
  
  // Game actions
  joinGame: (gameId: string, teamId: string) => Promise<void>;
  leaveGame: (gameId: string) => Promise<void>;
  createGame: (gameData: any) => Promise<GameWithDetails>;
  
  // Utility actions
  refreshGames: () => Promise<void>;
  loadMoreGames: () => Promise<void>;
  clearGames: () => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    games: [],
    currentGame: null,
    liveGames: new Map(),
    filters: {},
    currentPage: 1,
    totalPages: 1,
    isLoading: false,
    error: null,
    isSearchingQuickMatch: false,
    quickMatchPreferences: {
      maxDistance: 10,
      skillLevelRange: [1, 10],
      gameType: ['casual', 'competitive'],
    },

    // Basic setters
    setGames: (games) => set({ games }),
    
    addGame: (game) => set((state) => ({
      games: [game, ...state.games],
    })),
    
    updateGame: (gameId, updates) => set((state) => ({
      games: state.games.map(game => 
        game.id === gameId ? { ...game, ...updates } : game
      ),
      currentGame: state.currentGame?.id === gameId 
        ? { ...state.currentGame, ...updates }
        : state.currentGame,
    })),
    
    removeGame: (gameId) => set((state) => ({
      games: state.games.filter(game => game.id !== gameId),
      currentGame: state.currentGame?.id === gameId ? null : state.currentGame,
    })),
    
    setCurrentGame: (game) => set({ currentGame: game }),
    
    setFilters: (filters) => set((state) => ({
      filters: { ...state.filters, ...filters },
      currentPage: 1, // Reset to first page when filters change
    })),
    
    setCurrentPage: (page) => set({ currentPage: page }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Live game actions
    updateLiveGame: (gameId, update) => set((state) => {
      const newLiveGames = new Map(state.liveGames);
      const existing = newLiveGames.get(gameId);
      newLiveGames.set(gameId, { 
        ...existing, 
        ...update,
        gameId,
        lastUpdate: new Date(),
      } as LiveGameState);
      return { liveGames: newLiveGames };
    }),
    
    removeLiveGame: (gameId) => set((state) => {
      const newLiveGames = new Map(state.liveGames);
      newLiveGames.delete(gameId);
      return { liveGames: newLiveGames };
    }),

    // Quick match actions
    startQuickMatch: async (preferences) => {
      const { setQuickMatchPreferences, quickMatchPreferences } = get();
      
      if (preferences) {
        setQuickMatchPreferences(preferences);
      }
      
      set({ isSearchingQuickMatch: true, error: null });
      
      try {
        // Get user location (mock for now)
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const { latitude, longitude } = position.coords;
        const currentPrefs = get().quickMatchPreferences;
        
        // Search for nearby games
        const response = await gamesService.getNearbyGames(
          latitude,
          longitude,
          currentPrefs.maxDistance,
          {
            gameType: currentPrefs.gameType[0] as any,
            skillRange: currentPrefs.skillLevelRange,
            status: 'open',
          }
        );
        
        if (response.success && response.data.length > 0) {
          // Found games, update store
          set({ games: response.data, isSearchingQuickMatch: false });
        } else {
          // No games found
          set({ 
            error: 'No games found matching your preferences. Try adjusting your filters.',
            isSearchingQuickMatch: false 
          });
        }
      } catch (error: any) {
        set({ 
          error: error.message || 'Failed to find quick match',
          isSearchingQuickMatch: false 
        });
      }
    },
    
    stopQuickMatch: () => set({ isSearchingQuickMatch: false }),
    
    setQuickMatchPreferences: (preferences) => set((state) => ({
      quickMatchPreferences: { ...state.quickMatchPreferences, ...preferences },
    })),

    // Game actions
    joinGame: async (gameId, teamId) => {
      const { updateGame, setError } = get();
      
      try {
        setError(null);
        const response = await gamesService.joinGame(gameId, teamId);
        
        if (response.success && response.data) {
          updateGame(gameId, response.data);
        }
      } catch (error: any) {
        setError(error.message || 'Failed to join game');
        throw error;
      }
    },
    
    leaveGame: async (gameId) => {
      const { updateGame, setError } = get();
      
      try {
        setError(null);
        await gamesService.leaveGame(gameId);
        
        // Update game to remove current user's team
        updateGame(gameId, { opponentTeamId: undefined });
      } catch (error: any) {
        setError(error.message || 'Failed to leave game');
        throw error;
      }
    },
    
    createGame: async (gameData) => {
      const { addGame, setError } = get();
      
      try {
        setError(null);
        const response = await gamesService.createGame(gameData);
        
        if (response.success && response.data) {
          // Get full game details
          const gameResponse = await gamesService.getGameById(response.data.id);
          if (gameResponse.success && gameResponse.data) {
            addGame(gameResponse.data);
            return gameResponse.data;
          }
        }
        
        throw new Error('Failed to create game');
      } catch (error: any) {
        setError(error.message || 'Failed to create game');
        throw error;
      }
    },

    // Utility actions
    refreshGames: async () => {
      const { filters, setLoading, setGames, setError } = get();
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await gamesService.getGames(filters, 1, 20);
        
        if (response.success && response.data) {
          setGames(response.data.data);
          set({ 
            currentPage: 1,
            totalPages: response.data.pagination.totalPages,
          });
        }
      } catch (error: any) {
        setError(error.message || 'Failed to refresh games');
      } finally {
        setLoading(false);
      }
    },
    
    loadMoreGames: async () => {
      const { filters, currentPage, totalPages, games, setLoading, setError } = get();
      
      if (currentPage >= totalPages) {
        return; // No more pages to load
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const nextPage = currentPage + 1;
        const response = await gamesService.getGames(filters, nextPage, 20);
        
        if (response.success && response.data) {
          set({
            games: [...games, ...response.data.data],
            currentPage: nextPage,
          });
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load more games');
      } finally {
        setLoading(false);
      }
    },
    
    clearGames: () => set({
      games: [],
      currentGame: null,
      currentPage: 1,
      totalPages: 1,
      error: null,
    }),
  }))
);
