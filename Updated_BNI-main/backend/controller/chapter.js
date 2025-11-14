// controllers/countryController.js
const Chapter = require('../model/chapter');




// Create a new country
const addchapter = async (req, res) => {
    try {
        const { name ,countryName,city} = req.body;

        const chapter = new Chapter({ name,countryName,city });
        await chapter.save();

        res.status(201).send({ chapter, message: "chapter created successfully" });
    } catch (error) {
        console.error("Error creating chapter:", error);
        res.status(400).send(error);
    }
};

// Get all chapter
const getchapter = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const limit = 5;
        const count = await Chapter.countDocuments();
        const chapter = await Chapter.find()
        .skip((page - 1) * limit) // Skip records for previous pages
        .limit(limit);;
        res.status(200).send({
            data: chapter,
            total: count,
            currentPage: page,
            hasNextPage: count > page * limit,
            message: "cities fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching chapter:", error);
        res.status(400).send(error);
    }
};

// Get a single chapter by ID
const getchapterById = async (req, res) => {
    try {
        const { id } = req.query;
        const chapter = await Chapter.findById(id);

        if (!chapter) {
            return res.status(404).send({ message: 'chapter not found' });
        }

        res.status(200).send(chapter);
    } catch (error) {
        console.error("Error fetching chapter:", error);
        res.status(400).send(error);
    }
};

const getChapterByCity = async (req, res) => {
    try {
        const { city } = req.query;
        const chapter = await Chapter.find({ city: city });

        if (!chapter) {
            return res.status(404).send({ message: 'Chapter not found' });
        }

        res.status(200).send(chapter);
    } catch (error) {
        console.error("Error fetching chapter:", error);
        res.status(400).send({ message: "An error occurred", error });
    }
};

// Update a chapter
const updatechapterById = async (req, res) => {
    try {
        const { id } = req.query;
        const { name , countryName,
            city } = req.body;

        const updateObj = {
            $set: {
                name,
                countryName,
                city,
                updatedAt: Date.now()
            } 
        };

        const chapter = await Chapter.findByIdAndUpdate(id, updateObj, { new: true });

        if (!chapter) {
            return res.status(404).send({ message: 'chapter not found' });
        }

        res.status(200).send({ chapter, message: "Update successful" });
    } catch (error) {
        console.error("Error updating chapter:", error);
        res.status(400).send(error);
    }
};

// Delete a chapter
const deletechapterById = async (req, res) => {
    try {
        const { id } = req.query;

        const chapter = await Chapter.findByIdAndDelete(id);

        if (!chapter) {
            return res.status(404).send({ message: 'chapter not found' });
        }

        res.status(200).send({ message: "chapter deleted successfully" });
    } catch (error) {
        console.error("Error deleting chapter:", error);
        res.status(400).send(error);
    }
};

const TotalChapter = async (req, res) => {
    try {
      const TotalChapters = await Chapter.find().countDocuments();
        console.log(TotalChapters);
        return res
        .status(200)
        .json({success:true , message:`total chapters are ${TotalChapters}`, TotalChapters })

    } catch (error) {
        console.log(error)
        return res
        .status(500)
        .json({success:false , message:"server error"})
    }
}


module.exports = {
    addchapter,
    getchapter,
    getchapterById,
    updatechapterById,
    deletechapterById,
    TotalChapter,
    getChapterByCity
};
