
import { useState } from 'react';

export type NavigationPage = 'dashboard' | 'profile' | 'assessment' | 'report';

interface NavigationState {
  currentPage: NavigationPage;
  previousPage?: NavigationPage;
  reportData?: any;
  assessmentData?: any;
}

export const useNavigation = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentPage: 'dashboard'
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
        currentPage: prev.previousPage || 'dashboard',
        previousPage: undefined,
        reportData: prev.reportData,
        assessmentData: prev.assessmentData
      }));
    } else {
      navigateTo('dashboard');
    }
  };

  const goToDashboard = () => navigateTo('dashboard');
  const goToProfile = () => navigateTo('profile');
  const goToAssessment = () => navigateTo('assessment');
  const goToReport = (reportData: any) => navigateTo('report', reportData);

  return {
    currentPage: navigationState.currentPage,
    previousPage: navigationState.previousPage,
    reportData: navigationState.reportData,
    assessmentData: navigationState.assessmentData,
    navigateTo,
    goBack,
    goToDashboard,
    goToProfile,
    goToAssessment,
    goToReport
  };
};
