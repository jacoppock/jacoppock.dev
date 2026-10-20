export const isVisible = (entry: { data: { status?: string } }) =>
  import.meta.env.DEV || entry.data.status !== "draft";
