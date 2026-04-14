'use client';

import { useState } from 'react';
import { Travel, Vehicle, DiscardedCity, Mission, BRAZILIAN_STATES, STATE_FLAG_URLS, STATE_CITY_COUNTS } from '@/types/travel';
import { FaMapMarkerAlt, FaTrophy, FaCar, FaTrash, FaHeart, FaRoute, FaClock, FaStar, FaMoneyBillWave, FaBan, FaPlus, FaTimes, FaChevronDown, FaChevronUp, FaLock, FaLockOpen, FaFlag, FaCrown, FaGem, FaMedal, FaCheck, FaUtensils, FaGlobeAmericas } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const MISSION_ICON_MAP: Record<string, React.ReactNode> = {
    FaMapMarkerAlt: <FaMapMarkerAlt size={14} />,
    FaGlobeAmericas: <FaGlobeAmericas size={14} />,
    FaTrophy: <FaTrophy size={14} />,
    FaCrown: <FaCrown size={14} />,
    FaFlag: <FaFlag size={14} />,
    FaRoute: <FaRoute size={14} />,
    FaClock: <FaClock size={14} />,
    FaUtensils: <FaUtensils size={14} />,
    FaStar: <FaStar size={14} />,
    FaHeart: <FaHeart size={14} />,
    FaGem: <FaGem size={14} />,
    FaMedal: <FaMedal size={14} />,
};

interface StatsPanelProps {
    travels: Travel[];
    vehicles: Vehicle[];
    onDeleteVehicle: (id: string) => void;
    discardedCities: DiscardedCity[];
    onDiscardCity: (city: DiscardedCity) => void;
    onUndiscardCity: (city: string, state: string) => void;
    missions: Mission[];
    onAddMission: (mission: Mission) => void;
    onDeleteMission: (id: string) => void;
}

