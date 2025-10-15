
import { useState } from 'react';

export type NavigationPage = 'main-dashboard' | 'physical-dashboard' | 'tdah-dashboard' | 'big-five-dashboard' | 'profile' | 'assessment' | 'tdah-assessment' | 'diva2-assessment' | 'big-five-assessment' | 'report' | 'tdah-report' | 'big-five-report';

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
  const goToBigFiveDashboard = () => navigateTo('big-five-dashboard');
  const goToProfile = () => navigateTo('profile');
  const goToAssessment = () => navigateTo('assessment');
  const goToTDAHAssessment = () => navigateTo('tdah-assessment');
  const goToDIVA2Assessment = () => navigateTo('diva2-assessment');
  const goToBigFiveAssessment = () => navigateTo('big-five-assessment');
  const goToReport = (reportData: any) => navigateTo('report', reportData);
  const goToTDAHReport = (reportData: any) => navigateTo('tdah-report', reportData);
  const goToBigFiveReport = (reportData: any) => navigateTo('big-five-report', reportData);

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
    goToBigFiveDashboard,
    goToProfile,
    goToAssessment,
    goToTDAHAssessment,
    goToDIVA2Assessment,
    goToBigFiveAssessment,
    goToReport,
    goToTDAHReport,
    goToBigFiveReport
  };
};
