'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Travel, TravelStatus, TransportType, TRANSPORT_LABELS, ACTIVITY_OPTIONS, FoodWish, Vehicle, TripStop, HotelStay, RestaurantVisit, BRAZILIAN_STATES, UserProfile } from '@/types/travel';
import { fetchCitiesByState, searchCityCoords } from '@/lib/ibge';
import { v4 as uuidv4 } from 'uuid';
import {
    FaCar, FaMotorcycle, FaBus, FaPlane, FaTrain, FaBicycle, FaWalking, FaRocket,
    FaUmbrellaBeach, FaHiking, FaUtensils, FaLandmark, FaShoppingBag, FaParachuteBox,
    FaHeart, FaSpa, FaMoon, FaLeaf, FaChurch, FaFutbol, FaCamera, FaWater,
    FaPizzaSlice, FaFilm, FaGlassCheers, FaMusic, FaCoffee, FaSwimmingPool, FaTree, FaPaintBrush,
    FaPlus, FaTrash, FaTimes, FaStar, FaMapMarkerAlt, FaCompass, FaClock, FaRoute,
    FaImages, FaMoneyBillWave, FaCalendarAlt, FaPencilAlt, FaChevronRight, FaChevronLeft,
    FaCheck, FaHotel, FaUser, FaUserFriends
} from 'react-icons/fa';

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
};

interface TravelFormProps {
    onClose: () => void;
    onSave: (travel: Travel) => void | Promise<void>;
    editTravel?: Travel | null;
    vehicles: Vehicle[];
    onAddVehicle: () => void;
    profiles: UserProfile[];
}

