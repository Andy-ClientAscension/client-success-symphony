
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
  onVerify: (verified: boolean) => void;
  disabled?: boolean;
  required?: boolean;
}

export function Captcha({ onVerify, disabled = false, required = true }: CaptchaProps) {
  const [captchaText, setCaptchaText] = useState<string>('');
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState<number>(0);

  // Generate a random captcha code
  const generateCaptcha = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setUserInput('');
    setIsValid(null);
  };

  // Generate canvas text
  const generateCaptchaImage = (code: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise (dots)
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.2)`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Add lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 30px Arial';
    ctx.textBaseline = 'middle';
    
    // Distribute characters evenly
    const charWidth = canvas.width / (code.length + 2);
    
    for (let i = 0; i < code.length; i++) {
      const xPos = (i + 1) * charWidth;
      const yPos = canvas.height / 2 + Math.random() * 10 - 5;
      const rotation = Math.random() * 0.4 - 0.2;
      
      ctx.save();
      ctx.translate(xPos, yPos);
      ctx.rotate(rotation);
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }

    return canvas.toDataURL();
  };

  // Verify captcha
  const verifyCaptcha = () => {
    const valid = userInput.trim() === captchaCode;
    setIsValid(valid);
    onVerify(valid);
    
    if (!valid) {
      setAttempts(prev => prev + 1);
      
      // After 3 failed attempts, generate a new captcha
      if (attempts >= 2) {
        generateCaptcha();
        setAttempts(0);
      }
    }
  };

  // Generate initial captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Generate captcha image whenever code changes
  useEffect(() => {
    if (captchaCode) {
      const imageData = generateCaptchaImage(captchaCode);
      setCaptchaText(imageData);
    }
  }, [captchaCode]);

  return (
    <div className="space-y-3 my-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {required ? "Security Verification (Required)" : "Security Verification"}
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          onClick={generateCaptcha}
          disabled={disabled}
          className="h-8 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden bg-white">
        {captchaText && (
          <div className="flex justify-center p-2">
            <img src={captchaText} alt="CAPTCHA" className="h-12" />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Input 
          type="text"
          placeholder="Enter code above"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1"
          disabled={disabled}
          aria-invalid={isValid === false}
        />
        <Button 
          type="button" 
          onClick={verifyCaptcha}
          disabled={disabled || !userInput}
          className="whitespace-nowrap"
        >
          Verify
        </Button>
      </div>
      
      {isValid === false && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription>
            Incorrect code. Please try again. {attempts >= 2 && "A new code has been generated."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
