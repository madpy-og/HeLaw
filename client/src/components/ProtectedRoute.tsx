import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // TODO: Nanti ubah ini menjadi state autentikasi yang sesungguhnya (misal dari context/zustand)
  const isAuthenticated = false; // Ubah ke true jika ingin melihat halaman chat/profile saat ini

  if (!isAuthenticated) {
    // Jika belum login, lempar kembali ke halaman login
    return <Navigate to="/login" replace />;
  }

  // Jika sudah login, render halaman anak yang ada di dalam rute ini
  return <Outlet />;
}
