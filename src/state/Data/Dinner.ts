import { reactive } from "bonsify";
import { DinnerDTO } from "../../environments/Browser/Persistence";
import { FamilyStorage } from "../../environments/Browser/Storage";

export type Dinner = Omit<DinnerDTO, "imageRef"> & {
  imageUrl?: Promise<string>;
  setImage(imageSrc: string): Promise<void>;
};

type Params = {
  data: DinnerDTO;
  familyStorage: FamilyStorage;
};

export function Dinner({ data, familyStorage }: Params): Dinner {
  const dinner = reactive<Dinner>({
    ...data,
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
