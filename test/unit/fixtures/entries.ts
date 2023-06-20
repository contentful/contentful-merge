/******************************************************/
/*** Fixtures containing sys.id and sys.updatedAt only ***/
/******************************************************/

// changes: two entries added, two removed, three changed
// in addition, one sys.updatedAt changed, but no actual changes
export const sourceEntriesFixtureOnlySys = {
  sys: { type: 'Array' },
  total: 8,
  skip: 0,
  limit: 10,
  items: [
    {
      // changed entry
      sys: {
        id: '2uNOpLMJioKeoMq8W44uYc',
        updatedAt: '2023-05-17T13:36:43.271Z',
      },
    },
    {
      // changed updatedAt, but no changed entry
      sys: {
        id: '3jkW4CdxPqu8Q2oSgCeOuy',
        updatedAt: '2023-05-17T10:38:42.612Z',
      },
    },
    {
      // changed entry
      sys: {
        id: '5mgMoU9aCWE88SIqSIMGYE',
        updatedAt: '2023-05-17T10:40:42.033Z',
      },
    },
    {
      // changed entry
      sys: {
        id: '5p9qNpTOJaCE6ykC4a8Wqg',
        // changed updatedAt
        updatedAt: '2023-05-17T10:36:55.860Z',
      },
    },
    {
      // added entry
      sys: {
        id: '3op5VIqGZiwoe06c8IQIMO',
        updatedAt: '2023-05-17T10:36:40.280Z',
      },
    },
    {
      // no change
      sys: {
        id: 'Dy6jo5j4goU2C4sc8Kwkk',
        updatedAt: '2023-05-17T10:36:39.704Z',
      },
    },
    {
      // added entry
      sys: {
        id: '6gFiJvssqQ62CMYqECOu2M',
        updatedAt: '2023-05-17T10:36:37.596Z',
      },
    },
  ],
}

export const targetEntriesFixtureOnlySys = {
  sys: { type: 'Array' },
  total: 8,
  skip: 0,
  limit: 10,
  items: [
    {
      sys: {
        id: '2uNOpLMJioKeoMq8W44uYc',
        updatedAt: '2023-05-17T10:36:43.271Z',
      },
    },
    {
      sys: {
        id: '3jkW4CdxPqu8Q2oSgCeOuy',
        updatedAt: '2023-05-17T10:36:42.612Z',
      },
    },
    {
      sys: {
        id: '5mgMoU9aCWE88SIqSIMGYE',
        updatedAt: '2023-05-17T10:36:42.033Z',
      },
    },
    {
      // removed entry
      sys: {
        id: '34MlmiuMgU8wKCOOIkAuMy',
        updatedAt: '2023-05-17T10:36:41.429Z',
      },
    },
    {
      sys: {
        id: '5p9qNpTOJaCE6ykC4a8Wqg',
        updatedAt: '2023-05-17T10:36:40.860Z',
      },
    },
    {
      sys: {
        id: 'Dy6jo5j4goU2C4sc8Kwkk',
        updatedAt: '2023-05-17T10:36:39.704Z',
      },
    },
    {
      // removed entry
      sys: {
        id: '1toEOumnkEksWakieoeC6M',
        updatedAt: '2023-05-17T10:36:39.013Z',
      },
    },
  ],
}

/*****************************************************/
/*********** Fixtures containing full entries ***********/
/*****************************************************/

