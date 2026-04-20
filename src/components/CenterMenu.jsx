import { useState, useRef, useEffect } from 'react';
import { Monitor, Tablet, RotateCcw, Home, Dices, X, Grip } from 'lucide-react';
import './CenterMenu.css';

export default function CenterMenu({ viewMode, toggleViewMode, onReset, onToSetup, onRollDice, diceState, closeDiceRoll }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  const isRolling = diceState?.active;
  const needTieBreak = diceState && diceState.winnerId === null && diceState.tiedIds.length > 1;

  const shouldBeOpen = isOpen || isRolling || needTieBreak;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  return (
    <div 
      ref={menuRef}
      className="center-menu-wrapper"
    >
      {!shouldBeOpen ? (
        <div className="center-menu-trigger glass-panel" onClick={() => setIsOpen(true)}>
          <Grip size={24} className="opacity-50" />
        </div>
      ) : (
        <div className="center-menu-glass glass-panel text-shadow">
          <button 
            className="icon-btn tooltip-container" 
            onClick={() => { toggleViewMode(); setIsOpen(false); }}
          >
            {viewMode === 'tabletop' ? <Tablet size={24} /> : <Monitor size={24} />}
            <span className="tooltip">
              {viewMode === 'tabletop' ? 'Modo Mesa' : 'Modo TV'}
            </span>
          </button>

          <button 
            className="icon-btn tooltip-container" 
            onClick={() => { onReset(); setIsOpen(false); }}
          >
            <RotateCcw size={24} />
            <span className="tooltip">Reiniciar Partida</span>
          </button>

          <button 
            className="icon-btn tooltip-container" 
            onClick={() => { onToSetup(); setIsOpen(false); }}
          >
            <Home size={24} />
            <span className="tooltip">Menú Principal</span>
          </button>

          <button 
            className={`icon-btn tooltip-container ${needTieBreak ? 'pulse-btn' : ''}`} 
            onClick={onRollDice}
            style={{ background: needTieBreak ? 'var(--color-orange)' : '' }}
          >
            <Dices size={24} />
            <span className="tooltip">{needTieBreak ? '¡Desempate!' : 'Lanzar Dados (¿Quién empieza?)'}</span>
          </button>

          {isRolling && (
            <button 
              className="icon-btn tooltip-container" 
              onClick={() => { closeDiceRoll(); setIsOpen(false); }}
              style={{ background: 'var(--color-red)' }}
            >
              <X size={24} />
              <span className="tooltip">Cerrar Dados</span>
            </button>
          )}

          {!isRolling && !needTieBreak && (
            <button 
              className="icon-btn tooltip-container" 
              onClick={() => setIsOpen(false)}
            >
              <X size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
