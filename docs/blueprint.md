# **App Name**: RemoteTouch

## Core Features:

- Touchpad View: Full-screen touchpad with pointer movement tracking and fading trail dots using Material UI components.
- Keyboard View: Custom QWERTY keyboard layout with key press logging, implemented with Material UI Button components.
- Settings View: Adjustable touchpad sensitivity and haptic feedback settings using Material UI Slider and Switch components.
- Remote action classification: LLM that acts as a tool classifying remote control actions based on minimal gesture data for various applications like media control, browsing or document processing.
- View Navigation: Sidebar with intuitive Material UI icons for switching between touchpad, keyboard, and settings views.

## Style Guidelines:

- Primary color: A vibrant blue (#00AEEF) from the design tokens to provide a modern feel using Material UI's primary color palette.
- Background color: Dark gray (#212529) from the design tokens for reduced eye strain, applied as the background color in the Material UI theme.
- Accent color: A salmon hue (#FF6F61) to highlight interactive elements and provide a touch of warmth, as a complement to the blue primary, used for Material UI's secondary color palette.
- Body and headline font: 'Inter', a sans-serif from design tokens, known for its modern and readable qualities, set as the fontFamily in the Material UI theme.
- Full-screen layout optimized for mobile landscape mode, ensuring all components adapt seamlessly to the viewport, utilizing Material UI's Grid and Box components.
- Material UI icons for a consistent and recognizable visual language. The current active view is clearly highlighted using Material UI's color prop.
- Subtle fading animations for the touchpad trail dots to indicate movement history and enhance usability, potentially using Material UI's transitions.