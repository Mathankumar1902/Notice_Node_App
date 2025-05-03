const Description = require("../models/Description");
const sharp = require("sharp");
const axios = require("axios");

exports.createNotice = async (req, res) => {
  try {
    const {
      title = "",
      description = "",
      status = "",
      profile = "",
    } = req.body;

    const fileProfile = req.file?.path || profile; // Cloudinary URL

    let dimensions = {};

    if (fileProfile?.startsWith("http")) {
      // Remote image from Cloudinary — fetch it and use sharp
      const response = await axios.get(fileProfile, {
        responseType: "arraybuffer",
      });

      const imageBuffer = Buffer.from(response.data, "binary");
      const metadata = await sharp(imageBuffer).metadata();

      dimensions = { width: metadata.width, height: metadata.height };
    }

    const newNotice = new Description({
      title,
      description,
      status,
      profile: fileProfile,
      dimensions,
    });

    await newNotice.save();

    res.status(201).json({
      message: "Data created successfully",
      data: newNotice,
      dimensions,
    });
  } catch (err) {
    console.error("Create Error:", err);
    res.status(500).json({
      message: "Something went wrong while creating the data.",
      error: err.message,
    });
  }
};

// // CREATE - /create
// exports.createNotice = async (req, res) => {
//   try {

//     const { title = '', description = '', status = '', profile = '' } = req.body;

//     const fileProfile = req.file?.path || profile;
//     const newNotice = new Description({ title, description, status, profile: fileProfile });
//     await newNotice.save();

//     // Send a response with the created notice
//     res.status(201).json({
//       message: 'Data created successfully',
//       data: newNotice,
//     });
//   } catch (err) {
//     console.error('Create Error:', err);
//     res.status(500).json({
//       message: 'Something went wrong while creating the data.',
//       error: err.message,
//     });
//   }
// };

// GET ALL - /getall
exports.getAllNotices = async (req, res) => {
  try {
    const notices = await Description.find();

    if (notices.length === 0) {
      return res.status(404).json({
        message: "No data found",
        data: [],
      });
    }

    res.status(200).json({
      message: " All datas retrieved successfully",
      data: notices,
    });
  } catch (err) {
    console.error("Get All Error:", err);
    res.status(500).json({
      message: "Failed to retrieve data",
      error: err.message,
    });
  }
};

// Update notice by ID (ID provided inside request body)
exports.updateNotice = async (req, res) => {
  try {
    const { id, title, description, status } = req.body; // Get the ID and fields from the request body
    const profile = req.file?.path; // If a profile image is uploaded, get the file path

    // Check if ID is provided
    if (!id) {
      return res
        .status(400)
        .json({ message: "Data ID is required to update." });
    }

    // Find the notice by ID
    const existing = await Description.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Data not found" });
    }

    // Prepare the update data
    const updateData = {};
    const updatedFields = [];

    // Update the fields if they're provided in the request body
    if (title !== undefined) {
      updateData.title = title;
      updatedFields.push("title");
    }
    if (description !== undefined) {
      updateData.description = description;
      updatedFields.push("description");
    }
    if (status !== undefined) {
      updateData.status = status;
      updatedFields.push("status");
    }
    if (profile && profile !== existing.profile) {
      updateData.profile = profile;
      updatedFields.push("profile");
    }

    // If no fields are provided for update, return an error
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    // Update the document with the new data
    const updated = await Description.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: `Updated fields: ${updatedFields.join(", ")}`,
      data: updated,
    });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({ message: "Failed to update data" });
  }
};

// Delete notice by ID (ID provided inside request body)
exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.body; // Get ID from request body

    // Check if ID is provided
    if (!id) {
      return res
        .status(400)
        .json({ message: "Notice ID is required to delete." });
    }

    // Find and delete the notice by ID
    const deleted = await Description.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json({ message: "Data deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete Data" });
  }
};

// Get notice by ID (ID provided inside request body)
exports.getNoticeById = async (req, res) => {
  try {
    const { id } = req.body; // Get ID from request body

    // Check if ID is provided
    if (!id) {
      return res.status(400).json({ message: "Data ID is required to fetch." });
    }

    // Find the notice by ID
    const notice = await Description.findById(id);
    if (!notice) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json({ message: "Data retrieved successfully", data: notice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch data" });
  }
};
