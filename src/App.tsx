/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building, 
  TrendingUp, 
  Coins, 
  HelpCircle, 
  Maximize2, 
  FileText, 
  ShieldAlert, 
  ArrowRight, 
  Info, 
  Check, 
  Copy,
  SlidersHorizontal,
  Plus,
  Minus,
  Settings,
  RotateCcw,
  Undo,
  Redo,
  Trash2,
  FolderHeart,
  Terminal,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  CommercialFinanceEngine, 
  DSCRInput, 
  CapRateInput, 
  SaaSInput 
} from './lib/CommercialFinanceEngine';
import {
  METROPOLITAN_HUBS,
  generateSEOMetadata,
  FinancialHub
} from './lib/seoRouting';
import AdminPortalModal from './components/AdminPortalModal';

type ActiveTab = 'debt-coverage' | 'ten-year-hold' | 'saas-metrics' | 'library';

interface SavedDeal {
  id: string;
  projectName: string;
  dateUnderwritten: string;
  dealType: 'debt-coverage' | 'ten-year-hold' | 'saas-metrics';
  dealHealth: 'Prime' | 'Strong' | 'Adequate' | 'Stressed';
  formattedMetric: string;
  data: {
    // Debt coverage parameters
    dscrUseNoiDirect?: boolean;
    dscrDirectNoi?: number;
    dscrGrossRevenue?: number;
    dscrVacancyRate?: number;
    dscrOtherIncome?: number;
    dscrOperatingExpenses?: number;
    dscrAnnualDebtService?: number;
    dscrLoanAmount?: number;
    dscrInitialCashEquity?: number;
    // Cap rate parameters
    capInitialNoi?: number;
    capGoingInRate?: number;
    capNoiGrowth?: number;
    capExpansionBps?: number;
    capPurchasePriceOverride?: string;
    // SaaS parameters
    saasMrr?: number;
    saasMargin?: number;
    saasChurn?: number;
    saasCac?: number;
  };
}

const dscrChallenges = [
  {
    id: 'dscr-rates',
    name: 'Interest Rate Hike',
    headwindType: 'Interest Rate Hike',
    description: 'Central banks raise bench rates, forcing your floating-rate annual debt service to surge by 25%. Adjust operations to keep the asset afloat.',
    marketContext: 'Federal Reserve signals restrictive rate stance to combat structural service inflation, rapidly tightening liquid credit markets.',
    goalText: 'Maintain DSCR ≥ 1.25x',
    metricLabel: 'Active DSCR under headwind stress',
    targetValue: '1.25x',
    apply: (inputs: any) => ({
      ...inputs,
      annualDebtService: inputs.annualDebtService * 1.25
    })
  },
  {
    id: 'dscr-opex',
    name: 'Operating Expense Spike',
    headwindType: 'Operating Expense Spike',
    description: 'A major local property tax re-assessment combined with national insurance inflation drives property operating expenses up by 30%.',
    marketContext: 'Severe municipal budget deficits and rising reinsurance cost schedules force commercial insurance carriers to escalate premium structures.',
    goalText: 'Maintain DSCR ≥ 1.25x',
    metricLabel: 'Active DSCR under headwind stress',
    targetValue: '1.25x',
    apply: (inputs: any) => ({
      ...inputs,
      operatingExpenses: inputs.operatingExpenses * 1.30
    })
  },
  {
    id: 'dscr-rent',
    name: 'Market Rent Correction',
    headwindType: 'Market Rent Correction',
    description: 'An aggressive local zoning override sparks a surge in competitor rental inventory, triggering a 15% fall in Gross Revenue.',
    marketContext: 'Substantial local multifamily inventory deliveries outpace net household absorptions, triggering intense regional concession wars.',
    goalText: 'Maintain DSCR ≥ 1.25x',
    metricLabel: 'Active DSCR under headwind stress',
    targetValue: '1.25x',
    apply: (inputs: any) => ({
      ...inputs,
      grossRevenue: inputs.grossRevenue * 0.85
    })
  }
];

const capChallenges = [
  {
    id: 'cap-expansion',
    name: 'Exit Cap Rate Blowout',
    headwindType: 'Exit Cap Rate Blowout',
    description: 'Illiquidity in secondary capital markets forces institutional buyers to demand high risk premiums, inflating Cap Rate Expansion by an extra 30 bps annually.',
    marketContext: 'Sovereign treasury yield shifts force syndicators to seek enhanced margins, contracting terminal property bidding pools.',
    goalText: 'Achieve positive growth ≥ +15.0%',
    metricLabel: 'Modified 10-Yr Value Appreciation',
    targetValue: '+15.0%',
    apply: (inputs: any) => ({
      ...inputs,
      annualCapRateExpansionBps: inputs.annualCapRateExpansionBps + 30
    })
  },
  {
    id: 'cap-stagnation',
    name: 'Economic Stagnation',
    headwindType: 'Economic Stagnation',
    description: 'Over-development in neighboring sectors halts local business expansions, cutting projected property NOI annual growth rate by 2.5%.',
    marketContext: 'Macroeconomic manufacturing shifts and logistics delays freeze regional labor expansions, stalling submarket tenant demand.',
    goalText: 'Achieve positive growth ≥ +15.0%',
    metricLabel: 'Modified 10-Yr Value Appreciation',
    targetValue: '+15.0%',
    apply: (inputs: any) => ({
      ...inputs,
      annualNoiGrowth: inputs.annualNoiGrowth - 2.5
    })
  }
];

