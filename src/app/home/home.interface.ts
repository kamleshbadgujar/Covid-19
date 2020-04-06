export interface Covid19Data {
    cases_time_series: Array<CasesData>;
    statewise: Array<StateWiseCases>;
    tested: Array<TestingData>;
}

export interface CasesData {
    dailyconfirmed: string;
    dailydeceased: string;
    dailyrecovered: string;
    date: string;
    totalconfirmed: string;
    totaldeceased: string;
    totalrecovered: string;
}

export interface StateWiseCases {
    active: string;
    confirmed: string;
    deaths: string;
    deltaconfirmed: string;
    deltadeaths: string;
    deltarecovered: string;
    lastupdatedtime: string;
    recovered: string;
    state: string;
    statecode: string;
}

export interface TestingData {
    _ckd7g: string;
    source: string;
    testsconductedbyprivatelabs: string;
    totalindividualstested: string;
    totalpositivecases: string;
    totalsamplestested: string;
    updatetimestamp: string;
}

export interface DistrictData {
    state: string;
    district: string;
    confirmed: string;
}

