module.exports = function (migration) {
  const content = migration.createContentType('content')

  content
    .name('Content')
    .description('A Content - Content Type')

  content
    .createField('title', {
      type: "Symbol",
      name: 'Page title',
      required: true
    })

  content.displayField('title')

  content
    .createField('content', {
      type: "Text",
      name: 'Page Content',
      required: true
    })
}
