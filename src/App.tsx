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
import { StudentOrders } from './components/student/StudentOrders';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders } from './components/admin/AdminOrders';
import { DemandForecast } from './components/admin/DemandForecast';
import { SurplusBroadcast } from './components/admin/SurplusBroadcast';
import { SustainabilityAnalytics } from './components/admin/SustainabilityAnalytics';
import { MenuManagement } from './components/admin/MenuManagement';
import { CartModal } from './components/orders/CartModal';
import { ReceiptModal } from './components/orders/ReceiptModal';
import { OrderRecord } from './services/orderApi';
import { ProjectDocModal } from './components/docs/ProjectDocModal';

export default function App() {
  const store = useNutriStore();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const [currentTab, setCurrentTab] = useState<ActiveTab>('student-overview');
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<OrderRecord | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const handleSelectRoleFromLanding = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      store.switchUser('admin-1');
      setCurrentTab('admin-overview');
    } else {
      store.switchUser('student-1');
      setCurrentTab('student-overview');
    }
  };

  const handleOrderSuccess = (order: OrderRecord) => {
    setReceiptOrder(order);
    setIsReceiptOpen(true);
    // Switch to orders view so the student can track their fresh order
    setCurrentTab('my-orders');
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
        onOpenCart={() => setIsCartOpen(true)}
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
        {currentTab === 'daily-menu' && (
          <DailyMenu
            onNavigateToOrders={() => setCurrentTab('my-orders')}
            onNavigateToRsvp={() => setCurrentTab('meal-rsvp')}
          />
        )}
        {currentTab === 'meal-rsvp' && <MealRsvp />}
        {currentTab === 'flash-sale' && (
          <FlashSale onNavigateToClaims={() => setCurrentTab('my-claims')} />
        )}
        {currentTab === 'my-orders' && (
          <StudentOrders onNavigateToMenu={() => setCurrentTab('daily-menu')} />
        )}
        {currentTab === 'food-profile' && <FoodProfile />}
        {currentTab === 'my-claims' && (
          <MyClaims onNavigateToFlashSale={() => setCurrentTab('flash-sale')} />
        )}

        {/* Canteen Admin Portal Pages */}
        {currentTab === 'admin-overview' && (
          <AdminDashboard onNavigate={(tab) => setCurrentTab(tab)} />
        )}
        {currentTab === 'admin-orders' && <AdminOrders />}
        {currentTab === 'demand-forecast' && <DemandForecast />}
        {currentTab === 'surplus-broadcast' && <SurplusBroadcast />}
        {currentTab === 'sustainability-analytics' && <SustainabilityAnalytics />}
        {currentTab === 'menu-management' && <MenuManagement />}
      </main>

      {/* 4. Global Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* 5. Global Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        order={receiptOrder}
      />

      {/* 6. Footer */}
      <Footer onOpenDocs={() => setIsDocsOpen(true)} />

      {/* 7. Mini-Project Viva Documentation Modal */}
      <ProjectDocModal isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} />
    </div>
  );
}
