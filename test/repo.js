const expect = require('chai').expect
const axios = require('axios')

describe ('Room repository tests', function () {

    const url = "http://localhost:3011"

    describe ("Room CRUD", function () {

        afterEach('Clean up', async function () {
            let rooms = await axios.get(url + '/rooms')
            rooms.data.forEach (async x => {
                await axios.delete(url + '/rooms/' + x.id)
            })
        })

        it ('POST /rooms', async function () {
            let post = await axios.post(url + '/rooms', {name: 'someName', socketUrl: 'http://someSocketUrl', signallingUrl: 'http://someSignallingUrl'})
            expect(post.status).to.equal(201)
        })

        it ('Negative POST /rooms', async function () {
            try {
                await axios.post(url + '/rooms', {})
            }catch(error) {
                expect(error.response.status).to.equal(400)
            }
        })

        it ('GET /rooms', async function () {
            let rooms = await (axios.get(url + '/rooms'))
            expect(rooms.data.length).to.exist
            expect(rooms.status).to.equal(200)
        })

        it ('GET /rooms', async function () {
            await axios.post(url + '/rooms', {name: 'someName', socketUrl: 'http://someSocketUrl', signallingUrl: 'http://someSignallingUrl'})
            await axios.post(url + '/rooms', {name: 'someName', socketUrl: 'http://someSocketUrl', signallingUrl: 'http://someSignallingUrl'})
            let rooms = await (axios.get(url + '/rooms'))
            expect(rooms.data.length).to.equal(2)
            expect(rooms.status).to.equal(200)
        })

        it ('GET /rooms/:id', async function () {
            let post = await axios.post(url + '/rooms', {socketUrl: 'http://someSocketUrl', signallingUrl: 'http://someSignallingUrl'})
            let room = await axios.get(url + '/rooms/' + post.data.id)

            expect(room.data.name).to.exist
            expect(room.data.socketUrl).to.equal('http://someSocketUrl')
            expect(room.data.signallingUrl).to.equal('http://someSignallingUrl')
            expect(room.status).to.equal(200)
        })

        it ('IDs are unique', async function () {
            posts = []
            for (let i = 0; i < 100; i++) {
                let post = await axios.post(url + '/rooms', {name: 'someName', socketUrl: 'http://someSocketUrl', signallingUrl: 'http://someSignallingUrl'})          
                posts.push(post)      
            }
            expect(posts.every(x => {
                let identicals = 0
                posts.forEach(y => {
                    if (y.data.id == x.data.id) {
                        identicals++
                    }
                })
                return identicals == 1 // Each room will always come across itself.
            })).to.be.true
        })

        it ('Negative GET /rooms/:id', async function () {
            try {
                let response = await axios.get(url + '/rooms/RoomMcDoesntExists')
                expect(response.status).to.equal(404) // Better safe than sorry
            }catch (error) {
                expect(error.response.status).to.equal(404)
            }
        })

        it ('PATCH /rooms/:id/owner', async function () {
            let post = await axios.post(url + '/rooms', {name: 'someName', socketUrl: 'http://someSocketUrl', signallingUrl: 'http://someSignallingUrl'})
            expect(post.data.ownerId == null)
            await axios.patch(url + '/rooms/' + post.data.id + '/owner', {ownerId: 'ijupkgzxnxxfqmlaaugbzpbwbmevqsmubodh'}) // Must be 36 characters long. Should we write a test for that too..?
            let patched = await axios.get(url + '/rooms/' + post.data.id)
            expect(patched.data.ownerId).to.equal('ijupkgzxnxxfqmlaaugbzpbwbmevqsmubodh')
        })

        it ('PATCH /rooms/:id/name', async function () {
            let post = await axios.post(url + '/rooms', {name: 'someName', socketUrl: 'http://someSocketUrl', signallingUrl: 'http://someSignallingUrl'})
            expect(post.data.name == 'someName')
            await axios.patch(url + '/rooms/' + post.data.id + '/name', {name: 'someNewName'})
            let patched = await axios.get(url + '/rooms/' + post.data.id)
            expect(patched.data.name).to.equal('someNewName')
        })

        it ('DELETE /rooms/:id', async function () {
            let post = await axios.post(url + '/rooms', {name: 'someName', socketUrl: 'http://someSocketUrl', signallingUrl: 'http://someSignallingUrl'})
            await axios.delete(url + '/rooms/' + post.data.id)

            try {
                let response = await axios.get(url + '/rooms/' + post.data.id)
                expect(response.status).to.equal(404)
            }catch (error) {
                expect(error.response.status).to.equal(404)
            }
        })
    })
})