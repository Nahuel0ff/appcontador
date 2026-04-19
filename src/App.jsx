import { useState, useEffect } from 'react';
import PlayerZone from './components/PlayerZone';
import PlayerSetup from './components/PlayerSetup';
import CenterMenu from './components/CenterMenu';
import './index.css';

const DEFAULT_LIFE = 40;

const getDefaultPlayers = (count) => {
  const colors = ['red', 'blue', 'green', 'black', 'purple', 'orange', 'teal', 'pink'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Player ${i + 1}`,
    life: DEFAULT_LIFE,
    color: colors[i % colors.length],
    commanderDamage: {}
  }));
};

function App() {
  const [setupMode, setSetupMode] = useState(true);
  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState(getDefaultPlayers(4));
  const [viewMode, setViewMode] = useState('tabletop'); // 'tabletop' | 'tv'

  // Attempt to lock screen to landscape on mobile devices
  useEffect(() => {
    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
      window.screen.orientation.lock("landscape").catch((err) => {
        console.log("Could not lock orientation (might not be supported or required user interaction): ", err);
      });
    }
  }, []);

  // Dice roll state
  const [diceState, setDiceState] = useState(null);
  const [startingPlayerId, setStartingPlayerId] = useState(null);
  // structure: { active: boolean, rolls: { playerId: number }, tiedIds: array, winnerId: number | null }

  useEffect(() => {
    let timeout;
    if (diceState?.active && diceState?.winnerId !== null) {
      timeout = setTimeout(() => {
        closeDiceRoll();
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [diceState]);

  const handleStartGame = (configuredPlayers) => {
    setPlayers(configuredPlayers);
    setSetupMode(false);
    setDiceState(null);
    setStartingPlayerId(null);
  };

  const handleReset = () => {
    setPlayers(players.map(p => ({
      ...p,
      life: DEFAULT_LIFE,
      commanderDamage: {}
    })));
    setDiceState(null);
    setStartingPlayerId(null);
  };

  const handleToSetup = () => {
    setSetupMode(true);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'tabletop' ? 'tv' : 'tabletop');
  };

  const executeRoll = (playersToRoll) => {
    const rolls = { ...diceState?.rolls };
    let maxRoll = -1;
    let newTiedIds = [];
    let newWinnerId = null;

    playersToRoll.forEach(pId => {
      const val = Math.floor(Math.random() * 6) + 1; // D6
      rolls[pId] = val;
    });

    playersToRoll.forEach(pId => {
      if (rolls[pId] > maxRoll) {
        maxRoll = rolls[pId];
        newTiedIds = [pId];
      } else if (rolls[pId] === maxRoll) {
        newTiedIds.push(pId);
      }
    });

    if (newTiedIds.length === 1) {
      newWinnerId = newTiedIds[0];
    }

    setDiceState({
      active: true,
      phase: 'result',
      rolls,
      tiedIds: newTiedIds.length > 1 ? newTiedIds : [],
      winnerId: newWinnerId
    });

    if (newWinnerId !== null) {
      setStartingPlayerId(newWinnerId);
    }
  };

  const handleRollDice = () => {
    // If not active, or if we have a winner, we start a new fresh roll
    if (!diceState || diceState.winnerId !== null) {
      const allIds = players.map(p => p.id);
      setStartingPlayerId(null);
      setDiceState({ active: true, phase: 'rolling', rolls: {}, tiedIds: [], winnerId: null, rollingIds: allIds });
      setTimeout(() => {
        executeRoll(allIds);
      }, 1500);
    } else if (diceState.tiedIds.length > 1) {
      // Tie break roll
      const tied = diceState.tiedIds;
      setDiceState(prev => ({ ...prev, phase: 'rolling', rollingIds: tied }));
      setTimeout(() => {
        executeRoll(tied);
      }, 1500);
    }
  };

  const closeDiceRoll = () => {
    setDiceState(null);
  };

  const updatePlayerLife = (id, amount) => {
    setPlayers(prevPlayers => prevPlayers.map(p =>
      p.id === id ? { ...p, life: p.life + amount } : p
    ));
  };

  const updateCommanderDamage = (playerId, opponentId, amount) => {
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const currentDamage = p.commanderDamage[opponentId] || 0;
        const newDamage = Math.max(0, currentDamage + amount);

        const newLife = p.life - amount;

        return {
          ...p,
          life: newLife,
          commanderDamage: {
            ...p.commanderDamage,
            [opponentId]: newDamage
          }
        };
      }
      return p;
    }));
  };

  const updatePlayerName = (id, newName) => {
    setPlayers(prevPlayers => prevPlayers.map(p =>
      p.id === id ? { ...p, name: newName } : p
    ));
  }

  if (setupMode) {
    return (
      <PlayerSetup
        playerCount={playerCount}
        setPlayerCount={setPlayerCount}
        players={players}
        setPlayers={setPlayers}
        onStart={handleStartGame}
      />
    );
  }

  return (
    <div className={`app-container ${viewMode}`}>
      <div className={`players-grid players-grid-${players.length}`}>
        {players.map((player, index) => (
          <PlayerZone
            key={player.id}
            player={player}
            index={index}
            totalPlayers={players.length}
            viewMode={viewMode}
            opponents={players.filter(p => p.id !== player.id)}
            updateLife={updatePlayerLife}
            updateCommanderDamage={updateCommanderDamage}
            updateName={updatePlayerName}
            diceState={diceState}
            isStartingPlayer={startingPlayerId === player.id}
          />
        ))}
      </div>

      <div className="center-menu-container">
        <CenterMenu
          viewMode={viewMode}
          toggleViewMode={toggleViewMode}
          onReset={handleReset}
          onToSetup={handleToSetup}
          onRollDice={handleRollDice}
          diceState={diceState}
          closeDiceRoll={closeDiceRoll}
        />
      </div>
    </div>
  );
}

export default App;
