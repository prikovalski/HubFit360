
import { useState } from 'react';

export type NavigationPage = 'main-dashboard' | 'physical-dashboard' | 'tdah-dashboard' | 'profile' | 'assessment' | 'tdah-assessment' | 'report' | 'tdah-report';

interface NavigationState {
  currentPage: NavigationPage;
  previousPage?: NavigationPage;
  reportData?: any;
  assessmentData?: any;
}

export const useNavigation = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPage: 'main-dashboard'
  });

  const navigateTo = (page: NavigationPage, data?: any) => {
    setNavigationState(prev => ({
      currentPage: page,
      previousPage: prev.currentPage,
      reportData: page === 'report' ? data : prev.reportData,
      assessmentData: page === 'assessment' ? data : prev.assessmentData
    }));
  };

  const goBack = () => {
    if (navigationState.previousPage) {
      setNavigationState(prev => ({
        currentPage: prev.previousPage || 'main-dashboard',
        previousPage: undefined,
        reportData: prev.reportData,
        assessmentData: prev.assessmentData
      }));
    } else {
      navigateTo('main-dashboard');
    }
  };

  const goToMainDashboard = () => navigateTo('main-dashboard');
  const goToPhysicalDashboard = () => navigateTo('physical-dashboard');
  const goToTDAHDashboard = () => navigateTo('tdah-dashboard');
  const goToProfile = () => navigateTo('profile');
  const goToAssessment = () => navigateTo('assessment');
  const goToTDAHAssessment = () => navigateTo('tdah-assessment');
  const goToReport = (reportData: any) => navigateTo('report', reportData);
  const goToTDAHReport = (reportData: any) => navigateTo('tdah-report', reportData);

  return {
    currentPage: navigationState.currentPage,
    previousPage: navigationState.previousPage,
    reportData: navigationState.reportData,
    assessmentData: navigationState.assessmentData,
    navigateTo,
    goBack,
    goToMainDashboard,
    goToPhysicalDashboard,
    goToTDAHDashboard,
    goToProfile,
    goToAssessment,
    goToTDAHAssessment,
    goToReport,
    goToTDAHReport
  };
};
