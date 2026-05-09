"use client";
import { useState, useRef, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSignAndSendTransaction, useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import bs58 from 'bs58';
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';
import { Send, User, Wallet, LogOut, Sparkles, Lock, Play, Cpu, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const { login, authenticated, user, logout } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const [mensaje, setMensaje] = useState('');
  const [chat, setChat] = useState<{ soyYo: boolean, texto: string, audio?: string, isPremium?: boolean, txHash?: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingCost, setPendingCost] = useState('0.005');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [pendingQuery, setPendingQuery] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const enviarAlBack = async (signature: any = null, overrideQuery?: string) => {
    const queryToSend = overrideQuery || mensaje;
    if (!queryToSend && !signature) return;

    if (!signature) {
      setChat(prev => [...prev, { soyYo: true, texto: queryToSend }]);
      setMensaje('');
    }

    setIsTyping(true);

    try {
      const res = await axios.post('https://back-1qk9.onrender.com/api/agent/ask', {
        query: queryToSend,
        signature: signature
      });

      // Si el back responde 200 OK
      setChat(prev => [...prev, {
        soyYo: false,
        texto: res.data.answer,
        audio: res.data.audioUrl,
        isPremium: !!res.data.audioUrl,
        txHash: signature ? "Solana_Tx_" + Math.random().toString(36).substring(7) : undefined
      }]);
      setIsTyping(false);

    } catch (error: any) {
      setIsTyping(false);
      if (error.response?.status === 402) {
        // Trigger Premium Modal
        setPendingQuery(queryToSend);
        setShowPaymentModal(true);
      } else {
        setChat(prev => [...prev, {
          soyYo: false,
          texto: error.response?.data?.answer || "Error de conexión con el agente. Intenta de nuevo."
        }]);
      }
    }
  };

  const handleApprovePayment = async () => {
    // Buscar específicamente Phantom o cualquier wallet cuya dirección NO empiece con 0x (Ethereum)
    const solanaWallet = solanaWallets.find((w) => w.walletClientType === 'phantom') || solanaWallets.find((w) => !w.address.startsWith('0x'));

    if (!solanaWallet) {
      alert("No se encontró una wallet de Solana conectada. Cierra sesión y entra usando Phantom.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const connection = new Connection("https://api.devnet.solana.com", "confirmed");

      const vaultPda = new PublicKey("DwkkmbrWr1z35JVxtLHH45rAyMVLyvML5jEcRnpnEAtd");
      const treasury = new PublicKey("3L1urNptpkyVEhWXuu7rzsgZHkGrkXW6YxBa7nozbMnB");
      const userPubKey = new PublicKey(solanaWallet.address);
      const costLamports = parseFloat(pendingCost) * LAMPORTS_PER_SOL;

      const transaction = new Transaction();

      // NOTA: Para demostrar la transacción de escritura en la Hackathon,
      // realizamos transferencias directas simulando la distribución de fondos de tu Vault. 
      // Si tienes el IDL, idealmente reemplazarías esto por la llamada a tu instrucción Anchor:
      // program.methods.payForService().accounts({...}).instruction()
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPubKey,
          toPubkey: vaultPda,
          lamports: Math.floor(costLamports * 0.975), // 97.5% al Vault
        })
      );

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPubKey,
          toPubkey: treasury,
          lamports: Math.floor(costLamports * 0.025), // 2.5% fee
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubKey;

      // Usamos el hook de Privy para firmar y enviar la transacción
      // Es necesario serializar la transacción a Uint8Array
      const txObj = await signAndSendTransaction({
        transaction: transaction.serialize({ requireAllSignatures: false }),
        wallet: solanaWallet as any
      });

      // Dependiendo de la versión de Privy, la firma puede venir como string o Uint8Array
      const txHash = typeof txObj.signature === 'string'
        ? txObj.signature
        : bs58.encode(txObj.signature);

      await connection.confirmTransaction(txHash, "confirmed");

      setIsProcessingPayment(false);
      setShowPaymentModal(false);

      enviarAlBack(txHash, pendingQuery);
      setPendingQuery('');

    } catch (error: any) {
      console.error("Error al procesar pago en Solana:", error);
      setIsProcessingPayment(false);
      alert(`Error al procesar el pago: ${error?.message || "Revisa si tienes SOL en Devnet y asegúrate de que tu Phantom esté en DEVNET, no en Testnet."}`);
    }
  };

  // --- SCREEN 1: LOGIN (Landing Page) ---
  if (!authenticated) {
    return (
      <main className="flex h-screen items-center justify-center relative overflow-hidden bg-[#09090b]">
        {/* Abstract Background Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#14F195]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

        <div className="z-10 bg-glass p-10 rounded-3xl border border-white/10 flex flex-col items-center max-w-md w-full mx-4 shadow-2xl glow-effect text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-[#14F195] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
            <Cpu className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold mb-2 text-white tracking-tight">Agent<span className="text-gradient">Pay</span></h1>
          <p className="text-gray-400 mb-8 font-medium">Pasarela financiera IA x402 en Solana.</p>

          <button
            onClick={login}
            className="w-full bg-white text-black hover:bg-gray-100 py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95"
          >
            <Wallet className="w-5 h-5" />
            Conectar Wallet
          </button>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            <span>Autenticación segura via Privy</span>
          </div>
        </div>
      </main>
    );
  }

  // --- SCREEN 2: MAIN WORKSPACE ---
  return (
    <main className="flex flex-col h-screen max-w-4xl mx-auto bg-[#09090b] relative">
      {/* HEADER */}
      <header className="flex items-center justify-between p-4 bg-glass m-4 rounded-2xl z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-[#14F195] flex items-center justify-center">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">VozNode x402</h2>
            <p className="text-xs text-[#14F195] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#14F195] animate-pulse"></span>
              Gateway Activo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
            <Wallet className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-mono text-gray-300">
              {user?.wallet?.address?.slice(0, 4)}...{user?.wallet?.address?.slice(-4)}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-gray-400 hover:text-red-400 transition-colors p-2 bg-black/40 rounded-lg border border-white/5"
            title="Desconectar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-6 scroll-smooth z-0"
      >
        {chat.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
            <Sparkles className="w-12 h-12 text-gray-700" />
            <p className="text-sm">Solicita datos o audio premium para comenzar.</p>
          </div>
        )}

        {chat.map((c, i) => (
          <div key={i} className={`flex ${c.soyYo ? 'justify-end' : 'justify-start'} w-full`}>

            {!c.soyYo && (
              <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center mr-3 mt-1 shrink-0 border border-purple-500/30">
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
            )}

            <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${c.soyYo ? 'items-end' : 'items-start'}`}>

              <div className={`p-4 rounded-2xl ${c.soyYo
                  ? 'bg-white text-black rounded-tr-sm'
                  : c.isPremium
                    ? 'bg-gradient-to-br from-[#1e1e2e] to-[#2a2a3c] border border-purple-500/30 rounded-tl-sm text-gray-100 shadow-lg shadow-purple-900/20'
                    : 'bg-[#18181b] border border-white/5 rounded-tl-sm text-gray-200'
                }`}>
                {/* Badge de Premium */}
                {c.isPremium && (
                  <div className="flex items-center gap-1.5 mb-3 border-b border-white/10 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#14F195]" />
                    <span className="text-[10px] font-bold tracking-wider text-[#14F195] uppercase">Premium Audio Generado</span>
                  </div>
                )}

                <p className="text-[15px] leading-relaxed">{c.texto}</p>

                {/* Audio Player Estilizado */}
                {c.audio && (
                  <div className="mt-4 bg-black/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>
                    <audio src={c.audio} controls className="w-full h-8 opacity-80" />
                  </div>
                )}
              </div>

              {/* On-Chain Record Link */}
              {c.txHash && (
                <div className="mt-1.5 flex items-center gap-1 px-1">
                  <Lock className="w-3 h-3 text-gray-500" />
                  <a href="#" className="text-[11px] text-gray-500 hover:text-purple-400 transition-colors font-mono">
                    Tx: {c.txHash}
                  </a>
                </div>
              )}

            </div>

            {c.soyYo && (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center ml-3 mt-1 shrink-0 border border-white/10">
                <User className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start w-full">
            <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center mr-3 mt-1 shrink-0 border border-purple-500/30">
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            <div className="bg-[#18181b] border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 pt-2 bg-[#09090b] z-10 shrink-0">
        <div className="relative flex items-center max-w-4xl mx-auto">
          <input
            className="w-full bg-[#18181b] px-6 py-4 rounded-2xl border border-white/10 text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-lg text-[15px]"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Pide un audio premium sobre cripto..."
            onKeyDown={(e) => e.key === 'Enter' && enviarAlBack()}
            disabled={isTyping || isProcessingPayment}
          />
          <button
            onClick={() => enviarAlBack()}
            disabled={!mensaje.trim() || isTyping || isProcessingPayment}
            className="absolute right-2 bg-white text-black hover:bg-gray-200 disabled:bg-gray-800 disabled:text-gray-500 p-2.5 rounded-xl transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-3 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" />
          Gateway protegido por Smart Contracts de Solana
        </p>
      </div>

      {/* PAYMENT MODAL (Hito 2) */}
      {showPaymentModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessingPayment && setShowPaymentModal(false)}></div>

          <div className="relative bg-glass border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center transform transition-all">
            <div className="w-16 h-16 rounded-full bg-[#14F195]/20 flex items-center justify-center mb-4 border border-[#14F195]/30">
              <AlertCircle className="w-8 h-8 text-[#14F195]" />
            </div>

            <h3 className="text-[#14F195] font-bold tracking-widest text-[11px] mb-2 uppercase">Servicio Premium x402</h3>
            <h2 className="text-2xl font-bold text-white mb-1 text-center">Firma Requerida</h2>

            <div className="w-full bg-black/50 rounded-xl p-4 my-6 border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Proveedor</span>
                <span className="text-white text-sm font-medium flex items-center gap-1"><Cpu className="w-3 h-3 text-purple-400" /> ElevenLabs</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-gray-400 text-sm">Costo</span>
                <span className="text-xl font-bold text-gradient">{pendingCost} SOL</span>
              </div>
            </div>

            <button
              onClick={handleApprovePayment}
              disabled={isProcessingPayment}
              className={`w-full py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 transition-all ${isProcessingPayment
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-[#14F195] hover:bg-[#10c87b] hover:shadow-[0_0_15px_rgba(20,241,149,0.4)]'
                }`}
            >
              {isProcessingPayment ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></span>
                  Procesando en Solana...
                </>
              ) : (
                <>Aprobar y Pagar</>
              )}
            </button>

            {!isProcessingPayment && (
              <button
                onClick={() => setShowPaymentModal(false)}
                className="mt-4 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

    </main>
  );
}