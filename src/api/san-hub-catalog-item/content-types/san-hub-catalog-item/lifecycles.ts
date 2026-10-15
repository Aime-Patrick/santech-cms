const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

export default {
  beforeCreate(event: { params: { data: { title?: string; itemId?: string } } }) {
    const title = event.params.data.title?.trim();
    if (title) event.params.data.itemId = slugify(title);
  },

  beforeUpdate(event: { params: { data: { title?: string; itemId?: string } } }) {
    const title = event.params.data.title?.trim();
    if (title) event.params.data.itemId = slugify(title);
  },
};
