import User from "../Models/User.js";

// Add an existing child (by ID) to the authenticated user (parent)
export const addChild = async (req, res) => {
  const { childId } = req.body;

  try {
    const parent = await User.findById(req.user._id);
    if (!parent) {
      return res.status(404).json({ message: "Parent user not found" });
    }

    const child = await User.findById(childId);
    if (!child || child.UserType !== "child") {
      return res
        .status(404)
        .json({ message: "Child user not found or invalid user type" });
    }

    if (parent.children.includes(childId)) {
      return res
        .status(400)
        .json({ message: "Child is already associated with this parent" });
    }

    parent.children.push(childId);
    await parent.save();

    res.status(201).json({ message: "Child added successfully", child });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const deleteChild = async (req, res) => {
  const { childId } = req.params;

  try {
    const parent = await User.findById(req.user._id);
    if (!parent) {
      return res.status(404).json({ message: "Parent user not found" });
    }

    const childIndex = parent.children.findIndex(
      (child) => child.toString() === childId
    );
    if (childIndex === -1) {
      return res
        .status(404)
        .json({ message: "Child not found in parent's list" });
    }

    parent.children.splice(childIndex, 1);
    await parent.save();

    res.status(200).json({ message: "Child removed successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

export const getChildren = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).populate("children");
    if (!parent) {
      return res.status(404).json({ message: "Parent user not found" });
    }

    res.status(200).json(parent.children);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};
