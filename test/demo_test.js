const assert = require("assert")
const Avengers = require("./models/avengers")

describe("Some demo test", () => {

    it("Save new record to DB", (done) => {
        var hero = new Avengers({
            name: "Tony"
        })

        hero.save().then(() => {
            assert(hero.isNew === false)
            done()
        })
    })

})