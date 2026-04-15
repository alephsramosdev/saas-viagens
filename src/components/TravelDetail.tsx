'use client';

import { useState } from 'react';
import { Travel, Vehicle, TRANSPORT_LABELS, ACTIVITY_OPTIONS, TransportType, HotelStay, RestaurantVisit, CityVisit, UserProfile } from '@/types/travel';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { FaCar, FaMotorcycle, FaBus, FaPlane, FaTrain, FaBicycle, FaWalking, FaRocket, FaUmbrellaBeach, FaHiking, FaUtensils, FaLandmark, FaShoppingBag, FaParachuteBox, FaHeart, FaSpa, FaMoon, FaLeaf, FaChurch, FaFutbol, FaCamera, FaWater, FaPizzaSlice, FaFilm, FaGlassCheers, FaMusic, FaCoffee, FaSwimmingPool, FaTree, FaPaintBrush, FaStar, FaMapMarkerAlt, FaClock, FaRoute, FaTimes, FaPencilAlt, FaCalendarAlt, FaCheck, FaHotel, FaUser, FaCompass, FaImages, FaPlus, FaWineGlassAlt, FaHamburger, FaIceCream, FaAppleAlt, FaConciergeBell } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const TRANSPORT_ICON_MAP: Record<TransportType, React.ReactNode> = {
    carro: <FaCar />, moto: <FaMotorcycle />, onibus: <FaBus />, aviao: <FaPlane />,
    trem: <FaTrain />, bicicleta: <FaBicycle />, a_pe: <FaWalking />, outro: <FaRocket />,
};

const ACTIVITY_ICON_MAP: Record<string, React.ReactNode> = {
    FaUmbrellaBeach: <FaUmbrellaBeach />, FaHiking: <FaHiking />, FaUtensils: <FaUtensils />,
    FaLandmark: <FaLandmark />, FaShoppingBag: <FaShoppingBag />, FaParachuteBox: <FaParachuteBox />,
    FaHeart: <FaHeart />, FaSpa: <FaSpa />, FaMoon: <FaMoon />, FaLeaf: <FaLeaf />,
    FaChurch: <FaChurch />, FaFutbol: <FaFutbol />, FaCamera: <FaCamera />, FaWater: <FaWater />,
    FaPizzaSlice: <FaPizzaSlice />, FaFilm: <FaFilm />, FaGlassCheers: <FaGlassCheers />,
    FaMusic: <FaMusic />, FaCoffee: <FaCoffee />, FaSwimmingPool: <FaSwimmingPool />,
    FaTree: <FaTree />, FaPaintBrush: <FaPaintBrush />,
    FaWineGlassAlt: <FaWineGlassAlt />, FaHamburger: <FaHamburger />,
    FaIceCream: <FaIceCream />, FaAppleAlt: <FaAppleAlt />, FaConciergeBell: <FaConciergeBell />,
};

interface TravelDetailProps {
    travel: Travel;
    onClose: () => void;
    onEdit: (travel: Travel) => void;
    onUpdate: (travel: Travel) => void;
    vehicles: Vehicle[];
    profiles: UserProfile[];
}

