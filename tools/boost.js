import fs from 'fs';
import path from 'path';

const aiDir = path.join(process.cwd(), '.ai');
const stateTrackerPath = path.join(aiDir, 'state-tracker.md');
const masterPlanPath = path.join(aiDir, 'master-plan.md');

try {
  const stateTracker = fs.existsSync(stateTrackerPath) 
    ? fs.readFileSync(stateTrackerPath, 'utf8') 
    : 'No state-tracker.md found.';
    
  const masterPlan = fs.existsSync(masterPlanPath) 
    ? fs.readFileSync(masterPlanPath, 'utf8') 
    : 'No master-plan.md found.';

  console.log(`
=========================================
📋 CONTEXT BOOST PROMPT (COPY FROM BELOW)
=========================================

Let's continue. Please read the localized planning files to restore absolute context:

---

### 1. State Tracker (.ai/state-tracker.md)
${stateTracker}

---

### 2. Master Plan (.ai/master-plan.md)
${masterPlan}

=========================================
`);
} catch (error) {
  console.error('Error compiling context boost:', error);
}