// changes: two entries added, two removed, three changed
// in addition, one sys.updatedAt changed, but no actual changes
export const sourceEntriesFixture = {
  sys: { type: 'Array' },
  total: 8,
  skip: 0,
  limit: 10,
  items: [
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '2uNOpLMJioKeoMq8W44uYc',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:23.507Z',
        // changed updatedAt
        updatedAt: '2023-05-17T13:36:43.271Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'layout' } },
      },
      fields: {
        // change: changed title and slug text
        title: { 'en-US': 'Home page' },
        slug: { 'en-US': 'home-page' },
        contentModules: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: '4B9n4zqG6QCgui8YiUs4Yc' } }] },
      },
    },
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '3jkW4CdxPqu8Q2oSgCeOuy',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:23.494Z',
        // changed updatedAt
        updatedAt: '2023-05-17T10:38:42.612Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {
        title: { 'de-DE': 'Laden aller Einträge', 'en-US': 'Fetch all entries' },
        slug: { 'en-US': 'fetch-all-entries' },
        modules: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: '5WZ7JD9Hb2Myi6uYYSscIw' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '3QJuO2TNxm0OqSgIMaoCwi' } },
          ],
        },
      },
    },
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '5mgMoU9aCWE88SIqSIMGYE',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.572Z',
        // changed updatedAt
        updatedAt: '2023-05-17T10:40:42.033Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {
        title: { 'de-DE': 'SDK Basiswissen', 'en-US': 'SDK basics' },
        slug: { 'en-US': 'sdk-basics' },
        modules: {
          'en-US': [
            // change: added one linked entry
            { sys: { type: 'Link', linkType: 'Entry', id: '3Y1JQg9bjqIG6OgA2KAM4A' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '1ph3B44420k2wgG8y2aYcM' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '15Cx6Bu1Y2qAkyq2yWgkK2' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '1u8xSIQR4UaoQOc4m6KiiU' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '6gFiJvssqQ62CMYqECOu2M' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '3k6uoYm9i8MycCm42IsY62' } },
          ],
        },
      },
    },
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '5p9qNpTOJaCE6ykC4a8Wqg',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.522Z',
        // changed updatedAt
        updatedAt: '2023-05-17T10:36:55.860Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {
        title: { 'de-DE': 'Content-Modell', 'en-US': 'Content model' },
        slug: { 'en-US': 'content-model' },
        modules: {
          'en-US': [
            // change: removed one linked entry
            { sys: { type: 'Link', linkType: 'Entry', id: '4qT1W3HXewc0SscAs80UuA' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '6gFiJvssqQ62CMYqECOu2M' } },
          ],
        },
      },
    },
    {
      // added entry
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '3op5VIqGZiwoe06c8IQIMO',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.538Z',
        updatedAt: '2023-05-17T10:36:40.280Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {
        title: { 'de-DE': 'APIs', 'en-US': 'APIs' },
        slug: { 'en-US': 'apis' },
        modules: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: '7iCSSldqDuUkG4GWa46uUq' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '41fdMtrUzmiqKykUwA8u2A' } },
          ],
        },
      },
    },
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: 'Dy6jo5j4goU2C4sc8Kwkk',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.527Z',
        updatedAt: '2023-05-17T10:36:39.704Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {
        title: { 'de-DE': 'Laden von Entwürfen', 'en-US': 'Fetch draft content' },
        slug: { 'en-US': 'fetch-draft-content' },
        modules: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: '1wMm7tnKi0kIYsI24eYiKS' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '4Zg99dYM5awic2iwIKo6EW' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '4ZQtjYftNKaoKWuksM0sS0' } },
          ],
        },
      },
    },
    {
      // added entry
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '6gFiJvssqQ62CMYqECOu2M',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:21.528Z',
        updatedAt: '2023-05-17T10:36:37.596Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lessonImage' } },
      },
      fields: {
        title: { 'en-US': 'Content model > image' },
        image: { 'en-US': { sys: { type: 'Link', linkType: 'Asset', id: '5o1Zu7UJheEGGQUC6gYEmS' } } },
        caption: {
          'de-DE': 'Die Hierarchie der Content Types von der Startseite zu einer Lektion mit ihren Modulen.',
          'en-US': 'The full content type hierarchy from the home route down to a lesson with lesson modules.',
        },
      },
    },
  ],
}

