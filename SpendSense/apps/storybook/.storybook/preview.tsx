// import "@repo/tailwind-config"
import "@repo/ui/styles/globals.css";

// import "@repo/ui/styles/globals.css"
import type { Preview } from '@storybook/nextjs-vite'
import { TooltipProvider } from "@repo/ui/components/tooltip";
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
     
    ),
  ],
};

export default preview;