const saasChallenges = [
  {
    id: 'saas-war',
    name: 'Competitor Price War',
    headwindType: 'Competitor Price War',
    description: 'An aggressive competitor matches your features and slashes subscription MRR by 20%. Adjust contract margins or retention to survive.',
    marketContext: 'Venture-subsidized industry peers execute customer-poaching campaigns, introducing severe discounting tension into software negotiations.',
    goalText: 'Maintain LTV:CAC ≥ 3.0x',
    metricLabel: 'Active LTV to CAC Ratio under Price War',
    targetValue: '3.0x',
    apply: (inputs: any) => ({
      ...inputs,
      mrrPerCustomer: inputs.mrrPerCustomer * 0.80
    })
  },
  {
    id: 'saas-churn',
    name: 'Churn Epidemic',
    headwindType: 'Churn Epidemic',
    description: 'A major platform downtime event causes public fallout, causing your monthly customer churn rates to spike by an absolute +3.0%.',
    marketContext: 'Prolonged primary infrastructure outages trigger public compliance audits, severely shaking user trust indexes.',
    goalText: 'Maintain LTV:CAC ≥ 3.0x',
    metricLabel: 'Active LTV to CAC Ratio under Churn Shock',
    targetValue: '3.0x',
    apply: (inputs: any) => ({
      ...inputs,
      monthlyCustomerChurnPercent: inputs.monthlyCustomerChurnPercent + 3.0
    })
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('debt-coverage');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setIsAdminOpen(true);
    }
  }, []);

  const [dealStage, setDealStage] = useState<'revenue' | 'operating-costs' | 'debt-equity'>('revenue');
  const [investorInsights, setInvestorInsights] = useState<boolean>(false);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState<boolean>(false);
  const [copiedDiagnostic, setCopiedDiagnostic] = useState<boolean>(false);
  const [activeDiagnosticFile, setActiveDiagnosticFile] = useState<'dscr-calculator.ts' | 'cash-on-cash.ts' | 'cap-rate-terminal.ts' | 'saas-unit-economics.ts'>('dscr-calculator.ts');

  // --- REGIONAL SEO DYNAMIC ROUTING STATES ---
  const [selectedHubSlug, setSelectedHubSlug] = useState<string>('new-york-city');

  const activeHub = useMemo(() => {
    return METROPOLITAN_HUBS.find(h => h.slug === selectedHubSlug) || METROPOLITAN_HUBS[0];
  }, [selectedHubSlug]);

  const activeSEO = useMemo(() => {
    return generateSEOMetadata(activeHub.cityName, activeHub.slug);
  }, [activeHub]);

  useEffect(() => {
    document.title = activeSEO.title;
  }, [activeSEO]);

  // --- 1. STATE FOR DEBT SERVICE COVERAGE RATIO (DSCR) ---
  const [dscrUseNoiDirect, setDscrUseNoiDirect] = useState<boolean>(false);
  const [dscrDirectNoi, setDscrDirectNoi] = useState<number>(650000);
  const [dscrGrossRevenue, setDscrGrossRevenue] = useState<number>(1250000);
  const [dscrVacancyRate, setDscrVacancyRate] = useState<number>(5.0);
  const [dscrOtherIncome, setDscrOtherIncome] = useState<number>(180000);
  const [dscrOperatingExpenses, setDscrOperatingExpenses] = useState<number>(450000);
  const [dscrAnnualDebtService, setDscrAnnualDebtService] = useState<number>(550000);
  const [dscrLoanAmount, setDscrLoanAmount] = useState<number>(5000000);
  const [dscrInitialCashEquity, setDscrInitialCashEquity] = useState<number>(2000000);

  // --- 2. STATE FOR CAP RATE & PROPERTY VALUATION ---
  const [capInitialNoi, setCapInitialNoi] = useState<number>(450000);
  const [capGoingInRate, setCapGoingInRate] = useState<number>(6.5);
  const [capNoiGrowth, setCapNoiGrowth] = useState<number>(3.5);
  const [capExpansionBps, setCapExpansionBps] = useState<number>(15); // bps expansion annually
  const [capPurchasePriceOverride, setCapPurchasePriceOverride] = useState<string>('');

  // --- 3. STATE FOR SAAS UNITS ECONOMICS ---
  const [saasMrr, setSaasMrr] = useState<number>(150);
  const [saasMargin, setSaasMargin] = useState<number>(80);
  const [saasChurn, setSaasChurn] = useState<number>(2.0);
  const [saasCac, setSaasCac] = useState<number>(1200);

  // --- 4. STATE FOR PRESENTATIONAL EXPORTS ---
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [stressTestingActive, setStressTestingActive] = useState<boolean>(false);
  const [prospectusOpen, setProspectusOpen] = useState<boolean>(false);
  const [prospectusType, setProspectusType] = useState<'debt-coverage' | 'ten-year-hold' | 'saas-metrics'>('debt-coverage');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // --- CHALLENGE MODE STATE ---
  const [challengeActive, setChallengeActive] = useState<boolean>(false);
  const [dscrChallengeIdx, setDscrChallengeIdx] = useState<number>(0);
  const [capChallengeIdx, setCapChallengeIdx] = useState<number>(0);
  const [saasChallengeIdx, setSaasChallengeIdx] = useState<number>(0);

  // --- RECOVERY STRATEGY VISIBILITY STATES ---
  const [showRecoveryDscr, setShowRecoveryDscr] = useState<boolean>(false);
  const [showRecoveryCap, setShowRecoveryCap] = useState<boolean>(false);
  const [showRecoverySaas, setShowRecoverySaas] = useState<boolean>(false);

  // --- MASTERY TRACKER STREAK STATE ---
  const [masteryStreak, setMasteryStreak] = useState<number>(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [showMasteryToast, setShowMasteryToast] = useState<boolean>(false);

  // --- PORTFOLIO GALLERY / LIBRARY STATE ---
  const [saveModalOpen, setSaveModalOpen] = useState<boolean>(false);
  const [saveDealType, setSaveDealType] = useState<'debt-coverage' | 'ten-year-hold' | 'saas-metrics'>('debt-coverage');
  const [newDealProjectName, setNewDealProjectName] = useState<string>('');
  
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>(() => {
    const local = localStorage.getItem('commercial_finance_saved_deals');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: 'hudson-yards',
        projectName: 'Hudson Yards West Tower',
        dateUnderwritten: '2026-06-12',
        dealType: 'debt-coverage',
        dealHealth: 'Prime',
        formattedMetric: '1.43x DSCR',
        data: {
          dscrUseNoiDirect: false,
          dscrGrossRevenue: 1500005,
          dscrVacancyRate: 5.0,
          dscrOtherIncome: 200000,
          dscrOperatingExpenses: 480000,
          dscrAnnualDebtService: 660000,
          dscrLoanAmount: 7500000,
          dscrInitialCashEquity: 3000000
        }
      },
      {
        id: 'austin-corridor',
        projectName: 'Austin Tech Corridor Flex',
        dateUnderwritten: '2026-06-15',
        dealType: 'ten-year-hold',
        dealHealth: 'Strong',
        formattedMetric: '+19.45% appreciation',
        data: {
          capInitialNoi: 380000,
          capGoingInRate: 6.20,
          capNoiGrowth: 4.0,
          capExpansionBps: 10,
          capPurchasePriceOverride: '6129032'
        }
      },
      {
        id: 'sentryflow-saas',
        projectName: 'SentryFlow Enterprise Hub',
        dateUnderwritten: '2026-06-18',
        dealType: 'saas-metrics',
        dealHealth: 'Prime',
        formattedMetric: '4.63x LTV:CAC',
        data: {
          saasMrr: 295,
          saasMargin: 85,
          saasChurn: 1.8,
          saasCac: 1150
        }
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('commercial_finance_saved_deals', JSON.stringify(savedDeals));
  }, [savedDeals]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [libraryFilter, setLibraryFilter] = useState<'all' | 'debt-coverage' | 'ten-year-hold' | 'saas-metrics'>('all');

  const filteredSavedDeals = useMemo(() => {
    return savedDeals.filter(deal => {
      const matchType = libraryFilter === 'all' || deal.dealType === libraryFilter;
      const matchQuery = deal.projectName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchQuery;
    });
  }, [savedDeals, searchQuery, libraryFilter]);

  const handleRecordSuccess = () => {
    if (!challengeActive || !challengeSuccess || !activeChallenge) return;
    
    const newStreak = Math.min(5, masteryStreak + 1);
    const newCompleted = [...completedChallenges, activeChallenge.name];
    
    setMasteryStreak(newStreak);
    setCompletedChallenges(newCompleted);

    if (newStreak >= 5) {
      setShowMasteryToast(true);
    }

    // Advance to next challenge automatically to make a professional game loop
    handleRerollHeadwind();
  };

  const handleRerollHeadwind = () => {
    setShowRecoveryDscr(false);
    setShowRecoveryCap(false);
    setShowRecoverySaas(false);
    
    if (activeTab === 'debt-coverage') {
      const nextIdx = (dscrChallengeIdx + 1) % dscrChallenges.length;
      setDscrChallengeIdx(nextIdx);
    } else if (activeTab === 'ten-year-hold') {
      const nextIdx = (capChallengeIdx + 1) % capChallenges.length;
      setCapChallengeIdx(nextIdx);
    } else {
      const nextIdx = (saasChallengeIdx + 1) % saasChallenges.length;
      setSaasChallengeIdx(nextIdx);
    }
  };

  // --- UNDO/REDO HISTORY STACK IMPLEMENTATION ---
  interface HistoryState {
    activeTab: ActiveTab;
    dealStage: 'revenue' | 'operating-costs' | 'debt-equity';
    dscrUseNoiDirect: boolean;
    dscrDirectNoi: number;
    dscrGrossRevenue: number;
    dscrVacancyRate: number;
    dscrOtherIncome: number;
    dscrOperatingExpenses: number;
    dscrAnnualDebtService: number;
    dscrLoanAmount: number;
    dscrInitialCashEquity: number;
    capInitialNoi: number;
    capGoingInRate: number;
    capNoiGrowth: number;
    capExpansionBps: number;
    capPurchasePriceOverride: string;
    saasMrr: number;
    saasMargin: number;
    saasChurn: number;
    saasCac: number;
  }

  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isApplyingHistoryRef = React.useRef<boolean>(false);

  // Initialize history state on mount
  useEffect(() => {
    const initialState: HistoryState = {
      activeTab,
      dealStage,
      dscrUseNoiDirect,
      dscrDirectNoi,
      dscrGrossRevenue,
      dscrVacancyRate,
      dscrOtherIncome,
      dscrOperatingExpenses,
      dscrAnnualDebtService,
      dscrLoanAmount,
      dscrInitialCashEquity,
      capInitialNoi,
      capGoingInRate,
      capNoiGrowth,
      capExpansionBps,
      capPurchasePriceOverride,
      saasMrr,
      saasMargin,
      saasChurn,
      saasCac
    };
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  // Pack the current tracking values in a useMemo object
  const currentValues = useMemo<HistoryState>(() => ({
    activeTab,
    dealStage,
    dscrUseNoiDirect,
    dscrDirectNoi,
    dscrGrossRevenue,
    dscrVacancyRate,
    dscrOtherIncome,
    dscrOperatingExpenses,
    dscrAnnualDebtService,
    dscrLoanAmount,
    dscrInitialCashEquity,
    capInitialNoi,
    capGoingInRate,
    capNoiGrowth,
    capExpansionBps,
    capPurchasePriceOverride,
    saasMrr,
    saasMargin,
    saasChurn,
    saasCac
  }), [
    activeTab,
    dealStage,
    dscrUseNoiDirect,
    dscrDirectNoi,
    dscrGrossRevenue,
    dscrVacancyRate,
    dscrOtherIncome,
    dscrOperatingExpenses,
    dscrAnnualDebtService,
    dscrLoanAmount,
    dscrInitialCashEquity,
    capInitialNoi,
    capGoingInRate,
    capNoiGrowth,
    capExpansionBps,
    capPurchasePriceOverride,
    saasMrr,
    saasMargin,
    saasChurn,
    saasCac
  ]);

  // Debounce-track the changes and append to the history stack
  useEffect(() => {
    if (isApplyingHistoryRef.current) {
      return;
    }
    if (history.length === 0 || historyIndex === -1) {
      return;
    }

    const lastSaved = history[historyIndex];
    if (!lastSaved) return;

    const isDifferent = Object.keys(currentValues).some((key) => {
      return (currentValues as any)[key] !== (lastSaved as any)[key];
    });

    if (!isDifferent) {
      return;
    }

    const timer = setTimeout(() => {
      // Re-verify difference before saving
      const latestLastSaved = history[historyIndex];
      if (!latestLastSaved) return;
      const remainsDifferent = Object.keys(currentValues).some((key) => {
        return (currentValues as any)[key] !== (latestLastSaved as any)[key];
      });

      if (!remainsDifferent) return;

      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push({ ...currentValues });
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [currentValues, history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const targetState = history[prevIndex];
      if (targetState) {
        isApplyingHistoryRef.current = true;
        setHistoryIndex(prevIndex);
        
        setActiveTab(targetState.activeTab);
        setDealStage(targetState.dealStage);
        setDscrUseNoiDirect(targetState.dscrUseNoiDirect);
        setDscrDirectNoi(targetState.dscrDirectNoi);
        setDscrGrossRevenue(targetState.dscrGrossRevenue);
        setDscrVacancyRate(targetState.dscrVacancyRate);
        setDscrOtherIncome(targetState.dscrOtherIncome);
        setDscrOperatingExpenses(targetState.dscrOperatingExpenses);
        setDscrAnnualDebtService(targetState.dscrAnnualDebtService);
        setDscrLoanAmount(targetState.dscrLoanAmount);
        setDscrInitialCashEquity(targetState.dscrInitialCashEquity);
        setCapInitialNoi(targetState.capInitialNoi);
        setCapGoingInRate(targetState.capGoingInRate);
        setCapNoiGrowth(targetState.capNoiGrowth);
        setCapExpansionBps(targetState.capExpansionBps);
        setCapPurchasePriceOverride(targetState.capPurchasePriceOverride);
        setSaasMrr(targetState.saasMrr);
        setSaasMargin(targetState.saasMargin);
        setSaasChurn(targetState.saasChurn);
        setSaasCac(targetState.saasCac);

        setTimeout(() => {
          isApplyingHistoryRef.current = false;
        }, 50);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const targetState = history[nextIndex];
      if (targetState) {
        isApplyingHistoryRef.current = true;
        setHistoryIndex(nextIndex);
        
        setActiveTab(targetState.activeTab);
        setDealStage(targetState.dealStage);
        setDscrUseNoiDirect(targetState.dscrUseNoiDirect);
        setDscrDirectNoi(targetState.dscrDirectNoi);
        setDscrGrossRevenue(targetState.dscrGrossRevenue);
        setDscrVacancyRate(targetState.dscrVacancyRate);
        setDscrOtherIncome(targetState.dscrOtherIncome);
        setDscrOperatingExpenses(targetState.dscrOperatingExpenses);
        setDscrAnnualDebtService(targetState.dscrAnnualDebtService);
        setDscrLoanAmount(targetState.dscrLoanAmount);
        setDscrInitialCashEquity(targetState.dscrInitialCashEquity);
        setCapInitialNoi(targetState.capInitialNoi);
        setCapGoingInRate(targetState.capGoingInRate);
        setCapNoiGrowth(targetState.capNoiGrowth);
        setCapExpansionBps(targetState.capExpansionBps);
        setCapPurchasePriceOverride(targetState.capPurchasePriceOverride);
        setSaasMrr(targetState.saasMrr);
        setSaasMargin(targetState.saasMargin);
        setSaasChurn(targetState.saasChurn);
        setSaasCac(targetState.saasCac);

        setTimeout(() => {
          isApplyingHistoryRef.current = false;
        }, 50);
      }
    }
  };

  // --- COMPUTE LIVE COMPUTATIONS VIA ENGINE ---
  const dscrCalc = useMemo(() => {
    let input: DSCRInput = dscrUseNoiDirect 
      ? { noi: dscrDirectNoi, annualDebtService: dscrAnnualDebtService }
      : { 
          grossRevenue: dscrGrossRevenue, 
          vacancyRate: dscrVacancyRate, 
          otherIncome: dscrOtherIncome, 
          operatingExpenses: dscrOperatingExpenses,
          annualDebtService: dscrAnnualDebtService 
        };

    if (challengeActive && activeTab === 'debt-coverage') {
      const activeCh = dscrChallenges[dscrChallengeIdx];
      if (activeCh) {
        input = activeCh.apply(input);
      }
    }

    return CommercialFinanceEngine.calculateDSCR(input);
  }, [
    dscrUseNoiDirect, dscrDirectNoi, dscrGrossRevenue, 
    dscrVacancyRate, dscrOtherIncome, dscrOperatingExpenses, dscrAnnualDebtService,
    challengeActive, activeTab, dscrChallengeIdx
  ]);

  // --- DEBT YIELD COMPUTATION ---
  const debtYieldCalc = useMemo(() => {
    if (dscrCalc.success && dscrCalc.data) {
      return CommercialFinanceEngine.calculateDebtYield(dscrCalc.data.netOperatingIncome, dscrLoanAmount);
    }
    return { success: false, errors: ["Missing Net Operating Income data"], data: 0 };
  }, [dscrCalc, dscrLoanAmount]);

  // --- CASH ON CASH YIELD COMPUTATION ---
  const dscrCashOnCashCalc = useMemo(() => {
    if (dscrCalc.success && dscrCalc.data) {
      return CommercialFinanceEngine.calculateCashOnCash(
        dscrCalc.data.netOperatingIncome,
        dscrCalc.data.annualDebtService,
        dscrInitialCashEquity
      );
    }
    return { success: false, errors: ["Missing Net Operating Income data"], data: 0 };
  }, [dscrCalc, dscrInitialCashEquity]);

  // --- DSCR VACANCY SHOCK SENSITIVITY ---
  const dscrStressCalc = useMemo(() => {
    const input: DSCRInput = dscrUseNoiDirect 
      ? { noi: dscrDirectNoi, annualDebtService: dscrAnnualDebtService }
      : { 
          grossRevenue: dscrGrossRevenue, 
          vacancyRate: dscrVacancyRate, 
          otherIncome: dscrOtherIncome, 
          operatingExpenses: dscrOperatingExpenses,
          annualDebtService: dscrAnnualDebtService 
        };
    return CommercialFinanceEngine.runSensitivityStressTest(input, 'VACANCY_SHOCK');
  }, [
    dscrUseNoiDirect, dscrDirectNoi, dscrGrossRevenue, 
    dscrVacancyRate, dscrOtherIncome, dscrOperatingExpenses, dscrAnnualDebtService
  ]);

  const capCalc = useMemo(() => {
    let input: CapRateInput = {
      initialNoi: capInitialNoi,
      goingInCapRate: capGoingInRate,
      annualNoiGrowth: capNoiGrowth,
      annualCapRateExpansionBps: capExpansionBps,
      purchasePrice: capPurchasePriceOverride !== '' ? parseFloat(capPurchasePriceOverride) : undefined
    };

    if (challengeActive && activeTab === 'ten-year-hold') {
      const activeCh = capChallenges[capChallengeIdx];
      if (activeCh) {
        input = activeCh.apply(input);
      }
    }

    return CommercialFinanceEngine.projectCapRate(input);
  }, [capInitialNoi, capGoingInRate, capNoiGrowth, capExpansionBps, capPurchasePriceOverride, challengeActive, activeTab, capChallengeIdx]);

  const saasCalc = useMemo(() => {
    let input: SaaSInput = {
      mrrPerCustomer: saasMrr,
      grossMarginPercent: saasMargin,
      monthlyCustomerChurnPercent: saasChurn,
      cac: saasCac
    };

    if (challengeActive && activeTab === 'saas-metrics') {
      const activeCh = saasChallenges[saasChallengeIdx];
      if (activeCh) {
        input = activeCh.apply(input);
      }
    }

    return CommercialFinanceEngine.calculateSaaSMetrics(input);
  }, [saasMrr, saasMargin, saasChurn, saasCac, challengeActive, activeTab, saasChallengeIdx]);

  // --- SAAS CHURN SHOCK SENSITIVITY ---
  const saasStressCalc = useMemo(() => {
    const input: SaaSInput = {
      mrrPerCustomer: saasMrr,
      grossMarginPercent: saasMargin,
      monthlyCustomerChurnPercent: saasChurn,
      cac: saasCac
    };
    return CommercialFinanceEngine.runSensitivityStressTest(input, 'CHURN_SHOCK');
  }, [saasMrr, saasMargin, saasChurn, saasCac]);

  const activeChallenge = useMemo(() => {
    if (activeTab === 'debt-coverage') {
      return dscrChallenges[dscrChallengeIdx];
    } else if (activeTab === 'ten-year-hold') {
      return capChallenges[capChallengeIdx];
    } else {
      return saasChallenges[saasChallengeIdx];
    }
  }, [activeTab, dscrChallengeIdx, capChallengeIdx, saasChallengeIdx]);

  const challengeSuccess = useMemo(() => {
    if (!challengeActive) return false;
    if (activeTab === 'debt-coverage' && dscrCalc.success && dscrCalc.data) {
      return dscrCalc.data.dscr >= 1.25;
    }
    if (activeTab === 'ten-year-hold' && capCalc.success && capCalc.data) {
      return capCalc.data.valueChangePercent >= 15.0;
    }
    if (activeTab === 'saas-metrics' && saasCalc.success && saasCalc.data) {
      return saasCalc.data.ltvToCacRatio >= 3.0;
    }
    return false;
  }, [challengeActive, activeTab, dscrCalc, capCalc, saasCalc]);

  // --- DYNAMIC RECOVERY STRATEGIES ---
  const dscrRecoveryStrategy = useMemo(() => {
    if (!challengeActive || activeTab !== 'debt-coverage' || !dscrCalc.success || !dscrCalc.data) return null;
    const ans = dscrCalc.data;
    if (ans.dscr >= 1.25) return null;

    const targetDscr = 1.25; // Target to lift them back into compliant/strong covenant space
    const targetNoi = targetDscr * ans.annualDebtService;
    const currentNoi = ans.netOperatingIncome;
    const gap = targetNoi - currentNoi;

    if (gap <= 0) return null;

    const currentOpEx = ans.operatingExpenses;
    if (currentOpEx > 0 && gap < currentOpEx) {
      const neededReduction = gap;
      const pctReduction = (neededReduction / currentOpEx) * 100;
      return {
        leverName: "Reduce Operating Expense",
        impactSuggestion: `Reduce Operating Expense by ${pctReduction.toFixed(1)}% (saving of ${formatCur(neededReduction)})`,
        fullNarrative: `A surgical reduction of ${pctReduction.toFixed(1)}% in operating overhead saves ${formatCur(neededReduction)}, bringing OpEx to ${formatCur(currentOpEx - neededReduction)} and lifting DSCR directly to the 1.25x Covenant target.`,
        action: () => {
          setDscrOperatingExpenses(Math.max(0, Math.round(dscrOperatingExpenses - neededReduction)));
          setShowRecoveryDscr(false);
        }
      };
    }

    const neededRevenueGain = gap / (1 - dscrVacancyRate / 100);
    const pctGain = (neededRevenueGain / dscrGrossRevenue) * 100;
    return {
      leverName: "Boost Gross Revenue",
      impactSuggestion: `Boost Gross Revenue by ${pctGain.toFixed(1)}% (an extra ${formatCur(neededRevenueGain)})`,
      fullNarrative: `Optimizing regional lease-up rates and minor contract escalations to boost Gross Revenue by ${pctGain.toFixed(1)}% generates ${formatCur(neededRevenueGain)} of gross rent, lifting active DSCR to the compliant 1.25x limit.`,
      action: () => {
        setDscrGrossRevenue(Math.round(dscrGrossRevenue + neededRevenueGain));
        setShowRecoveryDscr(false);
      }
    };
  }, [
    challengeActive, activeTab, dscrCalc, dscrGrossRevenue, dscrVacancyRate, 
    dscrOtherIncome, dscrOperatingExpenses, dscrAnnualDebtService
  ]);

  const capRecoveryStrategy = useMemo(() => {
    if (!challengeActive || activeTab !== 'ten-year-hold' || !capCalc.success || !capCalc.data) return null;
    const ans = capCalc.data;
    if (ans.valueChangePercent >= 15.0) return null;

    const currentGrowth = capNoiGrowth;
    const diff = 15.0 - ans.valueChangePercent;
    const neededGrowth = currentGrowth + (diff * 0.4);
    const targetGrowthValue = Number(Math.min(15, Math.max(0.1, neededGrowth)).toFixed(2));

    return {
      leverName: "Optimize NOI Growth Rate",
      impactSuggestion: `Increase Annual NOI Growth to ${targetGrowthValue.toFixed(1)}%`,
      fullNarrative: `Negotiating index-linked rental escalators across major leases accelerates the property NOI compounding rate to ${targetGrowthValue.toFixed(1)}%, offsetting market yields to restore the +15.0% appreciation threshold.`,
      action: () => {
        setCapNoiGrowth(targetGrowthValue);
        setShowRecoveryCap(false);
      }
    };
  }, [challengeActive, activeTab, capCalc, capNoiGrowth]);

  const saasRecoveryStrategy = useMemo(() => {
    if (!challengeActive || activeTab !== 'saas-metrics' || !saasCalc.success || !saasCalc.data) return null;
    const ans = saasCalc.data;
    if (ans.ltvToCacRatio >= 3.0) return null;

    const marginRatio = saasMargin / 100;
    const maxChurn = (saasMrr * marginRatio) / (saasCac * 3.0) * 100;
    if (maxChurn > 0.1 && maxChurn < saasChurn) {
      return {
        leverName: "Suppress Customer Churn",
        impactSuggestion: `Decrease Monthly Churn Rate to ${maxChurn.toFixed(2)}%`,
        fullNarrative: `Focusing retention campaigns and rolling out secondary utility features reduces user Churn to ${maxChurn.toFixed(2)}%, restoring contract lifetime value directly back to the 3.0x ratio mark.`,
        action: () => {
          setSaasChurn(Number(maxChurn.toFixed(2)));
          setShowRecoverySaas(false);
        }
      };
    }

    const maxCac = (saasMrr * marginRatio) / (saasChurn / 100) / 3.0;
    const neededCac = Math.max(10, Math.round(maxCac));
    return {
      leverName: "Trim Customer Acquisition Cost",
      impactSuggestion: `Trim customer acquisition costs (CAC) to ${formatCur(neededCac)}`,
      fullNarrative: `Diverting marketing allocations from low-yield PPC strategies into high-yield referral campaigns trims average CAC cost to ${formatCur(neededCac)}, restoring safe LTV leverage.`,
      action: () => {
        setSaasCac(neededCac);
        setShowRecoverySaas(false);
      }
    };
  }, [challengeActive, activeTab, saasCalc, saasMrr, saasMargin, saasChurn, saasCac]);

  // --- REPORT EXPORT ACTION LISTENER ---
  const handleCopyReport = (moduleType: 'dscr' | 'caprate' | 'saas', activeData: any) => {
    const summaryMarkdown = CommercialFinanceEngine.generateShareableSummary(moduleType, activeData);
    navigator.clipboard.writeText(summaryMarkdown)
      .then(() => {
        setCopiedTab(moduleType);
        setTimeout(() => setCopiedTab(null), 2500);
      })
      .catch((err) => {
        console.error("Clipboard permission failure:", err);
      });
  };

  // --- FORMATTERS ---
  const formatCur = (val: number) => {
    if (val === Infinity || isNaN(val)) return '$0';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatFractionCur = (val: number) => {
    if (val === Infinity || isNaN(val)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const formatPct = (val: number) => `${val.toFixed(2)}%`;
  const formatNum = (val: number, dec = 2) => val.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // --- ADVANCED DIAGNOSTICS CODE GENERATORS ---
  const getDscrCalculatorLines = () => {
    const vacancyLoss = dscrGrossRevenue * (dscrVacancyRate / 100);
    const egi = dscrCalc.success ? dscrCalc.data.effectiveGrossIncome : (dscrGrossRevenue - vacancyLoss + dscrOtherIncome);
    const noi = dscrCalc.success ? dscrCalc.data.netOperatingIncome : (egi - dscrOperatingExpenses);
    const dscrVal = dscrCalc.success ? dscrCalc.data.dscr : (dscrAnnualDebtService > 0 ? noi / dscrAnnualDebtService : 0);
    const rating = dscrCalc.success ? dscrCalc.data.dscrRating : 'Critical';

    return [
      { label: "import", extra: " { DSCRInputs, MathEngineOutcome } ", keyword: "from", string: " \"./types\";" },
      { text: "" },
      { comment: "/**" },
      { comment: " * UNDERWRITTEN TRANSACTION CONTEXT" },
      { comment: " * Live Position State compiled dynamically" },
      { comment: ` * Active Financial Hub: ${activeHub.cityName} (${activeHub.state})` },
      { comment: " */" },
      { keyword: "export", decl: " const", variable: " runUnderwritingAudit", symbol: " = (): MathEngineOutcome => {" },
      { comment: "  // 1. Initial Position Inputs" },
      { keyword: "  const", variable: " grossPotentialRevenue", symbol: ": ", type: "number", value: ` = ${dscrGrossRevenue};`, comment: ` // ${formatCur(dscrGrossRevenue)}` },
      { keyword: "  const", variable: " vacancyRatePercent", symbol: ": ", type: "number", value: ` = ${dscrVacancyRate};`, comment: ` // ${dscrVacancyRate.toFixed(2)}%` },
      { keyword: "  const", variable: " otherIncomeAuxiliary", symbol: ": ", type: "number", value: ` = ${dscrOtherIncome};`, comment: ` // ${formatCur(dscrOtherIncome)}` },
      { keyword: "  const", variable: " annualOperatingExpenses", symbol: ": ", type: "number", value: ` = ${dscrOperatingExpenses};`, comment: ` // ${formatCur(dscrOperatingExpenses)}` },
      { keyword: "  const", variable: " annualDebtService", symbol: ": ", type: "number", value: ` = ${dscrAnnualDebtService};`, comment: ` // ${formatCur(dscrAnnualDebtService)}` },
      { text: "" },
      { comment: "  // 2. Compute Operational Flow Line Items" },
      { keyword: "  const", variable: " vacancyLossAllocation", symbol: ": ", type: "number", value: ` = grossPotentialRevenue * (vacancyRatePercent / 100);` },
      { comment: `  // Live Evaluation: ${dscrGrossRevenue} * (${dscrVacancyRate} / 100) = ${vacancyLoss.toFixed(2)}` },
      { text: "" },
      { keyword: "  const", variable: " effectiveGrossIncome", symbol: ": ", type: "number", value: ` = grossPotentialRevenue - vacancyLossAllocation + otherIncomeAuxiliary;` },
      { comment: `  // Live Evaluation: ${dscrGrossRevenue} - ${vacancyLoss.toFixed(2)} + ${dscrOtherIncome} = ${egi.toFixed(2)}` },
      { text: "" },
      { keyword: "  const", variable: " netOperatingIncome", symbol: ": ", type: "number", value: ` = effectiveGrossIncome - annualOperatingExpenses;` },
      { comment: `  // Live Evaluation: ${egi.toFixed(2)} - ${dscrOperatingExpenses} = ${noi.toFixed(2)}` },
      { text: "" },
      { comment: "  // 3. Credit Covenant Derivation" },
      { keyword: "  let", variable: " debtServiceCoverageRatio", symbol: ": ", type: "number", value: ";" },
      { keyword: "  if", symbol: " (annualDebtService === ", value: "0", symbol2: ") {" },
      { variable: "    debtServiceCoverageRatio", symbol: " = ", value: "Infinity", comment: " // Unleveraged structure" },
      { keyword: "  } else ", symbol: "{" },
      { variable: "    debtServiceCoverageRatio", symbol: " = netOperatingIncome / annualDebtService;" },
      { keyword: "  }" },
      { comment: `  // Live Evaluation: ${noi.toFixed(2)} / ${dscrAnnualDebtService} = ${dscrVal.toFixed(4)}` },
      { text: "" },
      { keyword: "  const", variable: " dscrRating", symbol: ": ", type: "string", value: ` = `, string: `"${rating}";` },
      { comment: `  // Live Evaluation: Rating corresponds to active covenants` },
      { text: "" },
      { keyword: "  return", symbol: " { dscr: debtServiceCoverageRatio, rating: dscrRating, noi: netOperatingIncome };" },
      { symbol: "};" }
    ];
  };

  const getCashOnCashLines = () => {
    const noi = dscrCalc.success ? dscrCalc.data.netOperatingIncome : 0;
    const cashFlow = noi - dscrAnnualDebtService;
    const equity = dscrInitialCashEquity;
    const cocVal = dscrCashOnCashCalc.success ? dscrCashOnCashCalc.data : (equity > 0 ? (cashFlow / equity) * 100 : 0);

    return [
      { label: "import", extra: " { CoCInputs } ", keyword: "from", string: " \"./yield-engine\";" },
      { text: "" },
      { comment: "/**" },
      { comment: " * COMPUTE CASH ON CASH DIVIDEND DISTRIBUTION RATE" },
      { comment: " * Live Cash yields underwritten on placement metrics" },
      { comment: " */" },
      { keyword: "export", decl: " const", variable: " calculateCashYield", symbol: " = (): number => {" },
      { keyword: "  const", variable: " netOperatingIncome", symbol: ": ", type: "number", value: ` = ${noi};`, comment: ` // ${formatCur(noi)}` },
      { keyword: "  const", variable: " annualDebtService", symbol: ": ", type: "number", value: ` = ${dscrAnnualDebtService};`, comment: ` // ${formatCur(dscrAnnualDebtService)}` },
      { keyword: "  const", variable: " initialCashEquity", symbol: ": ", type: "number", value: ` = ${equity};`, comment: ` // ${formatCur(equity)}` },
      { text: "" },
      { comment: "  // 1. Gross Cash Flow After Debt Service Placements" },
      { keyword: "  const", variable: " netCashFlowAfterDebt", symbol: ": ", type: "number", value: " = netOperatingIncome - annualDebtService;" },
      { comment: `  // Live Evaluation: ${noi} - ${dscrAnnualDebtService} = ${cashFlow}` },
      { text: "" },
      { comment: "  // 2. Safe Dividend Quotient" },
      { keyword: "  let", variable: " cashOnCashPercentage", symbol: ": ", type: "number", value: ";" },
      { keyword: "  if", symbol: " (initialCashEquity <= ", value: "0", symbol2: ") {" },
      { keyword: "    throw", decl: " new", variable: " Error", string: "(\"Initial cash equity must exceed zero to compute dividend yield.\");" },
      { keyword: "  } else ", symbol: "{" },
      { variable: "    cashOnCashPercentage", symbol: " = (netCashFlowAfterDebt / initialCashEquity) * ", value: "100", symbol2: ";" },
      { keyword: "  }" },
      { comment: `  // Live Evaluation: (${cashFlow} / ${equity}) * 100 = ${cocVal.toFixed(2)}%` },
      { text: "" },
      { keyword: "  return", symbol: " Number(cashOnCashPercentage.toFixed(", value: "2", symbol2: ")); // Yield outcome" },
      { symbol: "};" }
    ];
  };

  const getCapRateLines = () => {
    const purchasePrice = capCalc.success ? capCalc.data.purchasePrice : 0;
    const projections = capCalc.success ? capCalc.data.projections : [];
    const year10Noi = projections && projections.length >= 10 ? projections[9].netOperatingIncome : 0;
    const terminalVal = capCalc.success ? capCalc.data.terminalValuation : 0;
    const appreciation = capCalc.success ? capCalc.data.valueChangePercent : 0;
    const terminalCapPercent = capGoingInRate + (capExpansionBps * 10 / 100);

    return [
      { label: "import", extra: " { CapRateResult, YearProjection } ", keyword: "from", string: " \"./valuation-engine\";" },
      { text: "" },
      { comment: "/**" },
      { comment: " * 10-YEAR EXIT VALUATION AND CAP RATE GLIDE PATH" },
      { comment: ` * Location Index: ${activeHub.cityName}, ${activeHub.state}` },
      { comment: " */" },
      { keyword: "export", decl: " const", variable: " projectTerminalValue", symbol: " = (): CapRateResult => {" },
      { keyword: "  const", variable: " initialNoi", symbol: ": ", type: "number", value: ` = ${capInitialNoi};`, comment: ` // ${formatCur(capInitialNoi)}` },
      { keyword: "  const", variable: " goingInCapRatePercent", symbol: ": ", type: "number", value: ` = ${capGoingInRate};`, comment: ` // ${capGoingInRate.toFixed(2)}%` },
      { keyword: "  const", variable: " annualNoiGrowthPercent", symbol: ": ", type: "number", value: ` = ${capNoiGrowth};`, comment: ` // ${capNoiGrowth.toFixed(2)}%` },
      { keyword: "  const", variable: " capRateExpansionAnnualBps", symbol: ": ", type: "number", value: ` = ${capExpansionBps};`, comment: ` // ${capExpansionBps} bps expansion/yr` },
      { text: "" },
      { comment: "  // 1. Estimate Acquisition Pricing based on Entry Cap Rate" },
      { keyword: "  const", variable: " purchasePrice", symbol: ": ", type: "number", value: " = initialNoi / (goingInCapRatePercent / 100);" },
      { comment: `  // Live Evaluation: ${capInitialNoi} / ${(capGoingInRate/100).toFixed(4)} = ${purchasePrice.toFixed(2)}` },
      { text: "" },
      { comment: "  // 2. Compounding Net Operations over 10 Years" },
      { keyword: "  const", variable: " year10NetOperatingIncome", symbol: ": ", type: "number", value: ` = ${year10Noi.toFixed(2)};`, comment: ` // NOI Compounded at ${capNoiGrowth}%` },
      { text: "" },
      { comment: "  // 3. Shift Cap Rate by cumulative expansion factors" },
      { keyword: "  const", variable: " totalBpsExpansion", symbol: ": ", type: "number", value: ` = capRateExpansionAnnualBps * 10;`, comment: ` // ${capExpansionBps * 10} bps total` },
      { keyword: "  const", variable: " terminalCapRatePercent", symbol: ": ", type: "number", value: ` = goingInCapRatePercent + (totalBpsExpansion / 100);` },
      { comment: `  // Live Evaluation: ${capGoingInRate}% + ${(capExpansionBps * 10 / 100).toFixed(2)}% = ${terminalCapPercent.toFixed(2)}%` },
      { text: "" },
      { comment: "  // 4. Settle exit valuation under decompressed pricing" },
      { keyword: "  const", variable: " terminalValuation", symbol: ": ", type: "number", value: " = year10NetOperatingIncome / (terminalCapRatePercent / 100);" },
      { comment: `  // Live Evaluation: ${year10Noi.toFixed(2)} / ${(terminalCapPercent/100).toFixed(4)} = ${terminalVal.toFixed(2)}` },
      { text: "" },
      { comment: "  // 5. Compute Capital Appreciation delta margins" },
      { keyword: "  const", variable: " capitalGrowthPercent", symbol: ": ", type: "number", value: " = ((terminalValuation - purchasePrice) / purchasePrice) * 100;" },
      { comment: `  // Live Evaluation: ((${terminalVal.toFixed(2)} - ${purchasePrice.toFixed(2)}) / ${purchasePrice.toFixed(2)}) * 100 = ${appreciation.toFixed(2)}%` },
      { text: "" },
      { keyword: "  return", symbol: " { purchasePrice, terminalValuation, capitalGrowthPercent };" },
      { symbol: "};" }
    ];
  };

  const getSaasLines = () => {
    const ltv = saasCalc.success ? saasCalc.data.ltv : 0;
    const ratio = saasCalc.success ? saasCalc.data.ltvToCacRatio : 0;
    const health = saasCalc.success ? saasCalc.data.unitEconomicsHealth : 'Cautionary (1x - 3x)';
    const tenure = saasCalc.success ? saasCalc.data.customerLifetimeMonths : 0;
    const marginMul = saasCalc.success ? saasCalc.data.grossMarginMultiplier : (saasMargin / 100);

    return [
      { label: "import", extra: " { SaaSResult, SaaSInput } ", keyword: "from", string: " \"./saas-engine\";" },
      { text: "" },
      { comment: "/**" },
      { comment: " * SAAS CONTRACTUAL REVENUE AND CHURN DYNAMICS" },
      { comment: " * High fidelity unit economics projection under lockstep parameters" },
      { comment: " */" },
      { keyword: "export", decl: " const", variable: " auditSaaSMetrics", symbol: " = (): SaaSResult => {" },
      { keyword: "  const", variable: " mrrPerCustomer", symbol: ": ", type: "number", value: ` = ${saasMrr};`, comment: ` // ${formatCur(saasMrr)}` },
      { keyword: "  const", variable: " grossMarginPercent", symbol: ": ", type: "number", value: ` = ${saasMargin};`, comment: ` // ${saasMargin.toFixed(1)}%` },
      { keyword: "  const", variable: " monthlyChurnPercent", symbol: ": ", type: "number", value: ` = ${saasChurn};`, comment: ` // ${saasChurn.toFixed(2)}%` },
      { keyword: "  const", variable: " customerAcquisitionCost", symbol: ": ", type: "number", value: ` = ${saasCac};`, comment: ` // ${formatCur(saasCac)}` },
      { text: "" },
      { comment: "  // 1. Establish core segment gross yields" },
      { keyword: "  const", variable: " marginFraction", symbol: ": ", type: "number", value: ` = grossMarginPercent / 100;`, comment: ` // ${marginMul.toFixed(2)}` },
      { keyword: "  const", variable: " monthlyAvgGrossProfit", symbol: ": ", type: "number", value: " = mrrPerCustomer * marginFraction;" },
      { comment: `  // Live Evaluation: ${saasMrr} * ${marginMul.toFixed(2)} = ${saasMrr * marginMul}` },
      { text: "" },
      { comment: "  // 2. Client retention tenure indices in months" },
      { keyword: "  const", variable: " customerLifetimeMonths", symbol: ": ", type: "number", value: " = 1 / (monthlyChurnPercent / 100);" },
      { comment: `  // Live Evaluation: 1 / ${(saasChurn/100).toFixed(4)} = ${tenure.toFixed(1)} months` },
      { text: "" },
      { comment: "  // 3. Compounded Customer Lifetime Value (LTV)" },
      { keyword: "  const", variable: " ltv", symbol: ": ", type: "number", value: " = monthlyAvgGrossProfit * customerLifetimeMonths;" },
      { comment: `  // Live Evaluation: ${(saasMrr * marginMul).toFixed(2)} * ${tenure.toFixed(1)} = ${ltv.toFixed(2)}` },
      { text: "" },
      { comment: "  // 4. LTV : CAC Unit Coefficient" },
      { keyword: "  const", variable: " ltvToCacRatio", symbol: ": ", type: "number", value: " = ltv / customerAcquisitionCost;" },
      { comment: `  // Live Evaluation: ${ltv.toFixed(2)} / ${saasCac} = ${ratio.toFixed(2)}x` },
      { text: "" },
      { keyword: "  const", variable: " riskHealth", symbol: ": ", type: "string", value: ` = `, string: `"${health}";` },
      { text: "" },
      { keyword: "  return", symbol: " { ltv, ltvToCacRatio, lifetimeMonths: customerLifetimeMonths, health: riskHealth };" },
      { symbol: "};" }
    ];
  };

  const getActiveDiagnosticLines = () => {
    switch (activeDiagnosticFile) {
      case 'dscr-calculator.ts': return getDscrCalculatorLines();
      case 'cash-on-cash.ts': return getCashOnCashLines();
      case 'cap-rate-terminal.ts': return getCapRateLines();
      case 'saas-unit-economics.ts': return getSaasLines();
      default: return getDscrCalculatorLines();
    }
  };

  const renderDiagnosticLine = (line: any, idx: number) => {
    const lineNum = idx + 1;
    return (
      <div key={idx} className="flex hover:bg-stone-900/60 py-0.5 px-4 font-mono text-xs font-semibold leading-relaxed select-text font-light">
        <span className="w-10 text-stone-700 hover:text-stone-500 text-right pr-3 select-none border-r border-[#1e1e24] mr-4 font-mono text-xs font-semibold tracking-wider tracking-tight">
          {lineNum}
        </span>
        <span className="flex-1 whitespace-pre font-mono tracking-wide text-stone-300">
          {line.comment && <span className="text-[#6A9955] italic font-mono">{line.comment}</span>}
          {line.label && <span className="text-[#C586C0] font-mono">{line.label}</span>}
          {line.extra && <span className="text-stone-300 font-mono">{line.extra}</span>}
          {line.keyword && <span className="text-[#569CD6] font-semibold font-mono">{line.keyword}</span>}
          {line.decl && <span className="text-[#4FC1FF] font-mono">{line.decl}</span>}
          {line.variable && <span className="text-[#DCDCAA] font-mono">{line.variable}</span>}
          {line.symbol && <span className="text-stone-400 font-mono">{line.symbol}</span>}
          {line.type && <span className="text-[#4EC9B0] font-mono">{line.type}</span>}
          {line.value && <span className="text-stone-200 font-mono">{line.value}</span>}
          {line.string && <span className="text-[#CE9178] font-mono">{line.string}</span>}
          {line.symbol2 && <span className="text-stone-400 font-mono">{line.symbol2}</span>}
          {line.text && <span className="text-stone-400 font-mono">{line.text}</span>}
        </span>
      </div>
    );
  };

  const handleCopyDiagnosticCode = () => {
    const lines = getActiveDiagnosticLines();
    const text = lines.map(l => {
      let segment = "";
      if (l.label) segment += l.label;
      if (l.extra) segment += l.extra;
      if (l.keyword) segment += l.keyword;
      if (l.decl) segment += l.decl;
      if (l.variable) segment += l.variable;
      if (l.symbol) segment += l.symbol;
      if (l.type) segment += l.type;
      if (l.value) segment += l.value;
      if (l.string) segment += l.string;
      if (l.symbol2) segment += l.symbol2;
      if (l.text) segment += l.text;
      if (l.comment) segment += l.comment;
      return segment;
    }).join("\n");

    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedDiagnostic(true);
        setTimeout(() => setCopiedDiagnostic(false), 2000);
      })
      .catch((err) => console.error(err));
  };

  const loadPreset = (type: 'cre-prime' | 'cre-stressed' | 're-expansion' | 'saas-unicorn' | 'saas-risk' | 'asset-multifamily' | 'asset-selfstorage' | 'asset-retail' | 'asset-industrial') => {
    switch (type) {
      case 'cre-prime':
        setDscrUseNoiDirect(false);
        setDscrGrossRevenue(1900000);
        setDscrVacancyRate(4.0);
        setDscrOtherIncome(210000);
        setDscrOperatingExpenses(580000);
        setDscrAnnualDebtService(600000);
        setActiveTab('debt-coverage');
        break;
      case 'cre-stressed':
        setDscrUseNoiDirect(false);
        setDscrGrossRevenue(950000);
        setDscrVacancyRate(15.0);
        setDscrOtherIncome(25000);
        setDscrOperatingExpenses(520000);
        setDscrAnnualDebtService(450000);
        setActiveTab('debt-coverage');
        break;
      case 're-expansion':
        setCapInitialNoi(650000);
        setCapGoingInRate(4.75);
        setCapNoiGrowth(4.8);
        setCapExpansionBps(20);
        setCapPurchasePriceOverride('');
        setActiveTab('ten-year-hold');
        break;
      case 'saas-unicorn':
        setSaasMrr(350);
        setSaasMargin(88);
        setSaasChurn(0.85); // Healthy sticky subscribers
        setSaasCac(1200);
        setActiveTab('saas-metrics');
        break;
      case 'saas-risk':
        setSaasMrr(65);
        setSaasMargin(55);
        setSaasChurn(8.0); // Dangerous high-churn
        setSaasCac(1650);
        setActiveTab('saas-metrics');
        break;
      case 'asset-multifamily':
        setDscrUseNoiDirect(false);
        setDscrGrossRevenue(1500000);
        setDscrVacancyRate(5.0);
        setDscrOtherIncome(35000);
        setDscrOperatingExpenses(550000);
        setDscrAnnualDebtService(500000);
        setDscrLoanAmount(4500000);
        setDscrInitialCashEquity(1800000);
        setActiveTab('debt-coverage');
        break;
      case 'asset-selfstorage':
        setDscrUseNoiDirect(false);
        setDscrGrossRevenue(800000);
        setDscrVacancyRate(8.0);
        setDscrOtherIncome(15000);
        setDscrOperatingExpenses(320000);
        setDscrAnnualDebtService(280000);
        setDscrLoanAmount(2500000);
        setDscrInitialCashEquity(1000000);
        setActiveTab('debt-coverage');
        break;
      case 'asset-retail':
        setDscrUseNoiDirect(false);
        setDscrGrossRevenue(1200000);
        setDscrVacancyRate(10.0);
        setDscrOtherIncome(45000);
        setDscrOperatingExpenses(480000);
        setDscrAnnualDebtService(420000);
        setDscrLoanAmount(3800000);
        setDscrInitialCashEquity(1500000);
        setActiveTab('debt-coverage');
        break;
      case 'asset-industrial':
        setDscrUseNoiDirect(false);
        setDscrGrossRevenue(2200000);
        setDscrVacancyRate(6.5);
        setDscrOtherIncome(90000);
        setDscrOperatingExpenses(780000);
        setDscrAnnualDebtService(720000);
        setDscrLoanAmount(6500000);
        setDscrInitialCashEquity(2600000);
        setActiveTab('debt-coverage');
        break;
    }
  };

  const handleReset10YearHold = () => {
    setCapInitialNoi(450000);
    setCapGoingInRate(6.5);
    setCapNoiGrowth(3.5);
    setCapExpansionBps(15);
    setCapPurchasePriceOverride('');
  };

  const getDealMetadata = (type: 'debt-coverage' | 'ten-year-hold' | 'saas-metrics') => {
    if (type === 'debt-coverage') {
      const dscr = dscrCalc.success && dscrCalc.data ? dscrCalc.data.dscr : 0;
      let dealHealth: 'Prime' | 'Strong' | 'Adequate' | 'Stressed' = 'Stressed';
      if (dscr >= 1.4) dealHealth = 'Prime';
      else if (dscr >= 1.25) dealHealth = 'Strong';
      else if (dscr >= 1.1) dealHealth = 'Adequate';
      
      return {
        dealHealth,
        formattedMetric: `${dscr.toFixed(2)}x DSCR`
      };
    } else if (type === 'ten-year-hold') {
      const val = capCalc.success && capCalc.data ? capCalc.data.valueChangePercent : 0;
      let dealHealth: 'Prime' | 'Strong' | 'Adequate' | 'Stressed' = 'Stressed';
      if (val >= 20.0) dealHealth = 'Prime';
      else if (val >= 12.0) dealHealth = 'Strong';
      else if (val >= 5.0) dealHealth = 'Adequate';
      
      return {
        dealHealth,
        formattedMetric: `${val >= 0 ? '+' : ''}${val.toFixed(2)}% appreciation`
      };
    } else {
      const ltvCac = saasCalc.success && saasCalc.data ? saasCalc.data.ltvToCacRatio : 0;
      let dealHealth: 'Prime' | 'Strong' | 'Adequate' | 'Stressed' = 'Stressed';
      if (ltvCac >= 4.5) dealHealth = 'Prime';
      else if (ltvCac >= 3.0) dealHealth = 'Strong';
      else if (ltvCac >= 1.5) dealHealth = 'Adequate';
      
      return {
        dealHealth,
        formattedMetric: `${ltvCac.toFixed(2)}x LTV:CAC`
      };
    }
  };

  const handleOpenSaveModal = (type: 'debt-coverage' | 'ten-year-hold' | 'saas-metrics') => {
    setSaveDealType(type);
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    let proposed = '';
    if (type === 'debt-coverage') {
      proposed = `HUD Acquisition #${savedDeals.length + 1} (${dateStr})`;
    } else if (type === 'ten-year-hold') {
      proposed = `Austin Core Speculative #${savedDeals.length + 1} (${dateStr})`;
    } else {
      proposed = `Enterprise SaaS Plan #${savedDeals.length + 1} (${dateStr})`;
    }
    setNewDealProjectName(proposed);
    setSaveModalOpen(true);
  };

  const handleSaveCurrentDeal = (name: string) => {
    if (!name.trim()) return;
    
    const meta = getDealMetadata(saveDealType);
    const currentDate = new Date().toISOString().split('T')[0];
    
    let dataPayload: any = {};
    if (saveDealType === 'debt-coverage') {
      dataPayload = {
        dscrUseNoiDirect,
        dscrDirectNoi,
        dscrGrossRevenue,
        dscrVacancyRate,
        dscrOtherIncome,
        dscrOperatingExpenses,
        dscrAnnualDebtService,
        dscrLoanAmount,
        dscrInitialCashEquity
      };
    } else if (saveDealType === 'ten-year-hold') {
      dataPayload = {
        capInitialNoi,
        capGoingInRate,
        capNoiGrowth,
        capExpansionBps,
        capPurchasePriceOverride
      };
    } else if (saveDealType === 'saas-metrics') {
      dataPayload = {
        saasMrr,
        saasMargin,
        saasChurn,
        saasCac
      };
    }
    
    const newDeal: SavedDeal = {
      id: `saved-deal-${Date.now()}`,
      projectName: name,
      dateUnderwritten: currentDate,
      dealType: saveDealType,
      dealHealth: meta.dealHealth,
      formattedMetric: meta.formattedMetric,
      data: dataPayload
    };
    
    setSavedDeals(prev => [newDeal, ...prev]);
    setSaveModalOpen(false);
    setNewDealProjectName('');
  };

  const loadSavedDeal = (deal: SavedDeal) => {
    setChallengeActive(false);
    setActiveTab(deal.dealType);
    
    const d = deal.data;
    if (deal.dealType === 'debt-coverage') {
      if (d.dscrUseNoiDirect !== undefined) setDscrUseNoiDirect(d.dscrUseNoiDirect);
      if (d.dscrDirectNoi !== undefined) setDscrDirectNoi(d.dscrDirectNoi);
      if (d.dscrGrossRevenue !== undefined) setDscrGrossRevenue(d.dscrGrossRevenue);
      if (d.dscrVacancyRate !== undefined) setDscrVacancyRate(d.dscrVacancyRate);
      if (d.dscrOtherIncome !== undefined) setDscrOtherIncome(d.dscrOtherIncome);
      if (d.dscrOperatingExpenses !== undefined) setDscrOperatingExpenses(d.dscrOperatingExpenses);
      if (d.dscrAnnualDebtService !== undefined) setDscrAnnualDebtService(d.dscrAnnualDebtService);
      if (d.dscrLoanAmount !== undefined) setDscrLoanAmount(d.dscrLoanAmount);
      if (d.dscrInitialCashEquity !== undefined) setDscrInitialCashEquity(d.dscrInitialCashEquity);
    } else if (deal.dealType === 'ten-year-hold') {
      if (d.capInitialNoi !== undefined) setCapInitialNoi(d.capInitialNoi);
      if (d.capGoingInRate !== undefined) setCapGoingInRate(d.capGoingInRate);
      if (d.capNoiGrowth !== undefined) setCapNoiGrowth(d.capNoiGrowth);
      if (d.capExpansionBps !== undefined) setCapExpansionBps(d.capExpansionBps);
      if (d.capPurchasePriceOverride !== undefined) setCapPurchasePriceOverride(d.capPurchasePriceOverride);
    } else if (deal.dealType === 'saas-metrics') {
      if (d.saasMrr !== undefined) setSaasMrr(d.saasMrr);
      if (d.saasMargin !== undefined) setSaasMargin(d.saasMargin);
      if (d.saasChurn !== undefined) setSaasChurn(d.saasChurn);
      if (d.saasCac !== undefined) setSaasCac(d.saasCac);
    }
  };

  const renderChallengeModule = () => {
    return (
      <div className="bg-[#181616]/40 border border-stone-850 p-6 rounded-2xl relative overflow-hidden transition-all duration-300">
        
        {/* CSS Animations Injector */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes auraPulse {
            0% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.15), inset 0 0 10px rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3); }
            50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.4), inset 0 0 20px rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.6); }
            100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.15), inset 0 0 10px rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.3); }
          }
          @keyframes gridScroll {
            0% { background-position: 0 0; }
            100% { background-position: 24px 24px; }
          }
          @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(300%); }
          }
          .aura-pulse-active {
            animation: auraPulse 4s infinite ease-in-out;
          }
        `}} />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${challengeActive ? 'bg-emerald-400 shadow-[0_0_10px_#10B981]' : 'bg-stone-800'}`} />
            <div>
              <h4 className="text-xs font-mono font-bold text-stone-400 uppercase tracking-widest">
                Stress-Testing &amp; Risk Simulator
              </h4>
              <p className="text-xs font-semibold tracking-wider text-stone-600 font-mono mt-0.5">
                Inject random macroeconomic winds to study deal persistence under negative scenarios.
              </p>
            </div>
          </div>
          <button
            id="toggle-challenge-mode-btn"
            onClick={() => setChallengeActive(!challengeActive)}
            className={`py-2 px-5 font-mono text-xs font-semibold tracking-wider uppercase font-bold tracking-widest border rounded-full transition-all duration-300 select-none cursor-pointer active:scale-95 hover:scale-[1.02] ${
              challengeActive 
                ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/80 shadow-[0_0_16px_rgba(16,185,129,0.25)] animate-pulse' 
                : 'bg-transparent text-stone-600 border-stone-900/60 hover:text-stone-400 hover:border-stone-800/80 hover:bg-white/[0.01]'
            }`}
          >
            {challengeActive ? "⚡ SYSTEM OVERRIDE: ACTIVE" : "⚙️ SYSTEM OVERRIDE: OFF"}
          </button>
        </div>

        {challengeActive && activeChallenge && (
          <div className="mt-5 pt-5 border-t border-stone-900/60 transition duration-300 animate-fade-in space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              
              {/* Challenge Details */}
              <div className="md:col-span-12 lg:col-span-7 space-y-2">
                <div className="flex items-center gap-2 select-none">
                  <span className="text-[9px] font-mono font-bold tracking-wider text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/10">
                    MACRO EVENT ACTIVE
                  </span>
                  <span className="text-xs font-semibold tracking-wider font-mono text-stone-500">/</span>
                  <button
                    id="reroll-challenge-btn"
                    onClick={handleRerollHeadwind}
                    className="text-[9px] font-mono text-stone-400 hover:text-amber-400 transition cursor-pointer flex items-center gap-1 focus:outline-none uppercase font-bold"
                  >
                    Reroll Hazard ⟳
                  </button>
                </div>
                
                <h3 className="text-lg font-serif font-light text-stone-200 tracking-tight mt-1 flex items-center gap-2">
                  {activeChallenge.name}
                </h3>
                
                <p className="text-xs font-semibold text-stone-400 font-serif leading-relaxed italic">
                  {activeChallenge.description}
                </p>
              </div>

              {/* Targets & Goal Statement Details */}
              <div className="md:col-span-12 lg:col-span-5 bg-stone-950/40 p-4 rounded-xl border border-stone-900 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest block">TARGET COVENANT</span>
                </div>
                
                <div className="font-mono space-y-1.5">
                  <div className="text-xs text-stone-300 flex justify-between items-center bg-stone-950/30 p-1.5 rounded">
                    <span className="text-xs font-semibold tracking-wider">Objective:</span>
                    <span className="font-bold text-[#F9F6F0]">{activeChallenge.goalText}</span>
                  </div>
                  
                  <div className="text-xs text-stone-300 flex justify-between items-center bg-stone-950/30 p-1.5 rounded">
                    <span className="text-xs font-semibold tracking-wider">Current Value:</span>
                    <span className={`font-bold ${challengeSuccess ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                      {(() => {
                        if (activeTab === 'debt-coverage') {
                          return dscrCalc.success && dscrCalc.data ? `${dscrCalc.data.dscr.toFixed(2)}x` : 'N/A';
                        } else if (activeTab === 'ten-year-hold') {
                          return capCalc.success && capCalc.data ? `${capCalc.data.valueChangePercent.toFixed(2)}%` : 'N/A';
                        } else {
                          return saasCalc.success && saasCalc.data ? `${saasCalc.data.ltvToCacRatio.toFixed(2)}x` : 'N/A';
                        }
                      })()}
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* INTEGRATED INTELLIGENCE BRIEFING */}
            <div className="bg-[#111111]/80 border border-stone-900/80 p-4 rounded-xl shadow-lg relative overflow-hidden transition-all duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <div className="pl-3 space-y-1">
                <div className="flex items-center gap-2 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10B981]" />
                  <span className="text-[9px] font-mono tracking-[0.2em] text-emerald-400 uppercase font-black">
                    GLOBAL INTELLIGENCE BRIEFING
                  </span>
                  <span className="text-stone-800 font-mono text-[9px] pointer-events-none select-none">/</span>
                  <span className="text-[9px] tracking-widest font-mono text-stone-500 uppercase font-light">
                    ACTIVE SECURED FEED
                  </span>
                </div>
                <p className="text-xs text-stone-350 font-sans italic leading-relaxed pt-0.5">
                  "{(activeChallenge as any).marketContext || 'Macroeconomic updates being pushed downstream.'}"
                </p>
              </div>
            </div>

            {/* Aura & Grid status response visual row */}
            <div className="mt-4">
              {challengeSuccess ? (
                <div className="aura-pulse-active relative overflow-hidden border border-emerald-500/30 bg-emerald-950/5 p-4 rounded-xl transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                  {/* Scrolling Blueprint grid backing */}
                  <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                       style={{
                         backgroundImage: 'linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)',
                         backgroundSize: '16px 16px',
                         animation: 'gridScroll 8s linear infinite'
                       }} 
                  />
                  
                  {/* Scanning sweep scanning line */}
                  <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-transparent via-emerald-500/[0.1] to-transparent h-4 pointer-events-none"
                       style={{ animation: 'scanline 3s linear infinite' }}
                  />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs select-none">
                        ✓
                      </span>
                      <div>
                        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">COVENANT COMPLIANT</span>
                        <p className="text-xs font-semibold tracking-wider text-stone-400 font-mono mt-0.5 animate-pulse">
                          Excellent. Capital structures and revenue rates survive under stress tests.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold tracking-wider font-mono text-emerald-500 uppercase tracking-widest font-bold">AURA &amp; GRID SYNC_OK</span>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden border border-rose-950 bg-rose-950/10 p-4 rounded-xl transition duration-500">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-950 text-rose-400 flex items-center justify-center font-bold text-xs select-none animate-pulse">
                      !
                    </span>
                    <div>
                      <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest block">COVENANT VIOLATION DETECTED</span>
                      <p className="text-xs font-semibold tracking-wider text-stone-400 font-mono mt-0.5 leading-relaxed">
                        Under active market contraction, this deal defaults or loses cash efficiency. Adjust input multipliers above to stabilize.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mastery Tracker */}
            <div className="mt-5 pt-5 border-t border-stone-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold tracking-wider font-mono tracking-[0.15em] text-stone-500 uppercase font-bold select-none">
                  STRESS MASTERY INDEX:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {masteryStreak}/5
                </span>
                
                {/* 5 minimalist circles */}
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4].map((idx) => {
                    const isLit = idx < masteryStreak;
                    return (
                      <div
                        key={idx}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-500 flex items-center justify-center relative ${
                          isLit
                            ? 'bg-emerald-950/40 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                            : 'bg-[#111111]/80 border border-stone-900'
                        }`}
                      >
                        {isLit ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_#34D399]" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-850" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                {challengeSuccess ? (
                  <button
                    type="button"
                    onClick={handleRecordSuccess}
                    className="py-1.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-[#121212] font-mono text-[9px] uppercase font-black tracking-widest rounded-full transition-all active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.4)] cursor-pointer flex items-center gap-1.5 hover:shadow-[0_0_18px_rgba(16,185,129,0.6)]"
                  >
                    🔒 SECURE UNDERWRITING &amp; RECORD SUCCESS
                  </button>
                ) : (
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider select-none italic text-center sm:text-left">
                    ⚠ Adjust parameters for Covenant Compliance to lock in
                  </span>
                )}
                
                {masteryStreak > 0 && (
                  <button
                    type="button"
                    className="text-[9px] font-mono text-stone-500 hover:text-stone-300 uppercase tracking-widest focus:outline-none cursor-pointer border border-stone-900 hover:border-stone-800 px-2 py-1 rounded"
                    onClick={() => {
                      setMasteryStreak(0);
                      setCompletedChallenges([]);
                    }}
                  >
                    RESET
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    );
  };

  // Render elegant custom SVG paths representing compounding over 10 years
  const renderHoldChart = () => {
    if (!capCalc.success || !capCalc.data) return null;
    const projections = capCalc.data.projections;
    
    const width = 500;
    const height = 180;
    const padding = 20;

    const valuations = projections.map(p => p.valuation);
    const minVal = Math.min(...valuations) * 0.95;
    const maxVal = Math.max(...valuations) * 1.05;
    const valRange = maxVal - minVal || 1;

    const nois = projections.map(p => p.netOperatingIncome);
    const minNoi = Math.min(...nois) * 0.95;
    const maxNoi = Math.max(...nois) * 1.05;
    const noiRange = maxNoi - minNoi || 1;

    const points = projections.map((p, i) => {
      const x = padding + (i / 10) * (width - padding * 2);
      const valY = height - padding - ((p.valuation - minVal) / valRange) * (height - padding * 2);
      const noiY = height - padding - ((p.netOperatingIncome - minNoi) / noiRange) * (height - padding * 2);
      return { x, valY, noiY, ...p };
    });

    const valLinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.valY}`).join(' ');
    const noiLinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.noiY}`).join(' ');

    const valAreaPath = `${valLinePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    const noiAreaPath = `${noiLinePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div className="relative font-sans">
        <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-stone-400 font-mono mb-2">
          <span>COMPOUNDING CURVE OVER 10 YEARS</span>
          <span className="text-[#F9F6F0] font-bold">Exit Valuation: {formatCur(projections[10].valuation)}</span>
        </div>
        <div className="bg-stone-900/60 p-4 rounded-lg border border-stone-800/80 relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = padding + ratio * (height - padding * 2);
              const valValue = maxVal - ratio * valRange;
              return (
                <g key={index} opacity="0.15">
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F9F6F0" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={padding + 5} y={y - 4} fill="#F9F6F0" className="text-[8px] font-mono">{formatCur(valValue)}</text>
                </g>
              );
            })}

            {/* Area fills */}
            <path d={valAreaPath} fill="url(#ivoryGrad)" opacity="0.06" />
            <path d={noiAreaPath} fill="url(#emeraldGrad)" opacity="0.04" />

            {/* Main Vector Plot Lines */}
            <path d={valLinePath} fill="none" stroke="#F9F6F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={noiLinePath} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 2" />

            {/* Data Nodes & Pointer Handlers */}
            {points.map((p, i) => {
              const isSignificant = i === 0 || i === 5 || i === 10;
              const isHovered = hoveredPoint && hoveredPoint.year === p.year;
              return (
                <g key={i}>
                  {/* Valuation Circle */}
                  <circle 
                    cx={p.x} 
                    cy={p.valY} 
                    r={isHovered ? 5.5 : (isSignificant ? 3.5 : 2.0)} 
                    fill={isHovered ? "#F9F6F0" : (isSignificant ? "#F9F6F0" : "#1C1C1C")} 
                    stroke="#F9F6F0" 
                    strokeWidth="1.5" 
                    className="transition-all duration-150 pointer-events-none" 
                  />
                  {/* NOI Circle */}
                  <circle 
                    cx={p.x} 
                    cy={p.noiY} 
                    r={isHovered ? 5.0 : (isSignificant ? 3.5 : 2.0)} 
                    fill={isHovered ? "#10B981" : (isSignificant ? "#10B981" : "#1C1C1C")} 
                    stroke="#10B981" 
                    strokeWidth="1.25" 
                    className="transition-all duration-150 pointer-events-none" 
                  />

                  {isSignificant && !isHovered && (
                    <text x={p.x} y={p.valY - 10} textAnchor="middle" fill="#F9F6F0" className="text-[9px] font-mono font-bold tracking-tight pointer-events-none select-none">
                      Yr{p.year}
                    </text>
                  )}

                  {/* Vertical interactive column hover targets */}
                  <line
                    x1={p.x}
                    y1={padding}
                    x2={p.x}
                    y2={height - padding}
                    stroke="transparent"
                    strokeWidth="16"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseMove={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}

            {/* Definitions */}
            <defs>
              <linearGradient id="ivoryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F9F6F0" />
                <stop offset="100%" stopColor="#F9F6F0" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Luxury Floating HUD (Warm Ivory Micro-card in JetBrains Mono) */}
          {hoveredPoint && (
            <div 
              className="absolute z-30 bg-[#F9F6F0] text-[#121212] px-3.5 py-2.5 rounded-lg shadow-2xl border border-stone-200 text-xs font-semibold tracking-wider font-mono pointer-events-none -translate-x-1/2 -translate-y-full mb-3 transition-transform duration-100 ease-out"
              style={{ 
                left: `${(hoveredPoint.x / width) * 100}%`, 
                top: `${(Math.min(hoveredPoint.valY, hoveredPoint.noiY) / height) * 100}%` 
              }}
            >
              <div className="font-bold border-b border-stone-300 pb-1 mb-1.5 text-stone-900 uppercase tracking-widest text-[9px]">
                YEAR {hoveredPoint.year} HORIZON
              </div>
              <div className="space-y-1 text-left">
                <div className="flex justify-between gap-5">
                  <span className="text-stone-500 uppercase tracking-wider text-[8px]">Projected Value:</span>
                  <span className="font-bold text-stone-900">{formatCur(hoveredPoint.valuation)}</span>
                </div>
                <div className="flex justify-between gap-5">
                  <span className="text-stone-500 uppercase tracking-wider text-[8px]">NOI Cash Stream:</span>
                  <span className="font-bold text-emerald-800">{formatCur(hoveredPoint.netOperatingIncome)}</span>
                </div>
                <div className="flex justify-between gap-5">
                  <span className="text-stone-500 uppercase tracking-wider text-[8px]">Yield (Cap Rate):</span>
                  <span className="font-bold text-stone-950">{hoveredPoint.capRatePercent.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-stone-200 font-sans selection:bg-[#F9F6F0] selection:text-[#121212] overflow-x-hidden flex flex-col justify-between">
      
      {/* PRIMARY APPLICATION SURFACE - EXCLUDED ON PRINT */}
      <div className="print:hidden flex flex-col min-h-screen justify-between w-full">
      <div className="border-b border-stone-900 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="space-y-4">
            <h1 className="text-3xl font-sans tracking-tight text-[#F9F6F0] font-light">
              Commercial Real Estate Deal Calculator
            </h1>
            <p className="text-xs text-stone-400 font-sans italic max-w-xl leading-relaxed">
              Evaluate debt coverage, cash yields, and baseline market risk in minutes.
            </p>
            
            {/* SLEEK HORIZONTAL METADATA ROW */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 border-t border-stone-900/60 text-xs font-semibold tracking-wider font-mono text-stone-500 select-none">
              <div className="flex items-center gap-2">
                <span className="uppercase text-stone-600 font-bold tracking-widest">Region:</span>
                <select
                  id="hub-selector"
                  value={selectedHubSlug}
                  onChange={(e) => {
                    const slug = e.target.value;
                    setSelectedHubSlug(slug);
                    const hub = METROPOLITAN_HUBS.find(h => h.slug === slug);
                    if (hub) {
                      setDscrVacancyRate(hub.defaultVacancyRate);
                    }
                  }}
                  className="bg-transparent text-stone-300 font-medium py-0.5 border-b border-stone-800 focus:outline-none focus:border-stone-550 cursor-pointer text-xs font-semibold tracking-wider font-mono"
                >
                  {METROPOLITAN_HUBS.map((hub) => (
                    <option key={hub.slug} value={hub.slug} className="bg-[#121212] text-stone-300">
                      {hub.cityName}, {hub.state}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="uppercase text-stone-600 font-bold tracking-widest">Vacancy:</span>
                <span className="text-stone-300 font-semibold">{activeHub.defaultVacancyRate.toFixed(1)}%</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span className="uppercase text-stone-600 font-bold tracking-widest">Mkt Tax:</span>
                <span className="text-stone-300 font-semibold">{activeHub.baselineCommercialTaxPercent.toFixed(2)}%</span>
              </div>
              <div className="hidden lg:block text-stone-600 italic truncate max-w-xs" title={activeHub.marketBrief}>
                "{activeHub.marketBrief}"
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-stretch md:items-end w-full md:w-auto">
            {/* SIMULATION CONTROLLER PRESETS */}
            <div className="flex flex-wrap items-center gap-3 py-1.5 w-full justify-start md:justify-end text-xs font-semibold tracking-wider font-sans select-none">
              <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest font-bold">MODEL SELECTION</span>
              <button 
                id="preset-cre-btn"
                onClick={() => loadPreset('cre-prime')}
                className="text-stone-350 hover:text-stone-100 transition duration-200 cursor-pointer hover:underline underline-offset-4"
              >
                Prime CRE
              </button>
              <span className="text-stone-800">/</span>
              <button 
                id="preset-saas-btn"
                onClick={() => loadPreset('saas-unicorn')}
                className="text-stone-350 hover:text-stone-100 transition duration-200 cursor-pointer hover:underline underline-offset-4"
              >
                SaaS Enterprise
              </button>
              <span className="text-stone-800">/</span>
              <button 
                id="preset-stress-btn"
                onClick={() => loadPreset('cre-stressed')}
                className="text-rose-450 hover:text-rose-300 transition duration-200 cursor-pointer hover:underline underline-offset-4"
              >
                Stressed RE
              </button>
            </div>

            {/* ASSET PROFILE PRESETS */}
            <div className="flex flex-wrap items-center gap-3 py-1.5 w-full justify-start md:justify-end text-xs font-semibold tracking-wider font-sans select-none">
              <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest font-bold">ASSET CATEGORY</span>
              <button 
                id="asset-multifamily-btn"
                onClick={() => loadPreset('asset-multifamily')}
                className="text-stone-350 hover:text-stone-100 transition duration-200 cursor-pointer hover:underline underline-offset-4"
                title="Multifamily profile with 5.0% vacancy rates"
              >
                Multifamily
              </button>
              <span className="text-stone-800">/</span>
              <button 
                id="asset-selfstorage-btn"
                onClick={() => loadPreset('asset-selfstorage')}
                className="text-stone-350 hover:text-stone-100 transition duration-200 cursor-pointer hover:underline underline-offset-4"
                title="Self-Storage profile with 8.0% vacancy rates"
              >
                Self-Storage
              </button>
              <span className="text-stone-800">/</span>
              <button 
                id="asset-retail-btn"
                onClick={() => loadPreset('asset-retail')}
                className="text-stone-350 hover:text-stone-100 transition duration-200 cursor-pointer hover:underline underline-offset-4"
                title="Retail profile with 10.0% vacancy rates"
              >
                Retail Strip
              </button>
              <span className="text-stone-800">/</span>
              <button 
                id="asset-industrial-btn"
                onClick={() => loadPreset('asset-industrial')}
                className="text-stone-350 hover:text-stone-100 transition duration-200 cursor-pointer hover:underline underline-offset-4"
                title="Industrial profile with 6.5% vacancy rates"
              >
                Industrial
              </button>
            </div>

            {/* UNDO / REDO HISTORY CONTROL */}
            <div className="flex flex-wrap items-center gap-3 py-1.5 w-full justify-start md:justify-end text-xs font-semibold tracking-wider font-mono select-none">
              <span className="text-[9px] text-stone-500 uppercase tracking-widest font-bold">HISTORY</span>
              <div className="flex items-center gap-2 bg-stone-950 px-2 py-1 rounded-lg border border-stone-900">
                <button
                  type="button"
                  id="nav-history-undo"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className={`p-1 rounded transition-all cursor-pointer flex items-center justify-center ${
                    historyIndex > 0 
                      ? 'text-stone-300 hover:text-amber-500 hover:bg-stone-900' 
                      : 'text-stone-700 cursor-not-allowed opacity-50'
                  }`}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo size={12} />
                </button>
                <span className="text-[9px] text-stone-505 font-mono select-none align-middle px-0.5">
                  {historyIndex >= 0 ? historyIndex : 0} / {history.length > 0 ? history.length - 1 : 0}
                </span>
                <button
                  type="button"
                  id="nav-history-redo"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className={`p-1 rounded transition-all cursor-pointer flex items-center justify-center ${
                    historyIndex < history.length - 1 
                      ? 'text-stone-300 hover:text-amber-500 hover:bg-stone-900' 
                      : 'text-stone-700 cursor-not-allowed opacity-50'
                  }`}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo size={12} />
                </button>
              </div>

              <span className="text-stone-850">/</span>

              <button
                type="button"
                id="advanced-diagnostics-toggle-btn"
                onClick={() => {
                  if (activeTab === 'debt-coverage') {
                    setActiveDiagnosticFile('dscr-calculator.ts');
                  } else if (activeTab === 'ten-year-hold') {
                    setActiveDiagnosticFile('cap-rate-terminal.ts');
                  } else if (activeTab === 'saas-metrics') {
                    setActiveDiagnosticFile('saas-unit-economics.ts');
                  } else {
                    setActiveDiagnosticFile('dscr-calculator.ts');
                  }
                  setDiagnosticsOpen(true);
                }}
                className="bg-stone-950 border border-stone-900 hover:border-amber-500/50 hover:bg-stone-900 text-stone-300 hover:text-amber-450 rounded-lg px-2.5 py-1 flex items-center gap-1.5 transition-all duration-200 cursor-pointer font-bold shadow-sm"
                title="Open raw mathematical trace diagnostics panel"
              >
                <Terminal size={11} className="text-amber-500" />
                <span>DIAGNOSTICS</span>
              </button>

              {/* Ghost Factory Admin Pass */}
              <button
                type="button"
                id="re-analytics-admin-pass-btn"
                onClick={() => setIsAdminOpen(true)}
                className="bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-300 rounded-lg px-2.5 py-1 flex items-center gap-1.5 transition-all duration-200 cursor-pointer font-bold shadow-sm text-xs font-mono"
                title="Open Underwriting Committee Portal"
              >
                <span>[ ADMIN PASS ]</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* CORE WORKSPACE */}
      <main className="max-w-5xl w-full mx-auto px-8 py-16 flex-1 space-y-16">
        
        {/* ULTRA-MINIMAL TEXT NAVIGATION ROW */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pb-8 text-xs font-mono select-none uppercase tracking-widest relative">
          <button
            id="tab-select-re"
            onClick={() => setActiveTab('debt-coverage')}
            className={`relative py-1 px-2 transition-all duration-200 cursor-pointer font-bold focus:outline-none ${
              activeTab === 'debt-coverage' 
                ? 'text-[#F9F6F0]' 
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            Debt Coverage
            {activeTab === 'debt-coverage' && (
              <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-amber-500 rounded-full animate-fade-in" />
            )}
          </button>
          
          <span className="text-stone-850 pointer-events-none select-none py-1">/</span>
          
          <button
            id="re-subtab-caprate-btn"
            onClick={() => setActiveTab('ten-year-hold')}
            className={`relative py-1 px-2 transition-all duration-200 cursor-pointer font-bold focus:outline-none ${
              activeTab === 'ten-year-hold' 
                ? 'text-[#F9F6F0]' 
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            10-Year Hold
            {activeTab === 'ten-year-hold' && (
              <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-amber-500 rounded-full animate-fade-in" />
            )}
          </button>
          
          <span className="text-stone-850 pointer-events-none select-none py-1">/</span>
          
          <button
            id="tab-select-saas"
            onClick={() => setActiveTab('saas-metrics')}
            className={`relative py-1 px-2 transition-all duration-200 cursor-pointer font-bold focus:outline-none ${
              activeTab === 'saas-metrics' 
                ? 'text-[#F9F6F0]' 
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            SaaS Metrics
            {activeTab === 'saas-metrics' && (
              <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-amber-500 rounded-full animate-fade-in" />
            )}
          </button>

          <span className="text-stone-850 pointer-events-none select-none py-1">/</span>

          <button
            id="tab-select-library"
            onClick={() => setActiveTab('library')}
            className={`relative py-1 px-2 transition-all duration-200 cursor-pointer font-bold focus:outline-none ${
              activeTab === 'library' 
                ? 'text-[#F9F6F0]' 
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            Library
            {activeTab === 'library' && (
              <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-emerald-500 rounded-full animate-fade-in" />
            )}
          </button>
        </div>

        {/* CHALLENGE RISK SIMULATION AREA */}
        {renderChallengeModule()}

        {/* WORKSTATION CONFIGURATOR & RESULTS */}
        <div className="space-y-16">

          {/* TAB I: DEBT SERVICE COVERAGE RATIO */}
          {activeTab === 'debt-coverage' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* DESCRIPTION & INTRO */}
              <div className="pb-8">
                <span className="text-stone-600 font-mono text-[9px] tracking-[0.25em] uppercase font-light select-none">Credit Coverage Ratio</span>
                <h2 className="text-2xl font-sans font-light text-stone-100 tracking-tight mt-1">
                  Debt Service Coverage Ratio (DSCR)
                </h2>
                <p className="text-xs text-stone-400 font-sans italic mt-1">
                  Assess rental properties or portfolio businesses through dynamic cash flow metrics.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 select-none">
                  <button
                    id="sample-deal-onboarding-btn"
                    onClick={() => {
                      setDscrUseNoiDirect(false);
                      setDscrGrossRevenue(1250000);
                      setDscrVacancyRate(5.0);
                      setDscrOtherIncome(180000);
                      setDscrOperatingExpenses(450000);
                      setDscrAnnualDebtService(550000);
                      setDscrLoanAmount(5000000);
                      setDscrInitialCashEquity(2000000);
                    }}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono text-xs font-bold rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2"
                  >
                    🚀 Start with a sample deal
                  </button>
                </div>
                         {/* DYNAMIC FORM */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                
                {/* Inputs block */}
                <div className="bg-white/[0.02] p-8 md:p-12 lg:p-16 rounded-2xl space-y-12 animate-fade-in shadow-2xl">
                  
                  {/* Quiet Inputs Header with contextual gear icon */}
                  <div className="flex justify-between items-center pb-6">
                    <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest font-bold">Deal Inputs</span>
                    <button
                      id="noi-mode-toggle"
                      onClick={() => setDscrUseNoiDirect(!dscrUseNoiDirect)}
                      className="text-stone-500 hover:text-stone-350 transition p-1 hover:bg-[#1E1C1C]/40 rounded-md cursor-pointer flex items-center gap-1.5 focus:outline-none"
                      title={dscrUseNoiDirect ? "Switch to Multi-Line Breakdown" : "Direct NOI Override Options"}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-mono tracking-wider uppercase font-semibold">
                        {dscrUseNoiDirect ? "Breakdown Mode" : "Direct NOI"}
                      </span>
                    </button>
                  </div>

                  {/* Progressive Disclosure Stage Navigation */}
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/[0.03] rounded-xl select-none">
                    <button
                      type="button"
                      id="stage-nav-revenue"
                      onClick={() => setDealStage('revenue')}
                      className={`py-2 px-1 text-center font-mono rounded-lg transition-all text-xs font-semibold tracking-wider uppercase font-bold tracking-wider cursor-pointer ${
                        dealStage === 'revenue'
                          ? 'bg-amber-500 text-stone-950 font-extrabold shadow-sm'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/30'
                      }`}
                    >
                      1. Revenue
                    </button>
                    <button
                      type="button"
                      id="stage-nav-operating"
                      onClick={() => setDealStage('operating-costs')}
                      className={`py-2 px-1 text-center font-mono rounded-lg transition-all text-xs font-semibold tracking-wider uppercase font-bold tracking-wider cursor-pointer ${
                        dealStage === 'operating-costs'
                          ? 'bg-amber-500 text-stone-950 font-extrabold shadow-sm'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/30'
                      }`}
                    >
                      2. Operating Costs
                    </button>
                    <button
                      type="button"
                      id="stage-nav-debt"
                      onClick={() => setDealStage('debt-equity')}
                      className={`py-2 px-1 text-center font-mono rounded-lg transition-all text-xs font-semibold tracking-wider uppercase font-bold tracking-wider cursor-pointer ${
                        dealStage === 'debt-equity'
                          ? 'bg-amber-500 text-stone-950 font-extrabold shadow-sm'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/30'
                      }`}
                    >
                      3. Debt/Equity
                    </button>
                  </div>

                  <div className="relative pt-2">
                    <motion.div
                      key={dealStage + "_" + dscrUseNoiDirect}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-6"
                    >
                      {dealStage === 'revenue' && (
                        <div className="space-y-6 animate-fade-in">
                          {dscrUseNoiDirect ? (
                            /* Direct NOI fields */
                            <div className="group/field">
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-semibold font-sans font-medium text-stone-400/70 tracking-wide">Direct Net Operating Income (NOI)</label>
                                <span className="text-xs font-mono text-[#F9F6F0] font-bold">{formatCur(dscrDirectNoi)}</span>
                              </div>
                              <input
                                type="number"
                                id="noi-direct-input"
                                value={dscrDirectNoi}
                                onChange={(e) => setDscrDirectNoi(Math.max(0, Number(e.target.value)))}
                                className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                              />
                              <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                                <input 
                                  type="range"
                                  id="noi-direct-slider"
                                  min="0"
                                  max="3000000"
                                  step="25000"
                                  value={dscrDirectNoi}
                                  onChange={(e) => setDscrDirectNoi(Number(e.target.value))}
                                  className="w-full accent-[#F9F6F0] cursor-pointer h-5"
                                />
                              </div>
                            </div>
                          ) : (
                            /* Multi-line breakdown fields under Revenue step */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                              {/* Gross rental income */}
                              <div className="group/field">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Gross Rental Income</label>
                                  <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatCur(dscrGrossRevenue)}</span>
                                </div>
                                <input
                                  type="number"
                                  id="dscr-revenue-input"
                                  value={dscrGrossRevenue}
                                  onChange={(e) => setDscrGrossRevenue(Math.max(0, Number(e.target.value)))}
                                  className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                                />
                                <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                                  <input 
                                    type="range"
                                    id="dscr-revenue-slider"
                                    min="50000"
                                    max="4000000"
                                    step="25000"
                                    value={dscrGrossRevenue}
                                    onChange={(e) => setDscrGrossRevenue(Number(e.target.value))}
                                    className="w-full accent-[#F9F6F0] cursor-pointer h-5"
                                  />
                                </div>
                              </div>

                              {/* Vacancy Rate */}
                              <div className="group/field">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Vacancy Rate</label>
                                  <span className="text-xs font-mono text-amber-500 font-semibold">{formatPct(dscrVacancyRate)}</span>
                                </div>
                                <input
                                  type="number"
                                  id="dscr-vacancy-input"
                                  step="0.1"
                                  value={dscrVacancyRate}
                                  onChange={(e) => setDscrVacancyRate(Math.min(100, Math.max(0, Number(e.target.value))))}
                                  className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                                />
                                <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                                  <input 
                                    type="range"
                                    id="dscr-vacancy-slider"
                                    min="0"
                                    max="50"
                                    step="0.5"
                                    value={dscrVacancyRate}
                                    onChange={(e) => setDscrVacancyRate(Number(e.target.value))}
                                    className="w-full accent-[#F9F6F0] cursor-pointer h-5"
                                  />
                                </div>
                                {dscrVacancyRate > 15 && (
                                  <div id="vacancy-precision-warning" className="mt-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wider p-2 rounded-lg font-mono flex items-start gap-1.5 leading-relaxed">
                                    <ShieldAlert size={14} className="shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                                    <span>
                                      <strong>Precision Warning:</strong> Vacancy above 15% is higher than default market norms. This may indicate specialized assets (hotel/distress/stabilization phase).
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Other Income */}
                              <div className="group/field sm:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                  <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Other Revenues</label>
                                  <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatCur(dscrOtherIncome)}</span>
                                </div>
                                <input
                                  type="number"
                                  id="dscr-other-input"
                                  value={dscrOtherIncome}
                                  onChange={(e) => setDscrOtherIncome(Math.max(0, Number(e.target.value)))}
                                  className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                                />
                                <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                                  <input 
                                    type="range"
                                    id="dscr-other-slider"
                                    min="0"
                                    max="1000000"
                                    step="10000"
                                    value={dscrOtherIncome}
                                    onChange={(e) => setDscrOtherIncome(Number(e.target.value))}
                                    className="w-full accent-[#F9F6F0] cursor-pointer h-5"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-end pt-2 select-none">
                            <button
                              type="button"
                              onClick={() => setDealStage('operating-costs')}
                              className="px-4 py-1.5 bg-stone-905 hover:bg-stone-900 border border-stone-800 text-amber-500 hover:text-amber-400 font-mono text-xs font-semibold tracking-wider uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                              NEXT: COSTS ➜
                            </button>
                          </div>
                        </div>
                      )}

                      {dealStage === 'operating-costs' && (
                        <div className="space-y-6 animate-fade-in">
                          {dscrUseNoiDirect ? (
                            <div className="p-4 rounded-xl border border-stone-900 bg-[#161414]/30 space-y-2">
                              <span className="text-xs font-semibold tracking-wider font-mono text-amber-500 uppercase tracking-widest font-bold">Direct NOI Override Active</span>
                              <p className="text-xs font-serif text-stone-400 leading-relaxed italic">
                                Operating costs are built directly into your Direct Net Operating Income (NOI) override in Stage 1. Switch back to "Breakdown Mode" in the header to declare detailed separate expenses.
                              </p>
                            </div>
                          ) : (
                            /* Operating Expenses */
                            <div className="group/field">
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Operating Expenses</label>
                                <span className="text-xs font-mono text-rose-400 font-semibold">{formatCur(dscrOperatingExpenses)}</span>
                              </div>
                              <input
                                type="number"
                                id="dscr-opex-input"
                                value={dscrOperatingExpenses}
                                onChange={(e) => setDscrOperatingExpenses(Math.max(0, Number(e.target.value)))}
                                className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                              />
                              <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                                <input 
                                  type="range"
                                  id="dscr-opex-slider"
                                  min="0"
                                  max="2000000"
                                  step="10000"
                                  value={dscrOperatingExpenses}
                                  onChange={(e) => setDscrOperatingExpenses(Number(e.target.value))}
                                  className="w-full accent-rose-500 cursor-pointer h-5"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2 select-none">
                            <button
                              type="button"
                              onClick={() => setDealStage('revenue')}
                              className="px-3 py-1.5 bg-transparent text-stone-500 hover:text-stone-300 font-mono text-xs font-semibold tracking-wider uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
                            >
                              ⮌ REVENUE
                            </button>
                            <button
                              type="button"
                              onClick={() => setDealStage('debt-equity')}
                              className="px-4 py-1.5 bg-stone-905 hover:bg-stone-900 border border-stone-800 text-amber-500 hover:text-amber-400 font-mono text-xs font-semibold tracking-wider uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                            >
                              NEXT: DEBT/EQUITY ➜
                            </button>
                          </div>
                        </div>
                      )}

                      {dealStage === 'debt-equity' && (
                        <div className="space-y-6 animate-fade-in">
                          {/* Debt Service */}
                          <div className="group/field">
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Annual Debt Obligations</label>
                              <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatCur(dscrAnnualDebtService)}</span>
                            </div>
                            <input
                              type="number"
                              id="dscr-debt-input"
                              value={dscrAnnualDebtService}
                              onChange={(e) => setDscrAnnualDebtService(Math.max(0, Number(e.target.value)))}
                              className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                            />
                            <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                              <input 
                                type="range"
                                id="dscr-debt-slider"
                                min="0"
                                max="1500050"
                                step="10000"
                                value={dscrAnnualDebtService}
                                onChange={(e) => setDscrAnnualDebtService(Number(e.target.value))}
                                className="w-full accent-amber-500/80 cursor-pointer h-5"
                              />
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <button 
                                id="dscr-zero-debt-trigger"
                                onClick={() => setDscrAnnualDebtService(0)}
                                className="text-[9px] font-sans text-emerald-400 hover:text-emerald-300 bg-transparent py-0.5 cursor-pointer underline underline-offset-4"
                              >
                                SET DIRECT DEBT-FREE ($0)
                              </button>
                            </div>
                            {dscrCalc.success && dscrCalc.data && dscrCalc.data.dscr < 1.0 && !dscrCalc.data.isDebtFree && (
                              <div id="dscr-precision-warning" className="mt-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold tracking-wider p-2 rounded-lg font-mono flex items-start gap-1.5 leading-relaxed">
                                <ShieldAlert size={14} className="shrink-0 mt-0.5 text-rose-500 animate-pulse" />
                                <span>
                                  <strong>Precision Warning:</strong> DSCR is below 1.00x ({dscrCalc.data.dscr.toFixed(2)}x). Net Operating Cash flow is insufficient to cover debt service obligations. This typically breaches bank covenants.
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Lender Proposed Loan Amount */}
                          <div className="group/field">
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Loan Amount</label>
                              <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatCur(dscrLoanAmount)}</span>
                            </div>
                            <input
                              type="number"
                              id="dscr-loanamount-input"
                              value={dscrLoanAmount}
                              onChange={(e) => setDscrLoanAmount(Math.max(1, Number(e.target.value)))}
                              className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                            />
                            <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                              <input 
                                type="range"
                                id="dscr-loanamount-slider"
                                min="100000"
                                max="20000000"
                                step="100000"
                                value={dscrLoanAmount}
                                onChange={(e) => setDscrLoanAmount(Number(e.target.value))}
                                className="w-full accent-amber-500 cursor-pointer h-5"
                              />
                            </div>
                          </div>

                          {/* Initial Cash Equity for Cash-on-Cash Return */}
                          <div className="group/field">
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Cash Invested</label>
                              <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatCur(dscrInitialCashEquity)}</span>
                            </div>
                            <input
                              type="number"
                              id="dscr-cashequity-input"
                              value={dscrInitialCashEquity}
                              onChange={(e) => setDscrInitialCashEquity(Math.max(1, Number(e.target.value)))}
                              className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                            />
                            <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                              <input 
                                type="range"
                                id="dscr-cashequity-slider"
                                min="50000"
                                max="10000000"
                                step="50000"
                                value={dscrInitialCashEquity}
                                onChange={(e) => setDscrInitialCashEquity(Number(e.target.value))}
                                className="w-full accent-emerald-500 cursor-pointer h-5"
                              />
                            </div>
                          </div>

                          <div className="flex justify-start pt-2 select-none">
                            <button
                              type="button"
                              onClick={() => setDealStage('operating-costs')}
                              className="px-3 py-1.5 bg-transparent text-stone-500 hover:text-stone-300 font-mono text-xs font-semibold tracking-wider uppercase font-bold tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
                            >
                              ⮌ COSTS
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </div>     </div>

                </div>

                {/* OUTPUT COMPONENT IN LUXURIOUS IVORY PAPER */}
                <div className="space-y-6">
                  
                  {dscrCalc.success && dscrCalc.data ? (
                    (() => {
                      const data = dscrCalc.data;
                      
                      // Theme/Alert profiles based on rating
                      const ratingStyling = {
                        'Prime': { text: 'text-emerald-700', bg: 'bg-emerald-50/90', border: 'border-emerald-200', tag: 'bg-emerald-600 text-[#F9F6F0]' },
                        'Strong': { text: 'text-teal-700', bg: 'bg-teal-50/90', border: 'border-teal-200', tag: 'bg-teal-600 text-[#F9F6F0]' },
                        'Adequate': { text: 'text-amber-700', bg: 'bg-amber-50/90', border: 'border-amber-200', tag: 'bg-amber-600 text-[#F9F6F0]' },
                        'Under-collateralized': { text: 'text-orange-700', bg: 'bg-orange-50/90', border: 'border-orange-200', tag: 'bg-orange-600 text-[#F9F6F0]' },
                        'Critical': { text: 'text-red-700', bg: 'bg-red-50/90', border: 'border-red-200', tag: 'bg-red-600 text-[#F9F6F0]' }
                      }[data.dscrRating];

                      return (
                        <div className="space-y-6">
                          
                          {/* HIGHLIGHT COMPONENT – WARM PREMIUM IVORY */}
                          <div className={`bg-[#F9F6F0] text-[#121212] p-8 md:p-12 lg:p-16 rounded-3xl shadow-2xl transition-all duration-300 space-y-8 md:space-y-12 ${challengeActive && activeTab === 'debt-coverage' && !challengeSuccess ? 'border border-rose-450 ring-2 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-none'}`}>
                            
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 select-none flex-wrap">
                                  <span className="text-xs font-semibold tracking-wider font-mono tracking-widest text-stone-500 uppercase">Deal Health</span>
                                  {(data.isDebtFree || data.dscr >= 1.25) && !(challengeActive && activeTab === 'debt-coverage' && !challengeSuccess) && (
                                    <span id="dscr-guard-badge" className="text-xs font-serif italic text-[#10B981] font-light ml-2">
                                      ✓ Strong Coverage
                                    </span>
                                  )}
                                  {challengeActive && activeTab === 'debt-coverage' && !challengeSuccess && (
                                    <span className="text-xs font-semibold tracking-wider font-mono tracking-wider text-rose-600 bg-rose-100/60 px-2.5 py-0.5 rounded border border-rose-200 font-bold ml-2 uppercase animate-pulse">
                                      ⚠️ COVENANT FAILING
                                    </span>
                                  )}
                                </div>
                                <h3 className={`text-5xl font-serif mt-2 tracking-tight font-extrabold font-mono flex items-baseline gap-3 flex-wrap transition duration-300 ${challengeActive && activeTab === 'debt-coverage' && !challengeSuccess ? 'text-rose-600' : 'text-[#1C1C1C]'}`}>
                                  <span>{data.isDebtFree ? "DEBT FREE" : `${formatNum(data.dscr, 2)}x`}</span>
                                  {challengeActive && activeTab === 'debt-coverage' && !challengeSuccess ? (
                                    <span className="text-xs font-mono tracking-wider text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 select-none uppercase">
                                      (GOAL: ≥ 1.25x)
                                    </span>
                                  ) : (
                                    <span className="text-xs font-semibold font-mono tracking-wider text-stone-500 font-normal select-none">(Target benchmark is 1.25x or higher)</span>
                                  )}
                                </h3>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 text-right select-none">
                                <span className={`text-xs font-semibold tracking-wider uppercase font-mono font-bold tracking-wider px-3 py-1.5 rounded-full ${ratingStyling.tag}`}>
                                  {data.dscrRating}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-stone-600 leading-relaxed font-sans italic">
                              {data.isDebtFree 
                                ? "This investment maintains an unleveraged posture, representing infinite coverage without default risk exposure."
                                : `The asset generates $${formatNum(data.dscr, 2)} of net rental proceeds for every dollar of contract debt obligation.`}
                            </p>

                            <div className="pt-2 space-y-3 font-mono text-xs text-[#2A2A2A]">
                              {!dscrUseNoiDirect && (
                                <>
                                  <div className="flex justify-between">
                                    <span>Effective Gross Revenues</span>
                                    <span>{formatCur(data.effectiveGrossIncome)}</span>
                                  </div>
                                  <div className="flex justify-between text-stone-550">
                                    <span>(-) Cumulative OpEx</span>
                                    <span>{formatCur(data.operatingExpenses)}</span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between font-bold text-stone-900 pt-1 text-sm">
                                <span>NET OPERATING INCOME</span>
                                <span>{formatCur(data.netOperatingIncome)}</span>
                              </div>
                              <div className="flex justify-between text-stone-700">
                                <span>Gross Debt Service</span>
                                <span>{formatCur(data.annualDebtService)}</span>
                              </div>
                            </div>

                            {/* PERSISTENT HELPER EXPLANATION */}
                            <div className="pt-1.5">
                              <p className="text-xs font-semibold text-[#4A4A4A] font-sans italic leading-relaxed">
                                *"Measures whether your property generates enough rental cash flow to fully cover your mortgage payment."*
                              </p>
                            </div>

                            {/* RECOVERY STRATEGY PANEL */}
                            {challengeActive && !challengeSuccess && dscrRecoveryStrategy && (
                              <div className="mt-4 pt-4 border-t border-rose-300/40 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold tracking-wider font-mono font-bold tracking-wider text-rose-800 uppercase flex items-center gap-1.5 select-none font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    Tactical Recovery Option
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowRecoveryDscr(!showRecoveryDscr)}
                                    className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] uppercase font-bold tracking-wider rounded transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow"
                                  >
                                    {showRecoveryDscr ? "✕ Clear Blueprint" : "⚡ View Recovery Strategy"}
                                  </button>
                                </div>

                                {showRecoveryDscr && (
                                  <div className="bg-rose-50 border border-rose-250 p-4 rounded-xl text-stone-950 animate-fade-in space-y-3">
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono font-black text-rose-800 uppercase tracking-widest block">
                                        Impact Lever: {dscrRecoveryStrategy.leverName}
                                      </span>
                                      <p className="text-xs text-stone-850 leading-relaxed font-sans pt-0.5">
                                        {dscrRecoveryStrategy.fullNarrative}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={dscrRecoveryStrategy.action}
                                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] uppercase font-black tracking-widest rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow"
                                    >
                                      <span>⚡ APPLY PIVOT: {dscrRecoveryStrategy.leverName}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>

                          {/* INVESTMENT COMMITTEE GUIDELINE */}
                          <div className={`p-5 rounded-xl border ${ratingStyling.bg} ${ratingStyling.border} ${ratingStyling.text} text-xs space-y-2`}>
                            <div className="flex items-center gap-2 font-mono font-bold">
                              <Info className="w-4 h-4" />
                              <span>CONCLUSION</span>
                            </div>
                            <p className="font-serif leading-relaxed italic">
                              {data.isDebtFree 
                                ? "Unlevered acquisitions require zero mortgage amortizations but limit equity yield magnification."
                                : data.dscr >= 1.25 
                                  ? "Conclusion: This deal comfortably generates enough income to cover its debt obligations securely."
                                  : data.dscr >= 1.0 
                                    ? "Stressed coverage ratio. Lenders typically order dynamic pricing offsets or mandate funded debt service reservations blockades."
                                    : "Severe coverage shortage. Operating revenues fail to fulfill loan amortization schedules, risking immediate default covenants action."}
                            </p>
                          </div>

                          {/* RECALCULATED DEBT YIELD COMPONENT */}
                          {debtYieldCalc.success && debtYieldCalc.data !== undefined && (
                            <div className="bg-stone-950 border border-stone-850 p-5 rounded-xl space-y-3">
                              <div className="flex justify-between items-center text-xs font-semibold tracking-wider font-mono font-bold text-stone-400">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span>CALCULATED DEBT YIELD</span>
                                  {debtYieldCalc.data >= 10.0 && (
                                    <span id="debt-yield-guard-badge" className="text-xs font-serif italic text-emerald-400 font-light ml-2">
                                      ✓ Institutional Grade
                                    </span>
                                  )}
                                </div>
                                <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded tracking-wider uppercase">LENDER INDICATOR</span>
                              </div>
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-mono text-amber-400 font-extrabold">{debtYieldCalc.data.toFixed(2)}%</span>
                                <span className="text-xs font-semibold tracking-wider font-mono text-stone-500 mr-2">NOI / Loan Amount</span>
                                <span className="text-xs font-semibold font-mono tracking-wider text-stone-500 font-normal ml-auto select-none">(Standard benchmark is 10.0% or higher)</span>
                              </div>
                              <p className="text-xs text-stone-400 font-serif italic">
                                {debtYieldCalc.data >= 10.0 
                                  ? "This meets standard banking expectations, meaning there is a safe cushion on your total loan amount."
                                  : "Suboptimal debt yield indicator (< 10.0%). Credit committees typically mandate immediate equity infusions to support high-leverage risk."}
                              </p>

                              {/* PERSISTENT HELPER EXPLANATION */}
                              <div className="border-t border-stone-900 pt-2.5">
                                <p className="text-xs font-semibold text-stone-400 font-serif italic leading-relaxed">
                                  *"Shows the lender's immediate cash return if they had to foreclose and take over the property today."*
                                </p>
                              </div>
                            </div>
                          )}

                          {/* CASH ON CASH YIELD COMPONENT */}
                          {dscrCashOnCashCalc.success && dscrCashOnCashCalc.data !== undefined && (
                            <div className="bg-stone-950 border border-stone-850 p-5 rounded-xl space-y-3">
                              <div className="flex justify-between items-center text-xs font-semibold tracking-wider font-mono font-bold text-stone-400">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span>CASH-ON-CASH (CoC) RETURN</span>
                                  {dscrCashOnCashCalc.data >= 8.0 && (
                                    <span id="coc-guard-badge" className="text-xs font-serif italic text-emerald-400 font-light ml-2">
                                      ✓ High-Performing
                                    </span>
                                  )}
                                </div>
                                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded tracking-wider uppercase font-bold text-[9px]">EQUITY PERFORMANCE</span>
                              </div>
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-3xl font-mono text-emerald-400 font-extrabold">{dscrCashOnCashCalc.data.toFixed(2)}%</span>
                                <span className="text-xs font-semibold tracking-wider font-mono text-stone-500 mr-2">(NOI - Debt Service) / Cash Equity</span>
                                <span className="text-xs font-semibold font-mono tracking-wider text-stone-500 font-normal ml-auto select-none">(Target market expectation is 8.0% or higher)</span>
                              </div>
                              <p className="text-xs text-stone-400 font-serif italic">
                                {dscrCashOnCashCalc.data >= 8.0 
                                  ? "This is a strong return on your cash, outperforming baseline market expectations."
                                  : "Modest equity yield return (< 8.0%). Underwriters suggest improving operations or interest rates to boost yield spreads."}
                              </p>

                              {/* PERSISTENT HELPER EXPLANATION */}
                              <div className="border-t border-stone-900 pt-2.5">
                                <p className="text-xs font-semibold text-stone-400 font-serif italic leading-relaxed">
                                  *"Your actual annualized cash return relative to the down payment equity you physically invest out-of-pocket."*
                                </p>
                              </div>
                            </div>
                          )}

                          {/* SENSITIVITY STRESS TEST TRIGGER & CONTAINER */}
                          <div className="space-y-4">
                            <button
                              id="dscr-stress-toggle-btn"
                              onClick={() => setStressTestingActive(!stressTestingActive)}
                              className={`w-full py-3.5 px-6 font-mono text-xs font-semibold tracking-wider uppercase tracking-[0.2em] rounded-xl transition-all duration-300 flex items-center justify-between cursor-pointer focus:outline-none select-none ${
                                stressTestingActive
                                  ? 'bg-[#F9F6F0] text-[#121212]'
                                  : 'bg-[#131313]/35 text-stone-400 hover:bg-[#161616]/45 hover:text-[#F9F6F0]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span className="font-bold">
                                  {stressTestingActive ? 'Hide downturn scenarios' : 'Test market downturn scenarios'}
                                </span>
                              </div>
                              <span className="text-xs font-mono opacity-70">
                                {stressTestingActive ? '↑' : '↓'}
                              </span>
                            </button>

                            <motion.div
                              initial={false}
                              animate={stressTestingActive ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              {dscrStressCalc.success && dscrStressCalc.data && (
                                <div className="p-6 bg-[#131313]/15 rounded-xl space-y-6">
                                  
                                  {/* VACANCY SHOCK SIMULATION PARAMETERS */}
                                  <div className="bg-[#101010]/40 rounded-xl p-5 space-y-3 font-mono text-xs text-stone-300">
                                    <div className="flex justify-between items-center pb-2 border-b border-stone-800/40">
                                      <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest font-bold">VACANCY SHOCK ENVIRONMENT</span>
                                      <span className="text-[9px] text-rose-455 uppercase font-bold tracking-widest">[ ACTIVE HEADWIND ]</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <div className="text-stone-500 text-xs font-semibold tracking-wider">MACRO SHOCK PENALTY</div>
                                        <div className="text-[#F9F6F0] font-bold text-sm">+7.5% EGI Direct Slasher</div>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="text-stone-500 text-xs font-semibold tracking-wider">STRESSED VACANCY TARGET</div>
                                        <div className="text-[#F9F6F0] font-bold text-sm">{(dscrVacancyRate + 7.5).toFixed(1)}% Stressed rate</div>
                                      </div>
                                    </div>
                                    <p className="text-xs font-semibold tracking-wider text-stone-500 font-sans leading-relaxed">
                                      This dynamic simulation injects a 7.50% revenue impairment block directly over gross operations. This simulates severe vacancy spikes or tenant defaults within the {activeHub.cityName} hub.
                                    </p>
                                  </div>

                                  <div className="flex justify-between items-center pb-1.5 border-b border-stone-800/40">
                                    <span className="text-[9px] font-mono text-stone-500 tracking-widest uppercase font-bold">SENSITIVITY SPLIT REPORT</span>
                                    <span className="text-[9px] font-mono text-rose-455 uppercase font-semibold">Under Stress</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                                    {/* BASELINE SPLIT CARD */}
                                    <div className="bg-[#101010]/30 p-5 rounded-xl space-y-3">
                                      <div className="flex justify-between items-center text-[9px] text-stone-500 font-bold">
                                        <span>BASELINE STATUS</span>
                                        <span className="text-stone-500 font-normal uppercase font-bold">NORMAL OPS</span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-stone-550">Effective GRI:</span>
                                          <span className="text-[#F9F6F0] font-medium">{formatCur(data.effectiveGrossIncome)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-stone-550">Net Op Income:</span>
                                          <span className="text-emerald-400 font-medium">{formatCur(data.netOperatingIncome)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-stone-900 pt-1.5 font-bold">
                                          <span className="text-stone-400">DSCR Multiple:</span>
                                          <span className="text-[#F9F6F0]">{data.isDebtFree ? "DEBT FREE" : `${data.dscr.toFixed(2)}x`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-stone-550">Credit Rating:</span>
                                          <span className="text-emerald-500 uppercase">{data.dscrRating}</span>
                                        </div>
                                      </div>
                                                             {/* STRESSED SPLIT CARD */}
                                    <div className="bg-rose-950/5 p-5 rounded-xl space-y-3">
                                      <div className="flex justify-between items-center text-[9px] text-rose-455/80 font-bold">
                                        <span>VACANCY SHOCK (+7.5%)</span>
                                        <span className="text-rose-400 uppercase font-bold text-[8px]">Stressed</span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-stone-500 font-semibold">Effective GRI:</span>
                                          <span className="text-rose-300 font-medium">{formatCur(dscrStressCalc.data.effectiveGrossIncome)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-stone-500 font-semibold">Net Op Income:</span>
                                          <span className="text-rose-400 font-medium">{formatCur(dscrStressCalc.data.netOperatingIncome)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-stone-800/40 pt-1.5 font-bold">
                                          <span className="text-rose-400 font-bold">Stressed DSCR:</span>
                                          <span className="text-rose-300">{dscrStressCalc.data.isDebtFree ? "DEBT FREE" : `${dscrStressCalc.data.dscr.toFixed(2)}x`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-stone-500 font-semibold">Stressed Rating:</span>
                                          <span className="text-rose-400 uppercase">{dscrStressCalc.data.dscrRating}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <p className="text-xs font-semibold text-stone-550 font-serif italic leading-relaxed pt-1.5 border-t border-stone-850/40 font-light">
                                    Under vacancy pressure (adding 7.5% vacancy penalty to operations), the Net Operating Income shifts from {formatCur(data.netOperatingIncome)} to {formatCur(dscrStressCalc.data.netOperatingIncome)}, compressing debt servicing flexibility from {data.isDebtFree ? "N/A" : `${data.dscr.toFixed(2)}x`} to {dscrStressCalc.data.isDebtFree ? "N/A" : `${dscrStressCalc.data.dscr.toFixed(2)}x`}.
                                  </p>
                                </div>             </div>
                              )}
                            </motion.div>
                          </div>

                          {/* SECONDARY COMMANDS PANEL */}
                          <div className="pt-4.5 border-t border-stone-900/40 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold tracking-wider font-mono select-none">
                            <span className="text-stone-500 uppercase tracking-widest font-bold">Actions</span>
                            <div className="flex flex-wrap items-center gap-4">
                              <button
                                onClick={() => handleOpenSaveModal('debt-coverage')}
                                className="text-emerald-400 hover:text-[#F9F6F0] bg-transparent pb-0.5 border-b border-transparent hover:border-emerald-500/40 transition cursor-pointer flex items-center gap-1.5 focus:outline-none font-bold"
                                title="Save current scenario to Library"
                              >
                                Save Scenario
                              </button>
                              <button
                                id="dscr-copy-report-text-btn"
                                onClick={() => handleCopyReport('dscr', { ...data, cashOnCash: dscrCashOnCashCalc.data, cashEquity: dscrInitialCashEquity })}
                                className="text-stone-400 hover:text-[#F9F6F0] bg-transparent pb-0.5 border-b border-transparent hover:border-stone-400 transition cursor-pointer flex items-center gap-1.5 focus:outline-none"
                                title="Copy Deal Summary to Clipboard"
                              >
                                {copiedTab === 'dscr' ? '✓ Copy Complete' : 'Copy Deal Summary'}
                              </button>
                              <button
                                onClick={() => { setProspectusType('debt-coverage'); setProspectusOpen(true); }}
                                className="text-[#A2A2A2] hover:text-amber-400 bg-transparent pb-0.5 border-b border-transparent hover:border-amber-500/40 transition cursor-pointer flex items-center gap-1.5 focus:outline-none font-bold"
                                title="Download Memo"
                              >
                                Download Memo
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-5 bg-red-950/20 border border-red-800/40 rounded-xl text-red-400 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-mono">
                        <ShieldAlert className="w-4 h-4" />
                        <strong>UNDERWRITING ERROR LOGS</strong>
                      </div>
                      <ul className="list-disc pl-5 font-mono space-y-1">
                        {dscrCalc.errors.map((e, idx) => <li key={idx}>{e}</li>)}
                      </ul>
                    </div>
                  )}



                </div>

              </div>
            </motion.div>
          )}

          {/* TAB II: HORIZON HOLD PROJECTOR */}
          {activeTab === 'ten-year-hold' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* HEADER */}
              <div className="pb-8">
                <span className="text-stone-600 font-mono text-[9px] tracking-[0.25em] uppercase font-light select-none">Income Valuations</span>
                <h2 className="text-2xl font-sans font-light text-stone-100 tracking-tight mt-1">
                  10-Year Horizon Rent &amp; Yield Modeler
                </h2>
                <p className="text-xs text-stone-400 font-sans italic mt-1 font-light">
                  Simulate property values as net operating income ascends over time relative to capital market capitalization trends.
                </p>
              </div>

              {/* TWO COLUMN WORKSPACE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                
                {/* Inputs */}
                <div className="bg-white/[0.02] p-8 md:p-12 lg:p-16 rounded-2xl space-y-12 animate-fade-in shadow-2xl">
                  <div className="pb-6 flex justify-between items-center text-xs">
                    <span className="text-[9px] font-sans font-bold text-stone-500 uppercase tracking-widest">Hold Horizon Controls</span>
                    <button
                      id="reset-10year-hold-btn"
                      onClick={handleReset10YearHold}
                      className="group text-[9px] font-sans font-bold tracking-wider text-stone-500 hover:text-amber-400 bg-transparent py-0.5 px-2 border border-stone-900 hover:border-amber-500/20 rounded transition duration-200 cursor-pointer flex items-center gap-1.5 focus:outline-none uppercase"
                    >
                      <RotateCcw className="w-3 h-3 text-stone-500 group-hover:text-amber-400 transition-colors" />
                      Reset to Defaults
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Initial NOI */}
                    <div className="group/field">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Initial NOI</label>
                        <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatCur(capInitialNoi)}</span>
                      </div>
                      <input
                        type="number"
                        id="cap-noi-input"
                        value={capInitialNoi}
                        onChange={(e) => setCapInitialNoi(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                      <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                        <input 
                          type="range"
                          id="cap-noi-slider"
                          min="10000"
                          max="1500000"
                          step="10000"
                          value={capInitialNoi}
                          onChange={(e) => setCapInitialNoi(Number(e.target.value))}
                          className="w-full accent-amber-500/80 cursor-pointer h-5"
                        />
                      </div>
                    </div>

                    {/* Going-in Cap Rate */}
                    <div className="group/field">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Entry Cap Rate</label>
                        <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatPct(capGoingInRate)}</span>
                      </div>
                      <input
                        type="number"
                        id="cap-entry-input"
                        value={capGoingInRate}
                        step="0.05"
                        onChange={(e) => setCapGoingInRate(Math.max(0.001, Number(e.target.value)))}
                        className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                      <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                        <input 
                          type="range"
                          id="cap-entry-slider"
                          min="1.0"
                          max="15.0"
                          step="0.05"
                          value={capGoingInRate}
                          onChange={(e) => setCapGoingInRate(Number(e.target.value))}
                          className="w-full accent-amber-500/80 cursor-pointer h-5"
                        />
                      </div>
                      {(capGoingInRate < 3.0 || capGoingInRate > 12.0) && (
                        <div id="cap-precision-warning" className="mt-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold tracking-wider p-2 rounded-lg font-mono flex items-start gap-1.5 leading-relaxed">
                          <ShieldAlert size={14} className="shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                          <span>
                            <strong>Precision Warning:</strong> Entry cap of {formatPct(capGoingInRate)} is outside typical stabilized institutional bands (3.0% - 12.0%). {capGoingInRate < 3.0 ? "Sub-3% represents premium trophy assets with minimal cash yield." : "Above 12% indicates high risk premium or distressed operations."}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Annual Escalation */}
                    <div className="group/field">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Annual Growth</label>
                        <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatPct(capNoiGrowth)}</span>
                      </div>
                      <input
                        type="number"
                        id="cap-growth-input"
                        value={capNoiGrowth}
                        step="0.1"
                        onChange={(e) => setCapNoiGrowth(Number(e.target.value))}
                        className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                      <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                        <input 
                          type="range"
                          id="cap-growth-slider"
                          min="-5"
                          max="15"
                          step="0.1"
                          value={capNoiGrowth}
                          onChange={(e) => setCapNoiGrowth(Number(e.target.value))}
                          className="w-full accent-amber-500/80 cursor-pointer h-5"
                        />
                      </div>
                    </div>

                    {/* Yield decay expansion */}
                    <div className="group/field">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Annual Shift (Bps)</label>
                        <span className="text-xs font-mono text-amber-500 font-semibold">{capExpansionBps > 0 ? `+${capExpansionBps}` : capExpansionBps} bps</span>
                      </div>
                      <input
                        type="number"
                        id="cap-expansion-input"
                        value={capExpansionBps}
                        onChange={(e) => setCapExpansionBps(Number(e.target.value))}
                        className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                      <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                        <input 
                          type="range"
                          id="cap-expansion-slider"
                          min="-50"
                          max="100"
                          step="1"
                          value={capExpansionBps}
                          onChange={(e) => setCapExpansionBps(Number(e.target.value))}
                          className="w-full accent-amber-500/80 cursor-pointer h-5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Purchase price override */}
                  <div className="pt-4">
                    <label className="text-sm font-semibold font-sans font-light text-stone-400/80 block mb-1">Override Initial Purchase Cost (Optional)</label>
                    <input 
                      type="number"
                      id="cap-purchase-override"
                      placeholder="Implicitly derived if omitted..."
                      value={capPurchasePriceOverride}
                      onChange={(e) => setCapPurchasePriceOverride(e.target.value)}
                      className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 text-stone-100"
                    />
                  </div>

                </div>

                {/* Outputs section */}
                <div className="space-y-6">
                  
                  {capCalc.success && capCalc.data ? (
                    (() => {
                      const ans = capCalc.data;
                      const valueChangePositive = ans.valueChangePercent >= 0;
                      return (
                        <div className="space-[#F9F6F0] space-y-6">
                          
                          {/* DYNAMIC SVG CHART COMPONENT */}
                          {renderHoldChart()}

                          {/* CORE COMPACT METRICS TABLE */}
                          <div className={`bg-[#F9F6F0] text-[#121212] p-8 md:p-12 lg:p-16 rounded-3xl shadow-2xl transition-all duration-300 space-y-8 md:space-y-12 ${challengeActive && activeTab === 'ten-year-hold' && !challengeSuccess ? 'border border-rose-450 ring-2 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-none'}`}>
                            <div className="flex justify-between items-start select-none">
                              <span className="text-[9px] font-mono font-bold tracking-widest text-stone-500">10-YEAR HOLD SUMMARY</span>
                              {challengeActive && activeTab === 'ten-year-hold' && !challengeSuccess && (
                                <span className="text-[8px] font-mono tracking-wider text-rose-600 bg-rose-100/60 px-2 py-0.5 rounded border border-rose-200 font-bold uppercase animate-pulse">
                                  ⚠️ COVENANT FAILING
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-[#F9F6F0] grid-cols-2 gap-4">
                              <div className="border-r border-stone-200/60 pr-2">
                                <span className="text-xs font-semibold tracking-wider font-mono text-[#555555]">INITIAL VALUE</span>
                                <h4 className="text-lg font-mono font-bold text-stone-900">{formatCur(ans.purchasePrice)}</h4>
                              </div>
                              <div>
                                <span className="text-xs font-semibold tracking-wider font-mono text-[#555555]">PROYECTED TERMINAL VALUE</span>
                                <h4 className="text-lg font-mono font-bold text-stone-900">{formatCur(ans.terminalValuation)}</h4>
                              </div>
                            </div>

                            <hr className="border-stone-200" />

                            <div className="flex justify-between items-center">
                              <span className="text-xs font-serif text-[#333]">Net Hold Capital Change</span>
                              <span className={`text-sm font-mono font-bold transition duration-300 text-right ${challengeActive && activeTab === 'ten-year-hold' && !challengeSuccess ? 'text-rose-600 bg-rose-50 px-2.5 py-1 rounded border border-rose-100' : valueChangePositive ? 'text-emerald-700' : 'text-red-700'}`}>
                                {valueChangePositive ? `+${ans.valueChangePercent.toFixed(2)}%` : `${ans.valueChangePercent.toFixed(2)}%`}
                                {challengeActive && activeTab === 'ten-year-hold' && !challengeSuccess && (
                                  <span className="text-[8px] block font-mono font-bold mt-0.5 text-rose-500 uppercase tracking-tight">(GOAL: ≥ +15.0%)</span>
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-xs font-serif text-[#333]">Exit Yield Percent</span>
                              <span className="text-xs font-mono font-bold text-stone-900">{formatPct(ans.exitYieldTenYearPercent)}</span>
                            </div>

                            {/* RECOVERY STRATEGY PANEL */}
                            {challengeActive && !challengeSuccess && capRecoveryStrategy && (
                              <div className="mt-4 pt-4 border-t border-rose-300/40 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold tracking-wider font-mono font-bold tracking-wider text-rose-800 uppercase flex items-center gap-1.5 select-none font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    Tactical Recovery Option
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowRecoveryCap(!showRecoveryCap)}
                                    className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] uppercase font-bold tracking-wider rounded transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow"
                                  >
                                    {showRecoveryCap ? "✕ Clear Blueprint" : "⚡ View Recovery Strategy"}
                                  </button>
                                </div>

                                {showRecoveryCap && (
                                  <div className="bg-rose-50 border border-rose-250 p-4 rounded-xl text-stone-950 animate-fade-in space-y-3">
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono font-black text-rose-800 uppercase tracking-widest block">
                                        Impact Lever: {capRecoveryStrategy.leverName}
                                      </span>
                                      <p className="text-xs text-stone-850 leading-relaxed font-sans pt-0.5">
                                        {capRecoveryStrategy.fullNarrative}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={capRecoveryStrategy.action}
                                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] uppercase font-black tracking-widest rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow"
                                    >
                                      <span>⚡ APPLY PIVOT: {capRecoveryStrategy.leverName}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>

                          {/* Year 10 detailed summary log */}
                          <div className="bg-stone-950 border border-stone-850 rounded-xl p-4 space-y-3 font-mono text-xs font-semibold overflow-x-auto text-stone-400">
                            <span className="text-xs font-semibold tracking-wider text-stone-500 uppercase tracking-widest">ANNUALIZED TRENDING SCHEDULE</span>
                            
                            <table className="w-full text-left font-mono">
                              <thead>
                                <tr className="border-b border-stone-850 text-stone-500 text-xs font-semibold tracking-wider">
                                  <th className="pb-1.5">YEAR</th>
                                  <th className="pb-1.5 text-right">NOI</th>
                                  <th className="pb-1.5 text-right">CAP RATE</th>
                                  <th className="pb-1.5 text-right">VALUATION</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[0, 1, 3, 5, 8, 10].map((yr) => {
                                  const row = ans.projections[yr];
                                  if (!row) return null;
                                  return (
                                    <tr key={yr} className="border-b border-stone-900/40 text-stone-300">
                                      <td className="py-2">Year {yr === 0 ? "0 (Buy)" : yr}</td>
                                      <td className="py-2 text-right text-emerald-400">{formatCur(row.netOperatingIncome)}</td>
                                      <td className="py-2 text-right">{row.capRatePercent.toFixed(2)}%</td>
                                      <td className="py-2 text-right font-bold text-[#F9F6F0]">{formatCur(row.valuation)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* SECONDARY COMMANDS PANEL */}
                          <div className="pt-4.5 border-t border-stone-900/40 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold tracking-wider font-mono select-none">
                            <span className="text-stone-500 uppercase tracking-widest font-bold">Actions</span>
                            <div className="flex flex-wrap items-center gap-4">
                              <button
                                onClick={() => handleOpenSaveModal('ten-year-hold')}
                                className="text-emerald-400 hover:text-[#F9F6F0] bg-transparent pb-0.5 border-b border-transparent hover:border-emerald-500/40 transition cursor-pointer flex items-center gap-1.5 focus:outline-none font-bold"
                                title="Save current scenario to Library"
                              >
                                Save Scenario
                              </button>
                              <button
                                id="caprate-copy-report-text-btn"
                                onClick={() => handleCopyReport('caprate', ans)}
                                className="text-stone-400 hover:text-[#F9F6F0] bg-transparent pb-0.5 border-b border-transparent hover:border-stone-400 transition cursor-pointer flex items-center gap-1.5 focus:outline-none"
                                title="Copy Deal Summary to Clipboard"
                              >
                                {copiedTab === 'caprate' ? '✓ Copy Complete' : 'Copy Deal Summary'}
                              </button>
                              <button
                                onClick={() => { setProspectusType('ten-year-hold'); setProspectusOpen(true); }}
                                className="text-[#A2A2A2] hover:text-amber-400 bg-transparent pb-0.5 border-b border-transparent hover:border-amber-500/40 transition cursor-pointer flex items-center gap-1.5 focus:outline-none font-bold"
                                title="Download Memo"
                              >
                                Download Memo
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-5 bg-red-950/20 border border-red-800/40 rounded-xl text-red-500 font-mono text-xs">
                      {capCalc.errors.map((e, idx) => <p key={idx}>{e}</p>)}
                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB III: SAAS CLIENT METRIC ENGINE */}
          {activeTab === 'saas-metrics' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              <div className="pb-8">
                <span className="text-stone-600 font-mono text-[9px] tracking-[0.25em] uppercase font-light select-none">Client Economics</span>
                <h2 className="text-2xl font-sans font-light text-stone-100 tracking-tight mt-1 animate-fade-in">
                  SaaS Metrics &amp; Churn Matrix
                </h2>
                <p className="text-xs text-stone-400 font-sans italic mt-1">
                  Validate lifetime subscriber viability using actual contract values and gross margin factors.
                </p>
              </div>

              {/* TWO COLUMN GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                
                {/* Inputs block */}
                <div className="bg-white/[0.02] p-8 md:p-12 lg:p-16 rounded-2xl space-y-12 animate-fade-in shadow-2xl">
                  <div className="pb-6">
                    <span className="text-[9px] font-sans font-bold text-stone-500 uppercase tracking-widest">Economic Parameters</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Monthly Contract Value (MRR) */}
                    <div className="group/field">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Monthly Contract Value (MRR)</label>
                        <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatCur(saasMrr)} /mo</span>
                      </div>
                      <input
                        type="number"
                        id="saas-mrr-input"
                        value={saasMrr}
                        onChange={(e) => setSaasMrr(Math.max(0, Number(e.target.value)))}
                        className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                      <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                        <input 
                          type="range"
                          id="saas-mrr-slider"
                          min="10"
                          max="3000"
                          step="10"
                          value={saasMrr}
                          onChange={(e) => setSaasMrr(Number(e.target.value))}
                          className="w-full accent-amber-500/80 cursor-pointer h-5"
                        />
                      </div>
                    </div>

                    {/* Gross Margin */}
                    <div className="group/field">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Service Gross Margin (%)</label>
                        <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{saasMargin}%</span>
                      </div>
                      <input
                        type="number"
                        id="saas-margin-input"
                        value={saasMargin}
                        onChange={(e) => setSaasMargin(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                      <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                        <input 
                          type="range"
                          id="saas-margin-slider"
                          min="10"
                          max="100"
                          step="1"
                          value={saasMargin}
                          onChange={(e) => setSaasMargin(Number(e.target.value))}
                          className="w-full accent-amber-500/80 cursor-pointer h-5"
                        />
                      </div>
                    </div>

                    {/* Monthly Churn Rate */}
                    <div className="group/field">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Monthly Customer Churn (%)</label>
                        <span className="text-xs font-mono text-amber-500 font-semibold">{saasChurn}%</span>
                      </div>
                      <input
                        type="number"
                        id="saas-churn-input"
                        step="0.05"
                        value={saasChurn}
                        onChange={(e) => setSaasChurn(Math.max(0.005, Number(e.target.value)))}
                        className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                      <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                        <input 
                          type="range"
                          id="saas-churn-slider"
                          min="0.1"
                          max="25.0"
                          step="0.05"
                          value={saasChurn}
                          onChange={(e) => setSaasChurn(Math.max(0.01, Number(e.target.value)))}
                          className="w-full accent-amber-500/80 cursor-pointer h-5"
                        />
                      </div>
                      {saasChurn > 10.0 && (
                        <div id="saas-churn-precision-warning" className="mt-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold tracking-wider p-2 rounded-lg font-mono flex items-start gap-1.5 leading-relaxed">
                          <ShieldAlert size={14} className="shrink-0 mt-0.5 text-amber-500 animate-pulse" />
                          <span>
                            <strong>Precision Warning:</strong> Monthly churn above 10% (equivalent to ~70% annual customer loss), severely threatens typical SaaS business model sustainability.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Customer Acquisition cost */}
                    <div className="group/field">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold font-sans font-light text-stone-400/80 tracking-wide">Customer Acquisition Cost (CAC)</label>
                        <span className="text-xs font-mono text-[#F9F6F0] font-semibold">{formatCur(saasCac)}</span>
                      </div>
                      <input
                        type="number"
                        id="saas-cac-input"
                        value={saasCac}
                        onChange={(e) => setSaasCac(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-transparent border-b border-stone-800 text-stone-100 text-xs font-mono py-1 focus:outline-none focus:border-stone-500 transition-colors"
                      />
                      <div className="max-h-0 opacity-0 pointer-events-none group-hover/field:max-h-8 group-hover/field:opacity-100 group-hover/field:pointer-events-auto group-focus-within/field:max-h-8 group-focus-within/field:opacity-100 group-focus-within/field:pointer-events-auto transition-all duration-300 ease-in-out overflow-hidden mt-1.5">
                        <input 
                          type="range"
                          id="saas-cac-slider"
                          min="50"
                          max="10000"
                          step="50"
                          value={saasCac}
                          onChange={(e) => setSaasCac(Number(e.target.value))}
                          className="w-full accent-amber-500/80 cursor-pointer h-5"
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Outputs Panel */}
                <div className="space-y-6">
                  
                  {saasCalc.success && saasCalc.data ? (
                    (() => {
                      const res = saasCalc.data;
                      
                      const systemHealthColor = {
                        "Excellent (LTV:CAC >= 4x)": "bg-emerald-50 text-emerald-800 border-emerald-300",
                        "Healthy (3x - 4x)": "bg-teal-50 text-teal-800 border-teal-300",
                        "Cautionary (1x - 3x)": "bg-amber-50 text-amber-800 border-amber-300",
                        "Danger (< 1x)": "bg-rose-50 text-rose-850 border-rose-300"
                      }[res.unitEconomicsHealth];

                      // Simple representation of client tenure curves
                      const height = 80;
                      const width = 300;
                      const points = [];
                      for(let m = 0; m <= 24; m += 2) {
                        const activePct = Math.pow(1 - (saasChurn / 100), m);
                        const x = (m / 24) * width;
                        const y = height - (activePct * height);
                        points.push(`${x},${y}`);
                      }

                      return (
                        <div className="space-y-6">
                          
                          {/* HIGHLIGHT IVORY BOX */}
                          <div className={`bg-[#F9F6F0] text-[#121212] p-8 md:p-12 lg:p-16 rounded-3xl shadow-2xl transition-all duration-300 space-y-8 md:space-y-12 ${challengeActive && activeTab === 'saas-metrics' && !challengeSuccess ? 'border border-rose-450 ring-2 ring-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-none'}`}>
                            
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 select-none">
                                  <span className="text-xs font-semibold tracking-wider font-mono tracking-widest text-[#555] uppercase">LTV TO CAC RATIO</span>
                                  {challengeActive && activeTab === 'saas-metrics' && !challengeSuccess && (
                                    <span className="text-[8px] font-mono tracking-wider text-rose-600 bg-rose-100/60 px-2.5 py-0.5 rounded border border-rose-200 font-bold uppercase animate-pulse">
                                      ⚠️ COVENANT FAILING
                                    </span>
                                  )}
                                </div>
                                <h3 className={`text-5xl font-serif mt-2 tracking-tight font-extrabold font-mono flex items-baseline gap-3 transition duration-300 ${challengeActive && activeTab === 'saas-metrics' && !challengeSuccess ? 'text-rose-600' : 'text-[#1C1C1C]'}`}>
                                  <span>{formatNum(res.ltvToCacRatio, 2)}x</span>
                                  {challengeActive && activeTab === 'saas-metrics' && !challengeSuccess && (
                                    <span className="text-xs font-mono tracking-wider text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100 select-none uppercase">
                                      (GOAL: ≥ 3.0x)
                                    </span>
                                  )}
                                </h3>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 text-right select-none">
                                <span className="text-xs font-semibold tracking-wider font-mono tracking-widest bg-stone-900 text-[#F9F6F0] font-bold px-3 py-1.5 rounded-full">
                                  RATIO MATRIX
                                </span>
                              </div>
                            </div>

                            <div className="border-t border-[#1C1C1C]/15 pt-4 space-y-3 font-mono text-xs text-stone-700">
                              <div className="flex justify-between">
                                <span className="text-stone-500">Gross Margin Customer Lifetime Value (LTV)</span>
                                <span className="text-stone-900 font-bold">{formatCur(res.ltv)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500">Average Customer Lifetime</span>
                                <span className="text-stone-900">{formatNum(res.customerLifetimeMonths, 1)} months</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500">Annualized Revenue per Account</span>
                                <span className="text-stone-900">{formatCur(res.arpuAnnual)}</span>
                              </div>
                            </div>

                            {/* RECOVERY STRATEGY PANEL */}
                            {challengeActive && !challengeSuccess && saasRecoveryStrategy && (
                              <div className="mt-4 pt-4 border-t border-rose-300/40 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold tracking-wider font-mono font-bold tracking-wider text-rose-800 uppercase flex items-center gap-1.5 select-none font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    Tactical Recovery Option
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowRecoverySaas(!showRecoverySaas)}
                                    className="py-1 px-3 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] uppercase font-bold tracking-wider rounded transition-all active:scale-95 cursor-pointer shadow-sm hover:shadow"
                                  >
                                    {showRecoverySaas ? "✕ Clear Blueprint" : "⚡ View Recovery Strategy"}
                                  </button>
                                </div>

                                {showRecoverySaas && (
                                  <div className="bg-rose-50 border border-rose-250 p-4 rounded-xl text-stone-950 animate-fade-in space-y-3">
                                    <div className="space-y-1">
                                      <span className="text-[9px] font-mono font-black text-rose-800 uppercase tracking-widest block">
                                        Impact Lever: {saasRecoveryStrategy.leverName}
                                      </span>
                                      <p className="text-xs text-stone-850 leading-relaxed font-sans pt-0.5">
                                        {saasRecoveryStrategy.fullNarrative}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={saasRecoveryStrategy.action}
                                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] uppercase font-black tracking-widest rounded-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow"
                                    >
                                      <span>⚡ APPLY PIVOT: {saasRecoveryStrategy.leverName}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>

                          {/* SYSTEM HEALTH BLOCK */}
                          <div className={`p-5 rounded-xl border ${systemHealthColor} text-xs space-y-2`}>
                            <div className="flex items-center gap-2 font-mono font-bold uppercase">
                              <Info className="w-4 h-4" />
                              <span>SUBSCRIBER PORTFOLIO STATUS</span>
                            </div>
                            <p className="font-serif leading-relaxed italic">
                              {res.ltvToCacRatio >= 4 
                                ? "Outstanding unit economics. Marketing investment CAC is recovered multiple times within the customer tenure cycle, indicating a capital-efficient vehicle."
                                : res.ltvToCacRatio >= 3
                                  ? "Fulfills classic venture capital baseline constraints (LTV:CAC >= 3.0x). Balanced client retention metrics with appropriate acquisition velocity."
                                  : res.ltvToCacRatio >= 1
                                    ? "Suboptimal. Churn rate or low margin eats into lifetime contribution value. Consider increasing transaction rates or applying organic preservation strategies."
                                    : "Destructive capital allocation. Acquisition costs completely exceed estimated lifetime margin. The system consumes more funding than it replaces."}
                            </p>
                          </div>

                          {/* RETENTION DECAY VISUAL TICKET */}
                          <div className="p-4 bg-stone-950 rounded-xl border border-stone-850 space-y-4">
                            <span className="text-xs font-semibold tracking-wider font-mono tracking-wider text-stone-500 uppercase block">RETENTION CURVE OVER 24 MONTHS</span>
                            
                            <div className="h-10 bg-stone-900 rounded relative overflow-hidden flex items-end">
                              <svg className="w-full h-full absolute top-0 left-0" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                                <polyline fill="none" stroke="#F9F6F0" strokeWidth="2.5" points={points.join(' ')} />
                              </svg>
                            </div>

                            <div className="flex justify-between text-xs font-semibold tracking-wider font-mono text-stone-500">
                              <span>Month 1 (100%)</span>
                              <span>Month 12 ({formatPct(Math.pow(1 - (saasChurn / 100), 12) * 100)})</span>
                              <span>Month 24 ({formatPct(Math.pow(1 - (saasChurn / 100), 24) * 100)})</span>
                            </div>
                          </div>

                          {/* SENSITIVITY STRESS TEST TRIGGER & CONTAINER */}
                          <div className="space-y-4">
                            <button
                              id="saas-stress-toggle-btn"
                              onClick={() => setStressTestingActive(!stressTestingActive)}
                              className={`w-full py-3 px-5 font-mono text-xs font-semibold uppercase tracking-widest rounded-xl transition-all duration-300 border flex items-center justify-between cursor-pointer focus:outline-none select-none ${
                                stressTestingActive
                                  ? 'bg-[#1C1C1C] text-rose-450 border-rose-500/30'
                                  : 'bg-stone-900/60 text-stone-400 border-stone-850 hover:text-stone-200 hover:border-stone-750'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                                <span className="font-bold">
                                  {stressTestingActive ? 'Hide downturn scenarios' : 'Test market downturn scenarios'}
                                </span>
                              </div>
                              <span className="text-xs font-mono opacity-70">
                                {stressTestingActive ? '↑' : '↓'}
                              </span>
                            </button>

                            <motion.div
                              initial={false}
                              animate={stressTestingActive ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              {saasStressCalc.success && saasStressCalc.data && (
                                <div className="p-5 bg-stone-950 rounded-xl border border-stone-850 space-y-5">
                                  
                                  {/* VOLATILITY CHURN SHOCK PARAMETERS */}
                                  <div className="bg-[#090909] border border-stone-855 rounded-xl p-4.5 space-y-3 font-mono text-xs text-[#EAEAEA]">
                                    <div className="flex justify-between items-center pb-2 border-b border-stone-900">
                                      <span className="text-xs font-semibold tracking-wider font-mono text-stone-500 uppercase tracking-widest font-bold">CHURN VOLATILITY SIMULATION ENVIRONMENT</span>
                                      <span className="text-[9px] text-rose-400 bg-rose-950/40 border border-rose-500/25 px-2 py-0.5 rounded uppercase font-bold">[ ACTIVE HEADWIND ]</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <div className="text-stone-500 text-xs font-semibold tracking-wider">CHURN MULTIPLIER SCALING</div>
                                        <div className="text-[#F9F6F0] font-bold text-sm">1.5x Leverage Shock Factor</div>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="text-stone-500 text-xs font-semibold tracking-wider">STRESSED ATTRIBUTION RATE</div>
                                        <div className="text-[#F9F6F0] font-bold text-sm">{(saasChurn * 1.5).toFixed(1)}% Stressed monthly rate</div>
                                      </div>
                                    </div>
                                    <p className="text-xs font-semibold tracking-wider text-stone-500 font-sans leading-relaxed">
                                      In response to sudden competitive market entrants or macro cycles, this stress test scales standard monthly subscriber attrition by a severe 1.50x factor.
                                    </p>
                                  </div>

                                  <div className="flex justify-between items-center pb-1.5 border-b border-stone-900">
                                    <span className="text-xs font-semibold tracking-wider font-mono text-stone-400 tracking-wider">COMPREHENSIVE SENSITIVITY SPLIT</span>
                                    <span className="text-[9px] font-mono text-rose-450 bg-rose-500/10 px-2 py-0.5 rounded font-semibold uppercase">Under Stress</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                                    {/* BASELINE SPLIT CARD */}
                                    <div className="bg-[#090909] p-4 rounded-xl border border-stone-900 space-y-3">
                                      <div className="flex justify-between items-center text-[9px] text-stone-500 font-bold">
                                        <span>BASELINE ECONOMIC STATE</span>
                                        <span className="text-stone-400 font-normal">NORMAL OPS</span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-stone-550">Monthly Churn:</span>
                                          <span className="text-[#F9F6F0] font-medium">{saasChurn.toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-stone-550">LTV Margin:</span>
                                          <span className="text-emerald-400 font-medium">{formatCur(res.ltv)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-stone-900 pt-1.5 font-bold">
                                          <span className="text-stone-400">LTV:CAC Ratio:</span>
                                          <span className="text-[#F9F6F0]">{res.ltvToCacRatio.toFixed(2)}x</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-stone-555">Client Tenure:</span>
                                          <span className="text-stone-300">{res.customerLifetimeMonths.toFixed(1)} mo</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* STRESSED SPLIT CARD */}
                                    <div className="bg-rose-955/10 p-4 rounded-xl border border-rose-900/30 space-y-3">
                                      <div className="flex justify-between items-center text-[9px] text-rose-400/80 font-bold">
                                        <span>CHURN SHOCK (1.5x)</span>
                                        <span className="bg-rose-900/30 text-rose-400 px-1.5 py-0.5 rounded uppercase font-bold text-[8px]">Stressed</span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="flex justify-between">
                                          <span className="text-stone-550">Monthly Churn:</span>
                                          <span className="text-rose-300 font-medium">{(saasChurn * 1.5).toFixed(1)}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-stone-550">LTV Margin:</span>
                                          <span className="text-rose-400 font-medium">{formatCur(saasStressCalc.data.ltv)}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-rose-950/40 pt-1.5 font-bold">
                                          <span className="text-rose-450 font-semibold">Stressed LTV:CAC:</span>
                                          <span className="text-rose-350">{saasStressCalc.data.ltvToCacRatio.toFixed(2)}x</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-stone-555">Client Tenure:</span>
                                          <span className="text-rose-400">{saasStressCalc.data.customerLifetimeMonths.toFixed(1)} mo</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <p className="text-xs font-semibold text-stone-400 font-serif italic leading-relaxed pt-1.5 border-t border-stone-900">
                                    Multiplying subscriber churn by 1.5x (from {saasChurn}% to {(saasChurn * 1.5).toFixed(1)}%) compresses contract lifetime from {res.customerLifetimeMonths.toFixed(1)} months to {saasStressCalc.data.customerLifetimeMonths.toFixed(1)} months, degrading capital-recovery speeds.
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          </div>

                          {/* SECONDARY COMMANDS PANEL */}
                          <div className="pt-4.5 border-t border-stone-900/40 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold tracking-wider font-mono select-none">
                            <span className="text-stone-500 uppercase tracking-widest font-bold">Actions</span>
                            <div className="flex flex-wrap items-center gap-4">
                              <button
                                onClick={() => handleOpenSaveModal('saas-metrics')}
                                className="text-emerald-400 hover:text-[#F9F6F0] bg-transparent pb-0.5 border-b border-transparent hover:border-emerald-500/40 transition cursor-pointer flex items-center gap-1.5 focus:outline-none font-bold"
                                title="Save current scenario to Library"
                              >
                                Save Scenario
                              </button>
                              <button
                                id="saas-copy-report-text-btn"
                                onClick={() => handleCopyReport('saas', res)}
                                className="text-stone-400 hover:text-[#F9F6F0] bg-transparent pb-0.5 border-b border-transparent hover:border-stone-400 transition cursor-pointer flex items-center gap-1.5 focus:outline-none"
                                title="Copy Subscriber Economic Summary to Clipboard"
                              >
                                {copiedTab === 'saas' ? '✓ Copy Complete' : 'Copy Deal Summary'}
                              </button>
                              <button
                                onClick={() => { setProspectusType('saas-metrics'); setProspectusOpen(true); }}
                                className="text-[#A2A2A2] hover:text-amber-400 bg-transparent pb-0.5 border-b border-transparent hover:border-amber-500/40 transition cursor-pointer flex items-center gap-1.5 focus:outline-none font-bold"
                                title="Download Memo"
                              >
                                Download Memo
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-5 bg-stone-900 border border-amber-900/60 rounded-xl text-amber-500 text-xs font-mono space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                        <strong>CHURN HORIZON LIMIT</strong>
                      </div>
                      <p className="font-sans leading-relaxed">
                        {saasCalc.errors[0] || "Validations constraint violation detected."}
                      </p>
                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

          {/* TAB IV: PORTFOLIO LIBRARY DASHBOARD */}
          {activeTab === 'library' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Header block with statistics cards */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-serif text-[#F9F6F0] tracking-tight font-extralight uppercase">
                      PORTFOLIO DASHBOARD
                    </h2>
                    <p className="text-xs text-stone-400 font-mono tracking-widest uppercase mt-1">
                      Snapshot Vault & Scenario Library
                    </p>
                  </div>
                  
                  {/* Clean stats panel */}
                  <div className="flex items-center gap-6 text-xs font-semibold tracking-wider font-mono tracking-wider text-stone-400 uppercase bg-stone-900/35 border border-stone-850 p-4 rounded-xl">
                    <div className="text-center">
                      <div className="text-xl font-bold font-serif text-[#F9F6F0] leading-none mb-1">
                        {savedDeals.length}
                      </div>
                      <span>SNAPSHOTS</span>
                    </div>
                    <div className="h-6 w-px bg-stone-850" />
                    <div className="text-center">
                      <div className="text-xl font-bold font-serif text-emerald-450 leading-none mb-1">
                        {savedDeals.filter(d => d.dealHealth === 'Prime' || d.dealHealth === 'Strong').length}
                      </div>
                      <span>HEALTHY</span>
                    </div>
                    <div className="h-6 w-px bg-stone-850" />
                    <div className="text-center">
                      <div className="text-xl font-bold font-serif text-amber-500 leading-none mb-1">
                        {savedDeals.filter(d => d.dealHealth === 'Adequate' || d.dealHealth === 'Stressed').length}
                      </div>
                      <span>ALERT / CRITICAL</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action and Query Filters header */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-stone-950 p-4 rounded-xl border border-stone-850 font-mono text-xs">
                
                {/* Search query input */}
                <div className="flex items-center gap-2 relative w-full sm:w-72">
                  <span className="text-stone-500 pl-2">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search snapshots by name..."
                    className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 focus:outline-none rounded px-3 py-1.5 text-xs text-stone-250 font-sans"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 px-1 text-stone-500 hover:text-stone-300"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Subtab filter */}
                <div className="flex gap-2">
                  {(['all', 'debt-coverage', 'ten-year-hold', 'saas-metrics'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setLibraryFilter(filter)}
                      className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase font-bold tracking-wider rounded transition cursor-pointer select-none ${
                        libraryFilter === filter
                          ? 'bg-[#F9F6F0] text-stone-950 font-black'
                          : 'bg-transparent text-stone-400 hover:text-stone-200 border border-stone-850'
                      }`}
                    >
                      {filter === 'all' 
                        ? 'All Scenarios' 
                        : filter === 'debt-coverage'
                          ? 'Real Estate DSCR'
                          : filter === 'ten-year-hold'
                            ? '10-Yr Hold Valuation'
                            : 'SaaS Subscriber'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimalist Gallery Grid of Saved Deals */}
              {filteredSavedDeals.length === 0 ? (
                <div className="text-center py-20 bg-stone-950/20 rounded-2xl border border-stone-850/60 p-8 space-y-4">
                  <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center mx-auto border border-stone-800">
                    <FolderHeart className="w-5 h-5 text-stone-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-md font-serif text-[#F9F6F0] font-light">No Active Snapshots Found</h3>
                    <p className="text-xs text-stone-450 font-sans max-w-sm mx-auto leading-relaxed">
                      {searchQuery 
                        ? 'Adjust your query to locate other scenarios.' 
                        : 'Underwrite a scenario, look at the results and choose "Save Scenario" to list snapshot iterations here.'}
                    </p>
                  </div>
                  {!searchQuery && (
                    <button
                      onClick={() => setActiveTab('debt-coverage')}
                      className="px-4 py-2 bg-stone-900 border border-stone-750 text-stone-300 font-mono text-xs font-semibold tracking-wider uppercase font-bold tracking-widest rounded-lg hover:border-stone-600 transition cursor-pointer"
                    >
                      Go to Underwriting Dashboard
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSavedDeals.map((deal) => {
                    let healthColors = 'bg-emerald-950/40 text-emerald-450 border border-emerald-800/40';
                    if (deal.dealHealth === 'Strong') {
                      healthColors = 'bg-teal-950/40 text-teal-300 border border-teal-800/40';
                    } else if (deal.dealHealth === 'Adequate') {
                      healthColors = 'bg-amber-950/40 text-amber-500 border border-amber-900/40';
                    } else if (deal.dealHealth === 'Stressed') {
                      healthColors = 'bg-rose-950/40 text-rose-400 border border-rose-900/40';
                    }

                    return (
                      <motion.div
                        key={deal.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#111111] border border-stone-850 rounded-2xl flex flex-col justify-between hover:border-stone-700 transition duration-200 relative group"
                      >
                        {/* Upper card area */}
                        <div className="p-6 space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#A2A2A2] font-semibold bg-stone-900/50 px-2 py-0.5 rounded border border-stone-800">
                              {deal.dealType === 'debt-coverage' 
                                ? 'cre dscr' 
                                : deal.dealType === 'ten-year-hold' 
                                  ? '10-yr hold' 
                                  : 'saas metrics'}
                            </span>
                            <span className={`text-[9px] font-mono uppercase tracking-[0.1em] font-bold px-2 py-0.5 rounded-full ${healthColors}`}>
                              {deal.dealHealth}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-md font-serif text-[#F9F6F0] tracking-tight group-hover:text-amber-400 transition duration-150 line-clamp-1 font-medium text-left">
                              {deal.projectName}
                            </h3>
                            <div className="font-mono text-[9px] text-stone-500 flex gap-1.5 items-center select-none">
                              <span>Date Underwritten:</span>
                              <span className="font-bold text-stone-400">{deal.dateUnderwritten}</span>
                            </div>
                          </div>

                          {/* Quick snapshot metrics data breakdown */}
                          <div className="bg-stone-950/50 p-3 rounded-lg border border-stone-905 space-y-2 text-xs font-semibold tracking-wider font-mono leading-none">
                            <div className="flex justify-between items-center text-stone-505">
                              <span>Key Metric Score:</span>
                              <span className="text-[#F9F6F0] font-bold font-serif text-xs">{deal.formattedMetric}</span>
                            </div>
                            
                            <div className="border-t border-stone-900/40 my-1 pt-1.5 space-y-1">
                              {deal.dealType === 'debt-coverage' && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-stone-500">Gross Rev:</span>
                                    <span className="text-stone-300 font-bold">{formatCur(deal.data.dscrGrossRevenue || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-stone-500">Annual Debt:</span>
                                    <span className="text-stone-300">{formatCur(deal.data.dscrAnnualDebtService || 0)}</span>
                                  </div>
                                </>
                              )}
                              {deal.dealType === 'ten-year-hold' && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-stone-500">Initial NOI:</span>
                                    <span className="text-stone-300 font-bold">{formatCur(deal.data.capInitialNoi || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-stone-500">Growth Rate:</span>
                                    <span className="text-stone-300">{formatPct(deal.data.capNoiGrowth || 0)}</span>
                                  </div>
                                </>
                              )}
                              {deal.dealType === 'saas-metrics' && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-stone-500">MRR Spec:</span>
                                    <span className="text-stone-300 font-bold">{formatCur(deal.data.saasMrr || 0)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-stone-500">Churn Rate:</span>
                                    <span className="text-stone-300">{formatPct(deal.data.saasChurn || 0)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Buttons footer bar */}
                        <div className="bg-stone-950 p-4 rounded-b-2xl border-t border-stone-850/65 flex items-center justify-between">
                          <button
                            onClick={() => loadSavedDeal(deal)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-mono text-[9px] uppercase font-bold tracking-widest px-3 py-1.5 rounded transition active:scale-95 cursor-pointer shadow-md inline-flex items-center gap-1 focus:outline-none"
                            title="Restore snapshot details directly back to the workspace"
                          >
                            <span>Load Scenario</span>
                            <span>⚡</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Do you want to permanently delete the "${deal.projectName}" snapshot scenario?`)) {
                                setSavedDeals(prev => prev.filter(p => p.id !== deal.id));
                              }
                            }}
                            className="text-stone-500 hover:text-rose-450 bg-transparent py-1.5 px-2 transition flex items-center gap-1 font-mono text-[9px] uppercase cursor-pointer focus:outline-none"
                            title="Permanently discard scenario snapshot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* SAVE TO PORTFOLIO SNAPSHOT DIALOG */}
          {saveModalOpen && (
            <div className="fixed inset-0 z-50 bg-[#0C0C0C]/85 backdrop-blur-sm flex justify-center items-center p-4">
              <div className="w-full max-w-md bg-[#121212] border border-stone-800 rounded-2xl p-6 space-y-6 shadow-2xl animate-fade-in text-stone-200">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-[0.2em] text-emerald-400 block font-bold uppercase select-none text-left">
                    LIBRARY ARCHIVE UTILITY
                  </span>
                  <h3 className="text-xl font-serif text-[#F9F6F0] tracking-tight text-left">
                    Save Scenario Snapshot
                  </h3>
                  <p className="text-xs text-stone-450 font-sans leading-relaxed text-left">
                    Add this run's exact weights and variables under a new identifier in your Portfolio Dashboard.
                  </p>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-sm font-semibold tracking-wider font-mono text-stone-500 uppercase tracking-widest block font-bold">
                    Project Name / Scenario Label
                  </label>
                  <input
                    type="text"
                    value={newDealProjectName}
                    onChange={(e) => setNewDealProjectName(e.target.value)}
                    placeholder="e.g. Hudson Yards Acquisition Case B"
                    className="w-full bg-stone-900 border border-stone-800 focus:border-stone-600 focus:outline-none rounded-lg px-3 py-2 text-xs font-mono text-stone-200"
                    autoFocus
                  />
                </div>

                <div className="bg-stone-950 p-4 rounded-xl border border-stone-900 space-y-2 text-xs font-semibold tracking-wider font-mono text-stone-500 text-left">
                  <div className="flex justify-between">
                    <span>Model Category:</span>
                    <span className="text-[#F9F6F0] font-bold">
                      {saveDealType === 'debt-coverage' && 'Debt Coverage (CRE DSCR)'}
                      {saveDealType === 'ten-year-hold' && '10-Year Hold Analysis'}
                      {saveDealType === 'saas-metrics' && 'SaaS Unit Economics'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Computed Rating:</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider">{getDealMetadata(saveDealType).dealHealth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Snapshot Score:</span>
                    <span className="text-stone-300 font-bold">{getDealMetadata(saveDealType).formattedMetric}</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2 text-xs font-semibold tracking-wider font-mono uppercase tracking-widest">
                  <button
                    type="button"
                    onClick={() => setSaveModalOpen(false)}
                    className="py-2 px-4 border border-stone-800 hover:border-stone-600 rounded-lg text-stone-400 hover:text-stone-200 transition cursor-pointer select-none font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveCurrentDeal(newDealProjectName)}
                    disabled={!newDealProjectName.trim()}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-stone-950 rounded-lg transition cursor-pointer select-none font-bold shadow-md"
                  >
                    Commit Snapshot
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM UTILITY SPACE (BELOW THE FOLD) */}
          <div className="mt-12 pt-8 border-t border-stone-900/60 space-y-8 select-none print:hidden">

            {/* INSTITUTIONAL MEMORANDUM EXPORT STATION */}
            <div className="bg-[#131111]/20 p-8 rounded-2xl space-y-6">
              <div className="space-y-1">
                <span className="text-[9px] font-mono tracking-[0.25em] text-amber-500 block font-bold uppercase">EXPORT DEAL DOSSIER</span>
                <h3 className="text-xl font-serif text-[#F9F6F0] tracking-tight font-light">Export Underwriting &amp; Economics Memorandums</h3>
                <p className="text-xs text-stone-450 font-serif italic font-light leading-relaxed">
                  Generate clean, presentation-ready summaries of this deal.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-x-10 gap-y-4 pt-2 font-mono text-xs">
                <button
                  id="conduit-nav-dscr"
                  onClick={() => { setProspectusType('debt-coverage'); setProspectusOpen(true); }}
                  className="text-stone-400 hover:text-amber-400 text-left transition duration-200 cursor-pointer flex items-center gap-2 focus:outline-none"
                >
                  <span className="text-stone-600 font-bold">01.</span>
                  <span className="underline underline-offset-4 decoration-stone-800 hover:decoration-amber-500">Debt Service Memo</span>
                </button>
                <button
                  id="conduit-nav-caprate"
                  onClick={() => { setProspectusType('ten-year-hold'); setProspectusOpen(true); }}
                  className="text-stone-400 hover:text-amber-400 text-left transition duration-200 cursor-pointer flex items-center gap-2 focus:outline-none"
                >
                  <span className="text-stone-600 font-bold">02.</span>
                  <span className="underline underline-offset-4 decoration-stone-800 hover:decoration-amber-500">10-Year Hold Memo</span>
                </button>
                <button
                  id="conduit-nav-saas"
                  onClick={() => { setProspectusType('saas-metrics'); setProspectusOpen(true); }}
                  className="text-stone-400 hover:text-amber-400 text-left transition duration-200 cursor-pointer flex items-center gap-2 focus:outline-none"
                >
                  <span className="text-stone-600 font-bold">03.</span>
                  <span className="underline underline-offset-4 decoration-stone-800 hover:decoration-amber-500">SaaS Metrics Memo</span>
                </button>
              </div>
            </div>

            {/* ADVANCED INTELLIGENCE & AUDITING ACCORDION SECTION */}
            <div className="border border-stone-850/60 bg-[#131111]/20 rounded-2xl overflow-hidden mt-6 print:hidden">
              <button
                id="toggle-advanced-accordion"
                onClick={() => setAdvancedOpen(!advancedOpen)}
                className="w-full p-6 text-left hover:bg-[#1a1a1a]/30 transition duration-200 flex items-center justify-between cursor-pointer focus:outline-none select-none"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-[0.25em] text-amber-500 font-bold uppercase block">ANALYSIS LOGS &amp; DIAGNOSTICS</span>
                  <h3 className="text-lg font-serif text-[#F9F6F0] tracking-tight font-light">Advanced Intelligence &amp; Auditing</h3>
                </div>
                <span className="text-xs font-mono text-stone-400 font-medium bg-[#171717] px-3 py-1 rounded">
                  {advancedOpen ? '[ Hide Details ]' : '[ Expand +4 Sections ]'}
                </span>
              </button>

              {advancedOpen && (
                <div className="p-8 border-t border-stone-850/50 space-y-8 animate-fade-in divide-y divide-stone-900/65">
                  
                  {/* section 1: Search Engine Simulation */}
                  <div className="pt-0 space-y-4">
                    <span className="text-[9px] font-mono tracking-[0.2em] text-stone-500 uppercase block font-semibold">1. SEO ROUTING &amp; INDEXING SIMULATION</span>
                    <div className="space-y-1.5 font-sans">
                      <div className="text-xs font-semibold tracking-wider font-mono text-stone-500 truncate flex items-center gap-1 text-left">
                        <span>https://underwrite.institutional</span>
                        <span>›</span>
                        <span className="text-stone-400">market</span>
                        <span>›</span>
                        <span className="text-[#10B981]">{activeHub.slug}</span>
                      </div>
                      <a 
                        href="#" 
                        onClick={(e) => e.preventDefault()}
                        className="text-xs text-sky-400 hover:underline font-serif block leading-snug font-medium text-left"
                      >
                        {activeSEO.title}
                      </a>
                      <p className="text-xs font-semibold text-stone-400 leading-relaxed text-left">
                        {activeSEO.metaDescription}
                      </p>
                    </div>
                  </div>

                  {/* section 2: Mathematical Audit Details */}
                  <div className="pt-6 space-y-4">
                    <span className="text-[9px] font-mono tracking-[0.2em] text-stone-500 uppercase block font-semibold">2. MATHEMATICAL AUDIT LOGS &amp; ALIGNMENTS</span>
                    <p className="text-xs text-stone-400 leading-relaxed font-sans">
                      Calculations are validated utilizing high-fidelity arithmetic offsets to assure absolute system consistency across Node.js runtime layers.
                    </p>
                    <div className="p-4 rounded-xl bg-stone-900/60 text-xs font-semibold tracking-wider space-y-1.5 font-mono text-stone-400 overflow-x-auto text-left">
                      <span className="text-[#F9F6F0] font-semibold">// Precision Multiplier Alignment</span>
                      <pre className="text-[9px]">const factor = Math.pow(10, decimals);</pre>
                      <pre className="text-[9px]">Math.round((value + EPSILON) * factor) / factor</pre>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-wider font-mono text-stone-500 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                      Verified calculations against IEEE 754 float precision standards
                    </div>
                  </div>

                  {/* section 3: Theory & Formulas */}
                  <div className="pt-6 space-y-4">
                    <span className="text-[9px] font-mono tracking-[0.2em] text-stone-500 uppercase block font-semibold">3. FORMULIZATION ANATOMY &amp; GENERAL CONVENTIONS</span>
                    <div className="text-xs text-stone-400 font-serif space-y-3">
                      <p className="font-serif">The standard Debt Service Coverage ratio (DSCR) calculation follows standard real estate banking conventions:</p>
                      <div className="bg-stone-900/60 p-4 rounded-xl font-mono text-xs font-semibold tracking-wider text-[#F9F6F0] flex justify-center py-4">
                        DSCR = NOI / Annual Debt Service
                      </div>
                      <p className="font-serif pt-1.5">For SaaS Underwriting, customer lifetime value and acquisition efficiency are computed as follows:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-900/40 p-4 rounded-xl font-mono text-[9px] text-[#F9F6F0]">
                        <div>
                          <span className="text-stone-500 block text-[8px] uppercase">LTV FORMULA</span>
                          LTV = (MRR * Margin %) / Churn %
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[8px] uppercase">EFFICIENCY RATIO</span>
                          Ratio = LTV / CAC
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* section 4: Local Market Questions (FAQ) */}
                  <div className="pt-6 space-y-4">
                    <span className="text-[9px] font-mono tracking-[0.2em] text-stone-500 uppercase block font-semibold">4. METROPOLITAN MARKET INTELLIGENCE Q&amp;A: {activeHub.cityName}, {activeHub.state}</span>
                    <div className="space-y-3">
                      {[
                        {
                          question: `Underwriting Commercial Assets in ${activeHub.cityName}, ${activeHub.state}`,
                          answer: `Underwriting and acquiring cash-flowing assets inside the ${activeHub.cityName} metropolitan area mandates rigid adherence to localized cap rate variables. Historical analysis indicates this hub operates with a specific baseline posture: ${activeHub.marketBrief} Financial sponsors underwrite these assets with a focus on risk mitigation, vacancy buffer retention, and highly localized credit rating requirements.`
                        },
                        {
                          question: `What are typical commercial underwriting vacancy standards for ${activeHub.cityName}?`,
                          answer: `Strategic underwriters in the ${activeHub.cityName} MSA baseline vacancy risk projections at a conservative ${activeHub.defaultVacancyRate.toFixed(1)}% under standard operation models. During credit committee evaluations, institutional capital allocators mandate secondary vacancy shock tests—often modeled at a 1.5x amplification factor—to ensure debt coverage covenants preserve comfortable default margins.`
                        },
                        {
                          question: `Understanding the localized ${activeHub.cityName} commercial property tax baseline adjustments.`,
                          answer: `Property cost assessments in ${activeHub.cityName}, ${activeHub.state} demand direct integration of the baseline commercial real estate tax estimate of ${activeHub.baselineCommercialTaxPercent.toFixed(2)}% of appraised value. When structuring 10-year hold horizon models, it is essential to calculate tax multipliers against the projected terminal value to predict accurate net operating income (NOI) decay rates and avoid yield shortfalls.`
                        }
                      ].map((faq, idx) => {
                        const isOpen = activeFaq === idx;
                        return (
                          <div key={idx} className="border border-stone-850/60 rounded-lg bg-stone-900/10 transition-colors hover:bg-stone-900/30 font-sans">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveFaq(isOpen ? null : idx);
                              }}
                              className="w-full text-left font-[#F9F6F0] hover:text-amber-400 px-4 py-3 flex justify-between items-center transition-colors focus:outline-none cursor-pointer"
                            >
                              <span className="font-semibold pr-4 font-serif text-xs text-[#F9F6F0] leading-snug">{faq.question}</span>
                              <span className="text-xs font-mono text-stone-500 font-medium select-none">{isOpen ? "[-]" : "[+]"}</span>
                            </button>
                            {isOpen && (
                              <div className="px-4 pb-4 pt-1.5 text-xs text-stone-300 font-sans leading-relaxed border-t border-stone-850/30 mt-1 text-left">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* LUXE EDITORIAL FOOTER */}
      <footer className="border-t border-stone-900 bg-[#070707] py-12 text-stone-500 text-xs">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-serif italic text-stone-400">"Simplifying the architecture of cash flows through absolute precision."</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-stone-600 mt-2">COMMERCIAL FINANCE ENGINE WORKSPACE</p>
          </div>
          <div className="text-left md:text-right font-mono text-xs font-semibold tracking-wider space-y-1">
            <p className="text-stone-400">Pure client-side mathematical projection workstation.</p>
            <p className="text-stone-500">Guaranteed IEEE 754 float aligners inside JavaScript environments.</p>
            <p className="text-stone-600">No telemetry log tracking. Built for strict privacy and secure operations.</p>
          </div>
        </div>
      </footer>

      </div> {/* CLOSE PRIMARY APPLICATION SURFACE (print:hidden) */}

      {/* PROSPECTUS MEMO EXPORT MODAL */}
      {prospectusOpen && (
        <div className="fixed inset-0 z-50 bg-[#060606]/95 backdrop-blur-sm flex justify-center items-start p-4 overflow-y-auto print:absolute print:inset-0 print:p-0 print:bg-[#0C0C0C] print:text-stone-200 print:overflow-visible">
          {/* Custom print styles injected to force dark theme PDF generation on browsers */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              html, body, #root, .print\\:bg-\\[\\#0C0C0C\\] {
                background-color: #0C0C0C !important;
                color: #e7e5e4 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .print-no-bg {
                background: transparent !important;
                border-color: #292524 !important;
              }
              button {
                display: none !important;
              }
            }
          `}} />

          <div className="w-full max-w-4xl bg-[#0E0E10] text-stone-200 shadow-2xl border border-stone-850 rounded-2xl p-6 md:p-12 my-8 relative print:border-none print:shadow-none print:p-0 print:my-0 flex flex-col justify-between min-h-[85vh] print:min-h-0 relative overflow-hidden">
            
            {/* Ambient visual grid matching Aura & Grid */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                 style={{
                   backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                   backgroundSize: '24px 24px'
                 }} 
            />
            
            {/* Print Control bar - Hidden on print */}
            <div className="p-3 bg-stone-900/60 border border-stone-800 rounded-xl flex flex-wrap justify-between items-center gap-3 mb-10 text-stone-400 font-mono text-xs font-semibold tracking-wider uppercase tracking-wider print:hidden select-none relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-stone-300">Institutional Dossier Memo Ready for Export</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold px-4 py-1.5 rounded transition cursor-pointer font-bold shrink-0"
                >
                  [ Print &amp; Save PDF ]
                </button>
                <button 
                  onClick={() => setProspectusOpen(false)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-250 font-bold px-4 py-1.5 rounded transition cursor-pointer font-bold shrink-0"
                >
                  [ Close Preview ]
                </button>
              </div>
            </div>

            {/* Actual 1-Page Investment Memo Document Sheet */}
            <div className="relative z-10 font-sans text-stone-305 flex-1 flex flex-col justify-between">
              {/* Document Header */}
              <div className="border-b border-stone-850 pb-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-baseline gap-2">
                  <div>
                    <span className="text-[9px] font-mono tracking-[0.25em] text-amber-500 block uppercase select-none font-bold">
                      INSTITUTIONAL INVESTOR MEMORANDUM • PORT-{activeHub.state}
                    </span>
                    <h1 className="text-4xl font-light tracking-tight text-[#F9F6F0] font-serif uppercase mt-1">
                      PORTFOLIO UNDERWRITING DOSSIER
                    </h1>
                  </div>
                  <div className="text-right font-mono text-[9px] text-stone-550 select-none">
                    <span>DOSSIER REF: CONDUIT-754-{activeHub.slug.slice(0,4).toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Corporate Header Info Block */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-stone-950/40 border border-stone-850 p-6 rounded-xl text-xs font-semibold font-mono mb-8">
                <div>
                  <span className="text-stone-500 block uppercase text-[9px] tracking-widest font-bold mb-1">COMMITTEE DATE</span>
                  <span className="font-bold text-stone-250">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div>
                  <span className="text-stone-500 block uppercase text-[9px] tracking-widest font-bold mb-1">REGIONAL METRO HUB</span>
                  <span className="font-bold text-stone-250">{activeHub.cityName}, {activeHub.state}</span>
                </div>
                <div>
                  <span className="text-stone-500 block uppercase text-[9px] tracking-widest font-bold mb-1">REPORT ANALYSIS</span>
                  <span className="font-bold text-stone-250">
                    {prospectusType === 'debt-coverage' && "DEBT SERVICE INDEX"}
                    {prospectusType === 'ten-year-hold' && "10-YEAR EXIT PROJECTIONS"}
                    {prospectusType === 'saas-metrics' && "SUBSCRIBER ECONOMICS"}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block uppercase text-[9px] tracking-widest font-bold mb-1">CLASSIFICATION SECURITY</span>
                  <span className="font-black text-rose-500 tracking-widest uppercase">PROPRIETARY / SECRET</span>
                </div>
              </div>

              {/* Dynamic content rendering based on active prospectus selection */}
              {prospectusType === 'debt-coverage' && dscrCalc.success && dscrCalc.data && (
                <div className="space-y-8">
                  {/* SUMMARY INTELLIGENCE SECTION */}
                  <div className="border border-stone-800 bg-[#121214] rounded-xl p-6 space-y-4 mb-2">
                    <span className="text-[9px] font-mono tracking-[0.25em] text-amber-500 block font-bold uppercase select-none">
                      I. SUMMARY INTELLIGENCE
                    </span>
                    <p className="text-stone-300 font-serif leading-relaxed text-sm select-text text-left font-light">
                      This intelligence memorandum validates the underwriting parameters for a regional commercial real estate asset. Under baseline operations, the property generates a high-fidelity property capacity of <strong className="text-stone-100 font-mono font-medium">{formatCur(dscrGrossRevenue)}</strong> with a localized default vacancy rate adjustment of <strong className="text-stone-100 font-mono font-medium">{dscrVacancyRate.toFixed(1)}%</strong>. Calculated Net Operating Income (NOI) yields <strong className="text-emerald-400 font-mono font-medium">{formatCur(dscrCalc.data.netOperatingIncome)}</strong> against an annual contract debt service of <strong className="text-stone-100 font-mono font-medium">{formatCur(dscrAnnualDebtService)}</strong>. The resulting core Debt Service Coverage Ratio (DSCR) stands at a verified <strong className="text-emerald-400 font-mono font-semibold">{dscrCalc.data.dscr.toFixed(2)}x</strong>, certifying a credit risk profile of <strong className="text-amber-400 font-sans font-bold">{dscrCalc.data.dscrRating}</strong>.
                    </p>
                    <div className="pt-2 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-[#1C1C1F]">
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block">DEBT COVERAGE</span>
                        <p className="text-2xl font-mono font-black text-[#F9F6F0]">{dscrCalc.data.isDebtFree ? "DEBT FREE" : `${dscrCalc.data.dscr.toFixed(2)}x`}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block">CREDIT TIER</span>
                        <p className="text-2xl font-sans font-black text-amber-400 tracking-tight">{dscrCalc.data.dscrRating}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block font-medium">ANNUAL SURPLUS</span>
                        <span className="text-2xl font-mono font-black text-emerald-400 block">{formatCur(Math.max(0, dscrCalc.data.netOperatingIncome - dscrAnnualDebtService))}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block">CASH-ON-CASH</span>
                        <span className="text-2xl font-mono font-black text-[#F9F6F0] block">
                          {dscrCashOnCashCalc.success && dscrCashOnCashCalc.data !== undefined ? `${dscrCashOnCashCalc.data.toFixed(1)}%` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold mb-4">II. PROPERTY OPERATIONAL FLOW ANALYSIS</h3>
                    <div className="border-none mt-4 overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs text-stone-300">
                        <thead>
                          <tr className="border-b border-stone-800 text-stone-500 uppercase text-[9px] tracking-wider">
                            <th className="pb-3 pt-1 text-left font-bold">FINANCIAL LINE ITEM</th>
                            <th className="pb-3 pt-1 text-right font-bold w-48">VALUE (ANNUALIZED)</th>
                            <th className="pb-3 pt-1 text-left font-bold pl-8">IMPLICATION &amp; BREAKDOWN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-900">
                          <tr className="hover:bg-stone-950/20 transition duration-150">
                            <td className="py-4 text-stone-100 font-medium">Gross Scheduled Rental Revenue (GPR)</td>
                            <td className="py-4 text-right text-stone-100 font-semibold">{formatCur(dscrGrossRevenue)}</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">Baseline capacity of the core physical asset</td>
                          </tr>
                          <tr className="hover:bg-stone-950/20 transition duration-150">
                            <td className="py-4 text-stone-300">Localized Vacancy &amp; Credit Loss Allocation</td>
                            <td className="py-4 text-right text-amber-500 font-medium">-{formatCur((dscrGrossRevenue * dscrVacancyRate) / 100)}</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">{dscrVacancyRate.toFixed(1)}% (applied vacancy rate)</td>
                          </tr>
                          <tr className="hover:bg-stone-950/20 transition duration-150">
                            <td className="py-4 text-stone-300">Auxiliary / Other Property Income Range</td>
                            <td className="py-4 text-right text-stone-200">{formatCur(dscrOtherIncome)}</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">Non-lease income streams &amp; utility billbacks</td>
                          </tr>
                          <tr className="hover:bg-stone-950/20 transition duration-150 font-semibold bg-stone-950/15">
                            <td className="py-4 text-stone-100 uppercase tracking-wide">Effective Gross Income (EGI)</td>
                            <td className="py-4 text-right text-[#F9F6F0] font-bold">
                              {formatCur(dscrCalc.data.effectiveGrossIncome)}
                            </td>
                            <td className="py-4 text-stone-400 pl-8 italic font-sans">Realized top-line revenue collection</td>
                          </tr>
                          <tr className="hover:bg-stone-950/20 transition duration-150">
                            <td className="py-4 text-stone-300">Total Operating Expenses (Opex)</td>
                            <td className="py-4 text-right text-rose-500 font-medium">-{formatCur(dscrOperatingExpenses)}</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">Combined administrative, upkeep, and tax allocations</td>
                          </tr>
                          <tr className="font-semibold bg-stone-950/30">
                            <td className="py-4 text-[#F9F6F0] uppercase tracking-wide">NET OPERATING INCOME (NOI)</td>
                            <td className="py-4 text-right text-emerald-400 font-bold">
                              {formatCur(dscrCalc.data.netOperatingIncome)}
                            </td>
                            <td className="py-4 text-emerald-500 pl-8 font-mono text-xs font-semibold tracking-wider">Primary underwritten yield index</td>
                          </tr>
                          <tr className="hover:bg-stone-950/20 transition duration-150">
                            <td className="py-4 text-stone-300">Contract Annual Debt Service Obligation</td>
                            <td className="py-4 text-right text-stone-100">{formatCur(dscrAnnualDebtService)}</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">Yearly debt amortization and capital payments</td>
                          </tr>
                          <tr className="font-bold bg-stone-900/40 text-stone-100">
                            <td className="py-4 text-stone-100 uppercase tracking-wide">CALCULATED METRIC SURPLUS</td>
                            <td className="py-4 text-right text-amber-400">
                              {formatCur(Math.max(0, dscrCalc.data.netOperatingIncome - dscrAnnualDebtService))}
                            </td>
                            <td className="py-4 text-amber-500 pl-8 font-mono text-xs font-semibold tracking-wider">Retained liquidity above debit thresholds</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-900">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold mb-2">III. METRIC SENSITIVITY PORTRAIT &amp; SHOCK METRIC</h3>
                    <p className="text-xs font-sans leading-relaxed text-stone-400 select-text text-left">
                      To stress test the integrity of debt coverage, we model a standard 1.5x Vacancy Expansion penalty representing regional economic contraction. 
                      Under standard parameters, {activeHub.cityName} maintains a default baseline model of {activeHub.defaultVacancyRate.toFixed(1)}%. Stress testing spikes this rate to {(activeHub.defaultVacancyRate * 1.5).toFixed(1)}%, reducing Net Operating Income and examining whether DSCR drops below the critical 1.15x threshold.
                    </p>
                    <div className="border border-stone-850 rounded-xl p-6 bg-stone-950/30 grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs text-stone-350 mt-4">
                      <div>
                        <span className="text-stone-500 block text-[9px] uppercase tracking-widest font-semibold mb-1">STRESSED VACANCY</span>
                        <span className="font-bold text-rose-400">{(dscrVacancyRate * 1.5).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[9px] uppercase tracking-widest font-semibold mb-1">STRESSED NOI</span>
                        <span className="font-bold text-stone-100">{formatCur(dscrCalc.data.effectiveGrossIncome - (dscrGrossRevenue * (dscrVacancyRate * 1.5) / 100) + (dscrGrossRevenue * dscrVacancyRate / 100) - dscrOperatingExpenses)}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[9px] uppercase tracking-widest font-semibold mb-1">STRESSED DSCR</span>
                        <span className="font-bold text-rose-400">
                          {dscrAnnualDebtService > 0 ? (
                            ((dscrCalc.data.effectiveGrossIncome - (dscrGrossRevenue * (dscrVacancyRate * 1.5) / 100) + (dscrGrossRevenue * dscrVacancyRate / 100) - dscrOperatingExpenses) / dscrAnnualDebtService).toFixed(2) + "x"
                          ) : "DEBT FREE"}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-500 block text-[9px] uppercase tracking-widest font-semibold mb-1">CONDUIT COMPLIANT</span>
                        <span className="text-emerald-400 font-bold uppercase tracking-wider">YES</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {prospectusType === 'ten-year-hold' && capCalc.success && capCalc.data && (
                <div className="space-y-8">
                  {/* SUMMARY INTELLIGENCE SECTION */}
                  <div className="border border-stone-800 bg-[#121214] rounded-xl p-6 space-y-4 mb-2">
                    <span className="text-[9px] font-mono tracking-[0.25em] text-amber-500 block font-bold uppercase select-none">
                      I. SUMMARY INTELLIGENCE
                    </span>
                    <p className="text-stone-300 font-serif leading-relaxed text-sm select-text text-left font-light">
                      This investment memorandum models exit value appreciation profiles over a standard 10-year holding horizon. The localized MSA asset is scheduled with a baseline purchase price of <strong className="text-stone-100 font-mono font-medium">{formatCur(capCalc.data.purchasePrice)}</strong> at a going-in yield rate of <strong className="text-stone-100 font-mono font-medium">{capGoingInRate.toFixed(2)}%</strong>. Projecting a compounded operational revenue escalation of <strong className="text-stone-100 font-mono font-medium">{capNoiGrowth.toFixed(2)}%</strong> yearly, Net Operating Income climbs sequentially. Accounting for annual capitalization expansion of <strong className="text-stone-100 font-mono font-medium">{capExpansionBps} basis points</strong>, exit valuation at year ten compiles at an estimated <strong className="text-emerald-400 font-mono font-semibold">{formatCur(capCalc.data.terminalValuation)}</strong>. This models a total portfolio capital growth coefficient of <strong className="text-emerald-400 font-mono font-black">+{capCalc.data.valueChangePercent.toFixed(2)}%</strong>, demonstrating robust wealth retention metrics.
                    </p>
                    <div className="pt-2 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-[#1C1C1F]">
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block">EXPECTED GAIN</span>
                        <p className="text-2xl font-mono font-black text-[#F9F6F0]">+{capCalc.data.valueChangePercent.toFixed(2)}%</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block">TERMINAL VALUE</span>
                        <p className="text-2xl font-mono font-black text-emerald-400 tracking-tight">{formatCur(capCalc.data.terminalValuation)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block font-medium">EXIT YIELD</span>
                        <span className="text-2xl font-mono font-black text-amber-400 block">{((capGoingInRate * 100 + capExpansionBps * 10) / 100).toFixed(2)}%</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block">ACQUISITION PRICE</span>
                        <span className="text-2xl font-mono font-black text-[#F9F6F0] block">{formatCur(capCalc.data.purchasePrice)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold mb-4">II. SEQUENTIAL 10-YEAR VALUATION PROJECTIONS</h3>
                    <div className="border-none mt-4 overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs text-stone-300">
                        <thead>
                          <tr className="border-b border-stone-800 text-stone-500 uppercase text-[9px] tracking-wider">
                            <th className="pb-3 pt-1 text-left font-bold">HOLD YEAR</th>
                            <th className="pb-3 pt-1 text-left font-bold font-mono">NET OPERATING INCOME (NOI)</th>
                            <th className="pb-3 pt-1 text-center font-bold font-mono">COMPUTED EXPANDED CAP RATE</th>
                            <th className="pb-3 pt-1 text-right font-bold w-48 font-mono font-bold">MODEL VALUE AT EXIT GLIDE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-900">
                          {capCalc.data.projections.map((proj) => (
                            <tr key={proj.year} className="hover:bg-stone-950/20 transition duration-150">
                              <td className="py-3 font-bold text-[#F9F6F0]">Year {proj.year}</td>
                              <td className="py-3 text-stone-200 font-semibold">{formatCur(proj.netOperatingIncome)}</td>
                              <td className="py-3 text-center text-teal-400 font-bold">{proj.capRatePercent.toFixed(2)}%</td>
                              <td className="py-3 text-right text-[#F9F6F0] font-bold">{formatCur(proj.valuation)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-900">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold">III. LIQUIDITY ESCALATION POLICY DISCLOSURE</h3>
                    <p className="text-xs text-stone-400 font-serif font-light leading-relaxed select-text text-left">
                      This holding horizon assumes a cap rate expansion baseline of <strong className="text-stone-200 font-mono">{capExpansionBps} basis points</strong> ({(capExpansionBps / 100).toFixed(2)}% per annum) starting from the base yield rate of <strong className="text-[#F9F6F0] font-mono">{capGoingInRate.toFixed(2)}%</strong>. This escalation is designed to reflect physical depreciation profiles, institutional liquidity pivots, and capital market volatility inside the <strong className="text-[#F9F6F0] font-sans">{activeHub.cityName} ({activeHub.state}) MSA</strong> underwritten sub-sector model.
                    </p>
                  </div>
                </div>
              )}

              {prospectusType === 'saas-metrics' && saasCalc.success && saasCalc.data && (
                <div className="space-y-8">
                  {/* SUMMARY INTELLIGENCE SECTION */}
                  <div className="border border-stone-800 bg-[#121214] rounded-xl p-6 space-y-4 mb-2">
                    <span className="text-[9px] font-mono tracking-[0.25em] text-amber-500 block font-bold uppercase select-none">
                      I. SUMMARY INTELLIGENCE
                    </span>
                    <p className="text-stone-300 font-serif leading-relaxed text-sm select-text text-left font-light">
                      This operations dossier presents software subscriber unit economics and portfolio stability indicators. Individual accounts provide monthly recurring revenue of <strong className="text-stone-100 font-mono font-medium">{formatCur(saasMrr)}</strong> with gross delivery ratios at a high of <strong className="text-stone-100 font-mono font-medium">{saasMargin.toFixed(1)}%</strong>. Sustaining a monthly contractual subscriber attrition of <strong className="text-stone-100 font-mono font-medium">{saasChurn.toFixed(2)}%</strong>, client retention lifespan compounds at <strong className="text-stone-100 font-mono font-medium">{saasCalc.data.customerLifetimeMonths.toFixed(1)} months</strong>, culminating in a total customer lifetime value of <strong className="text-[#F9F6F0] font-mono font-semibold">{formatCur(saasCalc.data.ltv)}</strong>. Offset against a Customer Acquisition Cost of <strong className="text-stone-100 font-mono font-medium">{formatCur(saasCac)}</strong>, the critical LTV:CAC efficiency index settles at a robust <strong className="text-emerald-400 font-mono font-bold">{saasCalc.data.ltvToCacRatio.toFixed(2)}x</strong>, providing secure margins above macro headwinds.
                    </p>
                    <div className="pt-2 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-[#1C1C1F]">
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block">LTV:CAC RATIO</span>
                        <p className="text-2xl font-mono font-black text-emerald-400">{saasCalc.data.ltvToCacRatio.toFixed(2)}x</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block">LIFETIME VALUE</span>
                        <p className="text-2xl font-mono font-black text-[#F9F6F0] tracking-tight">{formatCur(saasCalc.data.ltv)}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block font-medium">LIFETIME PERIOD</span>
                        <span className="text-2xl font-mono font-black text-[#F9F6F0] block">{saasCalc.data.customerLifetimeMonths.toFixed(1)} mo</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-stone-500 font-mono text-[9px] uppercase tracking-widest block">CAC TOLL</span>
                        <span className="text-2xl font-mono font-black text-rose-500 block">{formatCur(saasCac)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold mb-4">II. SUBSCRIPTION REVENUE COVENANTS &amp; UNIT MARGINS</h3>
                    <div className="border-none mt-4 overflow-x-auto">
                      <table className="w-full text-left font-mono text-xs text-stone-300">
                        <thead>
                          <tr className="border-b border-stone-800 text-stone-500 uppercase text-[9px] tracking-wider">
                            <th className="pb-3 pt-1 text-left font-bold font-mono">SUBSCRIBER ECONOMIC COVENANT</th>
                            <th className="pb-3 pt-1 text-right font-bold w-48 font-mono">MODEL RANGE RATE</th>
                            <th className="pb-3 pt-1 text-left font-bold pl-8 font-mono">IMPLICATION MATRIX</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-900">
                          <tr className="hover:bg-stone-950/20 transition duration-150">
                            <td className="py-4 text-stone-100 font-semibold">Monthly Recurring Revenue (MRR)</td>
                            <td className="py-4 text-right text-[#F9F6F0] font-bold">{formatCur(saasMrr)}</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">Baseline contractual monthly payout per client</td>
                          </tr>
                          <tr className="hover:bg-stone-950/20 transition duration-150">
                            <td className="py-4 text-stone-300 font-medium">Gross Service Delivery Margin</td>
                            <td className="py-4 text-right text-teal-400 font-semibold">{saasMargin.toFixed(1)}%</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">Servicing operating scale and cloud infrastructure efficiency</td>
                          </tr>
                          <tr className="hover:bg-stone-950/20 transition duration-150">
                            <td className="py-4 text-stone-300 font-medium">Contractual Subscriber Monthly Churn</td>
                            <td className="py-4 text-right text-rose-500 font-semibold">{saasChurn.toFixed(2)}%</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">Monthly logo/account detachment velocity</td>
                          </tr>
                          <tr className="hover:bg-stone-950/20 transition duration-150">
                            <td className="py-4 text-stone-100 font-semibold">Derived Client Lifetime Value (LTV)</td>
                            <td className="py-4 text-right text-emerald-400 font-bold">{formatCur(saasCalc.data.ltv)}</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">Gross margin flow cumulative lifespan per account</td>
                          </tr>
                          <tr className="hover:bg-stone-900/20 transition duration-150">
                            <td className="py-4 text-stone-300 font-medium">Customer Acquisition Cost (CAC) Capital Toll</td>
                            <td className="py-4 text-right text-stone-100">{formatCur(saasCac)}</td>
                            <td className="py-4 text-stone-500 pl-8 italic font-sans">Upfront amortization burn to secure one client</td>
                          </tr>
                          <tr className="font-bold bg-stone-900/40 text-[#F9F6F0]">
                            <td className="py-4 uppercase tracking-wide">LTV:CAC RETENTION EFFICIENCY</td>
                            <td className="py-4 text-right text-emerald-400 text-sm font-black">
                              {`${saasCalc.data.ltvToCacRatio.toFixed(2)}x`}
                            </td>
                            <td className="py-4 text-emerald-500 pl-8 font-mono text-xs font-semibold tracking-wider">Cushion margin above target benchmark risk metrics</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {saasStressCalc.success && saasStressCalc.data && (
                    <div className="space-y-4 pt-4 border-t border-stone-900 mt-6">
                      <h3 className="text-xs font-mono uppercase tracking-widest text-stone-500 font-bold">III. RETENTION SENSITIVITY SHOCK AUDIT</h3>
                      <p className="text-xs font-serif font-light leading-relaxed text-stone-400 select-text text-left">
                        Under the 1.5x Churn Shock adverse sensitivity model, monthly active subscriber attrition spikes from <strong className="text-stone-300 font-mono">{saasChurn.toFixed(2)}%</strong> up to <strong className="text-rose-400 font-mono">{(saasChurn * 1.5).toFixed(2)}%</strong>. 
                        This contraction degrades your projected customer account tenure profile from <strong className="text-stone-300 font-mono">{saasCalc.data.customerLifetimeMonths.toFixed(1)} months</strong> down to <strong className="text-rose-300 font-mono">{saasStressCalc.data.customerLifetimeMonths.toFixed(1)} months</strong>, collapsing the core LTV to CAC efficiency coefficient and yield profile down to a compressed <strong className="text-rose-400 font-mono">{saasStressCalc.data.ltvToCacRatio.toFixed(2)}x</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Corporate Sign-off blocks */}
              <div className="border-t border-stone-800 pt-8 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
                <div>
                  <span className="text-stone-500 block text-[9px] uppercase tracking-widest font-bold">MEMORANDUM SECURITY SEAL</span>
                  <p className="text-stone-200 mt-1 uppercase text-xs font-semibold tracking-wider font-bold">
                    CERTIFIED SECURE DIRECT BROWSER COMPILATION WORKSPACE
                  </p>
                  <p className="text-stone-500 text-[9px] mt-2 italic leading-relaxed">
                    *All commercial equations and localized glide factors are programmatically verified under certified standards to prevent allocation drift on CDNs.
                  </p>
                </div>
                <div className="flex flex-col gap-5 text-left md:text-right md:items-end">
                  <div>
                    <span className="text-stone-500 block text-[9px] uppercase tracking-widest font-bold">UNDERWRITING VALIDITY SIGN-OFF</span>
                    <div className="border-b border-stone-800 w-48 mt-4 font-mono"></div>
                    <span className="text-stone-400 text-[9px] block mt-2 uppercase font-mono tracking-widest">Chief Risk Officer Approval Signature</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Sleek, dark, and minimal 'Mastery Achieved' Toast Notification */}
      {showMasteryToast && (
        <div className="fixed inset-0 bg-[#000000]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md transition-all duration-500 animate-fade-in text-stone-100">
          <div className="bg-[#0b0c0d] border border-emerald-500/30 text-stone-200 p-8 rounded-2xl max-w-lg w-full relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col items-center text-center space-y-6">
            
            {/* Grid background matching Aura & Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{
                   backgroundImage: 'linear-gradient(to right, #10B981 1px, transparent 1px), linear-gradient(to bottom, #10B981 1px, transparent 1px)',
                   backgroundSize: '16px 16px'
                 }} 
            />
            
            {/* Visual radar outline */}
            <div className="w-16 h-16 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-950/20 relative animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="text-2xl select-none">🏆</span>
              <div className="absolute inset-0 rounded-full border border-emerald-500/60 scale-110 animate-ping opacity-75" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wider font-mono tracking-[0.25em] text-emerald-400 uppercase font-black block">
                SECURITY CLEARED &amp; PROTOCOL VALIDATED
              </span>
              <h2 className="text-2xl font-serif font-light text-stone-100 tracking-tight">
                Stress-Testing Mastery Achieved
              </h2>
              <p className="text-xs font-mono text-stone-500 uppercase tracking-widest leading-loose">
                LEVEL 5 COVENANT CREDENTIALS ENGAGED
              </p>
            </div>

            <p className="text-xs text-stone-400 font-sans leading-relaxed max-w-sm">
              Excellent work. Your customized capitalized deal structures, yield ratios, and operating schedules successfully survived consecutive adverse macro simulation cycles.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowMasteryToast(false);
                setMasteryStreak(0);
                setCompletedChallenges([]);
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] font-mono text-xs uppercase font-black tracking-widest rounded-lg transition-all duration-300 cursor-pointer active:scale-95"
            >
              Acknowledge Credentials &amp; Reset
            </button>
          </div>
        </div>
      )}

      {/* ADVANCED DIAGNOSTICS SLIDING PANEL DRAWER */}
      {/* Overlay backdrop with fade effect */}
      {diagnosticsOpen && (
        <div 
          onClick={() => setDiagnosticsOpen(false)}
          className="fixed inset-0 bg-[#000000]/70 backdrop-blur-xs z-40 transition-opacity duration-350 animate-fade-in"
          id="diagnostics-overlay"
        />
      )}

      {/* Code Editor Styled Side Panel */}
      <div 
        id="diagnostics-drawer"
        role="dialog"
        aria-label="Raw Mathematical Trace Diagnostics Panel"
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-[#0F0F11] border-l border-[#1D1D22] shadow-[0_0_60px_rgba(0,0,0,0.85)] z-50 flex flex-col transition-all duration-300 ease-in-out transform ${
          diagnosticsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141418] border-b border-[#1D1D22]">
          <div className="flex items-center gap-2.5">
            <div className="flex space-x-1.5 select-none">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>
            <div className="h-4 w-px bg-stone-800 mx-1" />
            <div>
              <span className="text-xs font-semibold tracking-wider font-mono tracking-widest text-[#9A9A9A] font-bold block uppercase">
                COMPILED AUDIT ENGINE
              </span>
              <h2 className="text-xs font-mono font-medium text-amber-500 tracking-tight">
                Trace Diagnostics Panel
              </h2>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setDiagnosticsOpen(false)}
            className="p-1.5 rounded-md hover:bg-stone-900 border border-stone-800 transition-colors text-stone-400 hover:text-stone-100 cursor-pointer"
            title="Close panel"
          >
            <X size={14} />
          </button>
        </div>

        {/* VS Code Inspired Tabs Bar */}
        <div className="flex items-center bg-[#111114] border-b border-[#1D1D22] overflow-x-auto select-none no-scrollbar">
          {(['dscr-calculator.ts', 'cash-on-cash.ts', 'cap-rate-terminal.ts', 'saas-unit-economics.ts'] as const).map((file) => {
            const isActive = activeDiagnosticFile === file;
            let displayTitle: string = file;
            if (file === 'dscr-calculator.ts') displayTitle = 'dscr-calculator.ts (DSCR)';
            if (file === 'cash-on-cash.ts') displayTitle = 'cash-on-cash.ts (CoC)';
            if (file === 'cap-rate-terminal.ts') displayTitle = 'cap-rate-terminal.ts (Cap Rate)';
            if (file === 'saas-unit-economics.ts') displayTitle = 'saas-unit-economics.ts (SaaS)';

            return (
              <button
                key={file}
                onClick={() => setActiveDiagnosticFile(file)}
                className={`py-3 px-5 border-r border-[#1D1D22] font-mono text-xs font-semibold font-medium tracking-wide flex items-center gap-2 cursor-pointer transition-all duration-200 relative ${
                  isActive 
                    ? "bg-[#0F0F11] text-[#E0E0E0] border-b-2 border-b-amber-500 font-bold" 
                    : "bg-[#111114]/80 text-[#7C7C7C] hover:bg-[#131317] hover:text-[#B0B0B0]"
                }`}
              >
                <span className="text-amber-500 select-none text-xs font-semibold tracking-wider font-mono">JS</span>
                <span>{displayTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Editor Controls & Dynamic Variables HUD */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#141418] border-b border-[#1D1D22] select-none text-xs font-mono">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-stone-500">
            <span>Workspace:</span>
            <span className="text-[#A2A2A8]">@cre-finance/math-sandbox</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 font-bold tracking-tight text-[8px] uppercase border border-emerald-500/20">
              Live Compiled
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyDiagnosticCode}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-500 text-base font-semibold min-h-[44px] font-semibold tracking-wider font-semibold uppercase tracking-widest rounded-md transition-all duration-200 cursor-pointer"
          >
            {copiedDiagnostic ? (
              <>
                <Check size={10} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={10} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code View Editor Area */}
        <div className="flex-1 overflow-y-auto bg-[#0A0A0C] py-6 select-text selection:bg-[#264F78]/55 border-b border-[#1D1D22]">
          <div className="min-w-full inline-block">
            {getActiveDiagnosticLines().map((line, idx) => renderDiagnosticLine(line, idx))}
          </div>
        </div>

        {/* IDE Footer Status Bar Area */}
        <div className="bg-[#141418] px-6 py-2.5 border-t border-[#1D1D22]/60 select-none flex items-center justify-between text-xs font-semibold tracking-wider text-[#707075] font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Diagnostic Core: OK</span>
            </span>
            <span className="text-stone-600">|</span>
            <span>Tab size: 2 spaces</span>
          </div>
          <div className="flex items-center gap-4">
            <span>TypeScript (v5.8.2)</span>
            <span className="text-stone-600">|</span>
            <span>UTF-8</span>
          </div>
        </div>
      </div>

      <AdminPortalModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
}
