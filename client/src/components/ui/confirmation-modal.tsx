import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    variant = "destructive",
}: ConfirmationModalProps) {
    if (!isOpen) return null

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className={cn(
                    "relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg",
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">{title}</h2>
                </div>
                <div className="mb-6">
                    <p className="text-sm text-gray-600">{message}</p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        onClick={handleConfirm}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    )
}
