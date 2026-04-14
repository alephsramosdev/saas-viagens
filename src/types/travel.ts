export type TravelStatus = 'visited' | 'wishlist' | 'food_wishlist' | 'date';

export interface UserProfile {
    id: 'p1' | 'p2';
    name: string;
    photo: string;
}

export const DEFAULT_PROFILES: UserProfile[] = [
    { id: 'p1', name: 'Aleph', photo: '' },
    { id: 'p2', name: 'Alice', photo: '' },
];

export type TransportType = 'carro' | 'moto' | 'onibus' | 'aviao' | 'trem' | 'bicicleta' | 'a_pe' | 'outro';

export const TRANSPORT_LABELS: Record<TransportType, string> = {
    carro: 'Carro',
    moto: 'Moto',
    onibus: 'Ônibus',
    aviao: 'Avião',
    trem: 'Trem',
    bicicleta: 'Bicicleta',
    a_pe: 'A pé',
    outro: 'Outro',
};

export const TRANSPORT_ICONS: Record<TransportType, string> = {
    carro: 'FaCar',
    moto: 'FaMotorcycle',
    onibus: 'FaBus',
    aviao: 'FaPlane',
    trem: 'FaTrain',
    bicicleta: 'FaBicycle',
    a_pe: 'FaWalking',
    outro: 'FaRocket',
};

export const ACTIVITY_OPTIONS = [
    { id: 'praia', label: 'Praia', icon: 'FaUmbrellaBeach', color: '#06b6d4' },
    { id: 'trilha', label: 'Trilha', icon: 'FaHiking', color: '#22c55e' },
    { id: 'gastronomia', label: 'Gastronomia', icon: 'FaUtensils', color: '#f97316' },
    { id: 'cultura', label: 'Cultura', icon: 'FaLandmark', color: '#a855f7' },
    { id: 'compras', label: 'Compras', icon: 'FaShoppingBag', color: '#ec4899' },
    { id: 'aventura', label: 'Aventura', icon: 'FaParachuteBox', color: '#ef4444' },
    { id: 'romantico', label: 'Romântico', icon: 'FaHeart', color: '#f43f5e' },
    { id: 'relaxamento', label: 'Relaxamento', icon: 'FaSpa', color: '#14b8a6' },
    { id: 'vida_noturna', label: 'Vida Noturna', icon: 'FaMoon', color: '#6366f1' },
    { id: 'natureza', label: 'Natureza', icon: 'FaLeaf', color: '#84cc16' },
    { id: 'religioso', label: 'Religioso', icon: 'FaChurch', color: '#d97706' },
    { id: 'esporte', label: 'Esporte', icon: 'FaFutbol', color: '#0ea5e9' },
    { id: 'fotografia', label: 'Fotografia', icon: 'FaCamera', color: '#8b5cf6' },
    { id: 'cachoeira', label: 'Cachoeira', icon: 'FaWater', color: '#0891b2' },
    { id: 'pizza', label: 'Pizza', icon: 'FaPizzaSlice', color: '#e11d48' },
    { id: 'cinema', label: 'Cinema', icon: 'FaFilm', color: '#7c3aed' },
    { id: 'bar', label: 'Bar', icon: 'FaGlassCheers', color: '#be185d' },
    { id: 'show', label: 'Show', icon: 'FaMusic', color: '#0369a1' },
    { id: 'cafe', label: 'Café', icon: 'FaCoffee', color: '#92400e' },
    { id: 'piscina', label: 'Piscina', icon: 'FaSwimmingPool', color: '#0e7490' },
    { id: 'parque', label: 'Parque', icon: 'FaTree', color: '#16a34a' },
    { id: 'museu', label: 'Museu', icon: 'FaPaintBrush', color: '#9333ea' },
];

export interface FoodWish {
    restaurant: string;
    city: string;
    state: string;
    description: string;
    visited: boolean;
}

export interface TripStop {
    city: string;
    state: string;
    lat: number;
    lng: number;
    note: string;
}

export interface HotelStay {
    name: string;
    ratingP1: number;
    ratingP2: number;
    notes: string;
}

