import { NavLink } from "react-router-dom";
import { FiGrid, FiHome, FiMapPin, FiList } from "react-icons/fi";

const navItemClass = ({ isActive }) =>
  `flex flex-col items-center gap-1 text-xs font-medium transition ${
    isActive ? "text-amber-600" : "text-navy-800 hover:text-amber-500"
  }`;

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sand-200 shadow-card md:hidden safe-area-bottom">
      <div className="max-w-md mx-auto px-6 py-3 flex items-center justify-between">
        <NavLink to="/" className={navItemClass}>
          <div className={`p-2 rounded-xl transition ${navItemClass({ isActive: false }).includes('text-amber-600') ? 'bg-amber-100' : 'hover:bg-sand-100'}`}>
            <FiHome className="text-xl" />
          </div>
          Home
        </NavLink>
        <NavLink to="/history" className={navItemClass}>
          <div className={`p-2 rounded-xl transition ${navItemClass({ isActive: false }).includes('text-amber-600') ? 'bg-amber-100' : 'hover:bg-sand-100'}`}>
            <FiList className="text-xl" />
          </div>
          History
        </NavLink>
        <NavLink to="/request" className={navItemClass}>
          <div className="p-3 -mt-8 bg-amber-500 rounded-2xl shadow-amber">
            <FiMapPin className="text-xl text-white" />
          </div>
          Request
        </NavLink>
        <NavLink to="/dashboard" className={navItemClass}>
          <div className={`p-2 rounded-xl transition ${navItemClass({ isActive: false }).includes('text-amber-600') ? 'bg-amber-100' : 'hover:bg-sand-100'}`}>
            <FiGrid className="text-xl" />
          </div>
          Dashboard
        </NavLink>
      </div>
    </nav>
  );
};
