module.exports = function (migration) {
  const page = migration.createContentType('page')

  page
    .name('Page')
    .description('A Page Content Type')

  page
    .createField('title', {
      type: "Symbol",
      name: 'Page title',
      required: true
    })

  page.displayField('title')

  page
    .createField('content', {
      type: "Symbol",
      name: 'Page Content',
      required: true
    })

  page
    .createField('index', {
      type: "Number",
      name: 'Some required number',
      required: true
    })
}
