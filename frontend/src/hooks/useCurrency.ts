import { useAuth } from './useAuth';

export function useCurrency() {
  const { user } = useAuth();
  
  const fmt = (amount: number) => {
    if (typeof amount !== 'number') return amount;
    
    // Default to INR if not set, or whatever user.currency is
    const currency = user?.currency || 'INR';
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return { fmt };
}