export default function TravelForm({ onClose, onSave, editTravel, vehicles, onAddVehicle, profiles }: TravelFormProps) {
    const [step, setStep] = useState(0);
    const [city, setCity] = useState(editTravel?.city || '');
    const [state, setState] = useState(editTravel?.state || '');
    const [status, setStatus] = useState<TravelStatus>(editTravel?.status || 'visited');
    const [ratingP1, setRatingP1] = useState(editTravel?.ratingP1 || 0);
    const [ratingP2, setRatingP2] = useState(editTravel?.ratingP2 || 0);
    const [opinion, setOpinion] = useState(editTravel?.opinion || '');
    const [coverPhoto, setCoverPhoto] = useState(editTravel?.coverPhoto || '');
    const [photos, setPhotos] = useState<string[]>(editTravel?.photos || []);
    const [visitDate, setVisitDate] = useState(editTravel?.visitDate || '');
    const [originCity, setOriginCity] = useState(editTravel?.originCity || '');
    const [originState, setOriginState] = useState(editTravel?.originState || '');
    const [stops, setStops] = useState<TripStop[]>(editTravel?.stops || []);
    const [travelTimeHours, setTravelTimeHours] = useState(editTravel?.travelTimeHours || 0);
    const [travelTimeMinutes, setTravelTimeMinutes] = useState(editTravel?.travelTimeMinutes || 0);
    const [distanceKm, setDistanceKm] = useState(editTravel?.distanceKm || 0);
    const [transportType, setTransportType] = useState<TransportType>(editTravel?.transportType || 'carro');
    const [vehicleId, setVehicleId] = useState(editTravel?.vehicleId || '');
    const [wouldReturn, setWouldReturn] = useState(editTravel?.wouldReturn ?? true);
    const [activities, setActivities] = useState<string[]>(editTravel?.activities || []);
    const [foodWishes, setFoodWishes] = useState<FoodWish[]>(editTravel?.foodWishes || []);
    const [hotels, setHotels] = useState<HotelStay[]>(editTravel?.hotels || []);
    const [restaurants, setRestaurants] = useState<RestaurantVisit[]>(editTravel?.restaurants || []);
    const [budget, setBudget] = useState(editTravel?.budget || 0);
    const [savedAmount, setSavedAmount] = useState(editTravel?.savedAmount || 0);
    const [highlights, setHighlights] = useState(editTravel?.highlights || '');
    const [tips, setTips] = useState(editTravel?.tips || '');
    const [saving, setSaving] = useState(false);
    const [hoverP1, setHoverP1] = useState(0);
    const [hoverP2, setHoverP2] = useState(0);

    const p1Name = profiles.find(p => p.id === 'p1')?.name || 'Aleph';
    const p2Name = profiles.find(p => p.id === 'p2')?.name || 'Alice';
    const p1Photo = profiles.find(p => p.id === 'p1')?.photo || '';
    const p2Photo = profiles.find(p => p.id === 'p2')?.photo || '';

    // IBGE cities
    const [cities, setCities] = useState<string[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [citySearch, setCitySearch] = useState('');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [originCities, setOriginCities] = useState<string[]>([]);
    const [originCitySearch, setOriginCitySearch] = useState('');
    const [showOriginDropdown, setShowOriginDropdown] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // Steps configuration per status
    const getStepConfig = () => {
        if (status === 'visited') return [
            { icon: <FaMapMarkerAlt />, label: 'Destino' },
            { icon: <FaRoute />, label: 'Trajeto' },
            { icon: <FaStar />, label: 'Avaliação' },
            { icon: <FaHotel />, label: 'Hospedagem' },
            { icon: <FaImages />, label: 'Galeria' },
            { icon: <FaPencilAlt />, label: 'Memórias' },
        ];
        if (status === 'date') return [
            { icon: <FaHeart />, label: 'Detalhes' },
            { icon: <FaStar />, label: 'Avaliação' },
            { icon: <FaImages />, label: 'Galeria' },
        ];
        return [
            { icon: <FaMapMarkerAlt />, label: 'Destino' },
            { icon: <FaCalendarAlt />, label: 'Planejamento' },
            { icon: <FaMoneyBillWave />, label: 'Orçamento' },
        ];
    };

    const stepLabels = getStepConfig();
    const totalSteps = stepLabels.length;

    const loadCities = useCallback(async (uf: string) => {
        if (!uf) return;
        setLoadingCities(true);
        const data = await fetchCitiesByState(uf);
        setCities(data.map(c => c.nome));
        setLoadingCities(false);
    }, []);

    useEffect(() => {
        const stateObj = BRAZILIAN_STATES.find(s => s.name === state);
        if (stateObj) loadCities(stateObj.uf);
    }, [state, loadCities]);

    const loadOriginCities = useCallback(async (uf: string) => {
        if (!uf) return;
        const data = await fetchCitiesByState(uf);
        setOriginCities(data.map(c => c.nome));
    }, []);

    useEffect(() => {
        if (originState) loadOriginCities(originState);
    }, [originState, loadOriginCities]);

    const filteredCities = cities.filter(c =>
        c.toLowerCase().includes((citySearch || city).toLowerCase())
    ).slice(0, 20);

    const filteredOriginCities = originCities.filter(c =>
        c.toLowerCase().includes((originCitySearch || originCity).toLowerCase())
    ).slice(0, 20);

    const toggleActivity = (id: string) => {
        setActivities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    };

    const addFoodWish = () => {
        setFoodWishes(prev => [...prev, { restaurant: '', city, state, description: '', visited: false }]);
    };

    const updateFoodWish = (index: number, field: keyof FoodWish, value: string | boolean) => {
        setFoodWishes(prev => prev.map((fw, i) => i === index ? { ...fw, [field]: value } : fw));
    };

    const removeFoodWish = (index: number) => {
        setFoodWishes(prev => prev.filter((_, i) => i !== index));
    };

    const addStop = () => {
        setStops(prev => [...prev, { city: '', state: '', lat: 0, lng: 0, note: '' }]);
    };

    const updateStop = (index: number, field: keyof TripStop, value: string | number) => {
        setStops(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
    };

    const removeStop = (index: number) => {
        setStops(prev => prev.filter((_, i) => i !== index));
    };

    const addHotel = () => {
        setHotels(prev => [...prev, { name: '', ratingP1: 0, ratingP2: 0, notes: '' }]);
    };

    const updateHotel = (index: number, field: keyof HotelStay, value: string | number) => {
        setHotels(prev => prev.map((h, i) => i === index ? { ...h, [field]: value } : h));
    };

    const removeHotel = (index: number) => {
        setHotels(prev => prev.filter((_, i) => i !== index));
    };

    const addRestaurant = () => {
        setRestaurants(prev => [...prev, { name: '', dish: '', ratingP1: 0, ratingP2: 0, notes: '' }]);
    };

    const updateRestaurant = (index: number, field: keyof RestaurantVisit, value: string | number) => {
        setRestaurants(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
    };

    const removeRestaurant = (index: number) => {
        setRestaurants(prev => prev.filter((_, i) => i !== index));
    };

    const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.size > 5 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) setCoverPhoto(ev.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach((file) => {
            if (file.size > 5 * 1024 * 1024) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) setPhotos(prev => [...prev, ev.target!.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const avgRating = (ratingP1 > 0 || ratingP2 > 0)
        ? Math.round(((ratingP1 + ratingP2) / (ratingP1 > 0 && ratingP2 > 0 ? 2 : 1)) * 10) / 10
        : 0;

    const handleSubmit = async () => {
        if (!city.trim() || !state) return;
        setSaving(true);
        try {
            let lat = editTravel?.lat || -14.235;
            let lng = editTravel?.lng || -51.9253;
            const coords = await searchCityCoords(city, state);
            if (coords) { lat = coords.lat; lng = coords.lng; }

            const resolvedStops = await Promise.all(stops.map(async (s) => {
                if (s.lat && s.lng) return s;
                const sc = await searchCityCoords(s.city, s.state);
                return { ...s, lat: sc?.lat || 0, lng: sc?.lng || 0 };
            }));

            const travel: Travel = {
                id: editTravel?.id || uuidv4(),
                city: city.trim(), state, status, lat, lng,
                rating: avgRating,
                ratingP1, ratingP2,
                opinion,
                coverPhoto, photos, visitDate,
                originCity, originState, stops: resolvedStops,
                travelTimeHours, travelTimeMinutes, distanceKm,
                transportType, vehicleId, wouldReturn, activities, foodWishes,
                hotels, restaurants,
                visits: editTravel?.visits || [],
                budget, savedAmount, highlights, tips,
                createdAt: editTravel?.createdAt || new Date().toISOString(),
            };
            await onSave(travel);
        } catch (err) {
            console.error('Erro ao salvar:', err);
        } finally {
            setSaving(false);
        }
    };

    const canProceed = () => {
        if (step === 0) return city.trim() && state;
        return true;
    };

    const getDistanceLabel = (km: number) => {
        if (km === 0) return 'Arraste para definir';
        if (km < 100) return `${km} km — Pertinho!`;
        if (km < 300) return `${km} km — Bate e volta`;
        if (km < 600) return `${km} km — Viagem média`;
        if (km < 1000) return `${km} km — Aventura!`;
        if (km < 2000) return `${km} km — Expedição`;
        return `${km} km — Travessia épica!`;
    };

    const getDistanceColor = (km: number) => {
        if (km < 100) return '#22c55e';
        if (km < 300) return '#3b82f6';
        if (km < 600) return '#eab308';
        if (km < 1000) return '#f97316';
        return '#ef4444';
    };

    const renderStarPicker = (value: number, hover: number, setHover: (v: number) => void, setValue: (v: number) => void, label: string, photo?: string) => (
        <div className="rating-person-card">
            <div className="rating-person-header">
                {photo ? <img src={photo} alt={label} className="rating-person-avatar" /> : <FaUser size={14} />}
                <span className="rating-person-label">{label}</span>
            </div>
            <div className="rating-stars-row">
                {[0, 1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button"
                        className={`rating-star-btn ${star === 0 ? 'zero' : ''} ${star <= (hover || value) && star > 0 ? 'active' : ''}`}
                        onClick={() => setValue(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}>
                        {star === 0
                            ? <span className="zero-label">0</span>
                            : <FaStar size={22} color={star <= (hover || value) ? '#fbbf24' : '#4a5568'} />}
                    </button>
                ))}
            </div>
            <span className="rating-value-text">{value > 0 ? `${value}/5` : 'Sem nota'}</span>
        </div>
    );

    const renderCompactStars = (value: number, onChange: (v: number) => void, label: string, photo?: string) => (
        <div className="rating-inline">
            {photo ? <img src={photo} alt={label} className="rating-avatar-xs" /> : <FaUser size={8} />}
            <span className="rating-label-sm">{label}</span>
            {[0, 1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" className="rating-star-xs" onClick={() => onChange(s)}>
                    {s === 0 ? <span className="zero-xs">0</span> : <FaStar size={14} color={s <= value ? '#fbbf24' : '#4a5568'} />}
                </button>
            ))}
        </div>
    );

    // Render city selector (used in step 0 and date step)
    const renderCitySelector = () => (
        <>
            <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                    <label><FaMapMarkerAlt size={11} /> Estado</label>
                    <select className="form-select" value={state} onChange={(e) => { setState(e.target.value); setCity(''); setCitySearch(''); }}>
                        <option value="">Selecione o estado...</option>
                        {BRAZILIAN_STATES.map((s) => (
                            <option key={s.uf} value={s.name}>{s.name} ({s.uf})</option>
                        ))}
                    </select>
                </div>
            </div>

            {state && (
                <div className="form-group city-selector-group" ref={cityDropdownRef}>
                    <label><FaMapMarkerAlt size={11} /> Cidade {loadingCities && <span className="loading-hint">carregando...</span>}</label>
                    <input className="form-input" type="text" placeholder="Digite para buscar..."
                        value={city || citySearch}
                        onChange={(e) => { setCitySearch(e.target.value); setCity(e.target.value); setShowCityDropdown(true); }}
                        onFocus={() => setShowCityDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCityDropdown(false), 250)}
                    />
                    {showCityDropdown && filteredCities.length > 0 && (
                        <div className="city-dropdown">
                            {filteredCities.map(c => (
                                <button key={c} type="button" className={`city-dropdown-item ${c === city ? 'selected' : ''}`}
                                    onMouseDown={(e) => { e.preventDefault(); setCity(c); setCitySearch(''); setShowCityDropdown(false); }}>
                                    <FaMapMarkerAlt size={9} /> {c}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );

    // Render activities grid
    const renderActivities = () => (
        <div className="form-group">
            <label>{status === 'visited' || status === 'date' ? 'O que fizemos' : 'O que queremos fazer'}</label>
            <div className="activity-grid">
                {ACTIVITY_OPTIONS.map((act) => (
                    <button key={act.id} type="button"
                        className={`activity-chip ${activities.includes(act.id) ? 'selected' : ''}`}
                        onClick={() => toggleActivity(act.id)}
                        style={activities.includes(act.id) ? { background: act.color + '22', borderColor: act.color, color: act.color } : {}}>
                        <span className="activity-chip-icon">{ACTIVITY_ICON_MAP[act.icon]}</span>
                        <span>{act.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editTravel ? <><FaPencilAlt size={16} /> Editar</> : status === 'date' ? <><FaHeart size={16} /> Novo Date</> : <><FaMapMarkerAlt size={16} /> Nova Aventura</>}</h2>
                    <button className="modal-close" onClick={onClose} type="button"><FaTimes size={18} /></button>
                </div>

                {/* Step indicator */}
                <div className="step-indicator">
                    {stepLabels.map((sl, i) => (
                        <button key={i} type="button"
                            className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                            onClick={() => i <= step && setStep(i)}>
                            <span className="step-num">{i < step ? <FaCheck size={10} /> : sl.icon}</span>
                            <span className="step-label">{sl.label}</span>
                        </button>
                    ))}
                    <div className="step-progress" style={{ width: `${(step / (totalSteps - 1)) * 100}%` }} />
                </div>

                <div className="modal-body">
                    {/* ──── Step 0 — Destino / Detalhes ──── */}
                    {step === 0 && (
                        <>
                            <div className="form-group">
                                <label>Tipo de registro</label>
                                <div className="status-toggle">
                                    <button type="button" className={`status-option ${status === 'visited' ? 'sel-visited' : ''}`} onClick={() => { setStatus('visited'); setStep(0); }}>
                                        <FaCheck size={14} /><span>Já fomos</span>
                                    </button>
                                    <button type="button" className={`status-option ${status === 'wishlist' ? 'sel-wishlist' : ''}`} onClick={() => { setStatus('wishlist'); setStep(0); }}>
                                        <FaStar size={14} /><span>Queremos ir</span>
                                    </button>
                                    <button type="button" className={`status-option ${status === 'food_wishlist' ? 'sel-food' : ''}`} onClick={() => { setStatus('food_wishlist'); setStep(0); }}>
                                        <FaUtensils size={14} /><span>Quero comer</span>
                                    </button>
                                    <button type="button" className={`status-option ${status === 'date' ? 'sel-date' : ''}`} onClick={() => { setStatus('date'); setStep(0); }}>
                                        <FaHeart size={14} /><span>Date</span>
                                    </button>
                                </div>
                            </div>

                            {renderCitySelector()}

                            {status === 'visited' && (
                                <div className="form-group">
                                    <label><FaCalendarAlt size={11} /> Quando fomos?</label>
                                    <input className="form-input" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                                </div>
                            )}

                            {status === 'date' && (
                                <div className="form-group">
                                    <label><FaCalendarAlt size={11} /> Quando foi o date?</label>
                                    <input className="form-input" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                                </div>
                            )}

                            {renderActivities()}

                            {(status === 'food_wishlist' || status === 'wishlist') && (
                                <div className="form-group">
                                    <label><FaUtensils size={11} /> Onde queremos comer</label>
                                    {foodWishes.map((fw, i) => (
                                        <div key={i} className="food-wish-item">
                                            <input className="form-input" placeholder="Restaurante" value={fw.restaurant} onChange={(e) => updateFoodWish(i, 'restaurant', e.target.value)} />
                                            <input className="form-input" placeholder="O que comer?" value={fw.description} onChange={(e) => updateFoodWish(i, 'description', e.target.value)} />
                                            <button type="button" className="food-wish-remove" onClick={() => removeFoodWish(i)}><FaTrash size={12} /></button>
                                        </div>
                                    ))}
                                    <button type="button" className="add-food-btn" onClick={addFoodWish}><FaPlus size={12} /> Adicionar restaurante</button>
                                </div>
                            )}

                            {status === 'date' && (
                                <div className="form-group">
                                    <label><FaUtensils size={11} /> Onde comemos</label>
                                    {restaurants.map((r, i) => (
                                        <div key={i} className="hotel-item">
                                            <div className="hotel-item-header">
                                                <input className="form-input" placeholder="Nome do restaurante" value={r.name} onChange={(e) => updateRestaurant(i, 'name', e.target.value)} />
                                                <button type="button" className="btn-icon-sm" onClick={() => removeRestaurant(i)}><FaTrash size={10} /></button>
                                            </div>
                                            <input className="form-input" placeholder="O que comemos?" value={r.dish} onChange={(e) => updateRestaurant(i, 'dish', e.target.value)} />
                                        </div>
                                    ))}
                                    <button type="button" className="add-food-btn" onClick={addRestaurant}><FaPlus size={12} /> Adicionar restaurante</button>
                                </div>
                            )}
                        </>
                    )}

                    {/* ──── VISITED Step 1 — Trajeto ──── */}
                    {step === 1 && status === 'visited' && (
                        <>
                            <div className="timeline-route">
                                <div className="timeline-node origin">
                                    <div className="timeline-dot"><FaCompass size={12} /></div>
                                    <div className="timeline-content">
                                        <span className="timeline-label">Saímos de</span>
                                        <div className="form-row" style={{ marginTop: 6 }}>
                                            <select className="form-select" value={originState} onChange={(e) => { setOriginState(e.target.value); setOriginCity(''); }} style={{ maxWidth: 100 }}>
                                                <option value="">UF</option>
                                                {BRAZILIAN_STATES.map((s) => <option key={s.uf} value={s.uf}>{s.uf}</option>)}
                                            </select>
                                            <div className="city-selector-group" style={{ flex: 1 }}>
                                                <input className="form-input" placeholder="Cidade de origem"
                                                    value={originCity || originCitySearch}
                                                    onChange={(e) => { setOriginCitySearch(e.target.value); setOriginCity(e.target.value); setShowOriginDropdown(true); }}
                                                    onFocus={() => setShowOriginDropdown(true)}
                                                    onBlur={() => setTimeout(() => setShowOriginDropdown(false), 250)} />
                                                {showOriginDropdown && filteredOriginCities.length > 0 && (
                                                    <div className="city-dropdown">
                                                        {filteredOriginCities.map(c => (
                                                            <button key={c} type="button" className="city-dropdown-item"
                                                                onMouseDown={(e) => { e.preventDefault(); setOriginCity(c); setOriginCitySearch(''); setShowOriginDropdown(false); }}>
                                                                <FaMapMarkerAlt size={9} /> {c}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {stops.map((s, i) => (
                                    <div key={i} className="timeline-node stop">
                                        <div className="timeline-dot stop-dot">{i + 1}</div>
                                        <div className="timeline-content">
                                            <div className="timeline-label-row">
                                                <span className="timeline-label">Passamos por</span>
                                                <button type="button" className="btn-icon-sm" onClick={() => removeStop(i)}><FaTrash size={10} /></button>
                                            </div>
                                            <div className="form-row" style={{ marginTop: 4 }}>
                                                <input className="form-input" placeholder="Cidade" value={s.city} onChange={(e) => updateStop(i, 'city', e.target.value)} style={{ flex: 1 }} />
                                                <select className="form-select" value={s.state} onChange={(e) => updateStop(i, 'state', e.target.value)} style={{ maxWidth: 80 }}>
                                                    <option value="">UF</option>
                                                    {BRAZILIAN_STATES.map((st) => <option key={st.uf} value={st.uf}>{st.uf}</option>)}
                                                </select>
                                            </div>
                                            <input className="form-input" placeholder="Nota rápida..." value={s.note} onChange={(e) => updateStop(i, 'note', e.target.value)} style={{ marginTop: 4, fontSize: '0.75rem' }} />
                                        </div>
                                    </div>
                                ))}

                                <button type="button" className="add-stop-btn" onClick={addStop}>
                                    <FaPlus size={10} /> Adicionar parada
                                </button>

                                <div className="timeline-node destination">
                                    <div className="timeline-dot dest-dot"><FaMapMarkerAlt size={12} /></div>
                                    <div className="timeline-content">
                                        <span className="timeline-label">Chegamos em</span>
                                        <span className="timeline-city">{city || '...'}, {state || '...'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label><FaRoute size={11} /> Distância</label>
                                <div className="slider-container">
                                    <input type="range" className="distance-slider" min={0} max={5000} step={10} value={distanceKm}
                                        onChange={(e) => setDistanceKm(parseInt(e.target.value))}
                                        style={{ background: `linear-gradient(to right, ${getDistanceColor(distanceKm)} ${(distanceKm / 5000) * 100}%, var(--bg-input) ${(distanceKm / 5000) * 100}%)` }} />
                                    <div className="slider-label" style={{ color: getDistanceColor(distanceKm) }}>{getDistanceLabel(distanceKm)}</div>
                                    <div className="slider-manual">
                                        <input type="number" className="form-input km-input" placeholder="km" value={distanceKm || ''} onChange={(e) => setDistanceKm(parseInt(e.target.value) || 0)} min={0} />
                                        <span className="km-suffix">km</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label><FaClock size={11} /> Tempo de viagem</label>
                                <div className="time-inputs">
                                    <div className="time-input-group">
                                        <input className="form-input" type="number" min={0} value={travelTimeHours || ''} onChange={(e) => setTravelTimeHours(parseInt(e.target.value) || 0)} />
                                        <span>horas</span>
                                    </div>
                                    <div className="time-input-group">
                                        <input className="form-input" type="number" min={0} max={59} value={travelTimeMinutes || ''} onChange={(e) => setTravelTimeMinutes(parseInt(e.target.value) || 0)} />
                                        <span>min</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Como fomos?</label>
                                <div className="transport-grid">
                                    {(Object.entries(TRANSPORT_LABELS) as [TransportType, string][]).map(([key, label]) => (
                                        <button key={key} type="button" className={`transport-option ${transportType === key ? 'selected' : ''}`} onClick={() => setTransportType(key)}>
                                            <span className="transport-icon">{TRANSPORT_ICON_MAP[key]}</span><span>{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(transportType === 'carro' || transportType === 'moto') && (
                                <div className="form-group">
                                    <label><FaCar size={11} /> Veículo</label>
                                    <div className="vehicle-select">
                                        {vehicles.filter(v => v.type === transportType).map(v => (
                                            <button key={v.id} type="button" className={`vehicle-option ${vehicleId === v.id ? 'selected' : ''}`} onClick={() => setVehicleId(v.id)}>
                                                {v.photo && <img src={v.photo} alt={v.name} className="vehicle-thumb" />}
                                                <span>{v.name}</span>
                                            </button>
                                        ))}
                                        <button type="button" className="vehicle-option add-vehicle" onClick={onAddVehicle}>
                                            <FaPlus size={14} /> <span>Novo</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* ──── WISHLIST Step 1 — Planejamento ──── */}
                    {step === 1 && (status === 'wishlist' || status === 'food_wishlist') && (
                        <>
                            <div className="form-group">
                                <label><FaCalendarAlt size={11} /> Quando queremos ir?</label>
                                <input className="form-input" type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label><FaPencilAlt size={11} /> Anotações</label>
                                <textarea className="form-textarea" placeholder="O que pesquisamos?" value={opinion} onChange={(e) => setOpinion(e.target.value)} />
                            </div>
                        </>
                    )}

                    {/* ──── VISITED Step 2 / DATE Step 1 — Avaliação ──── */}
                    {((step === 2 && status === 'visited') || (step === 1 && status === 'date')) && (
                        <>
                            <div className="form-group">
                                <label className="section-label"><FaUserFriends size={12} /> Avaliação individual</label>
                                <div className="dual-rating-card">
                                    {renderStarPicker(ratingP1, hoverP1, setHoverP1, setRatingP1, p1Name, p1Photo)}
                                    <div className="rating-divider" />
                                    {renderStarPicker(ratingP2, hoverP2, setHoverP2, setRatingP2, p2Name, p2Photo)}
                                    {(ratingP1 > 0 || ratingP2 > 0) && (
                                        <div className="avg-rating-display">
                                            <FaStar size={18} color="#fbbf24" />
                                            <span>Média: <strong>{avgRating}</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label><FaHeart size={11} /> Voltariam?</label>
                                <div className="would-return-toggle">
                                    <button type="button" className={`return-option ${wouldReturn ? 'sel-yes' : ''}`} onClick={() => setWouldReturn(true)}>
                                        <FaHeart size={16} color={wouldReturn ? '#f43f5e' : undefined} /> Com certeza!
                                    </button>
                                    <button type="button" className={`return-option ${!wouldReturn ? 'sel-no' : ''}`} onClick={() => setWouldReturn(false)}>
                                        <FaTimes size={14} /> Talvez não
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label><FaPencilAlt size={11} /> Nossa opinião</label>
                                <textarea className="form-textarea" placeholder="Como foi a experiência?" value={opinion} onChange={(e) => setOpinion(e.target.value)} />
                            </div>
                        </>
                    )}

                    {/* ──── WISHLIST Step 2 — Budget ──── */}
                    {step === 2 && (status === 'wishlist' || status === 'food_wishlist') && (
                        <div className="budget-section">
                            <div className="budget-header">
                                <FaMoneyBillWave size={28} color="var(--visited)" />
                                <h3>Meta de economia</h3>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Meta (R$)</label>
                                    <input className="form-input" type="number" min={0} value={budget || ''} onChange={(e) => setBudget(parseFloat(e.target.value) || 0)} /></div>
                                <div className="form-group"><label>Já juntamos (R$)</label>
                                    <input className="form-input" type="number" min={0} value={savedAmount || ''} onChange={(e) => setSavedAmount(parseFloat(e.target.value) || 0)} /></div>
                            </div>
                            {budget > 0 && (
                                <div className="budget-progress">
                                    <div className="budget-bar"><div className="budget-fill" style={{ width: `${Math.min((savedAmount / budget) * 100, 100)}%` }} /></div>
                                    <div className="budget-info">
                                        <span>{Math.round((savedAmount / budget) * 100)}% da meta</span>
                                        <span>Faltam R$ {(budget - savedAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ──── VISITED Step 3 — Hotels & Restaurants ──── */}
                    {step === 3 && status === 'visited' && (
                        <>
                            <div className="form-group">
                                <label className="section-label"><FaHotel size={12} /> Hospedagem</label>
                                {hotels.map((h, i) => (
                                    <div key={i} className="hotel-item-card">
                                        <div className="hotel-item-header">
                                            <FaHotel size={12} color="var(--accent)" />
                                            <input className="form-input" placeholder="Nome do hotel / pousada" value={h.name} onChange={(e) => updateHotel(i, 'name', e.target.value)} />
                                            <button type="button" className="btn-icon-sm" onClick={() => removeHotel(i)}><FaTrash size={10} /></button>
                                        </div>
                                        <div className="hotel-rating-section">
                                            {renderCompactStars(h.ratingP1, (v) => updateHotel(i, 'ratingP1', v), p1Name, p1Photo)}
                                            {renderCompactStars(h.ratingP2, (v) => updateHotel(i, 'ratingP2', v), p2Name, p2Photo)}
                                        </div>
                                        <input className="form-input" placeholder="Observações..." value={h.notes} onChange={(e) => updateHotel(i, 'notes', e.target.value)} style={{ fontSize: '0.8rem' }} />
                                    </div>
                                ))}
                                <button type="button" className="add-food-btn" onClick={addHotel}><FaPlus size={12} /> Adicionar hospedagem</button>
                            </div>

                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="section-label"><FaUtensils size={12} /> Onde comemos</label>
                                {restaurants.map((r, i) => (
                                    <div key={i} className="hotel-item-card">
                                        <div className="hotel-item-header">
                                            <FaUtensils size={12} color="var(--food)" />
                                            <input className="form-input" placeholder="Nome do restaurante" value={r.name} onChange={(e) => updateRestaurant(i, 'name', e.target.value)} />
                                            <button type="button" className="btn-icon-sm" onClick={() => removeRestaurant(i)}><FaTrash size={10} /></button>
                                        </div>
                                        <input className="form-input" placeholder="O que comemos?" value={r.dish} onChange={(e) => updateRestaurant(i, 'dish', e.target.value)} style={{ fontSize: '0.8rem' }} />
                                        <div className="hotel-rating-section">
                                            {renderCompactStars(r.ratingP1, (v) => updateRestaurant(i, 'ratingP1', v), p1Name, p1Photo)}
                                            {renderCompactStars(r.ratingP2, (v) => updateRestaurant(i, 'ratingP2', v), p2Name, p2Photo)}
                                        </div>
                                        <input className="form-input" placeholder="Observações..." value={r.notes} onChange={(e) => updateRestaurant(i, 'notes', e.target.value)} style={{ fontSize: '0.8rem' }} />
                                    </div>
                                ))}
                                <button type="button" className="add-food-btn" onClick={addRestaurant}><FaPlus size={12} /> Adicionar restaurante</button>
                            </div>
                        </>
                    )}

                    {/* ──── VISITED Step 4 / DATE Step 2 — Gallery ──── */}
                    {((step === 4 && status === 'visited') || (step === 2 && status === 'date')) && (
                        <>
                            <div className="form-group">
                                <label><FaCamera size={11} /> Foto de capa</label>
                                {coverPhoto ? (
                                    <div className="cover-photo-preview">
                                        <img src={coverPhoto} alt="Capa" />
                                        <button type="button" className="photo-remove" onClick={() => setCoverPhoto('')}><FaTimes size={10} /></button>
                                    </div>
                                ) : (
                                    <div className="photo-upload-area" onClick={() => coverInputRef.current?.click()}>
                                        <FaImages size={24} /><p>Foto principal</p>
                                    </div>
                                )}
                                <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
                            </div>
                            <div className="form-group">
                                <label><FaImages size={11} /> Galeria ({photos.length})</label>
                                <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
                                    <FaCamera size={20} /><p>Adicionar fotos</p>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
                                {photos.length > 0 && (
                                    <div className="photo-preview-list">
                                        {photos.map((photo, i) => (
                                            <div key={i} className="photo-preview">
                                                <img src={photo} alt={`Foto ${i + 1}`} />
                                                <button type="button" className="photo-remove" onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}><FaTimes size={8} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {status === 'date' && (
                                <div className="form-group">
                                    <label><FaPencilAlt size={11} /> Melhores momentos</label>
                                    <textarea className="form-textarea" placeholder="O que foi especial nesse date?" value={highlights} onChange={(e) => setHighlights(e.target.value)} rows={3} />
                                </div>
                            )}
                        </>
                    )}

                    {/* ──── VISITED Step 5 — Memórias ──── */}
                    {step === 5 && status === 'visited' && (
                        <>
                            <div className="form-group">
                                <label><FaStar size={11} /> Melhores momentos</label>
                                <textarea className="form-textarea" placeholder="O pôr do sol, a comida maravilhosa..." value={highlights} onChange={(e) => setHighlights(e.target.value)} rows={3} />
                            </div>
                            <div className="form-group">
                                <label><FaCompass size={11} /> Dicas para próxima visita</label>
                                <textarea className="form-textarea" placeholder="Levar casaco, ir no restaurante X..." value={tips} onChange={(e) => setTips(e.target.value)} rows={3} />
                            </div>
                            <div className="form-group">
                                <label><FaUtensils size={11} /> Lista de desejos gastronômicos</label>
                                {foodWishes.map((fw, i) => (
                                    <div key={i} className="food-wish-item">
                                        <input className="form-input" placeholder="Restaurante" value={fw.restaurant} onChange={(e) => updateFoodWish(i, 'restaurant', e.target.value)} />
                                        <input className="form-input" placeholder="Prato" value={fw.description} onChange={(e) => updateFoodWish(i, 'description', e.target.value)} />
                                        <button type="button" className="food-wish-remove" onClick={() => removeFoodWish(i)}><FaTrash size={12} /></button>
                                    </div>
                                ))}
                                <button type="button" className="add-food-btn" onClick={addFoodWish}><FaPlus size={12} /> Adicionar</button>
                            </div>
                        </>
                    )}
                </div>

                {/* Navigation */}
                <div className="form-nav">
                    {step > 0 && <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}><FaChevronLeft size={12} /> Voltar</button>}
                    {step === 0 && <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>}
                    <div style={{ flex: 1 }} />
                    {step < totalSteps - 1 ? (
                        <button type="button" className="btn btn-primary" disabled={!canProceed()} onClick={() => setStep(step + 1)}>Próximo <FaChevronRight size={12} /></button>
                    ) : (
                        <button type="button" className="btn btn-primary btn-save" disabled={saving || !canProceed()} onClick={handleSubmit}>
                            {saving ? 'Salvando...' : <><FaCheck size={14} /> Salvar</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
