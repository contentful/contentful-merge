const contentful = require('contentful-management')
const ora = require('ora')

const SPACE = 'lnsjpb79eisl'
const ENVIRONMENT = 'test-clone'
const CONTENT_TYPE = 'content'

const client = contentful.createClient({
  accessToken: process.env.CMA_TOKEN,
  space: SPACE,
}, {type: 'plain'})

const spinner = ora(`creating content on ${SPACE}:${ENVIRONMENT}`).start();

const createAndPublishPage = async ({title, content}) => {
  const params = {
    environmentId: ENVIRONMENT,
    spaceId: SPACE,
    contentTypeId: CONTENT_TYPE,
  }

  const entry = await client.entry.create(params, {
    fields: {
      title: {"en-US": title},
      content: {"en-US": content},
    },
  })

  await client.entry.publish({
    spaceId: SPACE,
    environmentId: ENVIRONMENT,
    entryId: entry.sys.id
  }, entry)
}


const content = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Nec feugiat in fermentum posuere urna nec tincidunt praesent semper. Sed faucibus turpis in eu mi bibendum neque egestas. Iaculis nunc sed augue lacus viverra vitae congue eu consequat. Pellentesque pulvinar pellentesque habitant morbi. Adipiscing at in tellus integer feugiat. Elementum curabitur vitae nunc sed. Turpis egestas integer eget aliquet nibh praesent. Justo laoreet sit amet cursus sit amet dictum sit amet. Sed adipiscing diam donec adipiscing tristique risus. Urna molestie at elementum eu facilisis. Consequat interdum varius sit amet mattis. Eu nisl nunc mi ipsum faucibus vitae aliquet nec. Lacus sed turpis tincidunt id aliquet. Cras adipiscing enim eu turpis egestas pretium aenean. Ultrices dui sapien eget mi proin sed libero. Consectetur purus ut faucibus pulvinar elementum integer. Aliquam nulla facilisi cras fermentum odio eu feugiat pretium nibh. Cursus euismod quis viverra nibh. Eget nulla facilisi etiam dignissim diam quis enim lobortis.

Aliquam eleifend mi in nulla posuere sollicitudin aliquam. Pellentesque elit eget gravida cum sociis natoque. Cras fermentum odio eu feugiat pretium nibh ipsum. Molestie a iaculis at erat pellentesque. Sagittis nisl rhoncus mattis rhoncus urna neque viverra. Commodo sed egestas egestas fringilla phasellus. Sagittis orci a scelerisque purus semper eget duis at. Pulvinar neque laoreet suspendisse interdum. Pharetra massa massa ultricies mi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Leo urna molestie at elementum eu facilisis sed. Lectus proin nibh nisl condimentum id venenatis a condimentum. Eu facilisis sed odio morbi quis commodo odio aenean. Fermentum odio eu feugiat pretium nibh ipsum. Feugiat in ante metus dictum at tempor commodo. Quam elementum pulvinar etiam non quam. At imperdiet dui accumsan sit. Ac auctor augue mauris augue neque. Eu ultrices vitae auctor eu augue. Elit eget gravida cum sociis.

Egestas pretium aenean pharetra magna ac placerat vestibulum lectus mauris. Dictum varius duis at consectetur lorem donec massa sapien faucibus. Tincidunt lobortis feugiat vivamus at. Ipsum dolor sit amet consectetur. Vulputate ut pharetra sit amet. Ut porttitor leo a diam sollicitudin tempor id eu nisl. Elementum sagittis vitae et leo. Integer quis auctor elit sed vulputate. Rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar pellentesque habitant. Ac ut consequat semper viverra nam. Nisi porta lorem mollis aliquam ut. In ante metus dictum at. Fermentum leo vel orci porta non pulvinar neque laoreet. Vestibulum rhoncus est pellentesque elit. Sit amet dictum sit amet justo donec enim diam. Luctus venenatis lectus magna fringilla urna. Quis lectus nulla at volutpat diam ut. Proin nibh nisl condimentum id venenatis a condimentum. Eu scelerisque felis imperdiet proin.

Varius vel pharetra vel turpis nunc eget lorem dolor sed. Ultricies leo integer malesuada nunc vel risus commodo viverra maecenas. Integer enim neque volutpat ac tincidunt vitae. Sem integer vitae justo eget magna fermentum iaculis eu non. Sociis natoque penatibus et magnis dis parturient montes nascetur ridiculus. Sit amet nisl purus in mollis nunc sed. Leo urna molestie at elementum eu. Arcu felis bibendum ut tristique. Nulla pellentesque dignissim enim sit amet. In eu mi bibendum neque egestas congue. Accumsan lacus vel facilisis volutpat est velit egestas dui. Nisl purus in mollis nunc sed id. Quis vel eros donec ac odio tempor. In massa tempor nec feugiat. Nunc eget lorem dolor sed viverra ipsum nunc aliquet bibendum. Tincidunt ornare massa eget egestas purus viverra accumsan in nisl. Consectetur libero id faucibus nisl tincidunt eget. Ac auctor augue mauris augue neque. Elit scelerisque mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus.

Neque volutpat ac tincidunt vitae semper quis. Urna duis convallis convallis tellus. Velit laoreet id donec ultrices. Nullam eget felis eget nunc lobortis mattis aliquam faucibus purus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend donec pretium. Egestas egestas fringilla phasellus faucibus scelerisque eleifend donec. Tristique risus nec feugiat in fermentum posuere urna nec. Volutpat odio facilisis mauris sit amet. Ac felis donec et odio pellentesque diam volutpat. Pharetra convallis posuere morbi leo urna molestie at. Senectus et netus et malesuada fames ac turpis egestas sed. Fringilla phasellus faucibus scelerisque eleifend donec pretium vulputate. In eu mi bibendum neque egestas congue quisque egestas diam.
`

const run = async () => {
  for (let i = 0; i < 10000; i++) {
    const title = 'Content Index '  + i
    spinner.text = `Create entry ${title}`
    await Promise.all([1,2,3,4,5].map(index =>  createAndPublishPage({
      content, title: title + index,
    })))
  }
  spinner.stopAndPersist()
}

run()
