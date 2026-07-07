import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DashboardPreview } from '../components/ui/DashboardPreview';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="font-serif text-4xl text-[#33251E] mb-8">Your Dashboard</h1>
        <DashboardPreview />
      </main>
      <Footer />
    </div>
  );
}
