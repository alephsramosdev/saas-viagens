'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Travel } from '@/types/travel';

interface MapViewProps {
    travels: Travel[];
    onTravelClick: (travel: Travel) => void;
    selectedTravel: Travel | null;
    homeLocation?: { city: string; state: string; lat: number; lng: number } | null;
}

const visitedIcon = () =>
    L.divIcon({
        className: '',
        html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
      <path d="M10.5 14l2.5 2.5 4.5-5" stroke="#22c55e" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        popupAnchor: [0, -40],
    });

const wishlistIcon = () =>
    L.divIcon({
        className: '',
        html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#eab308" stroke="#ca8a04" stroke-width="1"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
      <path d="M14 10l1.3 2.6 2.9.4-2.1 2 .5 2.9L14 16.4l-2.6 1.5.5-2.9-2.1-2 2.9-.4z" fill="#eab308"/>
    </svg>`,
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        popupAnchor: [0, -40],
    });

const foodIcon = () =>
    L.divIcon({
        className: '',
        html: `<svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="#f97316" stroke="#ea580c" stroke-width="1"/>
      <circle cx="14" cy="14" r="6" fill="white"/>
      <path d="M10 11v6M14 11v2c0 1.1-.9 2-2 2h0c-1.1 0-2-.9-2-2v-2M18 11c0 0 0 3-1.5 4s-1.5 2-1.5 2v1" stroke="white" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    </svg>`,
        iconSize: [28, 40],
        iconAnchor: [14, 40],
        popupAnchor: [0, -40],
    });

const homeIcon = () =>
    L.divIcon({
        className: '',
        html: `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#5ba4cf" stroke="white" stroke-width="3"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });

export default function MapView({ travels, onTravelClick, selectedTravel, homeLocation }: MapViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [-14.235, -51.9253],
            zoom: 4,
            zoomControl: true,
            attributionControl: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!markersRef.current || !mapRef.current) return;

        markersRef.current.clearLayers();
        const markersGroup = markersRef.current;

        travels.forEach((travel) => {
            let icon;
            if (travel.status === 'visited') icon = visitedIcon();
            else if (travel.status === 'food_wishlist') icon = foodIcon();
            else icon = wishlistIcon();

            const marker = L.marker([travel.lat, travel.lng], { icon }).addTo(markersGroup);

            const statusLabel = travel.status === 'visited' ? 'Visitado' : travel.status === 'food_wishlist' ? 'Comer' : 'Desejo';
            const ratingStars = travel.rating > 0 ? '<span style="color:#eab308;">★</span>'.repeat(travel.rating) : '';
            const ratingHtml = ratingStars ? `<div class="popup-rating">${ratingStars}</div>` : '';
            const returnHtml = travel.wouldReturn && travel.status === 'visited' ? '<div class="popup-return" style="color:#ec4899;">Voltaríamos!</div>' : '';

            marker.bindPopup(`
                <div class="popup-title">${travel.city}</div>
                <div class="popup-subtitle">${travel.state}</div>
                <div class="popup-status">${statusLabel}</div>
                ${ratingHtml}
                ${returnHtml}
            `);

            marker.on('click', () => onTravelClick(travel));
        });

        // Home location marker
        if (homeLocation && homeLocation.lat && homeLocation.lng) {
            const homeMarker = L.marker([homeLocation.lat, homeLocation.lng], { icon: homeIcon() }).addTo(markersGroup);
            homeMarker.bindPopup(`
                <div class="popup-title">🏠 Nossa casa</div>
                <div class="popup-subtitle">${homeLocation.city}, ${homeLocation.state}</div>
            `);
        }
    }, [travels, onTravelClick, homeLocation]);

    useEffect(() => {
        if (!mapRef.current || !selectedTravel) return;
        mapRef.current.flyTo([selectedTravel.lat, selectedTravel.lng], 10, { duration: 1 });
    }, [selectedTravel]);

    return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
