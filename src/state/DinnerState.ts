import { reactive } from "mobx-lite";
import { DinnerDTO } from "../environment/Persistence";
import { FamilyStorage } from "../environment/Storage";

export type DinnerState = ReturnType<typeof DinnerState>;

type Params = {
  data: DinnerDTO;
  familyStorage: FamilyStorage;
};

export function DinnerState({ data, familyStorage }: Params) {
  const { imageRef, ...rest } = data;
  const dinner = reactive({
    ...rest,
    imageUrl: data.imageRef
      ? familyStorage.getImageUrl(data.imageRef)
      : undefined,
    setImage,
  });

  return reactive.readonly(dinner);

  async function setImage(imageSrc: string): Promise<void> {
    const imageRef = await familyStorage.uploadImage(
      "dinners",
      data.id,
      imageSrc
    );

    dinner.imageUrl = familyStorage.getImageUrl(imageRef);
  }
}
