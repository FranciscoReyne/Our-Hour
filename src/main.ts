/**
 * OurHour - Web Application Entry Point
 */

import './styles/main.css';
import { OurHourApp } from './ui/app';

function startOurHourApp(): void {
  const app = new OurHourApp();
  app.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startOurHourApp);
} else {
  startOurHourApp();
}
