// Quick test of the date fixes
import { getTodayDate, formatDateForDisplay } from './utils/dateUtils.ts';

console.log('Testing date functions...');
console.log('Today (local):', getTodayDate());
console.log('Format test 1:', formatDateForDisplay('2024-01-15'));
console.log('Format test 2:', formatDateForDisplay('2024-12-31'));
console.log('Null test:', formatDateForDisplay(null));
