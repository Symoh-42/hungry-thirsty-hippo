import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PublicLayout } from "@/components/Layout";
import Home from "@/pages/Home";
import Review from "@/pages/Review";
import Services from "@/pages/Services";
import { NotFound, PhotoCredits } from "@/pages/Misc";

// The dashboard (and its chart library) only loads for management.
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const Overview = lazy(() => import("@/pages/admin/Overview"));
const ReviewsAdmin = lazy(() => import("@/pages/admin/ReviewsAdmin"));
const Analytics = lazy(() => import("@/pages/admin/Analytics"));
const QrCodes = lazy(() => import("@/pages/admin/QrCodes"));

function Loading() {
  return (
    <div className="grid min-h-svh place-items-center bg-ivory" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-champagne border-t-transparent" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="photo-credits" element={<PhotoCredits />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="review" element={<Review />} />
          <Route path="review/:slug" element={<Review />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="reviews" element={<ReviewsAdmin />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="qr" element={<QrCodes />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
