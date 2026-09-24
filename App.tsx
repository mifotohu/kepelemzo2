import React, { useState, useCallback, useEffect } from 'react';
import { analyzeImage } from './services/geminiService';
import type { AnalysisResult } from './types';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Loader from './components/Loader';
import ApiKeyInput from './components/ApiKeyInput';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini-api-key', key);
    } else {
      localStorage.removeItem('gemini-api-key');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setAnalysisResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) {
      setError("Kérlek, először válassz ki egy képet.");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const base64Image = await fileToBase64(imageFile);
      const result = await analyzeImage(apiKey, base64Image, imageFile.type);
      setAnalysisResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = (err instanceof Error) ? err.message : "Ismeretlen hiba történt.";
      setError(`Hiba történt az elemzés során. (${errorMessage}) Kérlek, próbáld újra.`);
    } finally {
      setIsLoading(false);
    }
  }, [imageFile, apiKey]);
  
  const resetState = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-bunker font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-grow">
        <Header />
        
        <main className="mt-8 bg-shark border border-comet rounded-lg shadow-2xl p-6 md:p-8 transition-all duration-300 flex-grow">
          <ApiKeyInput apiKey={apiKey} onApiKeySave={handleApiKeySave} />
          {!imagePreviewUrl ? (
            <ImageUploader onFileChange={handleFileChange} />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md relative mb-6">
                <img
                  src={imagePreviewUrl}
                  alt="Feltöltött kép előnézete"
                  className="rounded-lg shadow-lg object-contain max-h-[60vh]"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-azure hover:bg-blue-600 disabled:bg-comet disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center text-lg"
                >
                  {isLoading ? 'Elemzés...' : 'Kép Elemzése'}
                </button>
                <button
                  onClick={resetState}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-nevada hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Új Kép
                </button>
              </div>
            </div>
          )}

          {isLoading && <Loader />}
          
          {error && (
            <div className="mt-8 text-center text-red-400 bg-red-900/50 border border-red-500 rounded-lg p-4">
              <p className="font-semibold">Hiba!</p>
              <p>{error}</p>
            </div>
          )}

          {analysisResult && <ResultDisplay result={analysisResult} />}
        </main>
        
        <div className="footer text-center py-8">
            <p className="text-lg text-white">MIfoto.hu - a [MI] közösségünk!</p>
            <a href="https://www.mifoto.hu" target="_blank" rel="noopener noreferrer" className="text-azure hover:underline">www.mifoto.hu</a>
        </div>
      </div>
    </div>
  );
};

export default App;