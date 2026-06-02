import { useReducer, useEffect, useMemo } from 'react';
import { ProjectContext } from './projectContextInstance';
import { DEMO_PROJECT_STATE } from '../data/demoProject';
import { hasOwnerAssessmentContent, normalizeOwnerAssessment } from '../domain/schema/ownerAssessment';
import { normalizeIntegratorPlan } from '../domain/schema/integratorPlan';
import { normalizeSelectionResults } from '../domain/schema/selectionResults';

const STORAGE_KEY = 'iec-62443-project-data';

const DEFAULT_PROJECT_META = {
  projectName: '',
  organizationName: '',
  siteName: '',
  industry: '',
  scenarioType: '',
  projectObjective: '',
  status: 'draft',
  experienceLevel: 'beginner'
};

const DEFAULT_OWNER_PROFILE = { assessment: null, draft: null };
const DEFAULT_RISK_TRANSLATION = { profile: null };
const DEFAULT_INTEGRATOR_DESIGN = { plan: null, draft: null };
const DEFAULT_VENDOR_CATALOG = { capabilities: [], draft: null };
const DEFAULT_SELECTION_ANALYSIS = { results: null };
const DEFAULT_GAP_CLOSURE = { items: [] };
const DEFAULT_DELIVERABLES = { reports: [] };

const initialState = {
  currentRole: null,
  currentStep: 0,
  projectMeta: DEFAULT_PROJECT_META,
  ownerProfile: DEFAULT_OWNER_PROFILE,
  riskTranslation: DEFAULT_RISK_TRANSLATION,
  integratorDesign: DEFAULT_INTEGRATOR_DESIGN,
  vendorCatalog: DEFAULT_VENDOR_CATALOG,
  selectionAnalysis: DEFAULT_SELECTION_ANALYSIS,
  gapClosure: DEFAULT_GAP_CLOSURE,
  deliverables: DEFAULT_DELIVERABLES
};

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureObject(value, fallback = {}) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
}

function normalizeProjectMeta(value) {
  return { ...DEFAULT_PROJECT_META, ...ensureObject(value) };
}

function normalizeOwnerProfile(value, parsed) {
  const source = ensureObject(value, DEFAULT_OWNER_PROFILE);
  const legacyAssessment = !source.assessment && !parsed.ownerProfile ? parsed.ownerAssessment : null;
  const assessmentSource = source.assessment || legacyAssessment || null;
  const draftSource = source.draft || null;

  const assessment = assessmentSource ? normalizeOwnerAssessment(assessmentSource) : null;
  const draft = hasOwnerAssessmentContent(draftSource) ? normalizeOwnerAssessment(draftSource) : assessment;

  return { assessment, draft };
}

function normalizeRiskTranslation(value, parsed) {
  const source = ensureObject(value, DEFAULT_RISK_TRANSLATION);
  return {
    profile: source.profile || (!parsed.riskTranslation ? parsed.riskProfile : null) || null
  };
}

function normalizeIntegratorDesign(value, parsed) {
  const source = ensureObject(value, DEFAULT_INTEGRATOR_DESIGN);
  const plan = normalizeIntegratorPlan(source.plan || (!parsed.integratorDesign ? parsed.integratorPlan : null) || null);
  const draft = normalizeIntegratorPlan(source.draft || null) || plan;

  return { plan, draft };
}

function normalizeVendorCatalog(value, parsed) {
  const source = ensureObject(value, DEFAULT_VENDOR_CATALOG);
  const capabilities = ensureArray(source.capabilities).length ? ensureArray(source.capabilities) : (!parsed.vendorCatalog ? ensureArray(parsed.vendorCapabilities) : []);
  return {
    capabilities,
    draft: source.draft || capabilities[capabilities.length - 1] || null
  };
}

function normalizeSelectionAnalysis(value, parsed) {
  const source = ensureObject(value, DEFAULT_SELECTION_ANALYSIS);
  return {
    results: normalizeSelectionResults(source.results || (!parsed.selectionAnalysis ? parsed.matchResults : null) || null)
  };
}

function normalizeGapClosure(value, parsed) {
  const source = ensureObject(value, DEFAULT_GAP_CLOSURE);
  return {
    items: ensureArray(source.items).length ? ensureArray(source.items) : (!parsed.gapClosure ? ensureArray(parsed.gapClosureItems) : [])
  };
}

