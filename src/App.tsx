import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { DevicesSkeleton } from "@/components/skeletons/DevicesSkeleton";
import { DeviceDetailSkeleton } from "@/components/skeletons/DeviceDetailSkeleton";
import { TablePageSkeleton } from "@/components/skeletons/TablePageSkeleton";
import { EditorSkeleton } from "@/components/skeletons/EditorSkeleton";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Devices = lazy(() => import("./pages/Devices"));
const DeviceDetail = lazy(() => import("./pages/DeviceDetail"));
const Settings = lazy(() => import("./pages/Settings"));
const Organizations = lazy(() => import("./pages/Organizations"));
const Users = lazy(() => import("./pages/Users"));
const AIConfigs = lazy(() => import("./pages/AIConfigs"));
const PageEditorPage = lazy(() => import("./pages/PageEditorPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" theme="dark" />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<Suspense fallback={<PageLoader />}><Auth /></Suspense>} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Suspense fallback={<DashboardSkeleton />}><Dashboard /></Suspense>} />
                <Route path="devices" element={<Suspense fallback={<DevicesSkeleton />}><Devices /></Suspense>} />
                <Route path="devices/:deviceId" element={<Suspense fallback={<DeviceDetailSkeleton />}><DeviceDetail /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<TablePageSkeleton />}><Settings /></Suspense>} />
                <Route path="organizations" element={<Suspense fallback={<TablePageSkeleton />}><Organizations /></Suspense>} />
                <Route path="users" element={<Suspense fallback={<TablePageSkeleton />}><Users /></Suspense>} />
                <Route path="ai-configs" element={<Suspense fallback={<TablePageSkeleton />}><AIConfigs /></Suspense>} />
                <Route path="page-editor" element={<Suspense fallback={<EditorSkeleton />}><PageEditorPage /></Suspense>} />
              </Route>
              <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
