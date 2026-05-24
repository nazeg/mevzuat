migrate((app) => {
  const collection = new Collection({
    name: "legislation",
    type: "base",
    system: false,
    fields: [
      {
        name: "title",
        type: "text",
        required: true,
        presentable: true,
        min: 1,
        max: 500
      },
      {
        name: "category",
        type: "select",
        required: true,
        values: ["Yönetmelik", "Yönerge", "Senato Kararı", "Yönetim Kurulu Kararı", "Etik Kurul Kararı"],
        maxSelect: 1
      },
      {
        name: "date",
        type: "date",
        required: true
      },
      {
        name: "documentNo",
        type: "text",
        max: 100
      },
      {
        name: "url",
        type: "text",
        max: 1000
      },
      {
        name: "description",
        type: "text",
        max: 2000
      }
    ],
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
  });

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("legislation");
    return app.delete(collection);
  } catch (err) {
    // collection not found
  }
});
