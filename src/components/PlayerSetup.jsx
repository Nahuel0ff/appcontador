import { useEffect } from 'react';
import { Users, Play, Settings } from 'lucide-react';
import './PlayerSetup.css';

export default function PlayerSetup({ playerCount, setPlayerCount, players, setPlayers, onStart }) {
  
  const handleCountChange = (count) => {
    setPlayerCount(count);
    // keep existing players if possible
    setPlayers(prev => {
      const colors = ['red', 'blue', 'green', 'black', 'purple', 'orange', 'teal', 'pink'];
      const newArray = [];
      for (let i = 0; i < count; i++) {
        if (prev[i]) {
          newArray.push(prev[i]);
        } else {
          newArray.push({
            id: i + 1,
            name: `Jugador ${i + 1}`,
            life: 40,
            color: colors[i % colors.length],
            commanderDamage: {}
          });
        }
      }
      return newArray;
    });
  };

  const updateColor = (id, newColor) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, color: newColor } : p
    ));
  };

  const updateName = (id, newName) => {
    setPlayers(players.map(p => 
      p.id === id ? { ...p, name: newName } : p
    ));
  };

  return (
    <div className="setup-container">
      <div className="setup-card glass-panel text-shadow">
        <div className="setup-header">
          <Settings size={32} />
          <h2>Magia de Pollas</h2>
        </div>
        
        <div className="setup-section">
          <h3>Número de Jugadores</h3>
          <div className="player-count-buttons">
            {[2, 3, 4, 5, 6, 7, 8].map(num => (
              <button 
                key={num}
                className={`count-btn ${playerCount === num ? 'active' : ''}`}
                onClick={() => handleCountChange(num)}
              >
                <Users size={20} />
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="setup-players-list">
          {players.map(p => (
            <div key={p.id} className="setup-player-row">
              <div 
                className="color-indicator" 
                style={{ backgroundColor: `var(--color-${p.color})` }}
              ></div>
              <input 
                type="text" 
                value={p.name} 
                onChange={(e) => updateName(p.id, e.target.value)} 
                className="setup-name-input"
              />
              <select 
                value={p.color} 
                onChange={(e) => updateColor(p.id, e.target.value)}
                className="setup-color-select"
              >
                <option value="red">Rojo</option>
                <option value="blue">Azul</option>
                <option value="green">Verde</option>
                <option value="black">Negro</option>
                <option value="purple">Morado</option>
                <option value="orange">Naranja</option>
                <option value="teal">Turquesa</option>
                <option value="pink">Rosa</option>
              </select>
            </div>
          ))}
        </div>

        <button className="primary-btn start-btn" onClick={() => onStart(players)}>
          <Play size={24} fill="currentColor" />
          Comenzar Partida
        </button>
      </div>
    </div>
  );
}
