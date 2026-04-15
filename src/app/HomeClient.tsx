'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Travel, TravelStatus, Vehicle, DiscardedCity, Mission, ACHIEVEMENT_MILESTONES, UserProfile } from '@/types/travel';
import { getTravels, addTravel, updateTravel, deleteTravel, getVehicles, addVehicle, updateVehicle, deleteVehicle, getDiscardedCities, addDiscardedCity, removeDiscardedCity, getMissions, updateMission, addMission, deleteMission, getProfiles, updateProfile } from '@/lib/storage';
import TravelForm from '@/components/TravelForm';
import TravelCard from '@/components/TravelCard';
import TravelDetail from '@/components/TravelDetail';
import VehicleForm from '@/components/VehicleForm';
import StatsPanel from '@/components/StatsPanel';
import Celebration from '@/components/Celebration';
import ProfileEditor from '@/components/ProfileEditor';
import { FaPlus, FaMap, FaPlaneDeparture, FaChartBar, FaCar, FaCheck, FaStar, FaUtensils, FaRoute, FaHeart, FaTrash, FaPencilAlt, FaUser, FaChevronLeft, FaChevronRight, FaHome } from 'react-icons/fa';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

type FilterType = 'all' | 'visited' | 'wishlist' | 'food_wishlist' | 'date';
type SidebarTab = 'list' | 'stats' | 'vehicles';

