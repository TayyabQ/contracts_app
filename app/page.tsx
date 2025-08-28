import DashboardPage from "@/components/DashboardPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from '@/components/Header'

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <Header />
        <main>
          <DashboardPage />
        </main>
      </div>
    </ProtectedRoute>
  );
}
