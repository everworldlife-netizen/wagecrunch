import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Calculator from './pages/Calculator'
import Results from './pages/Results'
import Leaderboards from './pages/Leaderboards'
import BestCities from './pages/BestCities'
import WageVsRent from './pages/WageVsRent'
import BestCities100k from './pages/BestCities100k'
import RentBurdenedCities from './pages/RentBurdenedCities'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Cities from './pages/Cities'
import CityDetail from './pages/CityDetail'
import Methodology from './pages/Methodology'
import About from './pages/About'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Compare from './pages/Compare'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calculator" element={<Calculator />} />
      <Route path="/results" element={<Results />} />
      <Route path="/leaderboards" element={<Leaderboards />} />
      <Route path="/leaderboards/best-cities-for-job" element={<BestCities />} />
      <Route path="/leaderboards/wage-vs-rent" element={<WageVsRent />} />
      <Route path="/leaderboards/best-100k" element={<BestCities100k />} />
      <Route path="/leaderboards/rent-burdened" element={<RentBurdenedCities />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:slug" element={<JobDetail />} />
      <Route path="/cities" element={<Cities />} />
      <Route path="/cities/:slug" element={<CityDetail />} />
      <Route path="/methodology" element={<Methodology />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/compare" element={<Compare />} />
    </Routes>
  )
}
