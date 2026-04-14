import { Travel, Vehicle, DiscardedCity, Mission, DEFAULT_MISSIONS, UserProfile, DEFAULT_PROFILES } from '@/types/travel';
import { supabase } from './supabase';

// ========== PROFILES ==========
export async function getProfiles(): Promise<UserProfile[]> {
    const { data, error } = await supabase.from('profiles').select('*').order('id');
    if (error || !data || data.length === 0) {
        await supabase.from('profiles').insert(DEFAULT_PROFILES);
        return DEFAULT_PROFILES;
    }
    return data as UserProfile[];
}

export async function updateProfile(profile: UserProfile): Promise<UserProfile[]> {
    await supabase.from('profiles').upsert({ id: profile.id, name: profile.name, photo: profile.photo });
    return getProfiles();
}

// ========== TRAVELS ==========
export async function getTravels(): Promise<Travel[]> {
    const { data, error } = await supabase
        .from('travels')
        .select('*')
        .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(rowToTravel);
}

export async function addTravel(travel: Travel): Promise<Travel[]> {
    const row = travelToRow(travel);
    await supabase.from('travels').insert(row);
    return getTravels();
}

export async function updateTravel(travel: Travel): Promise<Travel[]> {
    const row = travelToRow(travel);
    await supabase.from('travels').update(row).eq('id', travel.id);
    return getTravels();
}

export async function deleteTravel(id: string): Promise<Travel[]> {
    await supabase.from('travels').delete().eq('id', id);
    return getTravels();
}

// ========== VEHICLES ==========
export async function getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(rowToVehicle);
}

export async function addVehicle(vehicle: Vehicle): Promise<Vehicle[]> {
    await supabase.from('vehicles').insert({
        id: vehicle.id,
        name: vehicle.name,
        photo: vehicle.photo,
        acquired_date: vehicle.acquiredDate,
        type: vehicle.type,
        created_at: vehicle.createdAt,
    });
    return getVehicles();
}

export async function deleteVehicle(id: string): Promise<Vehicle[]> {
    await supabase.from('vehicles').delete().eq('id', id);
    return getVehicles();
}

export async function updateVehicle(vehicle: Vehicle): Promise<Vehicle[]> {
    await supabase.from('vehicles').update({
        name: vehicle.name,
        photo: vehicle.photo,
        acquired_date: vehicle.acquiredDate,
        type: vehicle.type,
    }).eq('id', vehicle.id);
    return getVehicles();
}

// ========== DISCARDED CITIES ==========
export async function getDiscardedCities(): Promise<DiscardedCity[]> {
    const { data, error } = await supabase
        .from('discarded_cities')
        .select('*')
        .order('discarded_at', { ascending: false });
    if (error || !data) return [];
    return data.map(r => ({
        city: r.city,
        state: r.state,
        reason: r.reason || '',
        discardedAt: r.discarded_at,
    }));
}

export async function addDiscardedCity(city: DiscardedCity): Promise<DiscardedCity[]> {
    await supabase.from('discarded_cities').insert({
        city: city.city,
        state: city.state,
        reason: city.reason,
        discarded_at: city.discardedAt,
    });
    return getDiscardedCities();
}

export async function removeDiscardedCity(cityName: string, state: string): Promise<DiscardedCity[]> {
    await supabase.from('discarded_cities').delete().eq('city', cityName).eq('state', state);
    return getDiscardedCities();
}

// ========== MISSIONS ==========
export async function getMissions(): Promise<Mission[]> {
    const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('completed', { ascending: true });
    if (error || !data || data.length === 0) {
        // Initialize default missions on first load
        const defaults: Mission[] = DEFAULT_MISSIONS.map(m => ({
            ...m,
            progress: 0,
            completed: false,
        }));
        const rows = defaults.map(missionToRow);
        await supabase.from('missions').insert(rows);
        return defaults;
    }
    return data.map(rowToMission);
}

export async function updateMission(mission: Mission): Promise<Mission[]> {
    await supabase.from('missions').update(missionToRow(mission)).eq('id', mission.id);
    return getMissions();
}

export async function addMission(mission: Mission): Promise<Mission[]> {
    await supabase.from('missions').insert(missionToRow(mission));
    return getMissions();
}

export async function deleteMission(id: string): Promise<Mission[]> {
    await supabase.from('missions').delete().eq('id', id);
    return getMissions();
}

// ========== ROW MAPPERS ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTravel(r: any): Travel {
    return {
        id: r.id,
        city: r.city,
        state: r.state,
        status: r.status,
        lat: r.lat,
        lng: r.lng,
        rating: r.rating || 0,
        ratingP1: r.rating_p1 || 0,
        ratingP2: r.rating_p2 || 0,
        opinion: r.opinion || '',
        coverPhoto: r.cover_photo || '',
        photos: r.photos || [],
        visitDate: r.visit_date || '',
        originCity: r.origin_city || '',
        originState: r.origin_state || '',
        stops: r.stops || [],
        travelTimeHours: r.travel_time_hours || 0,
        travelTimeMinutes: r.travel_time_minutes || 0,
        distanceKm: r.distance_km || 0,
        transportType: r.transport_type || 'carro',
        vehicleId: r.vehicle_id || '',
        wouldReturn: r.would_return ?? true,
        activities: r.activities || [],
        foodWishes: r.food_wishes || [],
        hotels: r.hotels || [],
        restaurants: r.restaurants || [],
        visits: r.visits || [],
        budget: r.budget || 0,
        savedAmount: r.saved_amount || 0,
        highlights: r.highlights || '',
        tips: r.tips || '',
        createdAt: r.created_at,
    };
}

function travelToRow(t: Travel) {
    return {
        id: t.id,
        city: t.city,
        state: t.state,
        status: t.status,
        lat: t.lat,
        lng: t.lng,
        rating: Math.round(t.rating || 0),
        rating_p1: t.ratingP1 || 0,
        rating_p2: t.ratingP2 || 0,
        opinion: t.opinion,
        cover_photo: t.coverPhoto,
        photos: t.photos,
        visit_date: t.visitDate || null,
        origin_city: t.originCity,
        origin_state: t.originState,
        stops: t.stops,
        travel_time_hours: t.travelTimeHours,
        travel_time_minutes: t.travelTimeMinutes,
        distance_km: t.distanceKm,
        transport_type: t.transportType,
        vehicle_id: t.vehicleId,
        would_return: t.wouldReturn,
        activities: t.activities,
        food_wishes: t.foodWishes,
        hotels: t.hotels || [],
        restaurants: t.restaurants || [],
        visits: t.visits || [],
        budget: t.budget,
        saved_amount: t.savedAmount,
        highlights: t.highlights,
        tips: t.tips,
        created_at: t.createdAt,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToVehicle(r: any): Vehicle {
    return {
        id: r.id,
        name: r.name,
        photo: r.photo || '',
        acquiredDate: r.acquired_date || '',
        type: r.type,
        createdAt: r.created_at,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMission(r: any): Mission {
    return {
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        category: r.category,
        target: r.target,
        progress: r.progress || 0,
        completed: r.completed || false,
        completedAt: r.completed_at || undefined,
        icon: r.icon,
    };
}

function missionToRow(m: Mission) {
    return {
        id: m.id,
        title: m.title,
        description: m.description,
        type: m.type,
        category: m.category,
        target: m.target,
        progress: m.progress,
        completed: m.completed,
        completed_at: m.completedAt || null,
        icon: m.icon,
    };
}
