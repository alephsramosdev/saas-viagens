'use client';

import { useState, useRef } from 'react';
import { UserProfile } from '@/types/travel';
import { FaTimes, FaCamera, FaUser, FaCheck } from 'react-icons/fa';

interface ProfileEditorProps {
    profile: UserProfile;
    onSave: (profile: UserProfile) => void;
    onClose: () => void;
}

export default function ProfileEditor({ profile, onSave, onClose }: ProfileEditorProps) {
    const [name, setName] = useState(profile.name);
    const [photo, setPhoto] = useState(profile.photo);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.size > 2 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) setPhoto(ev.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ ...profile, name: name.trim(), photo });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><FaUser size={14} style={{ marginRight: 8 }} />Editar Perfil</h2>
                    <button className="modal-close" onClick={onClose} type="button"><FaTimes size={16} /></button>
                </div>
                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="profile-photo-section">
                        <div className="profile-photo-circle" onClick={() => fileInputRef.current?.click()}>
                            {photo ? (
                                <img src={photo} alt={name} />
                            ) : (
                                <FaUser size={32} color="var(--text-muted)" />
                            )}
                            <div className="profile-photo-overlay">
                                <FaCamera size={16} />
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                    </div>
                    <div className="form-group">
                        <label>Nome</label>
                        <input className="form-input" type="text" placeholder="Nome..." value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary"><FaCheck size={12} /> Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
