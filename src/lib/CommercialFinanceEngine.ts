/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * CommercialFinanceEngine
 * A self-contained, pure high-precision financial calculation engine.
 * Specifically handles Floating Point Precision Arithmetic without external libraries
 * using multiplier decimal scale alignments, and offers explicit robust validations.
 */

export interface DSCRInput {
  grossRevenue?: number;
  vacancyRate?: number; // e.g. 0.05 for 5%
  otherIncome?: number;
  operatingExpenses?: number;
  noi?: number; // direct NOI (overrides breakdown if provided)
  annualDebtService: number;
  egiSlashPercent?: number; // Optional slash on calculated EGI, e.g. 7.5 for 7.5%
}

export interface DSCRResult {
  effectiveGrossIncome: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  annualDebtService: number;
  dscr: number;
  isDebtFree: boolean;
  dscrRating: "Prime" | "Strong" | "Adequate" | "Under-collateralized" | "Critical";
}

export interface CapRateInput {
  initialNoi: number;
  goingInCapRate: number; // e.g. 5.5 for 5.5%
  annualNoiGrowth: number; // e.g. 3.0 for 3%
  annualCapRateExpansionBps: number; // e.g. 10 for 10 basis points (0.1%) per year
  purchasePrice?: number; // Derived as direct initial NOI / initial Cap Rate if omitted
}

export interface YearProjection {
  year: number;
  netOperatingIncome: number;
  capRatePercent: number;
  valuation: number;
  cumulativeGrowthPercent: number;
  yoyNOIGrowthPercent: number;
}

export interface CapRateResult {
  purchasePrice: number;
  projections: YearProjection[];
  exitYieldTenYearPercent: number;
  terminalValuation: number;
  valueChangePercent: number;
}

export interface SaaSInput {
  mrrPerCustomer: number; // Monthly Recurring Revenue per account ($)
  grossMarginPercent: number; // e.g. 80 for 80% Gross Margin
  monthlyCustomerChurnPercent: number; // e.g. 2.0 for 2% churn per month
  cac: number; // Customer Acquisition Cost ($)
}

export interface SaaSResult {
  arpuAnnual: number;
  grossMarginMultiplier: number;
  monthlyChurnFraction: number;
  customerLifetimeMonths: number;
  ltv: number;
  cac: number;
  ltvToCacRatio: number;
  unitEconomicsHealth: "Excellent (LTV:CAC >= 4x)" | "Healthy (3x - 4x)" | "Cautionary (1x - 3x)" | "Danger (< 1x)";
}

export interface EngineOutcome<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

