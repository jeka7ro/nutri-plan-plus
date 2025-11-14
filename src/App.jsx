import './App.css'
import { Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/components/LanguageContext"
import { ThemeProvider } from "@/components/ThemeContext"
import IndexPage from "@/pages/index.jsx"
import Layout from "@/pages/Layout.jsx"
import Dashboard from "@/pages/Dashboard.jsx"
import DailyPlan from "@/pages/DailyPlan.jsx"
import Calendar from "@/pages/Calendar.jsx"
import Settings from "@/pages/Settings.jsx"
import Progress from "@/pages/Progress.jsx"
import WeightTracking from "@/pages/WeightTracking.jsx"
import Recipes from "@/pages/Recipes.jsx"
import MyRecipes from "@/pages/MyRecipes.jsx"
import Friends from "@/pages/Friends.jsx"
import Messages from "@/pages/Messages.jsx"
import Support from "@/pages/Support.jsx"
import Profile from "@/pages/Profile.jsx"
import Admin from "@/pages/Admin.jsx"
import Onboarding from "@/pages/Onboarding.jsx"
import Recommendations from "@/pages/Recommendations.jsx"
import Upgrade from "@/pages/Upgrade.jsx"
import Landing from "@/pages/Landing.jsx"

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host.startsWith('www.')) {
        const normalizedHost = host.replace(/^www\./i, '');
        const port = window.location.port ? `:${window.location.port}` : '';
        const targetUrl = `${window.location.protocol}//${normalizedHost}${port}${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.replace(targetUrl);
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<IndexPage />} />
          <Route path="/app" element={<IndexPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dailyplan" element={<DailyPlan />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/weighttracking" element={<WeightTracking />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/myrecipes" element={<MyRecipes />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App 