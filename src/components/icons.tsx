import type {SVGProps} from 'react';

/** Stroke icons on a shared 24×24 grid so every icon renders at the same visual size. */
function Icon({children, size = 18, ...props}: SVGProps<SVGSVGElement> & {size?: number}) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement> & {size?: number};

export const SunIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 1.5v2.5M12 20v2.5M1.5 12H4M20 12h2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
  </Icon>
);

export const RainIcon = (p: P) => (
  <Icon {...p}>
    <path d="M7 15a4.5 4.5 0 1 1 1-8.9A6 6 0 0 1 19.5 9 3.5 3.5 0 0 1 18 15.5" />
    <path d="M8 18l-1 3M12.5 17l-1 3.5M17 18l-1 3" />
  </Icon>
);

export const SandIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 8h11a3 3 0 1 0-3-3" />
    <path d="M3 12h16a3 3 0 1 1-3 3" />
    <path d="M3 16h7" />
  </Icon>
);

export const SnowIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" />
    <path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5" />
  </Icon>
);

export const ElectricIcon = (p: P) => (
  <Icon {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" />
  </Icon>
);

export const GrassyIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 21c0-9 5-15 15-17-1 10-6 15-15 17Z" />
    <path d="M5 21l8-8" />
  </Icon>
);

export const PsychicIcon = (p: P) => (
  <Icon {...p}>
    <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const MistyIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 8c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
    <path d="M3 13c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
    <path d="M3 18c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
  </Icon>
);

export const ReflectIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6l-8-3Z" />
    <path d="M9 9.5l3 2 3-2M12 11.5V16" />
  </Icon>
);

export const LightScreenIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6l-8-3Z" />
    <path d="M12 7.5l1.2 2.8 2.8 1.2-2.8 1.2L12 15.5l-1.2-2.8L8 11.5l2.8-1.2L12 7.5Z" />
  </Icon>
);

export const AuroraIcon = (p: P) => (
  <Icon {...p}>
    <path d="M2 17c3-6 6-9 10-9s7 3 10 9" />
    <path d="M5 20c2-4 4.5-6 7-6s5 2 7 6" />
    <path d="M7 3.5v2M5.9 4.5h2.2M17 2.5v2M15.9 3.5h2.2" />
  </Icon>
);

export const TailwindIcon = (p: P) => (
  <Icon {...p}>
    <path d="M2 9h12.5a3 3 0 1 0-3-3" />
    <path d="M2 14h17.5a3 3 0 1 1-3 3" />
    <path d="M2 19h6" />
    <path d="M18 4l3 3-3 3" />
  </Icon>
);

export const HelpingHandIcon = (p: P) => (
  <Icon {...p}>
    <path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V10" />
    <path d="M10 10V4a1.5 1.5 0 0 1 3 0v6" />
    <path d="M13 10V5a1.5 1.5 0 0 1 3 0v6" />
    <path d="M16 11V8a1.5 1.5 0 0 1 3 0v6a8 8 0 0 1-8 8h-.5a7 7 0 0 1-5.6-2.8L2.5 16a1.6 1.6 0 0 1 2.4-2.1L7 15.5V11" />
  </Icon>
);

export const FriendGuardIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6l-8-3Z" />
    <path d="M12 15.5s-3.5-2-3.5-4.3A1.8 1.8 0 0 1 12 10a1.8 1.8 0 0 1 3.5 1.2c0 2.3-3.5 4.3-3.5 4.3Z" />
  </Icon>
);

export const ExpandIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
  </Icon>
);

export const CollapseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
  </Icon>
);
