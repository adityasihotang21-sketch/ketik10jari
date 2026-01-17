
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Trophy, 
  Keyboard, 
  RotateCcw, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  ChevronRight,
  User,
  Star,
  BookOpen
} from 'lucide-react';
import { LEVELS } from './constants';
import { GameState, GameStats, Level } from './types';
import StatsCard from './components/StatsCard';
import { getTeacherFeedback } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [teacherFeedback, setTeacherFeedback] = useState<string>('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically
  useEffect(() => {
    if (gameState === 'PLAYING' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (gameState === 'PLAYING' && startTime) {
      interval = window.setInterval(() => {
        setTimeLeft(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, startTime]);

  const calculateStats = useCallback((finalInput: string, finalErrorCount: number, durationSeconds: number): GameStats => {
    const totalChars = finalInput.length;
    const words = totalChars / 5;
    const minutes = durationSeconds / 60;
    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
    
    // Simple accuracy
    let correctChars = 0;
    const target = currentLevel?.content || '';
    for (let i = 0; i < finalInput.length; i++) {
      if (finalInput[i] === target[i]) correctChars++;
    }
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;

    return {
      wpm,
      accuracy,
      timeInSeconds: durationSeconds,
      errorCount: finalErrorCount,
      totalChars
    };
  }, [currentLevel]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const target = currentLevel?.content || '';

    // Start timer on first keypress
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Validation
    if (val.length > userInput.length) {
      const charTyped = val[val.length - 1];
      const targetChar = target[val.length - 1];
      if (charTyped !== targetChar) {
        setErrorCount(prev => prev + 1);
      }
    }

    setUserInput(val);

    // Finish condition
    if (val.length === target.length) {
      const now = Date.now();
      const duration = Math.max(1, Math.floor((now - (startTime || now)) / 1000));
      setEndTime(now);
      const finalStats = calculateStats(val, errorCount + (val[val.length - 1] !== target[target.length - 1] ? 1 : 0), duration);
      setStats(finalStats);
      setGameState('RESULTS');
      generateFeedback(finalStats);
    }
  };

  const generateFeedback = async (finalStats: GameStats) => {
    setIsLoadingFeedback(true);
    const feedback = await getTeacherFeedback(finalStats, currentLevel?.title || "Level");
    setTeacherFeedback(feedback);
    setIsLoadingFeedback(false);
  };

  const startLevel = (level: Level) => {
    setCurrentLevel(level);
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setErrorCount(0);
    setTimeLeft(0);
    setGameState('PLAYING');
  };

  const resetGame = () => {
    setGameState('LOBBY');
    setCurrentLevel(null);
    setUserInput('');
    setStats(null);
    setTeacherFeedback('');
  };

  const renderLobby = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative">
        <div className="absolute -top-12 -right-12 bg-yellow-400 p-3 rounded-full shadow-lg rotate-12">
          <Star className="text-white w-8 h-8 fill-current" />
        </div>
        <img 
          src="https://picsum.photos/id/20/400/300" 
          alt="Teacher" 
          className="w-48 h-48 rounded-full border-8 border-white shadow-xl object-cover mb-4"
        />
      </div>
      <div className="space-y-2">
        <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">
          Halo, Murid Hebat! 👋
        </h1>
        <p className="text-xl text-slate-600 max-w-md mx-auto">
          Ayo asah jemarimu menjadi secepat kilat dalam Petualangan Mengetik GuruKetik.
        </p>
      </div>
      <button 
        onClick={() => setGameState('LEVEL_SELECT')}
        className="group relative flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-xl font-bold transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-1 active:scale-95"
      >
        <span>Mulai Petualangan</span>
        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );

  const renderLevelSelect = () => (
    <div className="w-full max-w-5xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 px-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Pilih Tantanganmu</h2>
          <p className="text-slate-500 font-medium">Ada 10 level yang menunggu untuk ditaklukkan!</p>
        </div>
        <button onClick={resetGame} className="text-slate-400 hover:text-slate-600 flex items-center space-x-1 transition-colors">
          <RotateCcw className="w-5 h-5" />
          <span className="font-semibold">Kembali</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-4">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => startLevel(level)}
            className="bg-white border-2 border-slate-100 hover:border-blue-400 p-6 rounded-3xl transition-all hover:shadow-xl group relative overflow-hidden text-left flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start">
              <span className="bg-slate-50 text-slate-400 font-bold px-3 py-1 rounded-full text-xs group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                Level {level.id}
              </span>
              <BookOpen className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-700 mb-1 group-hover:text-blue-600">{level.title}</h3>
              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{level.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderPlaying = () => {
    if (!currentLevel) return null;
    const target = currentLevel.content;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Keyboard className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-xl">{currentLevel.title}</h2>
                <p className="text-blue-100 text-sm">Ayo mengetik dengan teliti!</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-blue-200">Waktu</span>
                <span className="text-xl font-mono font-bold tracking-wider">{timeLeft}s</span>
              </div>
              <div className="h-8 w-[1px] bg-white/20" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-blue-200">Salah</span>
                <span className="text-xl font-mono font-bold text-red-300">{errorCount}</span>
              </div>
            </div>
          </div>
          
          <div className="p-10 space-y-8">
            <div className="relative text-3xl font-medium leading-relaxed tracking-wide text-slate-300 font-mono select-none">
              {/* Background text (target) */}
              <div className="absolute inset-0 z-0 opacity-50">
                {target}
              </div>
              
              {/* Foreground text (interactive) */}
              <div className="relative z-10">
                {target.split('').map((char, i) => {
                  let colorClass = 'text-slate-300';
                  if (i < userInput.length) {
                    colorClass = userInput[i] === char ? 'text-blue-600' : 'text-red-500 bg-red-50 rounded';
                  }
                  
                  return (
                    <span 
                      key={i} 
                      className={`${colorClass} transition-colors duration-150 ${i === userInput.length ? 'border-b-4 border-blue-500 cursor-blink' : ''}`}
                    >
                      {char}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                autoFocus
                value={userInput}
                onChange={handleInputChange}
                className="opacity-0 absolute inset-0 w-full h-full cursor-default"
                autoComplete="off"
                spellCheck="false"
              />
              <div className="flex justify-center">
                 <p className="text-slate-400 text-sm font-medium animate-pulse">Ketik teks di atas menggunakan keyboardmu...</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button onClick={() => setGameState('LEVEL_SELECT')} className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold">
            <RotateCcw className="w-4 h-4" />
            <span>Batalkan dan pilih level lain</span>
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!stats) return null;

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-100 rounded-full mb-4 ring-8 ring-yellow-50">
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <h2 className="text-4xl font-extrabold text-slate-800">Luar Biasa, Juara!</h2>
          <p className="text-slate-500 font-medium mt-2">Level {currentLevel?.title} telah kamu selesaikan!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard 
            label="Kecepatan (WPM)" 
            value={stats.wpm} 
            icon={<Zap className="w-5 h-5" />} 
            color="bg-purple-500" 
          />
          <StatsCard 
            label="Ketepatan" 
            value={`${stats.accuracy}%`} 
            icon={<CheckCircle className="w-5 h-5" />} 
            color="bg-green-500" 
          />
          <StatsCard 
            label="Salah Ketik" 
            value={stats.errorCount} 
            icon={<XCircle className="w-5 h-5" />} 
            color="bg-red-500" 
          />
          <StatsCard 
            label="Waktu" 
            value={`${stats.timeInSeconds}s`} 
            icon={<Clock className="w-5 h-5" />} 
            color="bg-blue-500" 
          />
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-blue-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <User className="w-24 h-24" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <span className="bg-blue-600 text-white p-1 rounded-lg">👨‍🏫</span>
            <span>Catatan Pak Guru:</span>
          </h3>
          <div className="min-h-[60px] flex items-center">
            {isLoadingFeedback ? (
              <div className="flex space-x-2 animate-pulse w-full">
                <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
              </div>
            ) : (
              <p className="text-slate-600 italic text-lg leading-relaxed">
                "{teacherFeedback}"
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <button
            onClick={() => setGameState('LEVEL_SELECT')}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-lg hover:-translate-y-1"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Lanjut Tantangan Berikutnya</span>
          </button>
          <button
            onClick={() => startLevel(currentLevel!)}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-4 rounded-2xl text-lg font-bold transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Coba Lagi Level Ini</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation / Header */}
      <header className="py-6 px-8 max-w-7xl mx-auto flex justify-between items-center">
        <div 
          onClick={resetGame} 
          className="flex items-center space-x-2 cursor-pointer group"
        >
          <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg">
            <Keyboard className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-tight">GuruKetik</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-6 text-slate-500 font-semibold">
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Cara Bermain</span>
          <span className="hover:text-blue-600 transition-colors cursor-pointer">Papan Skor</span>
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs">Siswa Aktif: 1,240</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {gameState === 'LOBBY' && renderLobby()}
        {gameState === 'LEVEL_SELECT' && renderLevelSelect()}
        {gameState === 'PLAYING' && renderPlaying()}
        {gameState === 'RESULTS' && renderResults()}
      </main>

      {/* Footer Decoration */}
      <footer className="fixed bottom-0 left-0 w-full pointer-events-none overflow-hidden opacity-50">
        <div className="h-12 bg-gradient-to-t from-slate-100 to-transparent" />
      </footer>
    </div>
  );
};

export default App;
