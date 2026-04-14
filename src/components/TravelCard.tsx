'use client';

import { Travel, TRANSPORT_LABELS, ACTIVITY_OPTIONS, Vehicle } from '@/types/travel';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaRoute, FaTrash, FaHeart, FaUtensils, FaCheck, FaCamera, FaCar, FaMotorcycle, FaBus, FaPlane, FaTrain, FaBicycle, FaWalking, FaRocket, FaUmbrellaBeach, FaHiking, FaLandmark, FaShoppingBag, FaParachuteBox, FaSpa, FaMoon, FaLeaf, FaChurch, FaFutbol, FaWater, FaPizzaSlice, FaFilm, FaGlassCheers, FaMusic, FaCoffee, FaSwimmingPool, FaTree, FaPaintBrush } from 'react-icons/fa';
import type { TransportType } from '@/types/travel';

const TRANSPORT_ICON_MAP: Record<TransportType, React.ReactNode> = {
    carro: <FaCar size={11} />,
    moto: <FaMotorcycle size={11} />,
    onibus: <FaBus size={11} />,
    aviao: <FaPlane size={11} />,
    trem: <FaTrain size={11} />,
    bicicleta: <FaBicycle size={11} />,
    a_pe: <FaWalking size={11} />,
    outro: <FaRocket size={11} />,
};

const ACTIVITY_ICON_MAP: Record<string, React.ReactNode> = {
    FaUmbrellaBeach: <FaUmbrellaBeach size={10} />, FaHiking: <FaHiking size={10} />, FaUtensils: <FaUtensils size={10} />,
    FaLandmark: <FaLandmark size={10} />, FaShoppingBag: <FaShoppingBag size={10} />, FaParachuteBox: <FaParachuteBox size={10} />,
    FaHeart: <FaHeart size={10} />, FaSpa: <FaSpa size={10} />, FaMoon: <FaMoon size={10} />, FaLeaf: <FaLeaf size={10} />,
    FaChurch: <FaChurch size={10} />, FaFutbol: <FaFutbol size={10} />, FaCamera: <FaCamera size={10} />, FaWater: <FaWater size={10} />,
    FaPizzaSlice: <FaPizzaSlice size={10} />, FaFilm: <FaFilm size={10} />, FaGlassCheers: <FaGlassCheers size={10} />,
    FaMusic: <FaMusic size={10} />, FaCoffee: <FaCoffee size={10} />, FaSwimmingPool: <FaSwimmingPool size={10} />,
    FaTree: <FaTree size={10} />, FaPaintBrush: <FaPaintBrush size={10} />,
};

interface TravelCardProps {
    travel: Travel;
    onClick: () => void;
    onDelete: (id: string) => void;
    vehicles: Vehicle[];
}

