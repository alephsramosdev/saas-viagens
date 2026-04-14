'use client';

import { useEffect, useState } from 'react';
import { FaTrophy, FaStar, FaMapMarkerAlt, FaMedal, FaCrown, FaGem, FaFlag } from 'react-icons/fa';

const ICON_MAP: Record<string, React.ReactNode> = {
    FaTrophy: <FaTrophy size={40} />,
    FaStar: <FaStar size={40} />,
    FaMapMarkerAlt: <FaMapMarkerAlt size={40} />,
    FaMedal: <FaMedal size={40} />,
    FaCrown: <FaCrown size={40} />,
    FaGem: <FaGem size={40} />,
    FaFlag: <FaFlag size={40} />,
};

interface CelebrationProps {
    message: string;
    icon?: string;
    onDone: () => void;
}

export default function Celebration({ message, icon, onDone }: CelebrationProps) {
    const [visible, setVisible] = useState(true);
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; delay: number; size: number }[]>([]);

    useEffect(() => {
        const p = Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            color: ['#fbbf24', '#22c55e', '#3b82f6', '#f43f5e', '#a855f7', '#06b6d4', '#f97316'][Math.floor(Math.random() * 7)],
            delay: Math.random() * 0.8,
            size: 4 + Math.random() * 8,
        }));
        setParticles(p);

        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onDone, 500);
        }, 3500);
        return () => clearTimeout(timer);
    }, [onDone]);

    return (
        <div className={`celebration-overlay ${visible ? 'show' : 'hide'}`} onClick={() => { setVisible(false); setTimeout(onDone, 500); }}>
            <div className="celebration-particles">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="confetti"
                        style={{
                            left: `${p.x}%`,
                            top: `-10%`,
                            backgroundColor: p.color,
                            width: p.size,
                            height: p.size * 1.5,
                            animationDelay: `${p.delay}s`,
                        }}
                    />
                ))}
            </div>
            <div className="celebration-card">
                <div className="celebration-icon">{icon && ICON_MAP[icon] ? ICON_MAP[icon] : <FaTrophy size={40} />}</div>
                <h2 className="celebration-title">Nova Conquista!</h2>
                <p className="celebration-message">{message}</p>
            </div>
        </div>
    );
}
