export async function randomWait() {
  await new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (500 - 100 + 1) + 100))
  );
}
