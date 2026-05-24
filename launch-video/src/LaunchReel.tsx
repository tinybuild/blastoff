import {
  AbsoluteFill,
  Img,
  Sequence,
  Series,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";

export const launchReelSchema = z.object({
  title: z.string(),
  one_sentence: z.string(),
  url: z.string().url(),
  screenshots: z.array(z.string().url()).min(1).max(5),
  brand: z
    .object({
      primary: z.string(),
      accent: z.string(),
      bg: z.string(),
    })
    .optional(),
});

export type LaunchReelProps = z.infer<typeof launchReelSchema>;

const DEFAULT_BRAND = {
  primary: "#FF4800",
  accent: "#FFB600",
  bg: "#F5F0EB",
};

const TITLE_FRAMES = 45; // 1.5s @ 30fps
const SHOT_FRAMES = 54; // 1.8s @ 30fps
const OUTRO_FRAMES = 36; // 1.2s @ 30fps

export const calculateLaunchReelMetadata = ({
  props,
}: {
  props: LaunchReelProps;
}) => {
  const durationInFrames =
    TITLE_FRAMES + props.screenshots.length * SHOT_FRAMES + OUTRO_FRAMES;
  return { durationInFrames };
};

export const LaunchReel: React.FC<LaunchReelProps> = ({
  title,
  one_sentence,
  url,
  screenshots,
  brand,
}) => {
  const b = { ...DEFAULT_BRAND, ...(brand ?? {}) };
  const reelEnd = TITLE_FRAMES + screenshots.length * SHOT_FRAMES;
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #ffeed9 0%, #ffd9c0 50%, #ffb89a 100%)",
        fontFamily: "DM Sans, system-ui, sans-serif",
      }}
    >
      <Sequence  durationInFrames={TITLE_FRAMES}>
        <TitleCard title={title} subtitle={one_sentence} brand={b} />
      </Sequence>
      <Sequence
        from={TITLE_FRAMES}
        durationInFrames={screenshots.length * SHOT_FRAMES}
      >
        <ScreenshotReel screenshots={screenshots} />
      </Sequence>
      <Sequence from={reelEnd} durationInFrames={OUTRO_FRAMES}>
        <OutroCard url={url} brand={b} />
      </Sequence>
    </AbsoluteFill>
  );
};

const TitleCard: React.FC<{
  title: string;
  subtitle: string;
  brand: typeof DEFAULT_BRAND;
}> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const titleOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [9, 21], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, 18], [12, 0], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: 120,
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: "#0f0f0f",
          margin: 0,
          opacity: titleOpacity,
          fontFamily: "Fraunces, Georgia, serif",
          lineHeight: 1.1,
          transform: `translateY(${titleY}px)`,
          maxWidth: 980,
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontSize: 28,
          color: "#3a3a3a",
          margin: "32px 0 0",
          opacity: subtitleOpacity,
          maxWidth: 900,
          lineHeight: 1.4,
        }}
      >
        {subtitle}
      </p>
    </AbsoluteFill>
  );
};

const ScreenshotReel: React.FC<{ screenshots: string[] }> = ({
  screenshots,
}) => {
  return (
    <Series>
      {screenshots.map((src, i) => (
        <Series.Sequence key={src} durationInFrames={SHOT_FRAMES}>
          <ScreenshotSlide src={src} index={i} />
        </Series.Sequence>
      ))}
    </Series>
  );
};

const ScreenshotSlide: React.FC<{ src: string; index: number }> = ({
  src,
  index,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 9, SHOT_FRAMES - 9, SHOT_FRAMES],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );
  // Alternate Ken Burns direction so consecutive shots don't feel identical
  const zoomDir = index % 2 === 0 ? 1 : -1;
  const zoom = interpolate(frame, [0, SHOT_FRAMES], [1, 1 + zoomDir * 0.06], {
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        opacity,
      }}
    >
      <Img
        src={src}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          transform: `scale(${zoom})`,
          transformOrigin: "center",
        }}
      />
    </AbsoluteFill>
  );
};

const OutroCard: React.FC<{ url: string; brand: typeof DEFAULT_BRAND }> = ({
  url,
  brand,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const cleanUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 36,
          color: brand.primary,
          fontWeight: 600,
          letterSpacing: "0.01em",
        }}
      >
        {cleanUrl}
      </div>
    </AbsoluteFill>
  );
};
