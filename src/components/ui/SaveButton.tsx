import { Save } from 'lucide-react';

interface SaveButtonProps {
  onClick: () => Promise<void>; // Changé en Promise pour gérer l'async
  saving: boolean;
  saved: boolean;
  disabled?: boolean;
}

export function SaveButton({
  onClick,
  saving,
  saved,
  disabled = false, // Valeur par défaut
}: SaveButtonProps) {
  const handleClick = async () => {
    if (disabled || saving || saved) return;
    await onClick();
  };

  const getButtonStyle = () => {
    if (saving) return 'bg-gray-100 text-gray-400 cursor-not-allowed';
    if (saved) return 'bg-green-500 text-white hover:bg-green-600';
    if (disabled) return 'bg-gray-300 text-gray-600 cursor-not-allowed';
    return 'bg-blue-600 text-white hover:bg-blue-700';
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || saving || saved}
      className={`
        relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
        ${getButtonStyle()}
        flex items-center gap-2 disabled:opacity-50
      `}
    >
      {!saving && (
        <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
      )}

      {saving ? (
        <>
          <span>Enregistrement...</span>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </>
      ) : saved ? (
        'Enregistré'
      ) : (
        'Enregistrer les modifications'
      )}
    </button>
  );
}
