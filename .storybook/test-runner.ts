import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

/**
 * Storybook Test Runner Configuration with Accessibility Checks
 *
 * Automatically runs axe-core WCAG 2.2 AA compliance checks on every story.
 * See https://storybook.js.org/docs/react/writing-tests/test-runner#test-hook-api
 */
const config: TestRunnerConfig = {
  async preVisit(page) {
    // Inject axe-core library before each story renders
    await injectAxe(page);
  },

  async postVisit(page) {
    // Run accessibility checks after story renders
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      // WCAG 2.2 Level AA compliance rules
      rules: {
        // Color contrast must be at least 4.5:1
        'color-contrast': { enabled: true },
        // Focus indicators must be visible
        'focus-visible': { enabled: true },
        // Interactive elements must have accessible names
        'button-name': { enabled: true },
        'link-name': { enabled: true },
        // Form inputs must have labels
        'label': { enabled: true },
        // Images must have alt text
        'image-alt': { enabled: true },
        // Document must have a title
        'document-title': { enabled: false }, // Not applicable for components
        // HTML lang attribute
        'html-has-lang': { enabled: false }, // Not applicable for components
        // Headings should be in order
        'heading-order': { enabled: true },
        // ARIA usage must be valid
        'aria-valid-attr-value': { enabled: true },
        'aria-valid-attr': { enabled: true },
        // Keyboard navigation
        'focus-order-semantics': { enabled: true },
        // Touch target size (at least 44x44px)
        'target-size': { enabled: true },
      },
    });

    // Get violations and format for better debugging
    const violations = await getViolations(page);

    if (violations.length > 0) {
      console.error('\n❌ Accessibility Violations Found:\n');
      violations.forEach((violation, index) => {
        console.error(`${index + 1}. ${violation.id}: ${violation.help}`);
        console.error(`   Impact: ${violation.impact}`);
        console.error(`   Description: ${violation.description}`);
        console.error(`   WCAG: ${violation.tags.filter(tag => tag.startsWith('wcag')).join(', ')}`);

        violation.nodes.forEach((node, nodeIndex) => {
          console.error(`
   Element ${nodeIndex + 1}:`);
          console.error(`     HTML: ${node.html}`);
          console.error(`     Target: ${node.target.join(' ')}`);
          console.error(`     Fix: ${node.failureSummary}\n`);
        });
      });
    }
  },
};

export default config;
