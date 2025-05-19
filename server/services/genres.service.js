const Genre = require('../models/genres.model')
const Book = require('../models/books.model')

const genreService = {
    getAll: async({page, limit}) => {
        return await Genre.find({})
    },
    getById: async(id) => {
        return await Genre.findById(id)
    },
    create: async({name, slug}) => {
        const newGenre = new Genre({name, slug});
        return await newGenre.save();
    },
    updateById: async(id, {name, slug}) => {
        return await Genre.findByIdAndUpdate(id, { name, slug }, {new: true});
    },
    deleteById: async(id) => {

        await Book.updateMany({genre: id}, {
            $pull: { genre: id }
        })
        return await Genre.findByIdAndDelete(id)
    }
}

module.exports = genreService