export interface RestaurantVisit {
    name: string;
    dish: string;
    ratingP1: number;
    ratingP2: number;
    notes: string;
}

export interface CityVisit {
    id: string;
    date: string;
    ratingP1: number;
    ratingP2: number;
    opinion: string;
    photos: string[];
    highlights: string;
    hotels: HotelStay[];
    restaurants: RestaurantVisit[];
}

export interface Vehicle {
    id: string;
    name: string;
    photo: string;
    acquiredDate: string;
    type: TransportType;
    createdAt: string;
}

export interface DiscardedCity {
    city: string;
    state: string;
    reason: string;
    discardedAt: string;
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    type: 'generic' | 'custom';
    category: 'cities' | 'states' | 'distance' | 'time' | 'food' | 'special';
    target: number;
    progress: number;
    completed: boolean;
    completedAt?: string;
    icon: string;
}

export const DEFAULT_MISSIONS: Omit<Mission, 'progress' | 'completed' | 'completedAt'>[] = [
    { id: 'cities_5', title: 'Primeiros Passos', description: 'Visite 5 cidades', type: 'generic', category: 'cities', target: 5, icon: 'FaMapMarkerAlt' },
    { id: 'cities_10', title: 'Exploradores', description: 'Visite 10 cidades', type: 'generic', category: 'cities', target: 10, icon: 'FaMapMarkerAlt' },
    { id: 'cities_25', title: 'Desbravadores', description: 'Visite 25 cidades', type: 'generic', category: 'cities', target: 25, icon: 'FaGlobeAmericas' },
    { id: 'cities_50', title: 'Nômades', description: 'Visite 50 cidades', type: 'generic', category: 'cities', target: 50, icon: 'FaTrophy' },
    { id: 'cities_100', title: 'Lendários', description: 'Visite 100 cidades', type: 'generic', category: 'cities', target: 100, icon: 'FaCrown' },
    { id: 'states_5', title: '5 Estados', description: 'Visite 5 estados diferentes', type: 'generic', category: 'states', target: 5, icon: 'FaFlag' },
    { id: 'states_10', title: '10 Estados', description: 'Visite 10 estados diferentes', type: 'generic', category: 'states', target: 10, icon: 'FaFlag' },
    { id: 'states_27', title: 'Brasil Completo', description: 'Visite todos os 27 estados', type: 'generic', category: 'states', target: 27, icon: 'FaFlag' },
    { id: 'km_1000', title: 'Mil Quilômetros', description: 'Percorra 1.000 km', type: 'generic', category: 'distance', target: 1000, icon: 'FaRoute' },
    { id: 'km_5000', title: 'Estradeiros', description: 'Percorra 5.000 km', type: 'generic', category: 'distance', target: 5000, icon: 'FaRoute' },
    { id: 'km_10000', title: 'Rodovia Nacional', description: 'Percorra 10.000 km', type: 'generic', category: 'distance', target: 10000, icon: 'FaRoute' },
    { id: 'hours_50', title: '50 Horas', description: '50 horas na estrada', type: 'generic', category: 'time', target: 50, icon: 'FaClock' },
    { id: 'hours_100', title: 'Centenário', description: '100 horas na estrada', type: 'generic', category: 'time', target: 100, icon: 'FaClock' },
    { id: 'food_10', title: 'Gastronômicos', description: 'Coma em 10 restaurantes', type: 'generic', category: 'food', target: 10, icon: 'FaUtensils' },
    { id: 'food_25', title: 'Críticos Culinários', description: 'Coma em 25 restaurantes', type: 'generic', category: 'food', target: 25, icon: 'FaUtensils' },
    { id: 'state_5_cities', title: 'Domínio Regional', description: '5 cidades num mesmo estado', type: 'generic', category: 'special', target: 5, icon: 'FaStar' },
    { id: 'perfect_score', title: 'Nota Máxima', description: 'Dê nota 5 para uma cidade', type: 'generic', category: 'special', target: 1, icon: 'FaStar' },
    { id: 'revisit', title: 'Saudade', description: 'Visite a mesma cidade 3 vezes', type: 'generic', category: 'special', target: 3, icon: 'FaHeart' },
];

