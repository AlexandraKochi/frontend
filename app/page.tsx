"use client";
import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import axios from 'axios';

export default function Home() {
  const { login, authenticated, user, logout } = usePrivy();
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState<{soyYo: boolean, texto: string, audio?: string}[]>([]);

  // CORRECCIÓN AQUÍ: Agregamos el tipo (any) para que TypeScript no se queje
  const enviarAlBack = async (signature: any = null) => {
    if (!mensaje && !signature) return;
    
    // Si es la primera vez (sin firma), lo pongo en la pantalla
    if (!signature) {
      setChat(prev => [...prev, { soyYo: true, texto: mensaje }]);
    }

    try {
      const res = await axios.post('http://localhost:8080/api/agent/ask', {
        query: mensaje,
        signature: signature
      });

      // Si el back responde 200 OK
      setChat(prev => [...prev, { 
        soyYo: false, 
        texto: res.data.answer, 
        audio: res.data.audioUrl 
      }]);
      setMensaje('');

    } catch (error: any) {
      if (error.response?.status === 402) {
        const confirmar = confirm("Contenido Premium. ¿Pagar 0.005 SOL?");
        if (confirmar) {
          // Simulamos firma por ahora
          alert("Procesando pago en Solana...");
          // Ahora TypeScript aceptará este string
          setTimeout(() => enviarAlBack("SIM_TX_VALIDA_123"), 2000);
        }
      }
    }
  };

  if (!authenticated) {
    return (
      <main className="flex h-screen items-center justify-center">
        <button onClick={login} className="bg-blue-600 p-4 rounded-xl font-bold">
          Entrar con Privy
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4 text-white bg-slate-900">
      <div className="flex justify-between p-2">
        <span className="text-xs text-gray-400">Wallet: {user?.wallet?.address}</span>
        <button onClick={logout} className="text-red-500 text-xs font-bold">SALIR</button>
      </div>

      <div className="flex-1 overflow-y-auto border border-gray-700 rounded-lg p-4 space-y-4 bg-slate-800">
        {chat.map((c, i) => (
          <div key={i} className={`${c.soyYo ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-[80%] ${c.soyYo ? 'bg-blue-600' : 'bg-gray-700'}`}>
              <p>{c.texto}</p>
              {c.audio && (
                <div className="mt-2">
                  <audio src={c.audio} controls className="h-8 w-full" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <input 
          className="flex-1 bg-black p-3 rounded-lg border border-gray-600 text-white outline-none focus:border-blue-500"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Pregunta sobre la Antártida..."
          onKeyDown={(e) => e.key === 'Enter' && enviarAlBack()}
        />
        <button 
          onClick={() => enviarAlBack()} 
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold transition"
        >
          Enviar
        </button>
      </div>
    </main>
  );
}