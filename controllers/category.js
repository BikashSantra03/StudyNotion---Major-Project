const Category = require("../models/Category");

exports.createCategories = (req, res) => {
  try {
    const { name, description } = req.body;

    //validation
    if (!name || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all the fields" });
    }

    //create entry in the database
    const category = new Category({
      name,
      description,
    });

    category.save((err, category) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      return res.status(200).json({ success: true, category });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all Categorys
exports.showAllCategories = async (req, res) => {
  try {
    const allCategorys = await Category.find(
      {},
      { name: true, description: true }
    );
    if (!allCategorys) {
      return res.status(404).json({ message: "No Categorys found" });
    }
    return res.status(200).json({ success: true, allCategorys });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