export interface Travel {
    id: string;
    city: string;
    state: string;
    status: TravelStatus;
    lat: number;
    lng: number;
    rating: number;
    ratingP1: number;
    ratingP2: number;
    opinion: string;
    coverPhoto: string;
    photos: string[];
    visitDate: string;
    originCity: string;
    originState: string;
    stops: TripStop[];
    travelTimeHours: number;
    travelTimeMinutes: number;
    distanceKm: number;
    transportType: TransportType;
    vehicleId: string;
    wouldReturn: boolean;
    activities: string[];
    foodWishes: FoodWish[];
    hotels: HotelStay[];
    restaurants: RestaurantVisit[];
    visits: CityVisit[];
    budget: number;
    savedAmount: number;
    highlights: string;
    tips: string;
    createdAt: string;
}

export const BRAZILIAN_STATES = [
    { uf: 'AC', name: 'Acre', flag: '' },
    { uf: 'AL', name: 'Alagoas', flag: '' },
    { uf: 'AP', name: 'Amapá', flag: '' },
    { uf: 'AM', name: 'Amazonas', flag: '' },
    { uf: 'BA', name: 'Bahia', flag: '' },
    { uf: 'CE', name: 'Ceará', flag: '' },
    { uf: 'DF', name: 'Distrito Federal', flag: '' },
    { uf: 'ES', name: 'Espírito Santo', flag: '' },
    { uf: 'GO', name: 'Goiás', flag: '' },
    { uf: 'MA', name: 'Maranhão', flag: '' },
    { uf: 'MT', name: 'Mato Grosso', flag: '' },
    { uf: 'MS', name: 'Mato Grosso do Sul', flag: '' },
    { uf: 'MG', name: 'Minas Gerais', flag: '' },
    { uf: 'PA', name: 'Pará', flag: '' },
    { uf: 'PB', name: 'Paraíba', flag: '' },
    { uf: 'PR', name: 'Paraná', flag: '' },
    { uf: 'PE', name: 'Pernambuco', flag: '' },
    { uf: 'PI', name: 'Piauí', flag: '' },
    { uf: 'RJ', name: 'Rio de Janeiro', flag: '' },
    { uf: 'RN', name: 'Rio Grande do Norte', flag: '' },
    { uf: 'RS', name: 'Rio Grande do Sul', flag: '' },
    { uf: 'RO', name: 'Rondônia', flag: '' },
    { uf: 'RR', name: 'Roraima', flag: '' },
    { uf: 'SC', name: 'Santa Catarina', flag: '' },
    { uf: 'SP', name: 'São Paulo', flag: '' },
    { uf: 'SE', name: 'Sergipe', flag: '' },
    { uf: 'TO', name: 'Tocantins', flag: '' },
];

