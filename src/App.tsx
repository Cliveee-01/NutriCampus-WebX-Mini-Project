/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNutriStore } from './hooks/useNutriStore';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DemoBanner } from './components/common/DemoBanner';
import { LandingPage } from './components/public/LandingPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { DailyMenu } from './components/student/DailyMenu';
import { MealRsvp } from './components/student/MealRsvp';
import { FlashSale } from './components/student/FlashSale';
import { FoodProfile } from './components/student/FoodProfile';
import { MyClaims } from './components/student/MyClaims';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DemandForecast } from './components/admin/DemandForecast';
import { SurplusBroadcast } from './components/admin/SurplusBroadcast';
import { SustainabilityAnalytics } from './components/admin/SustainabilityAnalytics';
import { MenuManagement } from './components/admin/MenuManagement';
import { ProjectDocModal } from './components/docs/ProjectDocModal';

export default function App() {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const [currentTab, setCurrentTab] = useState<ActiveTab>('student-overview');
  const [isDocsOpen, setIsDocsOpen] = useState(false);

  const handleSelectRoleFromLanding = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      store.switchUser('admin-1');
      setCurrentTab('admin-overview');
    } else {
      store.switchUser('student-1');
      setCurrentTab('student-overview');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-[#1E293B]">
      {/* 1. Presentation Demo & Examiner Controls */}
      <DemoBanner onOpenDocs={() => setIsDocsOpen(true)} />

      {/* 2. Top Bar Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenDocs={() => setIsDocsOpen(true)}
      />

      {/* 3. Main Body Content Viewport */}
      <main className="flex-1">
        {currentTab === 'welcome' && (
          <LandingPage
            onSelectRole={handleSelectRoleFromLanding}
            onOpenDocs={() => setIsDocsOpen(true)}
          />
        )}

        {/* Student Portal Pages */}
        {currentTab === 'student-overview' && (
          <StudentDashboard onNavigate={(tab) => setCurrentTab(tab)} />
        )}
        {currentTab === 'daily-menu' && <DailyMenu />}
        {currentTab === 'meal-rsvp' && <MealRsvp />}
        {currentTab === 'flash-sale' && (
          <FlashSale onNavigateToClaims={() => setCurrentTab('my-claims')} />
        )}
        {currentTab === 'food-profile' && <FoodProfile />}
        {currentTab === 'my-claims' && (
          <MyClaims onNavigateToFlashSale={() => setCurrentTab('flash-sale')} />
        )}

        {/* Canteen Admin Portal Pages */}
        {currentTab === 'admin-overview' && (
          <AdminDashboard onNavigate={(tab) => setCurrentTab(tab)} />
        )}
        {currentTab === 'demand-forecast' && <DemandForecast />}
        {currentTab === 'surplus-broadcast' && <SurplusBroadcast />}
        {currentTab === 'sustainability-analytics' && <SustainabilityAnalytics />}
        {currentTab === 'menu-management' && <MenuManagement />}
      </main>

      {/* 4. Footer */}
      <Footer onOpenDocs={() => setIsDocsOpen(true)} />

      {/* 5. Mini-Project Viva Documentation Modal */}
      <ProjectDocModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
