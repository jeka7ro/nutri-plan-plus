import './App.css'
import { Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { LanguageProvider } from "@/components/LanguageContext"
import { ThemeProvider } from "@/components/ThemeContext"
import IndexPage from "@/pages/index.jsx"
import Layout from "@/pages/Layout.jsx"
import Dashboard from "@/pages/Dashboard.jsx"
import DailyPlan from "@/pages/DailyPlan.jsx"
import Progress from "@/pages/Progress.jsx"
import WeightTracking from "@/pages/WeightTracking.jsx"
import Recipes from "@/pages/Recipes.jsx"
import Friends from "@/pages/Friends.jsx"
import Messages from "@/pages/Messages.jsx"
import Support from "@/pages/Support.jsx"
import Profile from "@/pages/Profile.jsx"
import Admin from "@/pages/Admin.jsx"
import Onboarding from "@/pages/Onboarding.jsx"
import Recommendations from "@/pages/Recommendations.jsx"

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dailyplan" element={<DailyPlan />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/weighttracking" element={<WeightTracking />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recommendations" element={<Recommendations />} />
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