export default function StatsPanel({ travels, vehicles, onDeleteVehicle, discardedCities, onDiscardCity, onUndiscardCity, missions, onAddMission, onDeleteMission }: StatsPanelProps) {
    const [expandedState, setExpandedState] = useState<string | null>(null);
    const [showDiscardForm, setShowDiscardForm] = useState(false);
    const [discardCity, setDiscardCity] = useState('');
    const [discardState, setDiscardState] = useState('');
    const [discardReason, setDiscardReason] = useState('');
    const [showAddMission, setShowAddMission] = useState(false);
    const [newMissionTitle, setNewMissionTitle] = useState('');
    const [newMissionDesc, setNewMissionDesc] = useState('');
    const [newMissionTarget, setNewMissionTarget] = useState(1);

    const visited = travels.filter(t => t.status === 'visited');
    const wishlists = travels.filter(t => t.status === 'wishlist' || t.status === 'food_wishlist');

    // Cities unlocked by state — only show states that have been "touched"
    const stateMap: Record<string, { visited: string[]; wishlist: string[]; total: number }> = {};
    travels.forEach(t => {
        if (!stateMap[t.state]) stateMap[t.state] = { visited: [], wishlist: [], total: 0 };
        stateMap[t.state].total++;
        if (t.status === 'visited' && !stateMap[t.state].visited.includes(t.city)) {
            stateMap[t.state].visited.push(t.city);
        }
        if (t.status !== 'visited' && !stateMap[t.state].wishlist.includes(t.city)) {
            stateMap[t.state].wishlist.push(t.city);
        }
    });

    const stateEntries = Object.entries(stateMap)
        .filter(([, data]) => data.visited.length > 0)
        .sort((a, b) => b[1].visited.length - a[1].visited.length);

    const totalKm = visited.reduce((sum, t) => sum + (t.distanceKm || 0), 0);
    const totalHours = visited.reduce((sum, t) => sum + (t.travelTimeHours || 0) + (t.travelTimeMinutes || 0) / 60, 0);
    const avgRating = visited.filter(t => t.rating > 0 || t.ratingP1 > 0 || t.ratingP2 > 0).length > 0
        ? (visited.reduce((sum, t) => {
            const avg = (t.ratingP1 > 0 || t.ratingP2 > 0)
                ? ((t.ratingP1 + t.ratingP2) / ((t.ratingP1 > 0 && t.ratingP2 > 0) ? 2 : 1))
                : t.rating;
            return sum + avg;
        }, 0) / visited.filter(t => t.rating > 0 || t.ratingP1 > 0 || t.ratingP2 > 0).length)
        : 0;
    const wouldReturnCount = visited.filter(t => t.wouldReturn).length;
    const totalSaved = wishlists.reduce((sum, t) => sum + (t.savedAmount || 0), 0);
    const totalBudget = wishlists.reduce((sum, t) => sum + (t.budget || 0), 0);

    const getStateUf = (stateName: string) => {
        const s = BRAZILIAN_STATES.find(st => st.name === stateName);
        return s?.uf || '';
    };

    const getStateTotalCities = (stateName: string) => {
        return STATE_CITY_COUNTS[stateName] || 100;
    };

    const handleDiscardSubmit = () => {
        if (!discardCity.trim() || !discardState) return;
        onDiscardCity({
            city: discardCity.trim(),
            state: discardState,
            reason: discardReason,
            discardedAt: new Date().toISOString(),
        });
        setDiscardCity('');
        setDiscardState('');
        setDiscardReason('');
        setShowDiscardForm(false);
    };

    const handleAddMissionSubmit = () => {
        if (!newMissionTitle.trim()) return;
        onAddMission({
            id: uuidv4(),
            title: newMissionTitle.trim(),
            description: newMissionDesc.trim(),
            type: 'custom',
            category: 'special',
            target: newMissionTarget,
            progress: 0,
            completed: false,
            icon: 'FaStar',
        });
        setNewMissionTitle('');
        setNewMissionDesc('');
        setNewMissionTarget(1);
        setShowAddMission(false);
    };

    return (
        <div className="stats-panel">
            <h3 className="stats-title"><FaTrophy size={16} /> Conquistas</h3>

            <div className="stats-grid">
                <div className="stat-card accent">
                    <div className="stat-number">{visited.length}</div>
                    <div className="stat-label"><FaLockOpen size={10} /> Desbloqueadas</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{wishlists.length}</div>
                    <div className="stat-label"><FaStar size={10} /> Lista de desejos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{totalKm.toLocaleString('pt-BR')}</div>
                    <div className="stat-label"><FaRoute size={10} /> km percorridos</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{Math.round(totalHours)}h</div>
                    <div className="stat-label"><FaClock size={10} /> na estrada</div>
                </div>
                {visited.filter(t => t.rating > 0).length > 0 && (
                    <div className="stat-card">
                        <div className="stat-number">{avgRating.toFixed(1)}</div>
                        <div className="stat-label"><FaStar size={10} /> média</div>
                    </div>
                )}
                <div className="stat-card love">
                    <div className="stat-number">{wouldReturnCount}</div>
                    <div className="stat-label"><FaHeart size={10} /> voltaríamos</div>
                </div>
            </div>

            {/* Savings */}
            {totalBudget > 0 && (
                <div className="stats-savings">
                    <h4><FaMoneyBillWave size={12} /> Total economizado</h4>
                    <div className="budget-bar big">
                        <div className="budget-fill" style={{ width: `${Math.min((totalSaved / totalBudget) * 100, 100)}%` }} />
                    </div>
                    <span className="savings-text">R$ {totalSaved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {totalBudget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
            )}

            {/* States with flags and progress */}
            {stateEntries.length > 0 && (
                <div className="stats-states">
                    <h4><FaMapMarkerAlt size={12} /> Estados desbloqueados ({stateEntries.length}/27)</h4>
                    <div className="state-list">
                        {stateEntries.map(([stateName, data]) => {
                            const uf = getStateUf(stateName);
                            const totalCities = getStateTotalCities(stateName) - (discardedCities.filter(d => d.state === stateName).length);
                            const percent = Math.round((data.visited.length / totalCities) * 100);
                            const isExpanded = expandedState === stateName;

                            return (
                                <div key={stateName} className="state-item-card">
                                    <button className="state-item-header" onClick={() => setExpandedState(isExpanded ? null : stateName)}>
                                        <div className="state-flag">
                                            {STATE_FLAG_URLS[uf] ? (
                                                <img src={STATE_FLAG_URLS[uf]} alt={`Bandeira ${uf}`} />
                                            ) : (
                                                <span className="state-flag-placeholder">{uf}</span>
                                            )}
                                        </div>
                                        <div className="state-info">
                                            <span className="state-name">{stateName}</span>
                                            <span className="state-count">{data.visited.length} cidade{data.visited.length !== 1 ? 's' : ''} desbloqueada{data.visited.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="state-progress-ring">
                                            <svg viewBox="0 0 36 36">
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--bg-input)" strokeWidth="3" />
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--visited)" strokeWidth="3" strokeDasharray={`${percent}, 100`} />
                                            </svg>
                                            <span className="state-percent">{percent}%</span>
                                        </div>
                                        {isExpanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                                    </button>
                                    {isExpanded && (
                                        <div className="state-expanded">
                                            <div className="state-cities-list">
                                                {data.visited.map(city => (
                                                    <span key={city} className="state-city-tag visited"><FaLockOpen size={8} /> {city}</span>
                                                ))}
                                                {data.wishlist.map(city => (
                                                    <span key={city} className="state-city-tag wishlist"><FaLock size={8} /> {city}</span>
                                                ))}
                                            </div>
                                            <div className="state-bar-full">
                                                <div className="state-fill" style={{ width: `${percent}%` }} />
                                            </div>
                                            <span className="state-bar-label">{data.visited.length} / {totalCities} cidades</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Discarded cities */}
            <div className="stats-discarded">
                <h4><FaBan size={12} /> Cidades descartadas ({discardedCities.length})</h4>
                <p className="discard-hint">Descarte cidades inseguras ou que não interessam para não travar metas</p>
                {discardedCities.map((dc, i) => (
                    <div key={i} className="discard-item">
                        <div className="discard-info">
                            <span className="discard-city">{dc.city}, {dc.state}</span>
                            {dc.reason && <span className="discard-reason">{dc.reason}</span>}
                        </div>
                        <button className="discard-undo" onClick={() => onUndiscardCity(dc.city, dc.state)} title="Restaurar">
                            <FaTimes size={10} />
                        </button>
                    </div>
                ))}
                {showDiscardForm ? (
                    <div className="discard-form">
                        <input className="form-input" placeholder="Cidade" value={discardCity} onChange={e => setDiscardCity(e.target.value)} />
                        <select className="form-select" value={discardState} onChange={e => setDiscardState(e.target.value)}>
                            <option value="">Estado</option>
                            {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.name}>{s.uf}</option>)}
                        </select>
                        <input className="form-input" placeholder="Motivo (opcional)" value={discardReason} onChange={e => setDiscardReason(e.target.value)} />
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={handleDiscardSubmit}>Descartar</button>
                            <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => setShowDiscardForm(false)}>Cancelar</button>
                        </div>
                    </div>
                ) : (
                    <button className="add-food-btn" onClick={() => setShowDiscardForm(true)}>
                        <FaPlus size={10} /> Descartar cidade
                    </button>
                )}
            </div>

            {/* Vehicles */}
            {vehicles.length > 0 && (
                <div className="stats-vehicles">
                    <h4><FaCar size={12} /> Nossos veículos</h4>
                    <div className="vehicle-list">
                        {vehicles.map(v => (
                            <div key={v.id} className="vehicle-card">
                                {v.photo && <img src={v.photo} alt={v.name} className="vehicle-card-img" />}
                                <div className="vehicle-card-info">
                                    <span className="vehicle-card-name">{v.name}</span>
                                    <span className="vehicle-card-type">{v.type}</span>
                                </div>
                                <button className="vehicle-delete" onClick={() => onDeleteVehicle(v.id)} title="Remover">
                                    <FaTrash size={10} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Missions */}
            <div className="stats-missions">
                <h4><FaTrophy size={12} /> Missões ({missions.filter(m => m.completed).length}/{missions.length})</h4>
                <div className="mission-list">
                    {missions.map(m => {
                        const percent = Math.min(Math.round((m.progress / m.target) * 100), 100);
                        return (
                            <div key={m.id} className={`mission-card ${m.completed ? 'completed' : ''}`}>
                                <div className="mission-icon">{MISSION_ICON_MAP[m.icon] || <FaStar size={14} />}</div>
                                <div className="mission-info">
                                    <div className="mission-title-row">
                                        <span className="mission-title">{m.title}</span>
                                        {m.completed && <FaCheck size={10} color="var(--visited)" />}
                                        {m.type === 'custom' && (
                                            <button className="mission-delete" onClick={() => onDeleteMission(m.id)} title="Remover missão"><FaTimes size={8} /></button>
                                        )}
                                    </div>
                                    <span className="mission-desc">{m.description}</span>
                                    <div className="mission-bar">
                                        <div className="mission-fill" style={{ width: `${percent}%` }} />
                                    </div>
                                    <span className="mission-progress">{m.progress}/{m.target}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {showAddMission ? (
                    <div className="discard-form">
                        <input className="form-input" placeholder="Nome da missão" value={newMissionTitle} onChange={e => setNewMissionTitle(e.target.value)} />
                        <input className="form-input" placeholder="Descrição" value={newMissionDesc} onChange={e => setNewMissionDesc(e.target.value)} />
                        <input className="form-input" type="number" min={1} placeholder="Meta" value={newMissionTarget} onChange={e => setNewMissionTarget(Number(e.target.value))} />
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={handleAddMissionSubmit}>Criar</button>
                            <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '6px 12px' }} onClick={() => setShowAddMission(false)}>Cancelar</button>
                        </div>
                    </div>
                ) : (
                    <button className="add-food-btn" onClick={() => setShowAddMission(true)}>
                        <FaPlus size={10} /> Criar missão personalizada
                    </button>
                )}
            </div>
        </div>
    );
}
