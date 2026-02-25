import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, CreditCard, ShieldCheck, CheckCircle2, 
    Loader2, ArrowRight, Zap, Info, Smartphone, Check,
    QrCode, Landmark, Wallet, MapPin, Building
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useDeliveryProfile } from '../context/DeliveryProfileContext';
import { Button, Card, Badge } from './UI';

const PaymentModal = ({ isOpen, onClose, orderData, onConfirm }) => {
    const { theme } = useTheme();
    const { profile } = useDeliveryProfile();
    const [step, setStep] = useState('summary'); // summary, method_selection, upi_qr, card_checkout, net_banking, address_verify, processing, success
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [selectedCard, setSelectedCard] = useState('existing');
    const [selectedBank, setSelectedBank] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const items = orderData?.items || orderData?.order?.items || orderData?.pendingOrderData?.items || [];
    const totalAmount = orderData?.total_price || orderData?.totalAmount || orderData?.order?.totalAmount || orderData?.pendingOrderData?.totalAmount || 0;

    const banks = [
        { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
        { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
        { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
        { id: 'axis', name: 'Axis Bank', code: 'AXIS' }
    ];

    const handleConfirmPayment = () => {
        setStep('processing');
        setIsProcessing(true);
        
        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
            setTimeout(() => {
                onConfirm();
                onClose();
                setStep('summary');
            }, 1500);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-brand-background/60 backdrop-blur-sm"
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className={`
                    relative w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl
                    ${theme === 'dark' ? 'bg-[#0f111a] border-white/10' : 'bg-white border-slate-200'}
                    bg-brand-card border-brand-border-color transition-colors duration-500
                `}
            >
                {/* Brand Identity Bar */}
                <div className="flex h-1.5 shadow-sm">
                    <div className="flex-1 bg-brand-primary opacity-80" />
                    <div className="flex-1 bg-brand-secondary opacity-80" />
                    <div className="flex-1 bg-brand-accent opacity-80" />
                </div>

                {/* Header */}
                <div className={`p-5 flex items-center justify-between border-b transition-colors duration-500 border-brand-border-color ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50/50'}`}>
                    <div className="flex items-center space-x-3">
                        <div className="flex space-x-[-10px]">
                           <div className="w-8 h-8 rounded-full bg-brand-primary opacity-90 shadow-lg shadow-brand-primary/20" />
                           <div className="w-8 h-8 rounded-full bg-brand-secondary opacity-90 shadow-lg shadow-brand-secondary/20" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black tracking-tight text-brand-text-primary flex items-center">
                                Secure Checkout
                            </h3>
                            <p className="text-[8px] font-bold opacity-40 uppercase tracking-[0.2em] text-brand-primary">Pharmaceutical Grade Security</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center hover:bg-brand-hover-tint rounded-full transition-all text-brand-text-secondary">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {step === 'summary' && (
                            <motion.div key="summary" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black tracking-tight text-brand-text-primary">Order Summary</h4>
                                    <p className="text-xs font-medium opacity-40 text-brand-text-secondary">Review your prescription and items</p>
                                </div>

                                <div className={`space-y-3 rounded-2xl p-5 border transition-all duration-500 ${theme === 'dark' ? 'bg-[#151722] border-white/5 shadow-inner' : 'bg-brand-background/30 border-brand-border-color'}`}>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
                                        {items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center group">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs font-bold text-brand-text-primary">{item.medicine_name}</span>
                                                    <span className="text-[9px] font-black opacity-30 px-1.5 py-0.5 rounded border border-brand-border-color uppercase text-brand-text-secondary">x{item.quantity}</span>
                                                </div>
                                                <span className="text-xs font-black text-brand-text-primary">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-3 border-t border-brand-border-color flex justify-between items-baseline">
                                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest text-brand-text-secondary">Grand Total</span>
                                        <span className="text-2xl font-black text-brand-primary">₹{totalAmount}</span>
                                    </div>
                                </div>

                                <Button 
                                    onClick={() => setStep('method_selection')} 
                                    className="w-full h-14 rounded-2xl bg-brand-primary text-white hover:bg-brand-secondary border-none text-sm font-black transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                                >
                                    Confirm Order <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </motion.div>
                        )}

                        {step === 'method_selection' && (
                            <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                                <div className="space-y-1 mb-2">
                                    <h4 className="text-lg font-black tracking-tight text-brand-text-primary">Select Payment Method</h4>
                                    <p className="text-xs font-medium opacity-40 text-brand-text-secondary">Choose your preferred way to pay</p>
                                </div>

                                <div className="grid gap-2 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                                    {[
                                        { id: 'upi', icon: QrCode, label: 'UPI / QR Code', sub: 'GPay, PhonePe, Paytm' },
                                        { id: 'card', icon: CreditCard, label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                                        { id: 'banking', icon: Landmark, label: 'Net Banking', sub: 'All Major Indian Banks' },
                                        { id: 'cod', icon: Wallet, label: 'Cash on Delivery', sub: 'Pay on delivery at door' }
                                    ].map((m) => (
                                        <button 
                                            key={m.id}
                                            onClick={() => setSelectedMethod(m.id)}
                                            className={`p-3 rounded-2xl border-2 flex items-center space-x-3 transition-all ${selectedMethod === m.id ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/5' : 'border-brand-border-color hover:border-brand-primary/30'}`}
                                        >
                                            <div className={`p-2 rounded-xl transition-colors ${selectedMethod === m.id ? 'bg-brand-primary text-white' : 'bg-brand-hover-tint text-brand-text-secondary'}`}>
                                                <m.icon size={18} />
                                            </div>
                                            <div className="text-left flex-1 font-black">
                                                <p className="text-xs">{m.label}</p>
                                                <p className="text-[9px] opacity-40">{m.sub}</p>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedMethod === m.id ? 'border-brand-primary bg-brand-primary' : 'border-brand-border-color'}`}>
                                                {selectedMethod === m.id && <Check size={10} className="text-white" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <Button variant="ghost" onClick={() => setStep('summary')} className="flex-1 h-12">Back</Button>
                                    <Button 
                                        onClick={() => {
                                            if (selectedMethod === 'upi') setStep('upi_qr');
                                            else if (selectedMethod === 'card') setStep('card_checkout');
                                            else if (selectedMethod === 'banking') setStep('net_banking');
                                            else if (selectedMethod === 'cod') setStep('address_verify');
                                        }} 
                                        className="flex-[2] h-12 bg-brand-primary hover:bg-brand-secondary text-white font-black text-xs"
                                    >
                                        {selectedMethod === 'cod' ? 'Verify Delivery' : `Proceed to Pay ₹${totalAmount}`}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'net_banking' && (
                            <motion.div key="net_banking" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black tracking-tight text-brand-text-primary">Net Banking</h4>
                                    <p className="text-xs font-medium opacity-40 text-brand-text-secondary">Select your bank from the list</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {banks.map((bank) => (
                                        <button 
                                            key={bank.id}
                                            onClick={() => setSelectedBank(bank.id)}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${selectedBank === bank.id ? 'border-brand-primary bg-brand-primary/10 shadow-lg shadow-brand-primary/5' : 'border-brand-border-color hover:border-brand-primary/30'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${selectedBank === bank.id ? 'bg-brand-primary text-white' : 'bg-brand-hover-tint text-brand-text-secondary'}`}>
                                                {bank.code}
                                            </div>
                                            <p className="text-[10px] font-black">{bank.name}</p>
                                        </button>
                                    ))}
                                </div>

                                <div className="flex space-x-3 pt-2">
                                    <Button variant="ghost" onClick={() => setStep('method_selection')} className="flex-1 h-12">Back</Button>
                                    <Button 
                                        onClick={handleConfirmPayment} 
                                        disabled={!selectedBank}
                                        className="flex-[2] h-12 bg-brand-primary hover:bg-brand-secondary text-white font-black text-xs disabled:opacity-50"
                                    >
                                        Pay ₹{totalAmount}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'address_verify' && (
                            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black tracking-tight text-brand-text-primary">Verify Address</h4>
                                    <p className="text-xs font-medium opacity-40 text-brand-text-secondary">Confirm your delivery point for COD</p>
                                </div>

                                <div className={`p-5 rounded-[2rem] border-2 transition-all duration-500 bg-brand-primary/5 border-brand-primary/20 shadow-xl shadow-brand-primary/5`}>
                                    <div className="flex items-start space-x-4">
                                        <div className="p-3 rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/30">
                                            <MapPin size={20} />
                                        </div>
                                        <div className="space-y-1">
                                            <h5 className="text-sm font-black text-brand-text-primary">Clinical Delivery Point</h5>
                                            <p className="text-xs font-bold text-brand-text-secondary leading-relaxed opacity-70">
                                                {profile?.address1 || profile?.street || 'Not specified'}<br />
                                                {profile?.city || 'City'} {profile?.pin || profile?.zipCode || '000000'}
                                            </p>
                                            <div className="pt-2 flex items-center text-[10px] font-black text-brand-primary uppercase tracking-widest">
                                                <Building size={12} className="mr-1.5" /> Pharmacy Logistics Verified
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-brand-card border border-brand-border-color">
                                    <div className="flex items-center space-x-3 text-brand-text-primary">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                            <Wallet size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Payment Type</p>
                                            <p className="text-xs font-black">Cash on Delivery (₹{totalAmount})</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <Button variant="ghost" onClick={() => setStep('method_selection')} className="flex-1 h-12">Change Method</Button>
                                    <Button onClick={handleConfirmPayment} className="flex-[2] h-12 bg-brand-primary hover:bg-brand-secondary text-white font-black text-xs">
                                        Confirm & Place Order
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'upi_qr' && (
                            <motion.div key="upi" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 flex flex-col items-center">
                                <div className="text-center space-y-1">
                                    <h4 className="text-lg font-black tracking-tight text-brand-text-primary">Scan to Pay</h4>
                                    <p className="text-xs font-medium opacity-40 text-brand-text-secondary">Scan using any UPI App</p>
                                </div>

                                <div className={`p-4 rounded-3xl bg-white shadow-xl flex flex-col items-center border ${theme === 'dark' ? 'border-white/10' : 'border-slate-100'}`}>
                                    <div className="w-48 h-48 bg-gray-50 rounded-2xl border-4 border-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 p-4 opacity-80">
                                            {Array.from({length: 16}).map((_, i) => (
                                                <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-slate-900' : 'bg-transparent'}`} />
                                            ))}
                                        </div>
                                        <div className="z-10 bg-white p-2 rounded shadow-sm">
                                            <div className="w-8 h-8 rounded-full bg-brand-primary" />
                                        </div>
                                        <div className="mt-2 text-[8px] font-black text-slate-800 z-10 tracking-[3px] uppercase">BHIM UPI</div>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to Pay</p>
                                        <p className="text-xl font-black text-slate-900">₹{totalAmount}</p>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <div className={`p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                                        <p className="text-[9px] font-black opacity-30 uppercase tracking-widest text-brand-text-secondary mb-1">Verify UPI ID</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-brand-text-primary">pharmacy@upi</span>
                                            <Badge variant="success" className="text-[8px] h-4">Verified</Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <Button variant="ghost" onClick={() => setStep('method_selection')} className="flex-1 h-12">Back</Button>
                                        <Button onClick={handleConfirmPayment} className="flex-[2] h-12 bg-brand-primary hover:bg-brand-secondary text-white font-black text-xs">
                                            Confirm Success
                                        </Button>
                                    </div>
                                    <p className="text-[8px] text-center opacity-30 font-bold uppercase tracking-widest">Auto-processing after scan...</p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'card_checkout' && (
                            <motion.div key="card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 text-brand-text-secondary">Saved Cards</p>
                                </div>

                                <div className="space-y-2">
                                    <button 
                                        onClick={() => setSelectedCard('existing')}
                                        className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 ${selectedCard === 'existing' ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border-color bg-brand-background/30 hover:border-brand-primary/30'}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-5 bg-black/20 rounded flex items-center justify-center p-0.5 border border-brand-border-color shadow-sm">
                                                <div className="flex space-x-[-3px]">
                                                   <div className="w-3 h-3 rounded-full bg-brand-primary/50" />
                                                   <div className="w-3 h-3 rounded-full bg-brand-secondary/50" />
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-xs font-black text-brand-text-primary">Secured ···· 4242</p>
                                                <p className="text-[9px] font-medium opacity-30 text-brand-text-secondary">Vaulted Token</p>
                                            </div>
                                        </div>
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selectedCard === 'existing' ? 'border-brand-primary bg-brand-primary scale-110 shadow-lg shadow-brand-primary/40' : 'border-brand-border-color'}`}>
                                            {selectedCard === 'existing' && <Check size={10} className="text-white" />}
                                        </div>
                                    </button>

                                    <div className="relative group grayscale">
                                        <div className="p-5 rounded-2xl border-2 border-brand-border-color opacity-50 cursor-not-allowed">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-brand-text-primary">New Card Interface</p>
                                                <CreditCard size={12} className="text-brand-text-secondary" />
                                            </div>
                                            <div className="space-y-3">
                                                <div className={`h-10 w-full rounded-xl border px-3 flex items-center transition-all duration-500 ${theme === 'dark' ? 'bg-[#0a0c14] border-white/5' : 'bg-white border-brand-border-color shadow-inner'}`}>
                                                    <span className="text-[10px] font-mono opacity-20 text-brand-text-primary">CARD NUMBER</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex space-x-2 pt-2">
                                    <Button variant="ghost" onClick={() => setStep('method_selection')} className="flex-1 h-12">Back</Button>
                                    <Button onClick={handleConfirmPayment} className="flex-[2] h-12 bg-brand-primary hover:bg-brand-secondary text-white font-black text-xs shadow-lg shadow-brand-primary/20">
                                        Confirm Payment ₹{totalAmount}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'processing' && (
                            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center justify-center space-y-6">
                                <div className="relative">
                                    <motion.div 
                                        className="w-24 h-24 rounded-full border-[3px] border-brand-primary/20"
                                        animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="flex space-x-[-8px]">
                                           <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 rounded-full bg-brand-primary shadow-lg shadow-brand-primary/30" />
                                           <motion.div animate={{ scale: [1.1, 1, 1.1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-10 h-10 rounded-full bg-brand-secondary shadow-lg shadow-brand-secondary/30" />
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center space-y-1">
                                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-brand-primary underline underline-offset-8 decoration-brand-accent/30 decoration-2">Verifying {selectedMethod === 'cod' ? 'Order' : 'Payment'}</h4>
                                    <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest text-brand-text-secondary animate-pulse">
                                        {selectedMethod === 'cod' ? 'Confirming with Logistics Core...' : 'Requesting Banking Confirmation...'}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-12 flex flex-col items-center justify-center space-y-4">
                                <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }} 
                                    className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                                >
                                    <CheckCircle2 size={40} className="text-white" />
                                </motion.div>
                                <div className="text-center space-y-1">
                                    <h4 className="text-2xl font-black text-brand-text-primary tracking-tight">Order Confirmed</h4>
                                    <div className="flex items-center justify-center space-x-2">
                                        <p className="text-xs font-bold opacity-30 uppercase tracking-widest text-brand-text-secondary">
                                            {selectedMethod === 'cod' ? 'COD VERIFIED' : 'TXN SUCCESS'}
                                        </p>
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <p className="text-[10px] font-black text-emerald-500 tracking-wider uppercase">Preparing Medicines</p>
                                    </div>
                                </div>
                                {selectedMethod === 'cod' && (
                                    <p className="text-[10px] font-bold text-center opacity-40 text-brand-text-secondary">Please keep ₹{totalAmount} ready at delivery.</p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                <div className={`p-3 border-t transition-colors duration-500 border-brand-border-color flex items-center justify-center space-x-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50/50'}`}>
                    <div className="flex space-x-1.5 grayscale opacity-30">
                        <div className="w-5 h-3 bg-brand-card rounded flex items-center justify-center p-0.5 border border-brand-border-color shadow-sm"><div className="flex space-x-[-1.5px]"><div className="w-1.5 h-1.5 rounded-full bg-brand-primary" /><div className="w-1.5 h-1.5 rounded-full bg-brand-secondary" /></div></div>
                        <div className="w-5 h-3 bg-brand-card rounded flex items-center justify-center p-0.5 font-black text-[4px] text-brand-primary border border-brand-border-color uppercase shadow-sm">PAY</div>
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest opacity-20 text-brand-text-secondary">Securing your healthcare journey</span>
                </div>
            </motion.div>
        </div>
    );
};


export default PaymentModal;
