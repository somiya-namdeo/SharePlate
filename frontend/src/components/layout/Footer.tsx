import { Utensils } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#FDFBF7] border-t border-[#33251E]/5 py-8">
      <div className="container mx-auto px-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#F07154] p-1.5 rounded-full text-white opacity-80">
            <Utensils size={16} strokeWidth={2.5} />
          </div>
          <p className="text-sm text-[#33251E]/60">
            &copy; 2026 SharePlate — rescue, match, deliver.
          </p>
        </div>
      </div>
    </footer>
  );
}