export const targetEntriesFixture = {
  sys: { type: 'Array' },
  total: 8,
  skip: 0,
  limit: 10,
  items: [
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '2uNOpLMJioKeoMq8W44uYc',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:23.507Z',
        updatedAt: '2023-05-17T10:36:43.271Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'layout' } },
      },
      fields: {
        title: { 'en-US': 'Home' },
        slug: { 'en-US': 'home' },
        contentModules: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: '4B9n4zqG6QCgui8YiUs4Yc' } }] },
      },
    },
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '3jkW4CdxPqu8Q2oSgCeOuy',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:23.494Z',
        updatedAt: '2023-05-17T10:36:42.612Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {
        title: { 'de-DE': 'Laden aller Einträge', 'en-US': 'Fetch all entries' },
        slug: { 'en-US': 'fetch-all-entries' },
        modules: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: '5WZ7JD9Hb2Myi6uYYSscIw' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '3QJuO2TNxm0OqSgIMaoCwi' } },
          ],
        },
      },
    },
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '5mgMoU9aCWE88SIqSIMGYE',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.572Z',
        updatedAt: '2023-05-17T10:36:42.033Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {
        title: { 'de-DE': 'SDK Basiswissen', 'en-US': 'SDK basics' },
        slug: { 'en-US': 'sdk-basics' },
        modules: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: '3Y1JQg9bjqIG6OgA2KAM4A' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '1ph3B44420k2wgG8y2aYcM' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '15Cx6Bu1Y2qAkyq2yWgkK2' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '1u8xSIQR4UaoQOc4m6KiiU' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '3k6uoYm9i8MycCm42IsY62' } },
          ],
        },
      },
    },
    {
      // removed entry
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '34MlmiuMgU8wKCOOIkAuMy',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.554Z',
        updatedAt: '2023-05-17T10:36:41.429Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'course' } },
      },
      fields: {
        title: { 'de-DE': 'Hallo SDKs', 'en-US': 'Hello SDKs' },
        slug: { 'en-US': 'hello-sdks' },
        image: { 'en-US': { sys: { type: 'Link', linkType: 'Asset', id: '6nvWJT1AkM64so8Auue4QQ' } } },
        shortDescription: {
          'de-DE': 'Lernen Sie den Umgang mit unseren SDKs.',
          'en-US': 'Learn about best practices when using our SDKs.',
        },
        description: {
          'de-DE':
            'Sobald Sie sich den Quellcode der Besipielanwendung ansehen, werden Sie ein Gespür entwickeln, wie Sie am besten die Contentful SDKs in Ihrer Programmiersprache benutzen. Für weitere, fremde Abhängigkeiten, schauen Sie bitte in der jewiligen Dokumentation nach.',
          'en-US':
            "By looking at the code of the example app, you'll get a sense of how to use a Contentful SDK in your favorite programming language.",
        },
        duration: { 'en-US': 5 },
        skillLevel: { 'en-US': 'beginner' },
        lessons: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: '5mgMoU9aCWE88SIqSIMGYE' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '3jkW4CdxPqu8Q2oSgCeOuy' } },
            { sys: { type: 'Link', linkType: 'Entry', id: 'Dy6jo5j4goU2C4sc8Kwkk' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '1HR1QvURo4MoSqO0eqmUeO' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '5VWYVBc39Cia0sqqaeyiIW' } },
          ],
        },
        categories: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: '7JhDodrNmwmwGmQqiACW4' } }] },
      },
    },
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '5p9qNpTOJaCE6ykC4a8Wqg',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.522Z',
        updatedAt: '2023-05-17T10:36:40.860Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {
        title: { 'de-DE': 'Content-Modell', 'en-US': 'Content model' },
        slug: { 'en-US': 'content-model' },
        modules: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: '4qT1W3HXewc0SscAs80UuA' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '6gFiJvssqQ62CMYqECOu2M' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '3UVMv9wHuw4auWMQ0qSamY' } },
          ],
        },
      },
    },
    {
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: 'Dy6jo5j4goU2C4sc8Kwkk',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.527Z',
        updatedAt: '2023-05-17T10:36:39.704Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'lesson' } },
      },
      fields: {
        title: { 'de-DE': 'Laden von Entwürfen', 'en-US': 'Fetch draft content' },
        slug: { 'en-US': 'fetch-draft-content' },
        modules: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: '1wMm7tnKi0kIYsI24eYiKS' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '4Zg99dYM5awic2iwIKo6EW' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '4ZQtjYftNKaoKWuksM0sS0' } },
          ],
        },
      },
    },
    {
      // removed entry
      metadata: { tags: [] },
      sys: {
        space: { sys: { type: 'Link', linkType: 'Space', id: '529ziq3ce86u' } },
        id: '1toEOumnkEksWakieoeC6M',
        type: 'Entry',
        createdAt: '2023-05-17T10:36:22.517Z',
        updatedAt: '2023-05-17T10:36:39.013Z',
        environment: { sys: { id: 'master', type: 'Link', linkType: 'Environment' } },
        revision: 1,
        contentType: { sys: { type: 'Link', linkType: 'ContentType', id: 'course' } },
      },
      fields: {
        title: { 'de-DE': 'Hallo Contentful', 'en-US': 'Hello Contentful' },
        slug: { 'en-US': 'hello-contentful' },
        image: { 'en-US': { sys: { type: 'Link', linkType: 'Asset', id: '6nvWJT1AkM64so8Auue4QQ' } } },
        shortDescription: {
          'de-DE': 'Lernen Sie, wie Sie Anwendungen mit Contentful bauen können.',
          'en-US': 'Learn how to build your own applications with Contentful.',
        },
        description: {
          'de-DE':
            'Diese Beispielanwendung hilft Ihnen, Ihre eigene Anwendung mittels Contentful zu bauen. Sie enthält Module, die Ihnen verschiedene Grundkonzepte näher bringen, Content-Modellierung erklärt und sie erläutert, wie Ihre eigene Anwendung Inhalt von Contentful verarbeitet. Der Inhalt wird von den APIs von Contentful unter zuhilfenahme von Contentful SDKs zurverfügung gestellt. \n\nDie Benutzeroberfläche dieses Beispieles wird nur von dem Beispiel selbst benutzt und bediehnt sich _keines_ Templates. Dies ist Absicht, da es sich bei Contentful um ein `Headless CMS` handelt. Was dies bedeuted, wird später nocheinmal verdeutlicht.   \n\nFolgende Themen werden von diesem Kurs abgehandelt:\n\n- **Die APIs von Contentful**: Komponenten von Contentful.\n- **Content-Modellierung**: Das Content-Modell der Anwendung.\n- **Integration mit Contentful**: Wie wurde diese Anwendung mit Contentful verbunden?',
          'en-US':
            "This course helps you understand the basics behind Contentful. It contains modules that introduce you to core concepts and how your app consumes content from Contentful. This content is pulled from Contentful APIs using a Contentful SDK.\n\nThe user interface of this example app is unique to this application and is _not_ a template. This is intentional, and it touches an aspect of Contentful's API-first approach that we'll discuss later.\n\nThe Hello Contentful course covers the following topics:\n\n- **Contentful's APIs**: Basic components of Contentful\n- **Content modelling**: How content is structured within Contentful\n- **Authoring content**: Connecting this application to Contentful's web app",
        },
        duration: { 'en-US': 10 },
        skillLevel: { 'en-US': 'beginner' },
        lessons: {
          'en-US': [
            { sys: { type: 'Link', linkType: 'Entry', id: '3op5VIqGZiwoe06c8IQIMO' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '5p9qNpTOJaCE6ykC4a8Wqg' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '1zwAjpe38UC8iqKMM6gu0Q' } },
            { sys: { type: 'Link', linkType: 'Entry', id: '3KinTi83FecuMeiUo0qGU4' } },
          ],
        },
        categories: { 'en-US': [{ sys: { type: 'Link', linkType: 'Entry', id: '6ucY5w3oswEU6EYSCEi0C8' } }] },
      },
    },
  ],
}
