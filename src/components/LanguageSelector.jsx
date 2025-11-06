import React from 'react';
import { useLanguage } from './LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ro">🇷🇴 RO</SelectItem>
          <SelectItem value="en">🇬🇧 EN</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}