export const STATE_FLAG_URLS: Record<string, string> = {
    'AC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bandeira_do_Acre.svg/45px-Bandeira_do_Acre.svg.png',
    'AL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Bandeira_de_Alagoas.svg/45px-Bandeira_de_Alagoas.svg.png',
    'AP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Bandeira_do_Amap%C3%A1.svg/45px-Bandeira_do_Amap%C3%A1.svg.png',
    'AM': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bandeira_do_Amazonas.svg/45px-Bandeira_do_Amazonas.svg.png',
    'BA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Bandeira_da_Bahia.svg/45px-Bandeira_da_Bahia.svg.png',
    'CE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Bandeira_do_Cear%C3%A1.svg/45px-Bandeira_do_Cear%C3%A1.svg.png',
    'DF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Bandeira_do_Distrito_Federal_%28Brasil%29.svg/45px-Bandeira_do_Distrito_Federal_%28Brasil%29.svg.png',
    'ES': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Bandeira_do_Esp%C3%ADrito_Santo.svg/45px-Bandeira_do_Esp%C3%ADrito_Santo.svg.png',
    'GO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Flag_of_Goi%C3%A1s.svg/45px-Flag_of_Goi%C3%A1s.svg.png',
    'MA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Bandeira_do_Maranh%C3%A3o.svg/45px-Bandeira_do_Maranh%C3%A3o.svg.png',
    'MT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Bandeira_de_Mato_Grosso.svg/45px-Bandeira_de_Mato_Grosso.svg.png',
    'MS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Bandeira_de_Mato_Grosso_do_Sul.svg/45px-Bandeira_de_Mato_Grosso_do_Sul.svg.png',
    'MG': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Bandeira_de_Minas_Gerais.svg/45px-Bandeira_de_Minas_Gerais.svg.png',
    'PA': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Bandeira_do_Par%C3%A1.svg/45px-Bandeira_do_Par%C3%A1.svg.png',
    'PB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Bandeira_da_Para%C3%ADba.svg/45px-Bandeira_da_Para%C3%ADba.svg.png',
    'PR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Bandeira_do_Paran%C3%A1.svg/45px-Bandeira_do_Paran%C3%A1.svg.png',
    'PE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Bandeira_de_Pernambuco.svg/45px-Bandeira_de_Pernambuco.svg.png',
    'PI': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Bandeira_do_Piau%C3%AD.svg/45px-Bandeira_do_Piau%C3%AD.svg.png',
    'RJ': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Bandeira_do_estado_do_Rio_de_Janeiro.svg/45px-Bandeira_do_estado_do_Rio_de_Janeiro.svg.png',
    'RN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Bandeira_do_Rio_Grande_do_Norte.svg/45px-Bandeira_do_Rio_Grande_do_Norte.svg.png',
    'RS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Bandeira_do_Rio_Grande_do_Sul.svg/45px-Bandeira_do_Rio_Grande_do_Sul.svg.png',
    'RO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Bandeira_de_Rond%C3%B4nia.svg/45px-Bandeira_de_Rond%C3%B4nia.svg.png',
    'RR': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Bandeira_de_Roraima.svg/45px-Bandeira_de_Roraima.svg.png',
    'SC': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bandeira_de_Santa_Catarina.svg/45px-Bandeira_de_Santa_Catarina.svg.png',
    'SP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Bandeira_do_estado_de_S%C3%A3o_Paulo.svg/45px-Bandeira_do_estado_de_S%C3%A3o_Paulo.svg.png',
    'SE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Bandeira_de_Sergipe.svg/45px-Bandeira_de_Sergipe.svg.png',
    'TO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Bandeira_do_Tocantins.svg/45px-Bandeira_do_Tocantins.svg.png',
};

export const STATE_CITY_COUNTS: Record<string, number> = {
    'Acre': 22, 'Alagoas': 102, 'Amapá': 16, 'Amazonas': 62,
    'Bahia': 417, 'Ceará': 184, 'Distrito Federal': 1, 'Espírito Santo': 78,
    'Goiás': 246, 'Maranhão': 217, 'Mato Grosso': 141, 'Mato Grosso do Sul': 79,
    'Minas Gerais': 853, 'Pará': 144, 'Paraíba': 223, 'Paraná': 399,
    'Pernambuco': 185, 'Piauí': 224, 'Rio de Janeiro': 92, 'Rio Grande do Norte': 167,
    'Rio Grande do Sul': 497, 'Rondônia': 52, 'Roraima': 15, 'Santa Catarina': 295,
    'São Paulo': 645, 'Sergipe': 75, 'Tocantins': 139,
};

export const ACHIEVEMENT_MILESTONES = [
    { cities: 1, label: 'Primeira aventura!', icon: 'FaFlag' },
    { cities: 5, label: '5 cidades desbloqueadas!', icon: 'FaMedal' },
    { cities: 10, label: '10 cidades — Exploradores!', icon: 'FaTrophy' },
    { cities: 25, label: '25 cidades — Desbravadores!', icon: 'FaCrown' },
    { cities: 50, label: '50 cidades — Nômades!', icon: 'FaGem' },
    { cities: 100, label: '100 cidades — Lendários!', icon: 'FaStar' },
];

export const STATE_MILESTONES = [
    { cities: 1, label: 'Primeira cidade no estado!' },
    { cities: 3, label: '3 cidades desbloqueadas!' },
    { cities: 5, label: '5 cidades — Domínio regional!' },
    { cities: 10, label: '10 cidades — Expert!' },
    { cities: 20, label: '20 cidades — Mestre!' },
];
