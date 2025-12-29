import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, PenTool, Eraser, AlertCircle, Trophy, Pause } from 'lucide-react';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
type CellValue = number | null;
type Board = CellValue[][];

// --- Sudoku Logic Helpers ---

const BLANK_BOARD: Board = Array(9)
  .fill(null)
  .map(() => Array(9).fill(null));

const isValidMove = (board: Board, row: number, col: number, num: number): boolean => {
  // Check Row
  for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;
  // Check Col
  for (let y = 0; y < 9; y++) if (board[y][col] === num) return false;
  // Check 3x3 Box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
};

const solveBoard = (board: Board): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        // Try numbers 1-9 shuffled for randomness
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            if (solveBoard(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const generateSudoku = (difficulty: Difficulty) => {
  // 1. Generate Solved Board
  const solved = JSON.parse(JSON.stringify(BLANK_BOARD));
  solveBoard(solved);

  // 2. Remove digits based on difficulty
  const puzzle = JSON.parse(JSON.stringify(solved));
  const attempts = difficulty === 'EASY' ? 30 : difficulty === 'MEDIUM' ? 45 : 55;

  for (let i = 0; i < attempts; i++) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    puzzle[r][c] = null;
  }

  return { solved, puzzle };
};

// --- Component ---

export const SudokuGrid: React.FC = () => {
  const initRef = useRef(false);

  const [board, setBoard] = useState<Board>(BLANK_BOARD);
  const [solution, setSolution] = useState<Board>(BLANK_BOARD);
  const [initialBoard, setInitialBoard] = useState<Board>(BLANK_BOARD); // To track locked cells

  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [notes, setNotes] = useState<Set<number>[][]>(
    Array(9)
      .fill(null)
      .map(() =>
        Array(9)
          .fill(null)
          .map(() => new Set())
      )
  );

  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [gameWon, setGameWon] = useState(false);

  // Init Game
  const newGame = useCallback(
    (diff: Difficulty = difficulty) => {
      const { solved, puzzle } = generateSudoku(diff);
      setSolution(solved);
      setBoard(JSON.parse(JSON.stringify(puzzle)));
      setInitialBoard(JSON.parse(JSON.stringify(puzzle)));
      setNotes(
        Array(9)
          .fill(null)
          .map(() =>
            Array(9)
              .fill(null)
              .map(() => new Set())
          )
      );
      setMistakes(0);
      setTimer(0);
      setGameWon(false);
      setIsPaused(false);
      setDifficulty(diff);
    },
    [difficulty]
  );

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      setTimeout(() => newGame(), 0);
    }
  }, [newGame]);

  // Timer
  useEffect(() => {
    let interval: number;
    if (!isPaused && !gameWon) {
      interval = window.setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, gameWon]);

  // Input Handler
  const handleInput = useCallback(
    (num: number) => {
      if (!selected || isPaused || gameWon) return;
      const [r, c] = selected;

      // Cannot edit initial cells
      if (initialBoard[r][c] !== null) return;

      if (isNoteMode) {
        setNotes(prev => {
          const newNotes = [...prev];
          const cellNotes = new Set(prev[r][c]);
          if (cellNotes.has(num)) cellNotes.delete(num);
          else cellNotes.add(num);
          newNotes[r][c] = cellNotes;
          return newNotes;
        });
      } else {
        // Input Mode
        if (num === solution[r][c]) {
          // Correct
          const newBoard = [...board];
          newBoard[r][c] = num;
          setBoard(newBoard);

          // Clear notes for this cell and related row/col/box
          setNotes(prev => {
            const newNotes = [...prev];
            newNotes[r][c] = new Set();
            // Optional: Auto-clear notes in row/col/box? Let's stick to simple clearing
            return newNotes;
          });

          // Check Win
          let isFull = true;
          for (let i = 0; i < 9; i++)
            for (let j = 0; j < 9; j++) if (newBoard[i][j] === null) isFull = false;
          if (isFull) setGameWon(true);
        } else {
          // Incorrect
          setMistakes(m => m + 1);
          // Visual feedback handled by state, usually don't fill the board with wrong number in Sudoku apps, just show error
        }
      }
    },
    [selected, isPaused, gameWon, isNoteMode, board, solution, initialBoard]
  );

  const handleErase = () => {
    if (!selected || isPaused || gameWon) return;
    const [r, c] = selected;
    if (initialBoard[r][c] !== null) return;

    // Clear notes if any, or clear board if filled (though we only fill correct numbers above,
    // typically user might want to clear notes)
    const newNotes = [...notes];
    newNotes[r][c] = new Set();
    setNotes(newNotes);
    // If we allowed wrong numbers on board, we'd clear them here too.
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || gameWon) return;
      const key = parseInt(e.key);
      if (!isNaN(key) && key >= 1 && key <= 9) {
        handleInput(key);
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      }
      if (e.key === 'n') setIsNoteMode(prev => !prev);
      if (e.key === 'ArrowUp')
        setSelected(prev => (prev ? [Math.max(0, prev[0] - 1), prev[1]] : [0, 0]));
      if (e.key === 'ArrowDown')
        setSelected(prev => (prev ? [Math.min(8, prev[0] + 1), prev[1]] : [0, 0]));
      if (e.key === 'ArrowLeft')
        setSelected(prev => (prev ? [prev[0], Math.max(0, prev[1] - 1)] : [0, 0]));
      if (e.key === 'ArrowRight')
        setSelected(prev => (prev ? [prev[0], Math.min(8, prev[1] + 1)] : [0, 0]));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, isPaused, gameWon]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col gap-3 select-none">
      {/* Header Controls */}
      <div className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-800">
        <div className="flex gap-2">
          <select
            value={difficulty}
            onChange={e => newGame(e.target.value as Difficulty)}
            className="bg-slate-800 text-[10px] rounded px-2 text-slate-300 border border-slate-700 outline-none focus:border-cyan-500"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
          <button
            onClick={() => newGame()}
            className="p-1 hover:text-cyan-400 text-slate-500 transition-colors"
            title="Restart"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        <div className="flex gap-4 font-mono text-xs font-bold text-slate-300">
          <div
            className={`flex items-center gap-1 ${mistakes >= 3 ? 'text-red-500 animate-pulse' : ''}`}
          >
            <AlertCircle size={12} /> {mistakes}/3
          </div>
          <div className="flex items-center gap-1 w-16 justify-end">{formatTime(timer)}</div>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="hover:text-cyan-400 transition-colors"
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {gameWon && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center animate-in zoom-in">
            <Trophy
              size={48}
              className="text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
            />
            <div className="text-2xl font-bold text-white mb-2">SYSTEM CLEARED</div>
            <div className="text-sm text-slate-400 mb-4">
              Difficulty: {difficulty} | Time: {formatTime(timer)}
            </div>
            <button
              onClick={() => newGame()}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-lg shadow-cyan-900/50 transition-all"
            >
              NEW SEQUENCE
            </button>
          </div>
        )}

        {isPaused && !gameWon && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center">
            <div className="text-4xl font-black text-slate-800 tracking-widest">PAUSED</div>
            <button
              onClick={() => setIsPaused(false)}
              className="mt-4 text-cyan-400 hover:text-cyan-300 underline"
            >
              Resume
            </button>
          </div>
        )}

        <div
          className="grid grid-cols-9 border-2 border-slate-600 bg-slate-800 shadow-2xl"
          style={{ aspectRatio: '1/1', maxHeight: '100%', maxWidth: '100%' }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isInitial = initialBoard[r][c] !== null;
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isRelated = selected && (selected[0] === r || selected[1] === c);

              // Borders for 3x3 blocks
              const borderR =
                (c + 1) % 3 === 0 && c !== 8
                  ? 'border-r-2 border-r-slate-500'
                  : 'border-r border-r-slate-700';
              const borderB =
                (r + 1) % 3 === 0 && r !== 8
                  ? 'border-b-2 border-b-slate-500'
                  : 'border-b border-b-slate-700';

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => setSelected([r, c])}
                  className={`
                    relative flex items-center justify-center text-sm sm:text-lg font-bold cursor-pointer transition-colors duration-75
                    ${borderR} ${borderB}
                    ${isSelected ? 'bg-cyan-900/60 text-white ring-inset ring-2 ring-cyan-500' : ''}
                    ${!isSelected && isRelated ? 'bg-slate-700/50' : 'bg-slate-900'}
                    ${isInitial ? 'text-slate-400' : 'text-cyan-300'}
                    ${cell === null && !isSelected && !isRelated ? 'hover:bg-slate-800' : ''}
                  `}
                >
                  {cell !== null ? (
                    cell
                  ) : (
                    // Notes Grid
                    <div className="grid grid-cols-3 gap-[1px] w-full h-full p-0.5 pointer-events-none">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <div
                          key={n}
                          className="flex items-center justify-center text-[6px] leading-none text-fuchsia-400/80"
                        >
                          {notes[r][c].has(n) ? n : ''}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Controls / Numpad */}
      <div className="grid grid-cols-6 gap-1 h-12">
        <button
          onClick={() => setIsNoteMode(!isNoteMode)}
          className={`flex flex-col items-center justify-center rounded border ${isNoteMode ? 'bg-fuchsia-900/50 border-fuchsia-500 text-fuchsia-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
        >
          <PenTool size={14} />
          <span className="text-[8px] uppercase font-bold">Note</span>
        </button>

        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => handleInput(n)}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded border border-slate-700 active:scale-95 transition-transform"
          >
            {n}
          </button>
        ))}

        <button
          onClick={handleErase}
          className="flex flex-col items-center justify-center rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-700"
        >
          <Eraser size={14} />
          <span className="text-[8px] uppercase font-bold">Clear</span>
        </button>

        {[6, 7, 8, 9].map(n => (
          <button
            key={n}
            onClick={() => handleInput(n)}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded border border-slate-700 active:scale-95 transition-transform"
          >
            {n}
          </button>
        ))}

        <div className="bg-slate-900 border border-slate-800 rounded flex items-center justify-center text-[8px] text-slate-500 uppercase font-bold tracking-widest text-center px-1">
          Omni
          <br />
          Sudoku
        </div>
      </div>
    </div>
  );
};
