const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const Question = require("../models/Question");
const Test = require("../models/Test");
const csv = require("csv-parser");
const xlsx = require("xlsx");
const fs = require("fs");

// Middleware to handle validation errors

module.exports.GetSingleTest = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId).populate("question");
    if (!test) {
      return res.status(404).json({ error: "Test series not found." });
    }

    res.status(200).json(test);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};

module.exports.CreateQuestionWithImage = async (req, res) => {
  try {
    const { testId } = req.params;
    const {
      name,
      // desc,
      options,
      correctOpt,
      marks,
      negative,
      rational,
      solution,
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let publicId;
    let imageUrlresult;
    if (req.file && req.file.path) {
      try {
        const data = await cloudinary.uploader.upload(req.file.path, {
          folder: "test-series",
        });
        imageUrlresult = data.secure_url;
        publicId = data.public_id;
      } catch (e) {
        console.log(e);
        return res.status(500).json({ error: "Image upload error" });
      }
    }

    const options_array = options.split(",");
    const correctOpt_array = correctOpt.split(",");

    const question = await Question.create({
      name,
      // desc,
      marks,
      negative,
      rational,
      solution,
      options: options_array,
      correctOpt: correctOpt_array,
      image: imageUrlresult,
      publicIdImage: publicId,
    });

    const test = await Test.findById(testId);
    test.question.push(question);
    await test.save();

    res.status(201).json({
      message: "Question is created successfully",
      question,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.UpdateQuestionWithImage = async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      name,
      // desc,
      options,
      correctOpt,
      marks,
      negative,
      rational,
      solution,
    } = req.body;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(400).json({ message: "Question not found" });
    }

    let publicId;
    let imageUrlresult;
    if (req.file && req.file.path) {
      await cloudinary.uploader
        .upload(req.file.path, {
          folder: "test-series",
          public_id: question.publicIdImage,
        })
        .then((data) => {
          imageUrlresult = data.secure_url;
          publicId = data.public_id;
          console.log(data);
        })
        .catch((e) => {
          console.log(e);
        });
      question.image = imageUrlresult;
      question.publicIdImage = publicId;
    }

    const options_array = options.split(",");
    const correctOpt_array = correctOpt.split(",");

    question.name = name;
    // question.desc = desc;
    question.marks = marks;
    question.negative = negative;
    question.rational = rational;
    question.solution = solution;
    question.options = options_array;
    question.correctOpt = correctOpt_array;

    await question.save();
    res
      .status(201)
      .json({ message: "question updated successfully", question });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.DeleteSingleQuestion = async (req, res) => {
  try {
    const { questionId, testId } = req.params;

    const question = await Question.findById(questionId);
    const test = await Test.findById(testId);
    if (!question) {
      return res.status(404).json({ message: "question not found" });
    }
    if (question.image) {
      await cloudinary.uploader.destroy(question.publicIdImage);
    }
    const index = test.question.indexOf(questionId);
    if (index !== -1) {
      test.question.splice(index, 1);
      await test.save();
    } else {
      return res.status(404).json({ error: "Question not found in the test." });
    }
    await Question.findByIdAndDelete(questionId);
    res.json({ message: "Question deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.AddMultipleQuestions = async (req, res) => {
  const { testId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const filePath = req.file.path;
    const fileExtension = req.file.originalname.split(".").pop().toLowerCase();

    if (fileExtension === "xlsx") {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Process Excel file
      const jsonData = xlsx.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        return res
          .status(400)
          .json({ error: "No data found in the Excel file" });
      }

      const test = await Test.findById(testId);

      for (const data of jsonData) {
        // Validate required fields
        if (!data.name || !data.marks || !data.options || !data.correctOpt) {
          return res
            .status(400)
            .json({ error: "Missing required fields in the Excel data" });
        }

        // Ensure correctOpt is a string before splitting
        let correctOptString = data.correctOpt;
        if (typeof correctOptString !== "string") {
          correctOptString = correctOptString.toString();
        }

        // Split options and correctOpt into arrays, removing empty options
        const options = data.options
          .split(",")
          .map((opt) => opt.trim())
          .filter((opt) => opt !== "");
        const correctOpt = correctOptString.split(",").map((opt) => opt.trim());

        // Check if there are valid options before creating the question
        if (options.length > 0) {
          const question = new Question({
            name: data.name,
            options,
            correctOpt,
            marks: data.marks,
            negative: data.negative || null,
            rational: data.rational || null,
            solution: data.solution || null,
          });

          await question.save();
          test.question.push(question);
        }
      }

      await test.save();

      return res.status(201).json({ message: "Created Excel data", test });
    } else if (fileExtension === "csv") {
      const jsonData = [];

      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          jsonData.push(data);
        })
        .on("end", async () => {
          if (jsonData.length === 0) {
            return res
              .status(400)
              .json({ error: "No data found in the CSV file" });
          }

          const test = await Test.findById(testId);

          for (const data of jsonData) {
            // Validate required fields
            if (
              !data.name ||
              !data.marks ||
              !data.options ||
              !data.correctOpt
            ) {
              return res
                .status(400)
                .json({ error: "Missing required fields in the CSV data" });
            }

            // Ensure correctOpt is a string before splitting
            let correctOptString = data.correctOpt;
            if (typeof correctOptString !== "string") {
              correctOptString = correctOptString.toString();
            }

            // Split options and correctOpt into arrays, removing empty options
            const options = data.options
              .split(",")
              .map((opt) => opt.trim())
              .filter((opt) => opt !== "");
            const correctOpt = correctOptString
              .split(",")
              .map((opt) => opt.trim());

            // Check if there are valid options before creating the question
            if (options.length > 0) {
              const question = new Question({
                name: data.name,
                options,
                correctOpt,
                marks: data.marks,
                negative: data.negative || null,
                rational: data.rational || null,
                solution: data.solution || null,
              });

              await question.save();
              test.question.push(question);
            }
          }

          await test.save();

          return res.status(201).json({ message: "Created CSV data", test });
        });
    } else {
      return res.status(400).json({ error: "Unsupported file format" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
