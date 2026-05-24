import "./index.css";
import { Composition } from "remotion";
import {
  LaunchReel,
  launchReelSchema,
  calculateLaunchReelMetadata,
} from "./LaunchReel";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LaunchReel"
        component={LaunchReel}
        schema={launchReelSchema}
        durationInFrames={135}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{
          title: "Manage your Claude Code agents in one native Mac app.",
          one_sentence:
            "Bonfire is a native macOS app that discovers and manages every Claude Code skill, agent, and config across all your projects in one place.",
          url: "https://getbonfire.dev",
          screenshots: [
            "https://pub-70c408865c0742a58010decebb934b30.r2.dev/products/2/1b1bdd9b-2b91-44a5-b7d1-395f3e12e6b1-framed.png",
          ],
        }}
        calculateMetadata={calculateLaunchReelMetadata}
      />
    </>
  );
};
