import type { Preview } from '@storybook/react-vite';
import  React from 'react';
import '../styles/liquid-justice.css'; // Import Tailwind CSS and global styles

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f1419',
        },
      ],
    },
    // Enable accessibility addon
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
      manual: false,
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        null,
        React.createElement(Story)
      ),
  ],
};

export default preview;