export class CommercialFinanceEngine {
  /**
   * Safe multiplier-based rounding to prevent floating point inaccuracies.
   */
  public static roundToDecimals(value: number, decimals: number): number {
    if (!isFinite(value) || isNaN(value)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  /**
   * Helper to convert fractional percentages into float safely (e.g. 5.5% -> 0.055)
   */
  public static percentToFraction(percent: number): number {
    return this.roundToDecimals(percent / 100, 6);
  }

  /**
   * Calculates Commercial Debt Service Coverage Ratio (DSCR)
   * DSCR = NOI / Annual Debt Service
   */
  public static calculateDSCR(input: DSCRInput): EngineOutcome<DSCRResult> {
    const errors: string[] = [];

    // Validations
    if (input.annualDebtService < 0) {
      errors.push("Annual Debt Service cannot be negative. For debt-free scenarios, pass 0.");
    }

    let calculatedNOI = 0;
    let egi = 0;
    let finalOpEx = 0;

    if (input.noi !== undefined) {
      if (input.noi < 0) {
        errors.push("Net Operating Income (NOI) cannot be negative for standard property assessment.");
      }
      calculatedNOI = input.noi;
      if (input.egiSlashPercent !== undefined) {
        calculatedNOI = this.roundToDecimals(calculatedNOI * (1 - this.percentToFraction(input.egiSlashPercent)), 2);
      }
      egi = calculatedNOI;
    } else {
      const grossRev = input.grossRevenue ?? 0;
      const vacRate = input.vacancyRate ?? 0;
      const otherInc = input.otherIncome ?? 0;
      const opEx = input.operatingExpenses ?? 0;

      if (grossRev < 0) errors.push("Gross Potential Revenue must be non-negative.");
      if (vacRate < 0 || vacRate > 100) errors.push("Vacancy rate must be between 0% and 100%.");
      if (otherInc < 0) errors.push("Other income must be non-negative.");
      if (opEx < 0) errors.push("Operating Expenses must be non-negative.");

      const vacFraction = this.percentToFraction(vacRate);
      const vacancyCost = this.roundToDecimals(grossRev * vacFraction, 2);
      egi = this.roundToDecimals(grossRev - vacancyCost + otherInc, 2);
      
      if (input.egiSlashPercent !== undefined) {
        egi = this.roundToDecimals(egi * (1 - this.percentToFraction(input.egiSlashPercent)), 2);
      }
      
      finalOpEx = opEx;
      calculatedNOI = this.roundToDecimals(egi - finalOpEx, 2);
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const debtService = this.roundToDecimals(input.annualDebtService, 2);
    let dscr = 0;
    let isDebtFree = false;

    if (debtService === 0) {
      dscr = calculatedNOI > 0 ? Infinity : 0;
      isDebtFree = true;
    } else {
      dscr = this.roundToDecimals(calculatedNOI / debtService, 4);
    }

    // Classify Rating
    let dscrRating: DSCRResult["dscrRating"] = "Critical";
    if (isDebtFree) {
      dscrRating = "Prime";
    } else if (dscr >= 1.5) {
      dscrRating = "Prime";
    } else if (dscr >= 1.25) {
      dscrRating = "Strong";
    } else if (dscr >= 1.15) {
      dscrRating = "Adequate";
    } else if (dscr >= 1.0) {
      dscrRating = "Under-collateralized";
    } else {
      dscrRating = "Critical";
    }

    return {
      success: true,
      errors: [],
      data: {
        effectiveGrossIncome: egi,
        operatingExpenses: finalOpEx,
        netOperatingIncome: calculatedNOI,
        annualDebtService: debtService,
        dscr: isDebtFree ? 999.99 : dscr, // standard representation for debt-free
        isDebtFree,
        dscrRating
      }
    };
  }

  /**
   * Projects Property Values and Capitalization Rates over a 10-year investment window.
   */
  public static projectCapRate(input: CapRateInput): EngineOutcome<CapRateResult> {
    const errors: string[] = [];

    if (input.initialNoi <= 0) {
      errors.push("Initial Net Operating Income (NOI) must be strictly greater than 0 for Cap Rate valuation.");
    }
    if (input.goingInCapRate <= 0) {
      errors.push("Going-in Capitalization Rate must be strictly greater than 0% to prevent division by zero.");
    }
    if (input.annualNoiGrowth < -100) {
      errors.push("Annual NOI growth cannot be less than -100%.");
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const goingInFraction = this.percentToFraction(input.goingInCapRate);
    const purchasePrice = input.purchasePrice ?? this.roundToDecimals(input.initialNoi / goingInFraction, 2);

    const projections: YearProjection[] = [];
    let currentNoi = input.initialNoi;
    let currentCapRate = input.goingInCapRate;

    // Year 0 (Current state benchmark)
    projections.push({
      year: 0,
      netOperatingIncome: this.roundToDecimals(currentNoi, 2),
      capRatePercent: this.roundToDecimals(currentCapRate, 4),
      valuation: this.roundToDecimals(purchasePrice, 2),
      cumulativeGrowthPercent: 0,
      yoyNOIGrowthPercent: 0,
    });

    const noiGrowthFraction = this.percentToFraction(input.annualNoiGrowth);
    const rateExpansionFraction = input.annualCapRateExpansionBps / 10000; // 1 bps = 0.01% = 0.0001 fraction

    for (let year = 1; year <= 10; year++) {
      const prevNoi = currentNoi;
      currentNoi = this.roundToDecimals(currentNoi * (1 + noiGrowthFraction), 2);
      
      const expansionPercent = (rateExpansionFraction * 100);
      currentCapRate = this.roundToDecimals(currentCapRate + expansionPercent, 4);

      // Guard against negative or near-zero Cap Rate inside projection loop
      if (currentCapRate <= 0.001) {
        currentCapRate = 0.001; // floor to 0.001% to prevent division by zero
      }

      const capFraction = this.percentToFraction(currentCapRate);
      const valuation = this.roundToDecimals(currentNoi / capFraction, 2);

      const cumulativeGrowth = this.roundToDecimals(
        ((valuation - purchasePrice) / purchasePrice) * 100,
        2
      );
      
      const yoyGrowth = this.roundToDecimals(
        ((currentNoi - prevNoi) / prevNoi) * 100,
        2
      );

      projections.push({
        year,
        netOperatingIncome: currentNoi,
        capRatePercent: currentCapRate,
        valuation,
        cumulativeGrowthPercent: cumulativeGrowth,
        yoyNOIGrowthPercent: yoyGrowth,
      });
    }

    const terminalValuation = projections[10].valuation;
    const valueChangePercent = this.roundToDecimals(
      ((terminalValuation - purchasePrice) / purchasePrice) * 100,
      2
    );

    return {
      success: true,
      errors: [],
      data: {
        purchasePrice,
        projections,
        exitYieldTenYearPercent: projections[10].capRatePercent,
        terminalValuation,
        valueChangePercent
      }
    };
  }

  /**
   * Calculates SaaS Customer Lifetime Value (LTV) and LTV-to-CAC Ratios.
   * LTV = (Monthly ARPU * Gross Margin %) / Monthly Customer Churn Rate
   */
  public static calculateSaaSMetrics(input: SaaSInput): EngineOutcome<SaaSResult> {
    const errors: string[] = [];

    if (input.mrrPerCustomer < 0) {
      errors.push("MRR per customer must be non-negative.");
    }
    if (input.grossMarginPercent < 0 || input.grossMarginPercent > 100) {
      errors.push("Gross Margin Percent must be between 0% and 100%.");
    }
    if (input.monthlyCustomerChurnPercent < 0) {
      errors.push("Monthly Churn Percent must be non-negative.");
    }
    if (input.cac <= 0) {
      errors.push("Customer Acquisition Cost (CAC) must be strictly greater than $0 to compute LTV:CAC ratios.");
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const arpuAnnual = this.roundToDecimals(input.mrrPerCustomer * 12, 2);
    const grossMarginMultiplier = this.percentToFraction(input.grossMarginPercent);
    const monthlyChurnFraction = this.percentToFraction(input.monthlyCustomerChurnPercent);

    let customerLifetimeMonths = 0;
    let ltv = 0;

    // division-by-zero validation for the churn rate
    if (monthlyChurnFraction === 0) {
      errors.push("Monthly churn rate is 0%. A stable customer base has a theoretical infinite LTV. To run calculations, introduce a minimal positive churn rate (e.g., 0.05%).");
      return { success: false, errors };
    }

    customerLifetimeMonths = this.roundToDecimals(1 / monthlyChurnFraction, 2);
    
    // Mathematically safe calculation: (MRR * grossMarginMultiplier) / monthlyChurnFraction
    const grossMRR = this.roundToDecimals(input.mrrPerCustomer * grossMarginMultiplier, 4);
    ltv = this.roundToDecimals(grossMRR / monthlyChurnFraction, 2);

    const ltvToCacRatio = this.roundToDecimals(ltv / input.cac, 2);

    let unitEconomicsHealth: SaaSResult["unitEconomicsHealth"] = "Cautionary (1x - 3x)";
    if (ltvToCacRatio >= 4) {
      unitEconomicsHealth = "Excellent (LTV:CAC >= 4x)";
    } else if (ltvToCacRatio >= 3) {
      unitEconomicsHealth = "Healthy (3x - 4x)";
    } else if (ltvToCacRatio >= 1) {
      unitEconomicsHealth = "Cautionary (1x - 3x)";
    } else {
      unitEconomicsHealth = "Danger (< 1x)";
    }

    return {
      success: true,
      errors: [],
      data: {
        arpuAnnual,
        grossMarginMultiplier,
        monthlyChurnFraction,
        customerLifetimeMonths,
        ltv,
        cac: this.roundToDecimals(input.cac, 2),
        ltvToCacRatio,
        unitEconomicsHealth
      }
    };
  }

  /**
   * Calculates Property Debt Yield. Proper coverage risk metric for lenders.
   * Debt YieldPercent = (Net Operating Income / Loan Amount) * 100
   */
  public static calculateDebtYield(netOperatingIncome: number, loanAmount: number): EngineOutcome<number> {
    const errors: string[] = [];

    if (loanAmount <= 0) {
      errors.push("Loan Amount must be strictly greater than 0 to compute debt yield.");
    }
    if (netOperatingIncome < 0) {
      errors.push("Net Operating Income cannot be negative for debt yield computations.");
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const calculatedYield = this.roundToDecimals((netOperatingIncome / loanAmount) * 100, 2);
    return {
      success: true,
      errors: [],
      data: calculatedYield
    };
  }

  /**
   * Calculates Cash-on-Cash (CoC) Return.
   * Formula: ((Net Operating Income - Annual Debt Service) / Initial Cash Equity) * 100
   * Safeguarded against zero/negative cash equity.
   */
  public static calculateCashOnCash(
    netOperatingIncome: number,
    annualDebtService: number,
    initialCashEquity: number
  ): EngineOutcome<number> {
    const errors: string[] = [];

    if (initialCashEquity <= 0) {
      errors.push("Initial Cash Equity must be strictly greater than 0 to compute cash-on-cash yield.");
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    const cashFlow = netOperatingIncome - annualDebtService;
    const calculatedReturn = this.roundToDecimals((cashFlow / initialCashEquity) * 100, 2);
    return {
      success: true,
      errors: [],
      data: calculatedReturn
    };
  }

  /**
   * Performs dynamic underwriting sensitivity stress testing.
   * Leverages existing mathematical engines to simulate severe macro headwinds.
   */
  public static runSensitivityStressTest(
    baseInputs: any,
    scenarioType: 'BASELINE' | 'VACANCY_SHOCK' | 'CHURN_SHOCK'
  ): EngineOutcome<any> {
    const errors: string[] = [];
    if (!baseInputs) {
      errors.push("Base inputs are required for sensitivity testing.");
      return { success: false, errors };
    }

    // Determine type: SaaS vs DSCR
    const isSaaS = 'mrrPerCustomer' in baseInputs || 'monthlyCustomerChurnPercent' in baseInputs;

    if (isSaaS) {
      const saasIn: SaaSInput = { ...baseInputs };
      
      if (scenarioType === 'CHURN_SHOCK') {
        // Multiply baseline churn rate by 1.5x
        saasIn.monthlyCustomerChurnPercent = this.roundToDecimals(
          (saasIn.monthlyCustomerChurnPercent || 0) * 1.5,
          4
        );
      }
      
      return this.calculateSaaSMetrics(saasIn);
    } else {
      const dscrIn: DSCRInput = { ...baseInputs };

      if (scenarioType === 'VACANCY_SHOCK') {
        // Slashing effective gross income by an extra 7.5% directly
        dscrIn.egiSlashPercent = 7.5;
      }
      
      return this.calculateDSCR(dscrIn);
    }
  }

  /**
   * Formats a clean, highly structured plain-text Markdown block designed to be copied directly.
   */
  public static generateShareableSummary(
    moduleType: 'dscr' | 'caprate' | 'saas',
    activeData: any
  ): string {
    const divider = "===================================================";
    const subdivider = "  ---------------------------------------------";
    const nowStamp = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

    if (moduleType === 'dscr') {
      const d = activeData as any;
      const dscrText = d.isDebtFree ? "DEBT FREE" : `${d.dscr.toFixed(2)}x`;
      const hasCoC = d.cashOnCash !== undefined;
      
      let cocBlock = "";
      if (hasCoC) {
        cocBlock = `
**EQUITY PERFORMANCE COVENANTS**
  - Initial Cash Equity Base:        $${d.cashEquity.toLocaleString('en-US', { minimumFractionDigits: 0 })}
  - Cash Flow after Debt Service:   $${(d.netOperatingIncome - d.annualDebtService).toLocaleString('en-US', { minimumFractionDigits: 0 })}
${subdivider}
  - CASH-ON-CASH (CoC) RETURN:       ${d.cashOnCash.toFixed(2)}%
`;
      }

      return `### COMMERCIAL CREDIT COMMITTEE UNDERWRITING REPORT
${divider}
  Generated: ${nowStamp}
  Module: Debt Service Coverage Ratio (DSCR) & Cash-on-Cash Assessment

**DEBT COVERAGE & YIELD COVENANTS**
  - Net Operating Income (NOI):      $${d.netOperatingIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
  - Annual Debt Service Obligation:  $${d.annualDebtService.toLocaleString('en-US', { minimumFractionDigits: 0 })}
${subdivider}
  - CALCULATED DSCR RATIO:           ${dscrText}
  - UNDERWRITING CREDIT RATING:      [${d.dscrRating}]
${cocBlock}
**PROPERTY OPERATIONAL PROFILE**
  - Effective Gross Income (EGI):    $${d.effectiveGrossIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
  - Annual Operating Expenses:       $${d.operatingExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}

${divider}
  *Underwriting mathematically validated with multiplier precision safety.*`;
    }

    if (moduleType === 'caprate') {
      const c = activeData as CapRateResult;
      const changePrefix = c.valueChangePercent >= 0 ? "+" : "";
      return `### TEN-YEAR PROPERTY INVESTMENT HOLD HORIZON ASSESSMENT
${divider}
  Generated: ${nowStamp}
  Module: Hold Horizon & Capital Yield Glide

**INVESTMENT PERFORMANCE TARGETS**
  - Derived Initial Allocation Value: $${c.purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 0 })}
  - Terminal Valuation (Year 10):     $${c.terminalValuation.toLocaleString('en-US', { minimumFractionDigits: 0 })}
${subdivider}
  - EXPECTED NET CAPITAL GROWTH:      ${changePrefix}${c.valueChangePercent.toFixed(2)}%
  - EXIT CAPITALIZATION YIELD (YR10): ${c.exitYieldTenYearPercent.toFixed(2)}%

**CHRONOLOGICAL HORIZON TRACK**
${c.projections.map(proj => {
  return `  - Year ${proj.year}: NOI $${proj.netOperatingIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })} | Cap Rate ${proj.capRatePercent.toFixed(2)}% | Val $${proj.valuation.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}).join("\n")}

${divider}
  *Capital projections calculated with high-fidelity multiplier arithmetic.*`;
    }

    if (moduleType === 'saas') {
      const s = activeData as SaaSResult;
      return `### SaaS SUBSCRIPTION ENTERPRISE UNIT ECONOMICS REPORT
${divider}
  Generated: ${nowStamp}
  Module: LTV to CAC Multiplier Portfolio Matrix

**CLIENT VIABILITY RATIOS & RETENTION**
  - Annual Recurring Revenue (ARPU):  $${s.arpuAnnual.toLocaleString('en-US', { minimumFractionDigits: 2 })}
  - Gross Profit Margin multiplier:   ${(s.grossMarginMultiplier * 100).toFixed(0)}%
  - Attrition Rate (Monthly Churn):   ${(s.monthlyChurnFraction * 100).toFixed(2)}%
  - Average Customer Tenure Duration: ${s.customerLifetimeMonths.toFixed(1)} months

**PORTFOLIO VALUE HEALTH COVENANTS**
  - Customer Lifetime Value (LTV):    $${s.ltv.toLocaleString('en-US', { minimumFractionDigits: 2 })}
  - Customer Acquisition Cost (CAC):  $${s.cac.toLocaleString('en-US', { minimumFractionDigits: 2 })}
${subdivider}
  - UNIFIED LTV:CAC MULTIPLE:         ${s.ltvToCacRatio.toFixed(2)}x
  - PORTFOLIO QUALITY SCORE:          [${s.unitEconomicsHealth}]

${divider}
  *Venture analytics backed by floating-point multiplier arithmetic.*`;
    }

    return `### COMMERCIAL FINANCE ENGINE SUMMARY REPORT\n${divider}\nInvalid or unselected module.`;
  }
}
