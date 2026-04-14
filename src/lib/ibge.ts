// IBGE API for Brazilian cities

interface IBGECity {
    id: number;
    nome: string;
}

const cityCache: Record<string, IBGECity[]> = {};

export async function fetchCitiesByState(uf: string): Promise<IBGECity[]> {
    if (cityCache[uf]) return cityCache[uf];
    try {
        const res = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
        );
        if (!res.ok) return [];
        const data: IBGECity[] = await res.json();
        cityCache[uf] = data;
        return data;
    } catch {
        return [];
    }
}

export async function searchCityCoords(city: string, state: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const query = encodeURIComponent(`${city}, ${state}, Brasil`);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
        const data = await res.json();
        if (data.length > 0) {
            return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
    } catch { /* fallback */ }
    return null;
}
