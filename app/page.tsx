import DashboardPage from "@/components/DashboardPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Header from '@/components/Header'

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="font-sans min-h-screen">
        <Header />
        <main className="flex flex-col items-center justify-center p-8">
          <DashboardPage />
        </main>
      </div>
    </ProtectedRoute>
  );
}