export default function TravelDetail({ travel, onClose, onEdit, onUpdate, vehicles, profiles }: TravelDetailProps) {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [showAddVisit, setShowAddVisit] = useState(false);
    const [newVisitDate, setNewVisitDate] = useState('');
    const [newVisitP1, setNewVisitP1] = useState(0);
    const [newVisitP2, setNewVisitP2] = useState(0);
    const [newVisitOpinion, setNewVisitOpinion] = useState('');

    const allPhotos = [travel.coverPhoto, ...travel.photos].filter(Boolean);
    const vehicle = vehicles.find(v => v.id === travel.vehicleId);
    const p1Name = profiles.find(p => p.id === 'p1')?.name || 'Aleph';
    const p2Name = profiles.find(p => p.id === 'p2')?.name || 'Alice';
    const p1Photo = profiles.find(p => p.id === 'p1')?.photo || '';
    const p2Photo = profiles.find(p => p.id === 'p2')?.photo || '';
    const avgRating = (travel.ratingP1 > 0 || travel.ratingP2 > 0)
        ? ((travel.ratingP1 + travel.ratingP2) / ((travel.ratingP1 > 0 && travel.ratingP2 > 0) ? 2 : 1))
        : travel.rating;
    const visitCount = 1 + (travel.visits?.length || 0);

    const handleAddVisit = () => {
        if (!newVisitDate) return;
        const visit: CityVisit = {
            id: uuidv4(),
            date: newVisitDate,
            ratingP1: newVisitP1,
            ratingP2: newVisitP2,
            opinion: newVisitOpinion,
            photos: [],
            highlights: '',
            hotels: [],
            restaurants: [],
        };
        const updated = { ...travel, visits: [...(travel.visits || []), visit] };
        onUpdate(updated);
        setShowAddVisit(false);
        setNewVisitDate('');
        setNewVisitP1(0);
        setNewVisitP2(0);
        setNewVisitOpinion('');
    };

    const renderStars = (value: number, max: number = 5) => (
        <div className="stars-inline">
            {Array.from({ length: max + 1 }, (_, i) => i).map(s =>
                s === 0 ? null : <FaStar key={s} size={12} color={s <= value ? '#fbbf24' : '#4a5568'} />
            )}
        </div>
    );

    const renderRatingAvg = (p1: number, p2: number) => {
        const avg = (p1 > 0 || p2 > 0) ? ((p1 + p2) / ((p1 > 0 && p2 > 0) ? 2 : 1)) : 0;
        return avg > 0 ? <span className="rating-avg-badge"><FaStar size={10} color="#fbbf24" /> {avg.toFixed(1)}</span> : null;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-detail" onClick={(e) => e.stopPropagation()}>
                {/* Gallery Swiper */}
                {allPhotos.length > 0 && (
                    <div className="detail-gallery-swiper">
                        <Swiper
                            modules={[Pagination, Thumbs]}
                            pagination={{ clickable: true }}
                            thumbs={thumbsSwiper ? { swiper: thumbsSwiper } : undefined}
                            spaceBetween={0}
                            slidesPerView={1}
                            className="detail-swiper-main"
                        >
                            {allPhotos.map((photo, i) => (
                                <SwiperSlide key={i}>
                                    <img src={photo} alt={`Foto ${i + 1}`} className="detail-swiper-img" />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        {allPhotos.length > 1 && (
                            <Swiper
                                modules={[Thumbs]}
                                onSwiper={setThumbsSwiper}
                                spaceBetween={6}
                                slidesPerView={Math.min(allPhotos.length, 6)}
                                watchSlidesProgress
                                className="detail-swiper-thumbs"
                            >
                                {allPhotos.map((photo, i) => (
                                    <SwiperSlide key={i}>
                                        <img src={photo} alt={`Thumb ${i + 1}`} className="detail-swiper-thumb-img" />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        )}
                    </div>
                )}

                <div className="detail-content">
                    {/* Header */}
                    <div className="detail-header">
                        <div>
                            <h2 className="detail-city">{travel.city}</h2>
                            <span className="detail-state"><FaMapMarkerAlt size={10} /> {travel.state}</span>
                        </div>
                        <div className="detail-actions">
                            <button className="btn-icon" onClick={() => onEdit(travel)}><FaPencilAlt size={14} /></button>
                            <button className="btn-icon" onClick={onClose}><FaTimes size={16} /></button>
                        </div>
                    </div>

                    {/* Status + Rating */}
                    <div className="detail-badges">
                        <span className={`detail-status-badge ${travel.status}`}>
                            {travel.status === 'visited' ? <><FaCheck size={10} /> Visitada</> : travel.status === 'food_wishlist' ? <><FaUtensils size={10} /> Comer</> : travel.status === 'date' ? <><FaHeart size={10} /> Date</> : <><FaStar size={10} /> Desejo</>}
                        </span>
                        {avgRating > 0 && (
                            <span className="detail-rating-badge"><FaStar size={10} color="#fbbf24" /> {avgRating.toFixed(1)}</span>
                        )}
                        {visitCount > 1 && (
                            <span className="detail-visit-badge"><FaImages size={10} /> {visitCount}x visitada</span>
                        )}
                        {travel.wouldReturn && travel.status === 'visited' && (
                            <span className="detail-return-badge"><FaHeart size={10} /> Voltaríamos</span>
                        )}
                    </div>

                    {/* Split Ratings */}
                    {(travel.ratingP1 > 0 || travel.ratingP2 > 0) && (
                        <div className="detail-split-rating">
                            <div className="split-person">
                                {p1Photo ? <img src={p1Photo} alt={p1Name} className="split-avatar" /> : <FaUser size={10} />}
                                {p1Name}: {renderStars(travel.ratingP1)}
                            </div>
                            <div className="split-person">
                                {p2Photo ? <img src={p2Photo} alt={p2Name} className="split-avatar" /> : <FaUser size={10} />}
                                {p2Name}: {renderStars(travel.ratingP2)}
                            </div>
                        </div>
                    )}

                    {/* Date + Distance */}
                    {travel.visitDate && (
                        <div className="detail-meta-row">
                            <span><FaCalendarAlt size={10} /> {new Date(travel.visitDate + 'T12:00').toLocaleDateString('pt-BR')}</span>
                            {travel.distanceKm > 0 && <span><FaRoute size={10} /> {travel.distanceKm} km</span>}
                            {(travel.travelTimeHours > 0 || travel.travelTimeMinutes > 0) && (
                                <span><FaClock size={10} /> {travel.travelTimeHours}h{travel.travelTimeMinutes > 0 ? `${travel.travelTimeMinutes}min` : ''}</span>
                            )}
                        </div>
                    )}

                    {/* Route Timeline */}
                    {travel.status === 'visited' && (travel.originCity || (travel.stops && travel.stops.length > 0)) && (
                        <div className="detail-timeline">
                            <h4><FaRoute size={12} /> Trajeto</h4>
                            <div className="timeline-vertical">
                                {travel.originCity && (
                                    <div className="tl-node">
                                        <div className="tl-dot origin-dot"><FaCompass size={10} /></div>
                                        <div className="tl-info">
                                            <span className="tl-city">{travel.originCity}</span>
                                            <span className="tl-tag">Partida</span>
                                        </div>
                                    </div>
                                )}
                                {travel.stops?.map((stop, i) => (
                                    <div key={i} className="tl-node">
                                        <div className="tl-dot stop-dot">{i + 1}</div>
                                        <div className="tl-info">
                                            <span className="tl-city">{stop.city}{stop.state ? `, ${stop.state}` : ''}</span>
                                            {stop.note && <span className="tl-note">{stop.note}</span>}
                                            <span className="tl-tag">Parada</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="tl-node">
                                    <div className="tl-dot dest-dot"><FaMapMarkerAlt size={10} /></div>
                                    <div className="tl-info">
                                        <span className="tl-city">{travel.city}, {travel.state}</span>
                                        <span className="tl-tag">Destino</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transport */}
                    {travel.status === 'visited' && (
                        <div className="detail-transport">
                            <span className="transport-badge">{TRANSPORT_ICON_MAP[travel.transportType]} {TRANSPORT_LABELS[travel.transportType]}</span>
                            {vehicle && <span className="vehicle-badge">{vehicle.name}</span>}
                        </div>
                    )}

                    {/* Activities */}
                    {travel.activities.length > 0 && (
                        <div className="detail-activities">
                            {ACTIVITY_OPTIONS.filter(a => travel.activities.includes(a.id)).map(act => (
                                <span key={act.id} className="activity-tag" style={{ background: act.color + '22', color: act.color }}>
                                    {ACTIVITY_ICON_MAP[act.icon]} {act.label}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Hotels */}
                    {travel.hotels && travel.hotels.length > 0 && (
                        <div className="detail-section">
                            <h4><FaHotel size={12} /> Hospedagem</h4>
                            {travel.hotels.map((h: HotelStay, i: number) => (
                                <div key={i} className="detail-hotel-card">
                                    <div className="hotel-card-name">{h.name}</div>
                                    <div className="hotel-card-ratings">
                                        <span>{p1Photo ? <img src={p1Photo} alt={p1Name} className="rating-avatar-xs" /> : <FaUser size={8} />} {p1Name}: {renderStars(h.ratingP1)}</span>
                                        <span>{p2Photo ? <img src={p2Photo} alt={p2Name} className="rating-avatar-xs" /> : <FaUser size={8} />} {p2Name}: {renderStars(h.ratingP2)}</span>
                                        {renderRatingAvg(h.ratingP1, h.ratingP2)}
                                    </div>
                                    {h.notes && <p className="hotel-card-note">{h.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Restaurants */}
                    {travel.restaurants && travel.restaurants.length > 0 && (
                        <div className="detail-section">
                            <h4><FaUtensils size={12} /> Onde comemos</h4>
                            {travel.restaurants.map((r: RestaurantVisit, i: number) => (
                                <div key={i} className="detail-hotel-card">
                                    <div className="hotel-card-name">{r.name}</div>
                                    {r.dish && <div className="hotel-card-dish">{r.dish}</div>}
                                    <div className="hotel-card-ratings">
                                        <span>{p1Photo ? <img src={p1Photo} alt={p1Name} className="rating-avatar-xs" /> : <FaUser size={8} />} {p1Name}: {renderStars(r.ratingP1)}</span>
                                        <span>{p2Photo ? <img src={p2Photo} alt={p2Name} className="rating-avatar-xs" /> : <FaUser size={8} />} {p2Name}: {renderStars(r.ratingP2)}</span>
                                        {renderRatingAvg(r.ratingP1, r.ratingP2)}
                                    </div>
                                    {r.notes && <p className="hotel-card-note">{r.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Opinion */}
                    {travel.opinion && (
                        <div className="detail-section">
                            <h4><FaPencilAlt size={12} /> Nossa opinião</h4>
                            <p className="detail-text">{travel.opinion}</p>
                        </div>
                    )}

                    {travel.highlights && (
                        <div className="detail-section">
                            <h4><FaStar size={12} /> Melhores momentos</h4>
                            <p className="detail-text">{travel.highlights}</p>
                        </div>
                    )}

                    {travel.tips && (
                        <div className="detail-section">
                            <h4><FaCompass size={12} /> Dicas</h4>
                            <p className="detail-text">{travel.tips}</p>
                        </div>
                    )}

                    {/* Previous visits */}
                    {travel.visits && travel.visits.length > 0 && (
                        <div className="detail-section">
                            <h4><FaCalendarAlt size={12} /> Visitas anteriores</h4>
                            {travel.visits.map((v: CityVisit) => (
                                <div key={v.id} className="visit-card">
                                    <div className="visit-card-header">
                                        <span><FaCalendarAlt size={10} /> {new Date(v.date + 'T12:00').toLocaleDateString('pt-BR')}</span>
                                        {(v.ratingP1 > 0 || v.ratingP2 > 0) && renderRatingAvg(v.ratingP1, v.ratingP2)}
                                    </div>
                                    {v.opinion && <p className="visit-card-text">{v.opinion}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add new visit */}
                    {travel.status === 'visited' && (
                        <div className="detail-section">
                            {showAddVisit ? (
                                <div className="add-visit-form">
                                    <h4><FaPlus size={10} /> Registrar nova visita</h4>
                                    <input className="form-input" type="date" value={newVisitDate} onChange={e => setNewVisitDate(e.target.value)} />
                                    <div className="dual-rating compact">
                                        <div className="rating-inline">
                                            <span className="rating-label-sm">{p1Photo ? <img src={p1Photo} alt={p1Name} className="rating-avatar-xs" /> : <FaUser size={8} />} {p1Name}</span>
                                            {[0, 1, 2, 3, 4, 5].map(s => (
                                                <button key={s} type="button" className="rating-star-xs" onClick={() => setNewVisitP1(s)}>
                                                    {s === 0 ? <span className="zero-xs">0</span> : <FaStar size={12} color={s <= newVisitP1 ? '#fbbf24' : '#4a5568'} />}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="rating-inline">
                                            <span className="rating-label-sm">{p2Photo ? <img src={p2Photo} alt={p2Name} className="rating-avatar-xs" /> : <FaUser size={8} />} {p2Name}</span>
                                            {[0, 1, 2, 3, 4, 5].map(s => (
                                                <button key={s} type="button" className="rating-star-xs" onClick={() => setNewVisitP2(s)}>
                                                    {s === 0 ? <span className="zero-xs">0</span> : <FaStar size={12} color={s <= newVisitP2 ? '#fbbf24' : '#4a5568'} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea className="form-textarea" placeholder="Como foi essa visita?" value={newVisitOpinion} onChange={e => setNewVisitOpinion(e.target.value)} rows={2} />
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-primary" style={{ fontSize: '0.75rem' }} onClick={handleAddVisit}>Salvar visita</button>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => setShowAddVisit(false)}>Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <button className="add-food-btn" onClick={() => setShowAddVisit(true)}>
                                    <FaPlus size={10} /> Registrar nova visita a {travel.city}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Budget */}
                    {travel.budget > 0 && (
                        <div className="detail-section">
                            <h4>Meta financeira</h4>
                            <div className="budget-bar"><div className="budget-fill" style={{ width: `${Math.min((travel.savedAmount / travel.budget) * 100, 100)}%` }} /></div>
                            <span className="detail-text">R$ {travel.savedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / R$ {travel.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
