import { Suspense, use } from "react";
import { DinnerState } from "../../state/DinnerState";

type Props = {
  dinner: DinnerState;
};

function DinnerImageElement({ imageUrl }: { imageUrl: Promise<string> }) {
  const src = use(imageUrl);
  return <img className="h-16 w-16 rounded" src={src} alt="" />;
}

export function DinnerImage({ dinner }: Props) {
  return (
    <div className="flex-shrink-0 h-16 w-16">
      {dinner.imageUrl ? (
        <Suspense>
          <DinnerImageElement imageUrl={dinner.imageUrl} />
        </Suspense>
      ) : null}
    </div>
  );
}
