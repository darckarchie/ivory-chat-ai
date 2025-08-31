import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import { normalizeCIPhone } from '@/lib/services/supabase-service';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function PhoneInput({ 
  value, 
  onChange, 
  error, 
  label = "Numéro de téléphone",
  placeholder = "0123456789",
  required = false 
}: PhoneInputProps) {
  const [localValue, setLocalValue] = useState(value.replace('+225', ''));
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^0-9]/g, ''); // Seulement les chiffres
    
    // Limiter à 10 chiffres
    if (input.length <= 10) {
      setLocalValue(input);
      setValidationError(null);
      
      // Validation en temps réel
      if (input.length === 10) {
        try {
          const normalized = normalizeCIPhone(input);
          onChange(normalized);
          setValidationError(null);
        } catch (err) {
          setValidationError(err instanceof Error ? err.message : 'Numéro invalide');
        }
      } else if (input.length > 0) {
        setValidationError(`${10 - input.length} chiffres manquants`);
      } else {
        setValidationError(null);
      }
    }
  };

  const displayError = validationError || error;

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="flex items-center gap-2">
        <Phone className="h-4 w-4" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
          <span className="text-sm font-medium">🇨🇮 +225</span>
          <div className="w-px h-4 bg-border"></div>
        </div>
        
        <Input
          id="phone"
          type="tel"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`pl-20 ${displayError ? 'border-destructive' : ''}`}
          maxLength={10}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Format: 10 chiffres commençant par 0
        </div>
        <div className="text-xs text-muted-foreground">
          {localValue.length}/10
        </div>
      </div>
      
      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}
      
      {localValue.length === 10 && !displayError && (
        <p className="text-sm text-success">
          ✓ Numéro valide : +225{localValue.substring(1)}
        </p>
      )}
    </div>
  );
}