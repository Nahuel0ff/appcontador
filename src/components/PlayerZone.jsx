import { useState, useRef, useEffect } from 'react';
import { Skull, ChevronUp, ChevronDown, Dices, Crown } from 'lucide-react';
import './PlayerZone.css';

export default function PlayerZone({ 
  player, 
  index, 
  totalPlayers, 
  viewMode, 
  opponents, 
  updateLife, 
  updateCommanderDamage,
  updateName,
  diceState,
  isStartingPlayer
}) {
  const [showCommanderMode, setShowCommanderMode] = useState(false);
  const touchTimer = useRef(null);
  const intervalRef = useRef(null);

  const [lifeDiff, setLifeDiff] = useState(0);
  const diffTimerRef = useRef(null);

  const isDead = player.life <= 0 || Object.values(player.commanderDamage).some(dmg => dmg >= 21);

  // Rotation logic for tabletop mode
  const isTopRow = (totalPlayers === 2 && index < 1) || 
                   (totalPlayers === 3 && index < 1) || 
                   (totalPlayers === 4 && index < 2) ||
                   (totalPlayers === 5 && index < 2) ||
                   (totalPlayers === 6 && index < 3) ||
                   (totalPlayers === 7 && index < 3) ||
                   (totalPlayers === 8 && index < 4);
  
  const rotateClass = (viewMode === 'tabletop' && isTopRow) ? 'rotate-180' : '';

  const handleAdjustLife = (amount) => {
    updateLife(player.id, amount);
    setLifeDiff(prev => prev + amount);
    if (diffTimerRef.current) clearTimeout(diffTimerRef.current);
    diffTimerRef.current = setTimeout(() => {
      setLifeDiff(0);
    }, 2000);
  };

  // Hold to add/subtract rapidly
  const startAdjusting = (amount) => {
    handleAdjustLife(amount);
    touchTimer.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        handleAdjustLife(amount);
      }, 100);
    }, 500); // Wait 500ms before rapid fire
  };

  const stopAdjusting = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => {
      stopAdjusting();
      if (diffTimerRef.current) clearTimeout(diffTimerRef.current);
    };
  }, []);

  const [displayRoll, setDisplayRoll] = useState(1);
  useEffect(() => {
    let interval;
    if (diceState?.phase === 'rolling' && diceState.rollingIds?.includes(player.id)) {
      interval = setInterval(() => {
        setDisplayRoll(Math.floor(Math.random() * 6) + 1);
      }, 50);
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [diceState, player.id]);

  const renderDiceOverlay = () => {
    if (!diceState || !diceState.active) return null;
    
    const isRollingMe = diceState.phase === 'rolling' && diceState.rollingIds?.includes(player.id);
    const myRoll = isRollingMe ? displayRoll : diceState.rolls[player.id];
    
    if (myRoll === undefined) return null; // Didn't roll (not in tiebreak?)

    const isWinner = diceState.winnerId === player.id;
    const isTied = diceState.tiedIds.includes(player.id) && diceState.winnerId === null;

    return (
      <div className="dice-overlay animate-in">
        <Dices size={48} className={`dice-icon ${diceState.tiedIds.length > 1 && !isWinner && !isTied ? 'opacity-50' : ''}`} />
        <div className="dice-val text-shadow">{myRoll}</div>
        {isWinner && <div className="dice-status winner-text"><Crown size={24} /> ¡Empieza!</div>}
        {isTied && <div className="dice-status tied-text">¡Empate!</div>}
      </div>
    );
  };

  const renderDeadOverlay = () => {
    if (isDead) {
      return (
        <div className="dead-overlay animate-in">
          <Skull size={120} className="dead-skull text-shadow" />
          <div className="dead-text text-shadow">Eliminado</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`player-wrapper ${rotateClass} bg-${player.color}`}>
      <div className="player-content">
        
        {/* Header - Name Input */}
        <div className="player-header">
          <div style={{ display: 'flex', alignItems: 'center', width: '70%' }}>
            {isStartingPlayer && <Crown size={24} className="text-shadow animate-in" style={{ color: '#fbbf24', marginRight: '8px', flexShrink: 0 }} />}
            <input 
              className="player-name text-shadow" 
              value={player.name} 
              onChange={(e) => updateName(player.id, e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <button 
            className={`cmd-toggle-btn ${showCommanderMode ? 'active' : ''}`}
            onClick={() => setShowCommanderMode(!showCommanderMode)}
          >
            <Skull size={20} />
          </button>
        </div>

        {/* Main Interface: Life or Commander Damage */}
        <div className="main-display">
          {renderDiceOverlay()}
          {!diceState?.active && !showCommanderMode && (
             <div className={`life-container ${isDead ? 'opacity-30' : ''}`}>
               <button 
                 className="tap-area tap-left glass-btn"
                 onPointerDown={() => startAdjusting(-1)}
                 onPointerUp={stopAdjusting}
                 onPointerLeave={stopAdjusting}
               >
                 -
               </button>
               
               <div className="life-wrapper">
                 <div className="life-value text-shadow">
                   {player.life}
                 </div>
                 {lifeDiff !== 0 && !isDead && (
                   <div className={`life-diff text-shadow ${lifeDiff > 0 ? 'text-green' : 'text-red'}`}>
                     {lifeDiff > 0 ? `+${lifeDiff}` : lifeDiff}
                   </div>
                 )}
               </div>
               
               <button 
                 className="tap-area tap-right glass-btn"
                 onPointerDown={() => startAdjusting(1)}
                 onPointerUp={stopAdjusting}
                 onPointerLeave={stopAdjusting}
               >
                 +
               </button>
             </div>
          )}

          {!diceState?.active && showCommanderMode && (
            <div className={`commander-damage-container ${isDead ? 'opacity-30' : ''}`}>
              <div className="cd-title text-shadow">Daño de Comandante Recibido</div>
              <div className="cd-grid">
                {opponents.map(opp => {
                  const dmg = player.commanderDamage[opp.id] || 0;
                  return (
                    <div key={opp.id} className="cd-opponent text-shadow" style={{ '--opp-color': `var(--color-${opp.color})` }}>
                      <div className="cd-opp-name">{opp.name}</div>
                      <div className="cd-controls">
                        <button 
                          className="cd-btn" 
                          onClick={() => updateCommanderDamage(player.id, opp.id, -1)}
                        >
                          <ChevronDown size={28} />
                        </button>
                        <span className="cd-val">{dmg}</span>
                        <button 
                          className="cd-btn" 
                          onClick={() => updateCommanderDamage(player.id, opp.id, 1)}
                        >
                          <ChevronUp size={28} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!diceState?.active && renderDeadOverlay()}
        </div>
        
      </div>
    </div>
  );
}
