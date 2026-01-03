import { z } from "zod";
import { AlignEnd } from "../components/AlignEnd";
import { Button } from "../components/Button";
import { DownloadButton } from "../components/DownloadButton";
import { ErrorComp } from "../components/Error";
import { ProgressBar } from "../components/ProgressBar";
import { Spacing } from "../components/Spacing";
import { COMP_NAME, CompositionProps, Segment } from "../../types/constants";
import { useRendering } from "../helpers/use-rendering";

export const RenderControls: React.FC<{
  segments: Segment[];
  setSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ segments, inputProps }) => {
  const { renderMedia, state, undo } = useRendering(COMP_NAME, inputProps);

  return (
    <div className="my-5">
      {state.status === "init" ||
      state.status === "invoking" ||
      state.status === "error" ? (
        <>
         
            <Button
              disabled={state.status === "invoking" || segments.length === 0}
              loading={state.status === "invoking"}
              onClick={renderMedia}
            >
              Render video
            </Button>
          {state.status === "error" ? (
            <ErrorComp message={state.error.message}></ErrorComp>
          ) : null}
        </>
      ) : null}
      {state.status === "rendering" || state.status === "done" ? (
        <>
          <ProgressBar
            progress={state.status === "rendering" ? state.progress : 1}
          />
          <Spacing></Spacing>
          <AlignEnd>
            <DownloadButton undo={undo} state={state}></DownloadButton>
          </AlignEnd>
        </>
      ) : null}
    </div>
  );
};
