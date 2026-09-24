import React, { useState, useEffect } from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeySave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeySave }) => {
  const [currentKey, setCurrentKey] = useState(apiKey);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCurrentKey(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    onApiKeySave(currentKey);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleClear = () => {
    setCurrentKey('');
    onApiKeySave('');
    setIsEditing(true);
  };

  if (!isEditing) {
    return (
      <div className="flex items-center justify-between p-3 bg-shark/50 border border-comet rounded-lg mb-6">
        <p className="text-nevada text-sm">{apiKey ? 'Egyéni API Kulcs Beállítva' : 'Alapértelmezett rendszer API kulcs használatban'}</p>
        <div>
          <button onClick={handleEdit} className="text-sm bg-nevada hover:bg-gray-600 text-white font-bold py-1 px-3 rounded-md transition-colors duration-300 mr-2">
            Módosítás
          </button>
          {apiKey && (
            <button onClick={handleClear} className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-md transition-colors duration-300">
              Törlés
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-azure rounded-lg mb-6 bg-shark/50">
        <h3 className="font-semibold text-whisper mb-2">Egyéni Google AI API Kulcs Megadása (Opcionális)</h3>
        <p className="text-sm text-white mb-3">
          Az alkalmazás alapértelmezetten a saját rendszer kulcsát használja. Ha szeretnéd, megadhatsz egy saját, ingyenes Google AI API kulcsot is.
          <br />
          <strong>A kulcsot biztonságosan, csak a te böngésződben, a helyi tárolóban mentjük el, soha nem küldjük tovább sehova.</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
            <input
                type="password"
                value={currentKey}
                onChange={(e) => setCurrentKey(e.target.value)}
                placeholder="Illeszd be az API kulcsod"
                className="flex-grow bg-bunker border border-comet text-whisper rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-azure"
                aria-label="Google AI API Kulcs"
            />
            <button
                onClick={handleSave}
                disabled={!currentKey}
                className="bg-azure hover:bg-blue-600 disabled:bg-comet disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
            >
                Mentés
            </button>
        </div>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-400 hover:underline mt-2 inline-block">
            API Kulcs beszerzése a Google AI Studio-ból
        </a>
    </div>
  );
};

export default ApiKeyInput;