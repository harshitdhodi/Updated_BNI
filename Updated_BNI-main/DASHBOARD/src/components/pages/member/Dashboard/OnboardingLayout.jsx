import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function OnboardingLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Navbar - onMenuClick is a no-op as there's no sidebar */}
      <Navbar onMenuClick={() => {}} />

      {/* Onboarding content - Independent scroll */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}