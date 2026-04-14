'use client';

import { useState, useRef } from 'react';
import { Vehicle, TransportType, TRANSPORT_LABELS } from '@/types/travel';
import { v4 as uuidv4 } from 'uuid';
import { FaTimes, FaCamera, FaCar } from 'react-icons/fa';

interface VehicleFormProps {
    onClose: () => void;
    onSave: (vehicle: Vehicle) => void;
    editVehicle?: Vehicle | null;
}

export default function VehicleForm({ onClose, onSave, editVehicle }: VehicleFormProps) {
    const [name, setName] = useState(editVehicle?.name || '');
    const [type, setType] = useState<TransportType>(editVehicle?.type || 'carro');
    const [photo, setPhoto] = useState(editVehicle?.photo || '');
    const [acquiredDate, setAcquiredDate] = useState(editVehicle?.acquiredDate || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || file.size > 5 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) setPhoto(ev.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({
            id: editVehicle?.id || uuidv4(),
            name: name.trim(),
            type,
            photo,
            acquiredDate,
            createdAt: editVehicle?.createdAt || new Date().toISOString(),
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-sm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><FaCar size={16} style={{ marginRight: 8 }} />{editVehicle ? 'Editar Veículo' : 'Cadastrar Veículo'}</h2>
                    <button className="modal-close" onClick={onClose} type="button">
                        <FaTimes size={16} />
                    </button>
                </div>
                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tipo de veículo</label>
                        <div className="transport-grid">
                            {(Object.entries(TRANSPORT_LABELS) as [TransportType, string][]).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    className={`transport-option ${type === key ? 'selected' : ''}`}
                                    onClick={() => setType(key)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Nome / Apelido</label>
                        <input
                            className="form-input"
                            type="text"
                            placeholder="Ex: Fitão, Civic, Onix..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Data que pegamos</label>
                        <input
                            className="form-input"
                            type="date"
                            value={acquiredDate}
                            onChange={(e) => setAcquiredDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Foto do veículo</label>
                        {photo ? (
                            <div className="vehicle-photo-preview">
                                <img src={photo} alt="Veículo" />
                                <button type="button" className="photo-remove" onClick={() => setPhoto('')}>×</button>
                            </div>
                        ) : (
                            <div className="photo-upload-area" onClick={() => fileInputRef.current?.click()}>
                                <FaCamera size={20} style={{ marginBottom: 4 }} />
                                <p>Foto do veículo</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handlePhotoUpload}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Salvar Veículo</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