export default function TravelCard({ travel, onClick, onDelete, vehicles }: TravelCardProps) {
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTravelTime = (hours: number, minutes: number) => {
        const parts = [];
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}min`);
        return parts.join(' ') || '';
    };

    const vehicle = vehicles.find(v => v.id === travel.vehicleId);
    const budgetPercent = travel.budget > 0 ? Math.min(Math.round((travel.savedAmount / travel.budget) * 100), 100) : 0;
    const displayPhoto = travel.coverPhoto || (travel.photos && travel.photos.length > 0 ? travel.photos[0] : '');
    const avgRating = (travel.ratingP1 > 0 || travel.ratingP2 > 0)
        ? ((travel.ratingP1 + travel.ratingP2) / ((travel.ratingP1 > 0 && travel.ratingP2 > 0) ? 2 : 1))
        : travel.rating;
    const visitCount = 1 + (travel.visits?.length || 0);

    return (
        <div className={`travel-card ${travel.wouldReturn ? 'would-return' : ''} status-${travel.status}`} onClick={onClick}>
            {displayPhoto && (
                <div className="card-cover">
                    <img src={displayPhoto} alt={travel.city} />
                    <div className="card-cover-overlay" />
                </div>
            )}

            <div className="travel-card-content">
                <div className="travel-card-actions">
                    <button className="card-action-btn" title="Excluir" onClick={(e) => { e.stopPropagation(); onDelete(travel.id); }}>
                        <FaTrash size={12} />
                    </button>
                </div>

                <div className="travel-card-header">
                    <div>
                        <div className="travel-card-title">
                            {travel.city}
                            {travel.wouldReturn && travel.status === 'visited' && <FaHeart size={12} className="heart-icon" color="#f43f5e" />}
                        </div>
                        <div className="travel-card-state"><FaMapMarkerAlt size={10} /> {travel.state}</div>
                    </div>
                    <span className={`travel-card-badge ${travel.status}`}>
                        {travel.status === 'visited' ? <><FaCheck size={9} /> Visitado</> : travel.status === 'food_wishlist' ? <><FaUtensils size={9} /> Comer</> : travel.status === 'date' ? <><FaHeart size={9} /> Date</> : <><FaStar size={9} /> Desejo</>}
                    </span>
                </div>

                {avgRating > 0 && (
                    <div className="travel-card-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar key={star} size={12} color={star <= Math.round(avgRating) ? '#fbbf24' : '#4a5568'} />
                        ))}
                        {visitCount > 1 && <span className="visit-count-badge">{visitCount}x</span>}
                    </div>
                )}

                {travel.activities && travel.activities.length > 0 && (
                    <div className="card-activities">
                        {travel.activities.slice(0, 4).map(actId => {
                            const act = ACTIVITY_OPTIONS.find(a => a.id === actId);
                            return act ? (
                                <span key={actId} className="card-activity-chip" style={{ borderColor: act.color + '66', color: act.color }}>
                                    {ACTIVITY_ICON_MAP[act.icon]} {act.label}
                                </span>
                            ) : null;
                        })}
                        {travel.activities.length > 4 && <span className="card-activity-more">+{travel.activities.length - 4}</span>}
                    </div>
                )}

                {/* Stops indicator */}
                {travel.stops && travel.stops.length > 0 && (
                    <div className="card-stops-indicator">
                        <FaRoute size={10} /> {travel.stops.length} parada{travel.stops.length > 1 ? 's' : ''}
                    </div>
                )}

                <div className="travel-card-info">
                    {travel.visitDate && (
                        <span className="travel-card-info-item"><FaCalendarAlt size={10} />{formatDate(travel.visitDate)}</span>
                    )}
                    {travel.distanceKm > 0 && (
                        <span className="travel-card-info-item"><FaRoute size={10} />{travel.distanceKm} km</span>
                    )}
                    {(travel.travelTimeHours > 0 || travel.travelTimeMinutes > 0) && (
                        <span className="travel-card-info-item"><FaClock size={10} />{formatTravelTime(travel.travelTimeHours, travel.travelTimeMinutes)}</span>
                    )}
                    {travel.transportType && (
                        <span className="travel-card-info-item">{TRANSPORT_ICON_MAP[travel.transportType]}{vehicle ? ` ${vehicle.name}` : ` ${TRANSPORT_LABELS[travel.transportType]}`}</span>
                    )}
                    {travel.foodWishes && travel.foodWishes.length > 0 && (
                        <span className="travel-card-info-item"><FaUtensils size={10} />{travel.foodWishes.length}</span>
                    )}
                    {((travel.photos && travel.photos.length > 0) || travel.coverPhoto) && (
                        <span className="travel-card-info-item"><FaCamera size={10} /> {(travel.photos?.length || 0) + (travel.coverPhoto ? 1 : 0)}</span>
                    )}
                </div>

                {/* Budget bar for wishlist */}
                {(travel.status === 'wishlist' || travel.status === 'food_wishlist') && travel.budget > 0 && (
                    <div className="card-budget">
                        <div className="card-budget-bar">
                            <div className="card-budget-fill" style={{ width: `${budgetPercent}%` }} />
                        </div>
                        <span className="card-budget-text">{budgetPercent}% — R$ {travel.savedAmount?.toLocaleString('pt-BR')} / {travel.budget.toLocaleString('pt-BR')}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
