export function Footer() {
  return (
    <footer className="w-full bg-[#FDFBF7] border-t border-[#33251E]/5 py-8">
      <div className="container mx-auto px-6">

        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo.png" alt="SharePlate Logo" className="w-8 h-8 object-contain" />
            <span className="font-serif text-xl font-bold tracking-tight text-[#33251E]">
              SharePlate
            </span>
          </div>
          <p className="text-sm text-[#33251E]/70 text-center max-w-sm">
            AI-Powered Food Redistribution Platform &copy; 2026
          </p>
        </div>

      </div>
    </footer>
  );
}