export default function HomeClient() {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [discardedCities, setDiscardedCities] = useState<DiscardedCity[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [editTravel, setEditTravel] = useState<Travel | null>(null);
  const [detailTravel, setDetailTravel] = useState<Travel | null>(null);
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('list');
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState<{ message: string; icon: string } | null>(null);
  const celebrationQueue = useRef<{ message: string; icon: string }[]>([]);
  const [stateImages, setStateImages] = useState<Record<string, string>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [homeLocation, setHomeLocation] = useState<{ city: string; state: string; lat: number; lng: number } | null>(null);
  const [missionToast, setMissionToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [t, v, d, m, p] = await Promise.all([getTravels(), getVehicles(), getDiscardedCities(), getMissions(), getProfiles()]);
        setTravels(t);
        setVehicles(v);
        setDiscardedCities(d);
        setMissions(m);
        setProfiles(p);
        // Load state images from localStorage
        try {
          const saved = localStorage.getItem('stateImages');
          if (saved) setStateImages(JSON.parse(saved));
          const savedHome = localStorage.getItem('homeLocation');
          if (savedHome) setHomeLocation(JSON.parse(savedHome));
        } catch { /* ignore */ }
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const triggerCelebration = (message: string, icon: string) => {
    if (celebration) {
      celebrationQueue.current.push({ message, icon });
    } else {
      setCelebration({ message, icon });
    }
  };

  const handleCelebrationDone = () => {
    const next = celebrationQueue.current.shift();
    if (next) {
      setCelebration(next);
    } else {
      setCelebration(null);
    }
  };

  const checkAchievements = (oldTravels: Travel[], newTravels: Travel[]) => {
    const oldVisited = oldTravels.filter(t => t.status === 'visited').length;
    const newVisited = newTravels.filter(t => t.status === 'visited').length;
    for (const milestone of ACHIEVEMENT_MILESTONES) {
      if (oldVisited < milestone.cities && newVisited >= milestone.cities) {
        triggerCelebration(milestone.label, milestone.icon);
      }
    }
  };

  const updateMissionsProgress = async (currentTravels: Travel[]) => {
    const visited = currentTravels.filter(t => t.status === 'visited');
    const citiesCount = visited.length;
    const statesSet = new Set(visited.map(t => t.state));
    const totalKm = visited.reduce((s, t) => s + (t.distanceKm || 0), 0);
    const totalHours = visited.reduce((s, t) => s + (t.travelTimeHours || 0) + (t.travelTimeMinutes || 0) / 60, 0);
    const totalRestaurants = visited.reduce((s, t) => s + (t.restaurants?.length || 0), 0);
    const maxCitiesInState = Object.values(
      visited.reduce<Record<string, number>>((acc, t) => { acc[t.state] = (acc[t.state] || 0) + 1; return acc; }, {})
    ).reduce((m, v) => Math.max(m, v), 0);
    const hasMaxRating = visited.some(t => (t.ratingP1 >= 5 || t.ratingP2 >= 5 || t.rating >= 5));
    const maxVisits = currentTravels.reduce((m, t) => Math.max(m, 1 + (t.visits?.length || 0)), 0);

    const updated: Mission[] = [];
    for (const mission of missions) {
      let progress = mission.progress;
      switch (mission.category) {
        case 'cities': progress = citiesCount; break;
        case 'states': progress = statesSet.size; break;
        case 'distance': progress = totalKm; break;
        case 'time': progress = Math.round(totalHours); break;
        case 'food': progress = totalRestaurants; break;
        case 'special':
          if (mission.id === 'state_5_cities') progress = maxCitiesInState;
          else if (mission.id === 'perfect_score') progress = hasMaxRating ? 1 : 0;
          else if (mission.id === 'revisit') progress = maxVisits;
          break;
      }
      const wasCompleted = mission.completed;
      const isNowCompleted = progress >= mission.target;
      if (progress !== mission.progress || isNowCompleted !== wasCompleted) {
        const m2 = { ...mission, progress, completed: isNowCompleted, completedAt: isNowCompleted && !wasCompleted ? new Date().toISOString() : mission.completedAt };
        updated.push(m2);
        if (isNowCompleted && !wasCompleted) {
          triggerCelebration(`Missão completa: ${mission.title}`, mission.icon);
        } else if (!isNowCompleted && progress >= mission.target * 0.8) {
          // Near-complete mission toast (Item 8)
          setMissionToast(`Quase lá! "${mission.title}" — ${progress}/${mission.target}`);
          setTimeout(() => setMissionToast(null), 4000);
        }
      }
    }
    if (updated.length > 0) {
      for (const m of updated) {
        await updateMission(m);
      }
      const fresh = await getMissions();
      setMissions(fresh);
    }
  };

  const handleSave = async (travel: Travel) => {
    try {
      const isEdit = travels.some((t) => t.id === travel.id);
      let newTravels: Travel[];
      if (isEdit) {
        newTravels = await updateTravel(travel);
        showToast('Viagem atualizada!');
      } else {
        newTravels = await addTravel(travel);
        if (travel.status === 'visited') {
          triggerCelebration(`${travel.city} desbloqueada!`, 'FaMapMarkerAlt');
        }
        showToast(travel.status === 'date' ? 'Date registrado!' : 'Nova aventura adicionada!');
        checkAchievements(travels, newTravels);
      }
      setTravels(newTravels);
      setShowForm(false);
      setEditTravel(null);
      setSelectedTravel(travel);
      await updateMissionsProgress(newTravels);

      // Auto-create mission from wishlist (Item 12)
      if (!isEdit && (travel.status === 'wishlist' || travel.status === 'food_wishlist')) {
        const missionId = `wish_${travel.id}`;
        const alreadyExists = missions.some(m => m.id === missionId);
        if (!alreadyExists) {
          const autoMission: Mission = {
            id: missionId,
            title: `Conhecer ${travel.city}`,
            description: `Visitar ${travel.city}, ${travel.state}`,
            type: 'custom',
            category: 'cities',
            target: 1,
            progress: 0,
            completed: false,
            icon: travel.status === 'food_wishlist' ? 'FaUtensils' : 'FaMapMarkerAlt',
          };
          await handleAddMission(autoMission);
        }
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      showToast('Erro ao salvar. Tente novamente.');
    }
  };

  const handleSaveVehicle = async (vehicle: Vehicle) => {
    const isEdit = vehicles.some(v => v.id === vehicle.id);
    let v: Vehicle[];
    if (isEdit) {
      v = await updateVehicle(vehicle);
      showToast(`${vehicle.name} atualizado!`);
    } else {
      v = await addVehicle(vehicle);
      showToast(`${vehicle.name} cadastrado!`);
    }
    setVehicles(v);
    setShowVehicleForm(false);
    setEditVehicle(null);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (confirm('Remover este veículo?')) {
      const v = await deleteVehicle(id);
      setVehicles(v);
      showToast('Veículo removido');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta viagem?')) {
      const t = await deleteTravel(id);
      setTravels(t);
      showToast('Viagem excluída');
      await updateMissionsProgress(t);
    }
  };

  const handleDiscardCity = async (dc: DiscardedCity) => {
    const d = await addDiscardedCity(dc);
    setDiscardedCities(d);
    showToast(`${dc.city} descartada`);
  };

  const handleUndiscardCity = async (city: string, state: string) => {
    const d = await removeDiscardedCity(city, state);
    setDiscardedCities(d);
    showToast(`${city} restaurada`);
  };

  const handleTravelClick = useCallback((travel: Travel) => {
    setDetailTravel(travel);
    setSelectedTravel(travel);
  }, []);

  const handleEditFromDetail = (travel: Travel) => {
    setDetailTravel(null);
    setEditTravel(travel);
    setShowForm(true);
  };

  const handleUpdateTravel = async (travel: Travel) => {
    const newTravels = await updateTravel(travel);
    setTravels(newTravels);
    setDetailTravel(travel);
  };

  const handleAddMission = async (mission: Mission) => {
    const m = await addMission(mission);
    setMissions(m);
    showToast('Missão criada!');
  };

  const handleDeleteMission = async (id: string) => {
    const m = await deleteMission(id);
    setMissions(m);
    showToast('Missão removida');
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    const p = await updateProfile(profile);
    setProfiles(p);
    setEditProfile(null);
    showToast(`Perfil de ${profile.name} atualizado!`);
  };

  const handleStateImageUpload = (stateName: string, image: string) => {
    const updated = { ...stateImages, [stateName]: image };
    setStateImages(updated);
    localStorage.setItem('stateImages', JSON.stringify(updated));
    showToast(`Foto de ${stateName} salva!`);
  };

  const handleSetHomeLocation = (city: string, state: string, lat: number, lng: number) => {
    const home = { city, state, lat, lng };
    setHomeLocation(home);
    localStorage.setItem('homeLocation', JSON.stringify(home));
    showToast(`Localização definida: ${city}, ${state}`);
  };

  const p1Name = profiles.find(p => p.id === 'p1')?.name || 'Aleph';
  const p2Name = profiles.find(p => p.id === 'p2')?.name || 'Alice';

  // Sort by most recent visit or creation
  const sortedTravels = [...travels].sort((a, b) => {
    const dateA = a.visitDate || a.createdAt;
    const dateB = b.visitDate || b.createdAt;
    return dateB.localeCompare(dateA);
  });

  const filteredTravels = sortedTravels.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const visitedCount = travels.filter((t) => t.status === 'visited').length;
  const wishlistCount = travels.filter((t) => t.status === 'wishlist' || t.status === 'food_wishlist').length;
  const totalKm = travels.reduce((sum, t) => sum + (t.distanceKm || 0), 0);
  const statesUnlocked = new Set(travels.filter(t => t.status === 'visited').map(t => t.state)).size;

  if (loading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>Carregando aventuras...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>
          <FaPlaneDeparture size={18} />
          <span>Nossas Viagens</span>
        </h1>
        <div className="header-stats">
          <div className="header-profiles">
            {profiles.map(p => (
              <button key={p.id} className="header-avatar-btn" onClick={() => setEditProfile(p)} title={`Editar ${p.name}`}>
                {p.photo ? <img src={p.photo} alt={p.name} className="header-avatar-img" /> : <FaUser size={12} />}
              </button>
            ))}
          </div>
          <div className="stat-item highlight">
            <FaCheck size={10} />
            {visitedCount} desbloqueadas
          </div>
          <div className="stat-item">
            <div className="stat-dot visited" />
            {statesUnlocked} estados
          </div>
          <div className="stat-item">
            <div className="stat-dot wishlist" />
            {wishlistCount} desejos
          </div>
          {totalKm > 0 && (
            <div className="stat-item">
              <FaRoute size={10} /> {totalKm.toLocaleString('pt-BR')} km
            </div>
          )}
        </div>
      </header>

      <div className="app-body">
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-handle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <span className="sidebar-handle-bar" />
          </div>
          <button className="sidebar-toggle-desktop" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title={sidebarCollapsed ? 'Expandir' : 'Minimizar'}>
            {sidebarCollapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
          </button>
          {/* Sidebar tabs */}
          <div className="sidebar-tabs">
            <button className={`sidebar-tab ${sidebarTab === 'list' ? 'active' : ''}`} onClick={() => setSidebarTab('list')}>
              <FaMap size={14} /> Viagens
            </button>
            <button className={`sidebar-tab ${sidebarTab === 'stats' ? 'active' : ''}`} onClick={() => setSidebarTab('stats')}>
              <FaChartBar size={14} /> Conquistas
            </button>
            <button className={`sidebar-tab ${sidebarTab === 'vehicles' ? 'active' : ''}`} onClick={() => setSidebarTab('vehicles')}>
              <FaCar size={14} /> Veículos
            </button>
          </div>

          {sidebarTab === 'list' && (
            <>
              <div className="sidebar-header">
                <div className="sidebar-filters">
                  <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    Todos ({travels.length})
                  </button>
                  <button className={`filter-btn ${filter === 'visited' ? 'active-visited' : ''}`} onClick={() => setFilter('visited')}>
                    <FaCheck size={10} /> Visitados
                  </button>
                  <button className={`filter-btn ${filter === 'wishlist' ? 'active-wishlist' : ''}`} onClick={() => setFilter('wishlist')}>
                    <FaStar size={10} /> Desejos
                  </button>
                  <button className={`filter-btn ${filter === 'food_wishlist' ? 'active-food' : ''}`} onClick={() => setFilter('food_wishlist')}>
                    <FaUtensils size={10} /> Comer
                  </button>
                  <button className={`filter-btn ${filter === 'date' ? 'active-date' : ''}`} onClick={() => setFilter('date')}>
                    <FaHeart size={10} /> Dates
                  </button>
                </div>
              </div>

              <div className="sidebar-list">
                {filteredTravels.length === 0 ? (
                  <div className="empty-state">
                    <FaMap size={32} />
                    <p>
                      {filter === 'all'
                        ? 'Nenhuma viagem ainda. Clique no + e comecem a aventura!'
                        : `Nenhum registro aqui ainda.`}
                    </p>
                  </div>
                ) : (
                  filteredTravels.map((travel) => (
                    <TravelCard
                      key={travel.id}
                      travel={travel}
                      onClick={() => handleTravelClick(travel)}
                      onDelete={handleDelete}
                      vehicles={vehicles}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {sidebarTab === 'vehicles' && (
            <div className="sidebar-list">
              <div className="vehicles-panel">
                <h3 className="stats-title"><FaCar size={16} /> Nossos Veículos</h3>
                {vehicles.length === 0 ? (
                  <div className="empty-state">
                    <FaCar size={32} />
                    <p>Nenhum veículo cadastrado ainda.</p>
                  </div>
                ) : (
                  <div className="vehicle-list-full">
                    {vehicles.map(v => (
                      <div key={v.id} className="vehicle-card-full">
                        {v.photo && <img src={v.photo} alt={v.name} className="vehicle-card-full-img" />}
                        <div className="vehicle-card-full-info">
                          <span className="vehicle-card-name">{v.name}</span>
                          <span className="vehicle-card-type">{v.type}</span>
                          {v.acquiredDate && <span className="vehicle-card-date">Desde {new Date(v.acquiredDate + 'T12:00').toLocaleDateString('pt-BR')}</span>}
                        </div>
                        <div className="vehicle-card-actions">
                          <button className="btn-icon-sm" onClick={() => { setEditVehicle(v); setShowVehicleForm(true); }} title="Editar"><FaPencilAlt size={12} /></button>
                          <button className="btn-icon-sm" onClick={() => { if (confirm('Remover este veículo?')) handleDeleteVehicle(v.id); }} title="Remover"><FaTrash size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="add-food-btn" onClick={() => setShowVehicleForm(true)} style={{ marginTop: 12 }}>
                  <FaPlus size={12} /> Cadastrar veículo
                </button>
              </div>
            </div>
          )}

          {sidebarTab === 'stats' && (
            <div className="sidebar-list">
              <StatsPanel
                travels={travels}
                vehicles={vehicles}
                onDeleteVehicle={handleDeleteVehicle}
                discardedCities={discardedCities}
                onDiscardCity={handleDiscardCity}
                onUndiscardCity={handleUndiscardCity}
                missions={missions}
                onAddMission={handleAddMission}
                onDeleteMission={handleDeleteMission}
                stateImages={stateImages}
                onStateImageUpload={handleStateImageUpload}
                homeLocation={homeLocation}
                onSetHomeLocation={handleSetHomeLocation}
              />
            </div>
          )}
        </aside>

        <div className="map-container">
          <MapView travels={travels} onTravelClick={handleTravelClick} selectedTravel={selectedTravel} homeLocation={homeLocation} />
          <button
            className="add-btn"
            onClick={() => { setEditTravel(null); setShowForm(true); }}
            title="Adicionar viagem"
          >
            <FaPlus size={22} />
          </button>
        </div>
      </div>

      {showForm && (
        <TravelForm
          onClose={() => { setShowForm(false); setEditTravel(null); }}
          onSave={handleSave}
          editTravel={editTravel}
          vehicles={vehicles}
          onAddVehicle={() => setShowVehicleForm(true)}
          profiles={profiles}
        />
      )}

      {showVehicleForm && (
        <VehicleForm
          onClose={() => { setShowVehicleForm(false); setEditVehicle(null); }}
          onSave={handleSaveVehicle}
          editVehicle={editVehicle}
        />
      )}

      {detailTravel && (
        <TravelDetail
          travel={detailTravel}
          onClose={() => setDetailTravel(null)}
          onEdit={handleEditFromDetail}
          onUpdate={handleUpdateTravel}
          vehicles={vehicles}
          profiles={profiles}
        />
      )}

      {celebration && (
        <Celebration
          message={celebration.message}
          icon={celebration.icon}
          onDone={handleCelebrationDone}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
      {missionToast && <div className="toast-mission"><FaStar size={12} className="toast-mission-icon" /> {missionToast}</div>}

      {editProfile && (
        <ProfileEditor
          profile={editProfile}
          onSave={handleSaveProfile}
          onClose={() => setEditProfile(null)}
        />
      )}
    </div>
  );
}
