import { Suspense, use } from "react";
import { DinnerDTO } from "../../environments/Browser/Persistence";
import { useFamilyScrum } from "../FamilyScrum/useFamilyScrum";

type Props = {
  dinner: DinnerDTO;
};

function DinnerImageElement({ imageRef }: { imageRef: string }) {
  const familyScrum = useFamilyScrum();
  const src = use(familyScrum.dinners.getImageUrl(imageRef));

  return <img className="h-16 w-16 rounded" src={src} alt="" />;
}

export function DinnerImage({ dinner }: Props) {
  return (
    <div className="flex-shrink-0 h-16 w-16">
      {dinner.imageRef ? (
        <Suspense>
          <DinnerImageElement imageRef={dinner.imageRef} />
        </Suspense>
      ) : null}
    </div>
  );
}
