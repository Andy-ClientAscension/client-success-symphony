
import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  onStrengthChange?: (strength: number) => void;
}

export function PasswordStrengthMeter({ 
  password, 
  onStrengthChange 
}: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      
      if (onStrengthChange) {
        onStrengthChange(0);
      }
      return;
    }

    // Check requirements
    const newRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    setRequirements(newRequirements);

    // Calculate strength (0-100)
    const requirementCount = Object.values(newRequirements).filter(Boolean).length;
    const newStrength = Math.min(100, requirementCount * 20); // 20% per requirement
    
    setStrength(newStrength);
    
    if (onStrengthChange) {
      onStrengthChange(newStrength);
    }
  }, [password, onStrengthChange]);

  const getColorClass = () => {
    if (strength === 0) return "bg-gray-200";
    if (strength < 40) return "bg-red-500";
    if (strength < 60) return "bg-orange-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength === 0) return "Enter password";
    if (strength < 40) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  const RequirementItem = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center space-x-2">
      {met ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertCircle className="h-4 w-4 text-gray-400" />
      )}
      <span className={`text-xs ${met ? "text-green-700" : "text-gray-600"}`}>{label}</span>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Password Strength</span>
        <span className={`text-xs
          ${strength === 0 ? "text-gray-500" : ""} 
          ${strength > 0 && strength < 40 ? "text-red-500" : ""} 
          ${strength >= 40 && strength < 60 ? "text-orange-500" : ""} 
          ${strength >= 60 && strength < 80 ? "text-yellow-600" : ""} 
          ${strength >= 80 ? "text-green-600" : ""}
        `}>
          {getStrengthLabel()}
        </span>
      </div>
      <Progress 
        value={strength} 
        className={`h-2 ${getColorClass()}`} 
      />
      <div className="pt-2 grid grid-cols-2 gap-y-1 gap-x-4">
        <RequirementItem met={requirements.length} label="At least 8 characters" />
        <RequirementItem met={requirements.uppercase} label="Uppercase letter (A-Z)" />
        <RequirementItem met={requirements.lowercase} label="Lowercase letter (a-z)" />
        <RequirementItem met={requirements.number} label="Number (0-9)" />
        <RequirementItem met={requirements.special} label="Special character (!@#$%)" />
      </div>
    </div>
  );
}