function normalizeDeliverables(value) {
  const source = ensureObject(value, DEFAULT_DELIVERABLES);
  return {
    reports: ensureArray(source.reports)
  };
}

function normalizeState(rawState = {}) {
  const parsed = ensureObject(rawState, {});
  const nextState = {
    ...initialState,
    ...parsed,
    projectMeta: normalizeProjectMeta(parsed.projectMeta),
    ownerProfile: normalizeOwnerProfile(parsed.ownerProfile, parsed),
    riskTranslation: normalizeRiskTranslation(parsed.riskTranslation, parsed),
    integratorDesign: normalizeIntegratorDesign(parsed.integratorDesign, parsed),
    vendorCatalog: normalizeVendorCatalog(parsed.vendorCatalog, parsed),
    selectionAnalysis: normalizeSelectionAnalysis(parsed.selectionAnalysis, parsed),
    gapClosure: normalizeGapClosure(parsed.gapClosure, parsed),
    deliverables: normalizeDeliverables(parsed.deliverables)
  };

  if (parsed.projectName && !nextState.projectMeta.projectName) {
    nextState.projectMeta.projectName = parsed.projectName;
  }

  return nextState;
}

function loadStateFromStorage() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (stored) return normalizeState(JSON.parse(stored));
  } catch (error) {
    console.warn('Failed to load state from storage:', error);
  }
  return initialState;
}

function saveStateToStorage(state) {
  try {
    const payload = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, payload);
    sessionStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.warn('Failed to save state to storage:', error);
  }
}

const ActionTypes = {
  SET_ROLE: 'SET_ROLE',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_PROJECT_META: 'SET_PROJECT_META',
  SET_PROJECT_NAME: 'SET_PROJECT_NAME',
  SET_OWNER_ASSESSMENT: 'SET_OWNER_ASSESSMENT',
  SET_OWNER_DRAFT: 'SET_OWNER_DRAFT',
  SET_RISK_PROFILE: 'SET_RISK_PROFILE',
  SET_INTEGRATOR_PLAN: 'SET_INTEGRATOR_PLAN',
  SET_INTEGRATOR_DRAFT: 'SET_INTEGRATOR_DRAFT',
  ADD_VENDOR_CAPABILITY: 'ADD_VENDOR_CAPABILITY',
  UPDATE_VENDOR_CAPABILITY: 'UPDATE_VENDOR_CAPABILITY',
  SET_VENDOR_DRAFT: 'SET_VENDOR_DRAFT',
  SET_MATCH_RESULTS: 'SET_MATCH_RESULTS',
  SET_GAP_CLOSURE_ITEMS: 'SET_GAP_CLOSURE_ITEMS',
  SET_REPORTS: 'SET_REPORTS',
  LOAD_DEMO_PROJECT: 'LOAD_DEMO_PROJECT',
  RESET_PROJECT: 'RESET_PROJECT'
};

function projectReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_ROLE:
      return { ...state, currentRole: action.payload };
    case ActionTypes.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload };
    case ActionTypes.SET_PROJECT_META:
      return { ...state, projectMeta: { ...state.projectMeta, ...action.payload } };
    case ActionTypes.SET_PROJECT_NAME:
      return { ...state, projectMeta: { ...state.projectMeta, projectName: action.payload } };
    case ActionTypes.SET_OWNER_ASSESSMENT:
      return { ...state, ownerProfile: { ...state.ownerProfile, assessment: action.payload, draft: action.payload } };
    case ActionTypes.SET_OWNER_DRAFT:
      if (JSON.stringify(state.ownerProfile?.draft) === JSON.stringify(action.payload)) return state;
      return { ...state, ownerProfile: { ...state.ownerProfile, draft: action.payload } };
    case ActionTypes.SET_RISK_PROFILE:
      return { ...state, riskTranslation: { ...state.riskTranslation, profile: action.payload } };
    case ActionTypes.SET_INTEGRATOR_PLAN:
      return { ...state, integratorDesign: { ...state.integratorDesign, plan: action.payload, draft: action.payload } };
    case ActionTypes.SET_INTEGRATOR_DRAFT:
      if (JSON.stringify(state.integratorDesign?.draft) === JSON.stringify(action.payload)) return state;
      return { ...state, integratorDesign: { ...state.integratorDesign, draft: action.payload } };
    case ActionTypes.ADD_VENDOR_CAPABILITY:
      return { ...state, vendorCatalog: { ...state.vendorCatalog, capabilities: [...ensureArray(state.vendorCatalog?.capabilities), action.payload], draft: action.payload } };
    case ActionTypes.UPDATE_VENDOR_CAPABILITY:
      return { ...state, vendorCatalog: { ...state.vendorCatalog, capabilities: ensureArray(state.vendorCatalog?.capabilities).map((item, index) => (index === action.payload.index ? action.payload.data : item)) } };
    case ActionTypes.SET_VENDOR_DRAFT:
      if (JSON.stringify(state.vendorCatalog?.draft) === JSON.stringify(action.payload)) return state;
      return { ...state, vendorCatalog: { ...state.vendorCatalog, draft: action.payload } };
    case ActionTypes.SET_MATCH_RESULTS:
      if (JSON.stringify(state.selectionAnalysis?.results) === JSON.stringify(action.payload)) return state;
      return { ...state, selectionAnalysis: { ...state.selectionAnalysis, results: action.payload } };
    case ActionTypes.SET_GAP_CLOSURE_ITEMS:
      if (JSON.stringify(state.gapClosure?.items) === JSON.stringify(ensureArray(action.payload))) return state;
      return { ...state, gapClosure: { ...state.gapClosure, items: ensureArray(action.payload) } };
    case ActionTypes.SET_REPORTS:
      return { ...state, deliverables: { ...state.deliverables, reports: ensureArray(action.payload) } };
    case ActionTypes.LOAD_DEMO_PROJECT:
      return normalizeState(DEMO_PROJECT_STATE);
    case ActionTypes.RESET_PROJECT:
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      return initialState;
    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, initialState, loadStateFromStorage);

  useEffect(() => {
    saveStateToStorage(normalizeState(state));
  }, [state]);
  const actions = useMemo(() => ({
    setRole: (payload) => dispatch({ type: ActionTypes.SET_ROLE, payload }),
    setCurrentStep: (payload) => dispatch({ type: ActionTypes.SET_CURRENT_STEP, payload }),
    setProjectMeta: (payload) => dispatch({ type: ActionTypes.SET_PROJECT_META, payload }),
    setProjectName: (payload) => dispatch({ type: ActionTypes.SET_PROJECT_NAME, payload }),
    setOwnerAssessment: (payload) => dispatch({ type: ActionTypes.SET_OWNER_ASSESSMENT, payload }),
    setOwnerDraft: (payload) => dispatch({ type: ActionTypes.SET_OWNER_DRAFT, payload }),
    setRiskProfile: (payload) => dispatch({ type: ActionTypes.SET_RISK_PROFILE, payload }),
    setIntegratorPlan: (payload) => dispatch({ type: ActionTypes.SET_INTEGRATOR_PLAN, payload }),
    setIntegratorDraft: (payload) => dispatch({ type: ActionTypes.SET_INTEGRATOR_DRAFT, payload }),
    addVendorCapability: (payload) => dispatch({ type: ActionTypes.ADD_VENDOR_CAPABILITY, payload }),
    updateVendorCapability: (index, data) => dispatch({ type: ActionTypes.UPDATE_VENDOR_CAPABILITY, payload: { index, data } }),
    setVendorDraft: (payload) => dispatch({ type: ActionTypes.SET_VENDOR_DRAFT, payload }),
    setMatchResults: (payload) => dispatch({ type: ActionTypes.SET_MATCH_RESULTS, payload }),
    setGapClosureItems: (payload) => dispatch({ type: ActionTypes.SET_GAP_CLOSURE_ITEMS, payload }),
    setReports: (payload) => dispatch({ type: ActionTypes.SET_REPORTS, payload }),
    loadDemoProject: () => dispatch({ type: ActionTypes.LOAD_DEMO_PROJECT }),
    resetProject: () => dispatch({ type: ActionTypes.RESET_PROJECT })
  }), []);

  const normalizedState = useMemo(() => normalizeState(state), [state]);

  return <ProjectContext.Provider value={{ state: normalizedState, actions }}>{children}</ProjectContext.Provider>;
}
