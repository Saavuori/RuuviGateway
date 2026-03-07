import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    onSubmit: () => void;
    isSaving?: boolean;
    isFormDirty?: boolean;
}

export function Modal({ isOpen, onClose, title, children, onSubmit, isSaving, isFormDirty = true }: ModalProps) {
    if (!isOpen) return null;

    const canSave = isFormDirty && !isSaving;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-ruuvi-card border border-ruuvi-border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 transition-colors duration-250">
                <div className="flex items-center justify-between p-6 border-b border-ruuvi-border">
                    <h2 className="text-xl font-bold text-ruuvi-text">{title}</h2>
                    <button onClick={onClose} className="p-2 text-ruuvi-text-muted hover:text-ruuvi-text rounded-lg hover:bg-ruuvi-input-bg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {children}
                </div>

                <div className="p-6 bg-ruuvi-input-bg flex justify-end gap-3 border-t border-ruuvi-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-ruuvi-text-muted bg-transparent border border-ruuvi-border rounded-lg hover:bg-ruuvi-card hover:text-ruuvi-text focus:ring-2 focus:ring-ruuvi-success/50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={!canSave}
                        className={`px-4 py-2 text-sm font-bold rounded-lg focus:ring-2 focus:ring-ruuvi-success/50 flex items-center gap-2 transition-colors ${canSave
                                ? 'text-ruuvi-dark bg-ruuvi-success hover:bg-ruuvi-success/90'
                                : 'text-ruuvi-text-muted bg-ruuvi-card/50 cursor-not-allowed border border-ruuvi-border'
                            }`}
                    >
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}
